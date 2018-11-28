function loadTypeAhead(){
  //Auto complete with typeahead https://github.com/bassjobsen/Bootstrap-3-Typeahead
  var autocomplete_name=$.get({
    url: '/javascripts/DB_mature_miRNA_name.json',  
    dataType:'json'
  });
  var autocomplete_sequence=$.get({
    url: '/javascripts/DB_mature_miRNA_sequence.json', 
    dataType:'json'
  });

    Promise.all([autocomplete_name,autocomplete_sequence]).then(function(values){
      //texts in order
      let data={
        "miRNA name": values[0],
        "Sequence": values[1]
      }
      let element=$('select.custom-select#searchOptions')
      let target=$('input.form-control#searchText')
      addTypeaheadListenerTo(element,target,data)
    })
  }
  //Clear table function
  //!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!?????????STAY?
  function clearTable(){
    $('table.DBvalues tr.tableRow.DBvalues').remove();
  }

 function addTypeaheadListenerTo(element,target,data){
  let select=element[0]
  let selectedIndex=select.selectedIndex;
  let selectedText=select[selectedIndex].text
  let values=data[selectedText];
  let selectedTitle=select[selectedIndex].title
  target.closest('.input-group.searchText').tooltip({
    boundary:'window',
    title:selectedTitle,
    placement:'top'
  })
  target.typeahead({ 
    source:values,
    autoSelect:true
  });

  element.change(function(){
    target.typeahead('destroy')
    
    let select=element[0]
    let selectedIndex=select.selectedIndex;
    let selectedText=select[selectedIndex].text;      
    let selectedTitle=select[selectedIndex].title
    let selectedPlaceholder=select[selectedIndex].attributes.placeholder.value
    let values=data[selectedText];
    target.closest('.input-group.searchText').attr('data-original-title',selectedTitle)
    target.attr('placeholder',selectedPlaceholder)
    target.typeahead({ 
      source:values,
      autoSelect:true
    });
  })    
}

function loadGraph(element,accession){
  $.get({
    url:"/db/api/v1/linkedMatureMiRNA?accession="+accession,
    success:function(data){
      let graphDataStrucutre=setGraphStrucutre(data)
      loadChart(graphDataStrucutre,accession)
    },
    dataType:"json"
  })
}

function loadFeatures(data){
  let _data=data.result.data
  //More than one feature? If it exists will only show last one.
  for ( i in _data){
    let dataPoint=_data[i]
    let mature_id=dataPoint.mature_miRNA_id
    let target=$('table.DBvalues tr[mature_id|="'+mature_id+'"]')
        
    getTemplate('accordionCard',callback)

    function callback(ajaxTemplate){
      
      target.after(ajaxTemplate)
      let insertedTemplate = target.next("tr").find('.collapse');
      let precursorAcc=dataPoint.Precursor.accession;
      insertedTemplate.attr('id',"mature_id"+mature_id)

      let svg=insertedTemplate.find("svg")
      svg.attr("id",precursorAcc)
      let seqView=insertedTemplate.find("#sequence-viewer")
      let options={
        'title':"Precursor sequence",
        'search': false,
        'toolbar': false,
        'header' : {
                    display:true,
                    searchInTitle :true,
                    unit: "Char",
                    showCpl: true,
                    badgeWithUnit : false
        }
      }
      let selection=[{
        start: 1,
        end: 22,
        color: "black", 
        underscore: false,
        bgcolor: "white",
        tooltip: "mature sequence"  
      }];
      let legend = [{
        name: "Mature Protein", 
        color: "#ff0000", 
        underscore: false
      }];

      seqView.attr("id","sequence-viewer-"+precursorAcc)

      populateElement(insertedTemplate,dataPoint)
      
      // Render the sequence with or without rendering options
      // (Check the interactive documentation)
      var sequence=insertedTemplate.find(".pre-sequence").text()
      sequenceViewer(sequence,"#sequence-viewer-"+precursorAcc,options,selection,legend)
      loadGraph(svg,precursorAcc);
    } 
  }
}


function loadFilter(data,metadata){
  getTemplate('checkbox',callback);

  function callback(ajaxForm){
    let filters=$('.database .panel .filters');
    filters.empty().append(ajaxForm);
    let form = filters.children(':last')
    changeClasses(form,[metadata.formClassLabel],[])
    let organismFilter=filters.children('.form-check.'+metadata.formClassLabel);
    organismFilter.children('.title').text(metadata.title)
    
    var keys=Object.keys(data)
    for( k in keys ){
      var checkbox=form.children('.sample').clone()
      changeAttrs(checkbox,[],['hidden']);
      changeClasses(checkbox,['checkbox-group-'+metadata.table,keys[k]],['sample']);
      checkbox.attr('table',metadata.table)

      checkbox.children('input').attr('id',keys[k])
      checkbox.children('label').text(data[keys[k]])
      checkbox.children('label').attr('for',keys[k])
      form.append(checkbox)
      checkbox.children('input').change(filter);
    }
    setSelectFilters(filters)
  }
}  

