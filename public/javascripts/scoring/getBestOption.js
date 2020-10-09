var descriptionExclusions=[
  "unknown",
  "---NA---"
]
function processList(list){
  return getLowestScore('expectation',list)
}



function getLowestScore(key,list){
  let score={index:null,value:null}
  list.forEach(function(target,index){
    if(index==0){
      score.index=0 
      score.value=target[key]
    }else{
      if(target[key]<score.value && descriptionExclusions.indexOf(target['target_description'])==-1){
        score.index=index
        score.value=target[key]        
      }
    }
  })
  return list[score.index] // or maby [] if not found
}