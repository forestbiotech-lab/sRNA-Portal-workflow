## Transaction response for target 

For each line of the target file a response will be generated containing the transaction either commited or rolledback. The status object which is either a success or an error. With the detail of what likely happened.


#### Response object

``` javascript
  {
    status
  }
```

#### Transaction Object (Promise)
``` javascript
  Sequelize.transaction.commit() || Sequelize.transaction.rollback()
````

#### Status Object

``` javascript 
  {
    name:"",
    message:"",
    created:{
      feature_id:"",
      transcript_id:"",
      target_id:""
    },
    referenced:{
      mature_miRNA_id:"",
      study_id:""
    }
  }
```

### Error Objects

#### Sequence not found

```javascript

{
  name:"Error",
  message:`Sequence ${sequence} not found! - Rollback has been triggered for this line.`,
  description:{target_line:linenum,target_file:filename},
}
```
