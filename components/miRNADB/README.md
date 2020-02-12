## API Calls

This section list all the call addresses and their responses

https://[host]/db/v1/api/

#### Call sequence
* **Address:** /sequence
* **Description:** This call searches the in the database for mature miRNA sequence. 
* **DataModel specification:** 
	* **Table:** Mature_miRNA 
	* **Column:** sequence   

#### Call name
* **address:** /name
* **Description: ** This call searches the in the database for mature miRNA name. 
* **DataModel specification:**
	* **Table**: Mature_miRNA 
	* **Column**: name   




## Assemble Assay_Data 

This groups the information for each assay

The struture for this call has 4 main attributes:
```javascript
{
  group:{},
  attributes:{
    row_attributes:{},
    targets:{}
  },
  header:{},
  grouping_attributes:{},
  metadata:{}
}	
```

Structure of the result grouped by sequence or any other grouping
```javascript
{
  headers:{
    attribute1:{
      value:"",
      metadata:{
        id:""
      }
    },
    "row_attributes":{
      value:"",
      metadata:{
        id:"",
        type:""
      }
    }

  },
  rows:{
    "ATGC":{ //Sequence key
      "header1":{//header values of each sequence
        value:"",
        metadata:{
          type:"" //raw | cpm
          id:""  //Assay_data id
          assayId:"" //Assay id
        }
      },
      "row_attributes":{
        "attr1":{
          value:{},
          metadata:{
            id:"header"  
          }
        }
      },
      "targets":{
        "attr1":{
          value:{},
          metadata:{
            id:"header"  
          }
        }
      }
    },
    "ATGCC":{}  //another sequence
  }
}
```

The attributes placed in the "grouping_attributes" attribute, will be appended if they are in a result row with the same grouping element. The other attributes are seperated.


### Adding metadata to grouped attributes

### Adding metadata to the other attributes