function loadSearch(context){
  let button=context;
  let form=context.closest('.searchDBform')
  let call=form.find('select#searchOptions option:selected').attr('call');
  let searchText=form.find('input#searchText').val()
  let table=$('table.miRNAs.DBvalues')
  let row=cloneElement(table.find('tr.sampleSource'));  
  let url='/db/api/v1/'+call  
  let parameters={
    searchText:searchText
  }
  getSearchResults(url,parameters,success,fail)

  function success(data){
      changeButtonStyle(button,'btn-primary','btn-success')

      if(typeof data.result === "undefined"){
        let results=[]
        const totalCount=0
        loadResults(results,totalCount,row,searchText,table,button)
      }else{
        let results=data.result.data
        let organisms=getOrganisms(results)
        const totalCount=data.metadata.pagination.totalCount;        
        //actions
        metadata={
           title:"Filter organisms",
           formClassLabel:"organismFilter",
           table:"Organism"
        }  
        loadFilter(organisms,metadata)
        loadResults(results,totalCount,row,searchText,table,button)
        restoreButtonStyle(button,'btn-success')
      }
  }

  function fail(response){
    console.log("FAIL")
    //Depends on: button,row
    changeButtonStyle(button,'btn-primary','btn-danger')
    
    let status=response.status;
    let statusText=response.statusText;
    let responseText=response.responseText;      
    let data={
      type: "error",
      status: status,
      statusText: statusText,
      responseText: responseText
    }

    row=loadCellFailure(row,data)
    table.find('tbody').append(row); 
    table.find('tr.DBvalues .expand-row').remove()     
    restoreButtonStyle(button,'btn-danger')
  }

}




//Tests whether the query got a null set
function loadResults(results,totalCount,row,searchText,table,button){
  if (totalCount>0){
    for (var i = 0; i < totalCount; i++) {
      let fullRow=fillRow(row,results[i]);
      //Add values into cell
      table.find('tbody').append(fullRow);
    let expand=table.find('tr.DBvalues .expand-row')
    expand.click(getFeatures);
    addTableSorter(table);
    }
  }else{
    changeButtonStyle(button,'btn-success','btn-danger')
    searchText=searchText || "no text given!"
    let data={}
    data.type='warning';
    data.status='Executing your query raised the following warning:'          
    data.text='no results found for your query: <strong>'+searchText+"</strong>";
    row=loadCellFailure(row,data);
    table.find('tbody').append(row);

    table.find('tr.DBvalues .expand-row').remove()      
    restoreButtonStyle(button,'btn-danger')
  }
}



function addTableSorter(element){
  //Currently applies to tables with CLASS .resizableTable
  //Table Sorter: https://mottie.github.io/tablesorter/docs/example-widget-resizable.html
  element.tablesorter({
    // initialize zebra striping and resizable widgets on the table
    widgets: [ 'resizable' ],
    widgetOptions: {
      resizable_addLastColumn : true
    }
  });
}

function loadCellFailure(row,data){
  changeClasses(row,['tableRow','DBvalues',data.type],['sampleSource','d-none']);
  let uniqueCell=row.children('td:nth(0)').clone();
  row.children('td').remove();
  uniqueCell.attr('colspan',4);
  
  if( data.type=='warning'){
    let errorHeader='Warning!'
    errorStatus='<p><strong>Status:</strong>'+data.status+'</p>'
    errorMessage='<p>'+data.text+'</p>'
    let alert='<div class="alert alert-warning" role="alert"><h4 class="alert-heading">'+errorHeader+'</h4>'+errorStatus+'<hr>'+errorMessage+'</div>'

    uniqueCell.append(alert);
  }  
  if( data.type=='error' ){
    let errorHeader='Attention! An error occurred'
    errorStatus='<p><strong>Status:</strong>'+data.status+' - '+data.statusText+'</p>'
    errorMessage='<p><strong>Response:</strong>'+data.responseText+'</p>'
    let errorAlert='<div class="alert alert-danger" role="alert"><h4 class="alert-heading">'+errorHeader+'</h4>'+errorStatus+'<hr>'+errorMessage+'</div>'
    uniqueCell.append(errorAlert);
  }  //Message 
  row.append(uniqueCell);
  return row;
}


