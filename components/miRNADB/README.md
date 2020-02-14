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
    row_attributes:{},  //Takes several attributes here but only single Objects.
    targets:{}          //
  },
  header:{},
  grouping_attributes:{},
  metadata:{
    row:{},  //given to the other elements
    cell:{} //given to grouped elements
  }
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
This can be done simply by placing single value Objects in the "metadata.cell" Object

### Adding metadata to the other attributes
The metadata.row attributes are given to the other attributes. 


### Using arrays in the input file instead of a single value Object
If you need to pass a list of values add it as an [array object](https://github.com/forestbiotech-lab/sRNA-Portal-workflow/tree/master/components/miRNADB/structures#creating-an-array-of-objects) with the name list this will not be added to the table but can be processed to access the best option to show.  
