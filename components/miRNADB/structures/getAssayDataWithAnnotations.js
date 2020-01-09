module.exports={
	"group":{
		_table:"Annotation",
		Sequence:{
			_table:["Mature_miRNA","Mature_miRNA_sequence"],
			_attribute:"sequence"
		}
		
	},
	"attributes":{
		_table:"Annotation",
		Sequence:{
			_table:["Mature_miRNA","Mature_miRNA_sequence"],
			_attribute:"sequence"
		},
		Name:{
			_table:"Mature_miRNA",
			_attribute:"name"
		},
		Accession:{
			_table:"Mature_miRNA",
			_attribute:"accession"
		}
	},
	"header":{
		_table:"Assay",
		"assayName":"name",
	},
	"raw":"",
	"cpm":"",
	metadata:{
		_table:"./",
		row:{
			_table:"Assay",
			assayId:"id"		
		},
		cell:{
			_table:"./",
			id:"",
			assayId:{_table:"Assay",_attribute:"id"}
		}
	}

/*	"mature_miRNA_id":"id",
	"mature_accession":"accession",
	"mature_description":"description",
	"pre_sequence":{"_table":["Mature_has_Pre","Pre_miRNA","Pre_miRNA_sequence"],"_attribute":"sequence"},
	"Precursor":{
		"_table":["Mature_has_Pre","Pre_miRNA"],
		"id":"",
		"name":"",
		"accession":"",
		"description":"",
	},
	"Precursor_Feature":{
		"_table":["Mature_has_Pre","Pre_miRNA","Pre_has_Feature","Feature"],
		"name":"",
		"source":"",
		"type":"",
		"start":"",
		"end":"",
		"score":"",
		"strand":"",
		"phase":""

	},
	"Mature_Feature":{
		"_table":["Mature_has_Pre","Feature"],
		"name":"",
		"source":"",
		"type":"",
		"start":"",
		"end":"",
		"score":"",
		"strand":"",
		"phase":""
	}*/
}