var getOptions=require('./getOptions');


/**
* @ resolveCall -  function to query the database for a given call
                   and process the result.
*
* @params call - The call to retrieve the data
* @params req - Express router, request
* @params res - Express router, result
* @params errMsg - Message to be displayed if an error is caught
* @params [view] Optional - Give the json to a view instead
*
*/


function resolveCall(call,req,res,errMsg,view){

  var options=getOptions(req);
  call(options).then(function(callRes){
    if (view){

      res.render(view,callRes)
    }else{
      console.log(callRes.result.data)
      res.status(200).json(callRes);
    }
  }).catch(function(err){
    console.trace(errMsg+err)
    resolveError(res,err);
  })
}
function resolveError(res,err){
  var statusCode;
  try{
    statusCode=err.metadata.status[0].code;
  }
  catch(error){
    statusCode=500;
  }
  res.status(statusCode).json(err);  
}


module.exports={
	resolveCall:resolveCall
}
