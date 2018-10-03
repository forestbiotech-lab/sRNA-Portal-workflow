$(document).ready(function(){

  $('.searchDBform button.DBsearch').on('click',function(){
    let button=$(this);
    let call=$('.searchDBform select#searchOptions option:selected').attr('call');
    let searchText=$('.searchDBform input#searchText').val()
    let row=cloneElement($('table.DBvalues tr.sampleSource'))
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
        successfulQuery(results,totalCount,row)

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
  $.get({
    url: '/javascripts/DB_mature_miRNA_name.json', 
    success: function(data){
      let element=$('select.custom-select#searchOptions')
      let target=$('.form-control#searchText')
      addTypeaheadListenerTo(element,target,data,"miRNA name")     
    }, 
    dataType:'json'
  });


  //Clear table function
  function clearTable(){
    $('table.DBvalues tr.tableRow.DBvalues').remove();
  }

  //Function to add values to row???????
  function fillRow(row,data){
    let organism=data.Organism.id

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
  function addTypeaheadListenerTo(element,target,data,text){
    element.change(function(){
      let select=element[0]
      let selectedIndex=select.selectedIndex;
      if(select[selectedIndex].text==text){
        target.typeahead({ 
          source:data,
          autoSelect:true
        });
      }
    })
  }
  function successfulQuery(results,totalCount,row){
    if (totalCount>0){
      for (var i = 0; i < totalCount; i++) {
        row=fillRow(row,results[i]);
        //Add values into cell
        $('table.DBvalues tbody').append(row); 
      }
    }else{
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
      }
    }
  }

  function getPart(part,cb){
   $.get({
    url: "/getParts/"+part,
    success: cb,
    dataType:"html"
   }) 
  }

});

