//PASSED INSPECTION
function fillRow(row,data){
  let organism=data['Organism'].id
  row=cloneElement(row) 
  changeClasses(row,['tableRow','DBvalues'],['sampleSource',"d-none"]);
  row.attr('organism_id',organism)
  row.attr('mature_id',data.id)
  row.find('td button.expand-row').attr('data-target','#sequence'+data.id)

  row.children('td').each(function(){
    let attribute=$(this).attr('dbAttr');
    let value=data[attribute];
    $(this).append(value);
  })
  return row;
}

function restoreButtonStyle(button,style){
  let _button=button
  const timeout=15000;
  setTimeout(
    function(){
      changeButtonStyle(_button,style,'btn-primary')
    }, 
    timeout
  )
}

function changeButtonStyle(button,fromStyle,toStyle){
  button.blur();
  changeClasses(button,[toStyle],[fromStyle])
}

function filter(){
  let element=$(this);
  let id=element.attr('id');
  let filterRows=$('.DBvalues.tableRow[organism_id|="'+id+'"]')
  if(element.prop('checked')){
    rmClasses(filterRows,['d-none'])
  }else{
    setClasses(filterRows,['d-none'])
  }
}

class graphData {
  constructor(){
    this.nodes=[];
    this.links=[];
  }
  node(id,group){
    this.nodes.push({
      id:id,
      group:group
    })
  }
  link(source,target,value){
    this.links.push({
      source:source,
      target:target,
      value:value
    })      
  }
  get data(){
    return {nodes:this.nodes,links:this.links}
  }
}

function setGraphStrucutre(data){
  data=data.result.data[0]
  graph=new graphData();
  let precursor=data.accession;
  graph.node(precursor,1)
  for(m in data.mature){
    graph.node(data.mature[m],6)
    graph.link(precursor,data.mature[m],6)
  }
  return graph.data
}
//PASSED INSPECTION




//Suggested name change
function populateElement(element,data){
  //Grabs all descendant elements with ".db-data" sub arrays with table
  element.find('.db-data').each(function(){
    let table=$(this).attr('table');
    let attribute=$(this).attr('dbAttr')
    if( table ){
      data[table] ? text=data[table][attribute] : text=""
      $(this).text(text)  
    }else{
      $(this).text(data[attribute])
    }
  })
}