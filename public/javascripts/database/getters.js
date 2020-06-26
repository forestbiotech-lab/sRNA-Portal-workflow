

function getTemplate(template,cb){
 $.get({
  url: "/forms/factory/"+template,
  success: cb,
  dataType:"html"
 }) 
}

function getOrganisms(data){
  result={}
  //Ensures unique organisms
  //Key is organism ID
  //Value is Genus species (common name) [NCBI ID:XXXX]
  for (i in data){
    entry=data[i].Organism
    result[entry.id]=entry.genus+" "+entry.specific_name+" ("+entry.common_name+") - [NCBI ID:"+entry.ncbi_taxon_id+"]"
  }
  return result
}


function getFeatures(){
  let row=$(this).closest('tr')
  let mature_id=row.attr('mature_id')
  let loaded=row.prop('loaded')
  if(!loaded){
    row.prop('loaded',true)
    $.get({
      url:"/db/api/v1/feature?matureId="+mature_id,
      success: loadFeatures,
      dataType:"json"
    })
  }else{
   row.next('tr').collapse('toggle')
  } 
}

function getSearchResults(url,parameters,success,fail){
  $.get({
    url: url,
    data:parameters,
    success:success,
    
  }).fail(fail)
}