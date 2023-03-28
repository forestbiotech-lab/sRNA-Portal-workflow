var db = require('./sqldb/index');


let killAttributes=[
    "sequence_id",
    "Assay_data",
    "Mature_miRNA_sequence"
]

/*
select s.id,ad.mature_miRNA,  a.name,ad.raw,a2.name,ad2.raw from Assay_data ad, Assay_data ad2, Assay a, Assay a2, Study s where s.id=8 AND s.id=a.study AND a.id = ad.assay
AND s.id=a2.study AND a2.id = ad2.assay and ad.mature_miRNA = ad2.mature_miRNA AND a.id <> a2.id
*/


function getAssaysInOrderOfName(studyId){
     return db['Study'].findAll({
        include:[{
            attributes:[["id","id"],["name","name"]],
            order:[[
                db.sequelize.fn('length',db.sequelize.col('name')),
                "ASC"
            ],[
                db.sequelize.col('name'),
                "ASC"
            ]],
            model:db['Assay']
        }],
         where:{id:studyId}
     })
}

async function getAssayDataForStudy(studyId){
    try{
        let assayIds=await getAssaysInOrderOfName(studyId)
        let assayDataSelectors=assayIds[0].dataValues.Assays.reduce((acc,cur,index)=>{
            return `${acc} \`ad${index}\`.\`raw\` AS \`Raw.${cur.dataValues["name"]}\`,`
        },"")
        assayDataSelectors+=assayIds[0].dataValues.Assays.reduce((acc,cur,index)=>{
            return `${acc} \`ad${index}\`.\`cpm\` AS \`CPM.${cur.dataValues["name"]}\`,`
        },"")
        let fromBlock=assayIds[0].dataValues.Assays.reduce((acc,cur,index)=>{
            return `${acc} \`Assay_data\` \`ad${index}\`, \`Assay\` \`a${index}\`,`
        },"")
        let whereBlock=assayIds[0].dataValues.Assays.reduce((acc,cur,index)=>{
            acc+=`s.id = a${index}.study AND a${index}.id=ad${index}.assay AND a${index}.id=${cur.dataValues['id']} AND `
            if(index<assayIds[0].dataValues.Assays.length-1){
                for (let i=index; i<assayIds[0].dataValues.Assays.length;i++ )
                    acc+=`ad${index}.mature_miRNA=ad${i}.mature_miRNA AND `
            }
            return acc
        },"")
        let query=`SELECT seq.sequence as Sequence, m.name, \`ad0\`.\`mature_miRNA\`, ${assayDataSelectors} \`s\`.\`active\` from Mature_miRNA_sequence seq,  Mature_miRNA m, ${fromBlock} \`Study\` \`s\` where ${whereBlock} s.id=${studyId} AND ad0.mature_miRNA = m.accession AND m.sequence_id = seq.id `
        //let query=`SELECT seq.sequence as Sequence, m.name, \`ad0\`.\`mature_miRNA\`, ${assayDataSelectors} \`s\`.\`active\` from Mature_miRNA_sequence seq,  Mature_miRNA m, ${fromBlock} \`Study\` \`s\` where ${whereBlock} s.id=${studyId} AND ad0.mature_miRNA = m.accession AND m.sequence_id = seq.id `
        await db.sequelize.query(`DROP VIEW IF EXISTS AssayData${studyId}`);
        let view=await db.sequelize.query(`CREATE VIEW AssayData${studyId} AS ${query}`)
        let [results,metadata]=await db.sequelize.query(`SELECT * FROM AssayData${studyId} limit 500`)
        let letDrop=await db.sequelize.query(`DROP VIEW AssayData${studyId}`)
        return results
    }catch (e) {
        return e
    }

}

function getAssayDataForStudy2(studyId){
    //TODO add
    return db['Mature_miRNA'].findAll({
        include: [{
            model: db['Assay_data'],
            include: [{
                model: db['Assay'],
                where: {
                    study: studyId
                }
            },]
        }, {
            model: db['Mature_miRNA_sequence']
        }],
    }).then(data=>{
        return data.map(mat=>{
            try {
                mat.dataValues.Sequence = mat.dataValues.Mature_miRNA_sequence.dataValues.sequence
                Object.assign(mat.dataValues,
                    mat.dataValues.Assay_data.reduce((acc, cur) => {
                        acc["Raw." + cur.dataValues.Assay.dataValues["name"]] = cur.dataValues['raw']
                        acc["CPM." + cur.dataValues.Assay.dataValues["name"]] = cur.dataValues['cpm']
                        return acc
                    }, {})
                )
                killAttributes.forEach(killAttribute=>{
                    delete mat.dataValues[killAttribute]
                })
                return Object.assign({Sequence:mat.dataValues.sequence,Name:mat.dataValues.name,Accession:mat.dataValues.accession},mat.dataValues)
            }catch(e){
                console.log('This row is incomplete')
            }
        })
    })
}

module.exports = {getAssayDataForStudy}