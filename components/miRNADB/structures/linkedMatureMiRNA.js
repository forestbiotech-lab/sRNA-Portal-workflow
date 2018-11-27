//Requires: mature[accessions] and accession(pre)
module.exports={
	"accession":"",
	"mature_miRNA_id":{
		_table:["Mature_has_Pre","Mature_miRNA"],
		_attribute:"id"},
	"description":"",
	"mature": [ {
		_table:["Mature_has_Pre","Mature_miRNA"],
		_attribute:"accession"
	}],
}

