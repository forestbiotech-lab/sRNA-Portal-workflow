$(document).ready(function(){

  $('.searchDBform button.DBsearch').on('click',function(){
    let button=$(this);
    let call=$('.searchDBform select#searchOptions option:selected').attr('call');
    let searchText=$('.searchDBform input#searchText').val()
    let row=cloneElement($('table.DBvalues tr.sampleSource'));
    //Further specify if you need another table
    let table=cloneElement($('table.DBvalues'))
    clearTable();

    $.get({
      url: '/db/v1/api/'+call+'?searchText='+searchText, 
      success: function(data){
        //Head
        changeButtonStyle(button,'btn-primary','btn-success')
        
        //Defintion of vars
        let results=data.result.data
        let organisms=getOrganisms(results)
        const totalCount=data.metadata.pagination.totalCount;

        //actions
        metadata={
           title:"Filter organisms",
           formClassLabel:"organismFilter",
           table:"Organism"
        }  
        addFilter(organisms,metadata)
        successfulQuery(results,totalCount,row,searchText)
        addTableSorter(table);
        //Final
        restoreButtonStyle(button,'btn-success')
      }
    }).fail(function(response){
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

      row=addInfo(row,data)
      $('table.DBvalues tbody').append(row); 

      restoreButtonStyle(button,'btn-danger')
    })
  })

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
    let target=$('.form-control#searchText')
    addTypeaheadListenerTo(element,target,data)
  })
  //Ends - Auto complete with typeahead https://github.com/bassjobsen/Bootstrap-3-Typeahead

  //Clear table function
  function clearTable(){
    $('table.DBvalues tr.tableRow.DBvalues').remove();
  }

  //Function to add values to row???????
  function fillRow(row,data){
    let organism=data.Organism.id
    row=cloneElement(row) 
    changeClasses(row,['tableRow','DBvalues'],['sampleSource']);
    changeAttrs(row,[],['hidden']);
    row.attr('organism_id',organism)

    row.children('td').each(function(){
      let attribute=$(this).attr('dbAttr');
      let value=data[attribute];
      $(this).text(value);
    })
    return row;
  }

  function addInfo(row,data){
    changeClasses(row,['tableRow','DBvalues',data.type],['sampleSource']);
    changeAttrs(row,[],['hidden']);

    let uniqueCell=row.children('td:nth(0)').clone();
    
    row.children('td').remove();
    uniqueCell.attr('colspan',4);
    
    if( data.type=='warning'){
      uniqueCell.append(data.text);
    }  
    if( data.type=='error' ){    
      uniqueCell.append('<p><strong>An error occurred</strong></p>');
      uniqueCell.append('<p>Status: '+data.status+' '+data.statusText+'</p>');
      uniqueCell.append('<p>'+data.responseText+'</p>');
    }  

    row.append(uniqueCell);
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
    button.removeClass(fromStyle).addClass(toStyle);
  }
  function changeClasses(element,addClasses,rmClasses){
    for (a in addClasses){
      element.addClass(addClasses[a])
    }
    for (r in rmClasses){
      element.removeClass(rmClasses[r])
    }
  }
  function changeAttrs(element,addAttrs,rmAttrs){
    for (a in addAttrs){
      element.attr(addAttrs[a],"")
    }
    for (r in rmAttrs){
      element.removeAttr(rmAttrs[r])
    }      
  }
  function cloneElement(element){
    return element.clone()
  }

  function addTypeaheadListenerTo(element,target,data){
    let select=element[0]
    let selectedIndex=select.selectedIndex;
    let selectedText=select[selectedIndex].text
    let values=data[selectedText]
    target.typeahead({ 
      source:values,
      autoSelect:true
    });

    element.change(function(){
      target.typeahead('destroy')
   
      let select=element[0]
      let selectedIndex=select.selectedIndex;
      let selectedText=select[selectedIndex].text;      
      let values=data[selectedText];

      target.typeahead({ 
        source:values,
        autoSelect:true
      });
    })    
  }

  function successfulQuery(results,totalCount,row,searchText){
    if (totalCount>0){
      for (var i = 0; i < totalCount; i++) {
        let fullRow=fillRow(row,results[i]);
        //Add values into cell
        $('table.DBvalues tbody').append(fullRow); 
      }
    }else{
      console.log(searchText)
      searchText=searchText || "no text given!"
      let data={}
      data.type='warning';          
      data.text='<p>No results found for query: '+searchText+'</p>';

      row=addInfo(row,data);
      $('table.DBvalues tbody').append(row);
    }
  }

  function getOrganisms(data){
    result={}
    //Ensures unique organisms
    //Key is organism ID
    //Value is Genus species (common name) [NCBI ID:XXXX]
    for (i in data){
      entry=data[i].Organism
      result[entry.id]=entry.genus+" "+entry.species+" ("+entry.common_name+") - [NCBI ID:"+entry.ncbi_taxon_id+"]"
    }
    return result
  }

  function addFilter(data,metadata){
    getPart('checkbox',callback);
  
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
    }
  }

  function filter(){
    let element=$(this);
    let id=element.attr('id');
    let filterRows=$('.DBvalues.tableRow[organism_id|="'+id+'"]')
    if(element.prop('checked')){
      changeAttrs(filterRows,[],['hidden'])
    }else{
      changeAttrs(filterRows,['hidden'],[])
    }
  }

  function getPart(part,cb){
   $.get({
    url: "/getParts/"+part,
    success: cb,
    dataType:"html"
   }) 
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
});

