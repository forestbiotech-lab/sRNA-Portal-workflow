$(document).ready(function(){
  //Must deal with resizing This becomes fixed for the session
  var sidePanel=$('.sidePanel');
  var sidePanelOriginalWidth=sidePanel.css('width');
  $('img.collapsePanel').click(function() {
    sidePanel.animate(
      { "width": "0px", "padding": "0px" }, 
      {duration: "slow",
        start: function(){
          newMainSize=sidePanelOriginalWidth.replace('px','')-20+"px";
          $('.mainPanel').animate(
          {"width": "+="+newMainSize},"slow")
        }, 
        progress: function(prom,progress,rem){
          if(progress>=0.75) sidePanel.children('.content').hide();
        },
        complete: toggleSidePanel()
      } 
    );    
    //sidePanel.removeClass('col-md-3');
    //$('.content').replaceClass('col-md-8','col-md-11')
  });  
  $('img.expandPanel').click(function() {
    $('.miRPursuitPanel').width(sidePanelOriginalWidth.replace('px','')-20+"px");
    //Store current value for getting back to previous value.
    sidePanel.animate(
      { "width": sidePanelOriginalWidth, "padding-left": "15px", "padding-right" :"15px" }, 
      { 
        duration: "slow",
        start: function(){
          newMainSize=sidePanelOriginalWidth.replace('px','')-20+"px";
          $('.mainPanel').animate(
          {"width": "-="+newMainSize},"slow")
        },  
        progress: function(prom,progress,rem){
          if(progress>=0.20) sidePanel.children('.content').show();
        },
        complete: toggleSidePanel()
      } 
    );
    //sidePanel.animate({ "width": "-=100%" }, "slow" );
    //sidePanel.removeClass('col-md-3');
    //toggleSidePanel()
  });

function toggleSidePanel(){
  $('.sidePanel').toggleClass('collapsedPanel');
  $('img.expandPanel').toggle('hidden');
  $('img.collapsePanel').toggle('hidden');
  $('.miRPursuitPanel').toggle('hidden');  
}



///Login Related
  //Set hover event for menu.
  $('.menu span.menuItem1').click(function(){window.location.replace('login')}).mouseover(function(){$(this).toggleClass('hover')}).mouseout(function(){$(this).toggleClass('hover')});
  $('.authElixir-button#authElixir').click(function(){window.location.replace('/elixir')}); 
  /*$('.manage-resource').click(function(){manageResource()});
  manageResource=function(){
  	data={
  		
  	     : $('.form .clientID').val(),
   	     : $('.form .registerToken').val()
    }
 	var url=$('.form .resourceURL').val(),
  	$.post();
  }	*/



  //Auto complete with typeahead https://github.com/bassjobsen/Bootstrap-3-Typeahead
  $.get({
    url: 'javascripts/ontologies.json', 
    success: function(data){
      processedData=[];
      for(i=0;i<data.length;i++){
        processedData[i]={"name": data[i].acronym+" - "+data[i].name}
      }
      $('.typeahead').typeahead({ 
        source:data,
        autoSelect:true
      });      
      $('table thead .ontoSelect').typeahead({ 
        source:processedData,
        autoSelect:true
      });
    }, 
    dataType:'json'
  });


  //Currently applies to tables with CLASS .resizableTable
  //Table Sorter: https://mottie.github.io/tablesorter/docs/example-widget-resizable.html
  $('.resizableTable').tablesorter({
    // initialize zebra striping and resizable widgets on the table
    widgets: [ 'resizable' ],
    widgetOptions: {
      storage_useSessionStorage : true,
      resizable_addLastColumn : true
    }
  });


  //Uploading files to server https://coligo.io/building-ajax-file-uploader-with-node/
  $('.upload-btn').on('click', function (){
    $('#upload-files').click();
    $('.progress-bar').text('0%');
    $('.progress-bar').width('0%');
  });
  $('#upload-files').on('change', function(){

    var files = $(this).get(0).files;
    if (files.length > 0){
      // One or more files selected, process the file upload
    
      // create a FormData object which will be sent as the data payload in the
      // AJAX request
      var formData = new FormData();

      // loop through all the selected files
      for (var i = 0; i < files.length; i++) {
        var file = files[i];

        // add the files to formData object for the data payload
        formData.append('uploads[]', file, file.name);
      }
      //console.log(files[0].name);
      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function(data,textStatus,jqXHR){
            console.log('upload successful!\n' + data);
            uploads=formData.getAll("uploads[]");
            $('table.annotationTable tbody tr.noFiles').hide()
            for(i=0; i<uploads.length; i++){
              row=$('table.annotationTable tbody tr.sample').clone().removeAttr('hidden').removeClass('sample').addClass('row'+i);
              row.children('th').text(formData.getAll("uploads[]")[i].name);
              row.appendTo('table.annotationTable tbody');
            }
        },
        xhr: function() {
          // create an XMLHttpRequest
          var xhr = new XMLHttpRequest();

          // listen to the 'progress' event
          xhr.upload.addEventListener('progress', function(evt) {

            if (evt.lengthComputable) {
              // calculate the percentage of upload completed
              var percentComplete = evt.loaded / evt.total;
              percentComplete = parseInt(percentComplete * 100);

              // update the Bootstrap progress bar with the new percentage
              $('.progress-bar').text(percentComplete + '%');
              $('.progress-bar').width(percentComplete + '%');

              // once the upload reaches 100%, set the progress bar text to done
              if (percentComplete === 100) {
                $('.progress-bar').html('Done');
              }

            }

          }, false);

          return xhr;
        }
      });
    }
  });

  // Setting attr to signal waiting for term
  $('table.annotationTable .btn[modalButton]').click(function(){
    //Set attribute to waiting
    $(this).attr('modalButton','waiting');
    //If modal Closes remove waiting from target and unbind this event. This is very specific to the element that triggered the event. It didn't really need to. But since it's done. Will be kept in case need in the future.
    var origin=$(this);
    $('.modal').off('hidden.bs.modal').on('hidden.bs.modal',{origin:origin},function(event){
        event.data.origin.attr('modalButton','');
    });
  });






  //Adding terms
  $('#termSearchModal .termSearch .btn.search').click(function(){
    term=$('#termSearchModal .termSearch #inlineTextTerm').val();
    console.log(encodeURI(term));
    //Should use form to ensure sanitation from formidable check on sanitation
    $.ajax({
      url: '/search-term?term='+encodeURI(term),
      type: 'POST',
      //data: 'term='+term,
      //application/json;charset=utf-8
      contentType: false,//'application/x-www-form-urlencoded;charset=UTF-8',
      processData: false,
      success: function(data,textStatus,jqXHR){  
        console.log(data);
        $('#termSearchModal #accordion').removeAttr('hidden');
        table=$('table.termTable');
        $('table.termTable [class*=row]').remove();
        table.removeAttr('hidden');
//Attention - reduce this to one for with nested for.
        for(i=0; i<data.bioportal.length; i++){
          var dataSend={};
          dataSend.termText= data.bioportal[i].prefLabel.toString();
          dataSend.ontology=data.bioportal[i].links.ontology.split("/").reverse()[0];
          dataSend.definition=data.bioportal[i].definition;
          dataSend.ui=data.bioportal[i].links.ui;

          row=$('table.termTable.bioportal tr.sample').clone().removeAttr('hidden').removeClass('sample').addClass('row'+i);
          row.children('.term').children('span.text').text(dataSend.termText);
          row.children('.term').children('a').attr('href',dataSend.ui);
          row.children('.ontology').text(dataSend.ontology);
          row.children('.definition').text(dataSend.definition);
          row.children('.definition').text(row.children('.definition').text().substring(0,100)+"...");
          row.click(dataSend, function(dataSend){
            //console.log(dataSend.data);
            data=dataSend.data;
            //$(this).children('.term').children('span.text').text().appendTo
            var target=$('table.annotationTable .btn[modalButton=waiting]')
            target.text(data.termText+" - "+data.ontology.substring(0,20))
            target.attr('modalButton','');
            typeof data.definition !== 'undefined'  ? target.attr('title',data.definition[0]): '';
            
            //hide modal
            $('.modal#termSearchModal').modal('hide');
          })
          row.appendTo('table.termTable.bioportal tbody');
        }

        for(i=0; i<data.agroportal.length; i++){
          var dataSend={};
          dataSend.termText= data.agroportal[i].prefLabel.toString();
          dataSend.ontology=data.agroportal[i].links.ontology.split("/").reverse()[0];
          dataSend.definition=data.agroportal[i].definition;
          dataSend.ui=data.agroportal[i].links.ui;

          row=$('table.termTable.agroportal tr.sample').clone().removeAttr('hidden').removeClass('sample').addClass('row'+i);
          row.children('.term').children('span.text').text(dataSend.termText);
          row.children('.term').children('a').attr('href',dataSend.ui);
          row.children('.ontology').text(dataSend.ontology);
          row.children('.definition').text(dataSend.definition);
          row.children('.definition').text(row.children('.definition').text().substring(0,100)+"...");
          row.click(dataSend, function(dataSend){
            //console.log(dataSend.data);
            data=dataSend.data;
            //$(this).children('.term').children('span.text').text().appendTo
            var target=$('table.annotationTable .btn[modalButton=waiting]')
            target.text(data.termText+" - "+data.ontology.substring(0,20))
            target.attr('modalButton','');
            typeof data.definition !== 'undefined'  ? target.attr('title',data.definition[0]): '';
            
            //hide modal
            $('.modal#termSearchModal').modal('hide');
          })
          row.appendTo('table.termTable.agroportal tbody');
        }
      }
    })
  });


  //Panel resize on move
  var width=$('.sidePanel').css('width').replace('px','')-20+"px";
  $('.miRPursuitPanel').css('width',width);
  //On load set to size of sidePanel
  $(window).resize(function(){  
    //if panel is collapsed set main to bigger size
    if( $('.sidePanel').hasClass('collapsedPanel') ){
      $('.mainPanel').width('100%');
      var mainPanel100=$('.mainPanel').width();
      //20 for sidepanel and another 20 for spacing (optional)
      $('.mainPanel').width(mainPanel100-20-20+"px");
      sidePanelOriginalWidth=mainPanel100*0.2+50+"px";
      console.log(mainPanel100*0.2+50);
    }
    else {
      $('.sidePanel').width('20%');
      $('.mainPanel').width('80%');
      var mainPanel80=$('.mainPanel').width()-50+"px";
      $('.mainPanel').width(mainPanel80);
      sidePanelOriginalWidth=sidePanel.css('width');
      console.log(sidePanelOriginalWidth);
    }
    var width=$('.sidePanel').css('width').replace('px','')-20+"px";
    $('.miRPursuitPanel').css('width',width);
  });


  //Hide .miRPursuitPanel
  $('.miRPursuitPanel button.close').click(function(){
    $('.miRPursuitPanel').hide();
  })
  // Advanced buttons 1 for to show miRPursuit panel (Temporary)
  $('#advancedOptions button.advancedButton2').click(function(){
      $('.miRPursuitPanel').toggle('hidden');
    });

  //Toggle Logs
  $('.miRPursuitPanel .openLogMenu').click(function(){
    if($('.miRPursuitPanel .subMenu').css('display') == "none"){
      path=$('.miRPursuitPanel .openLogMenu').attr('path');
      path=atob(path)+"log/";
      $.ajax({
        url: "/list?path="+path,
        type: 'POST',
        //data: 'term='+term,
        //application/json;charset=utf-8
        contentType: false,//'application/x-www-form-urlencoded;charset=UTF-8',
        processData: false,
        success: function(data,textStatus,jqXHR){
          //console.log(data);
          $('.miRPursuitPanel .subMenu').empty();
          var row=$('.miRPursuitPanel .buildingBlock .row').clone();
          row.addClass("content").removeClass("row").empty();
          row.appendTo('.miRPursuitPanel .subMenu');
          for(i=0;i<data.length;i++){
            var row=$('.miRPursuitPanel .buildingBlock .row').clone();
            if(data[i].match(/\.log$/g)==".log"){
              button=row.children('button').text(data[i].replace(/\.log/g,"")).removeClass('btn-info').addClass('btn-warning').addClass('logButton0');
            }else{
              button=row.children('button').text(data[i]);
            }
            row.appendTo('.miRPursuitPanel .subMenu .content');

          }
          var row=$('.miRPursuitPanel .buildingBlock .row').clone();
          button=row.children('button').text("Previous menu").removeClass('btn-info').addClass('btn-secondary').addClass('previousMenu0');
          row.appendTo('.miRPursuitPanel .subMenu');
            //Return to main menu.
          $('.miRPursuitPanel .subMenu .previousMenu0').click(function(){
            $('.miRPursuitPanel .subMenu').toggle('hidden');
            $('.miRPursuitPanel .mainMenu').toggle('hidden');
            $('.card.logs').hide();
            $('.card.logs .logContent p').empty();
            $('.miRPursuitPanel .subMenu').empty();
          })
          $('.miRPursuitPanel .logButton0').click(function(){
            //log intermediary should be another var
            var path=$('.miRPursuitPanel .openLogMenu').attr('path');
            path=path;
            level="log/"
            var file=btoa(level+$(this).text()+".log");
            $.ajax({
              url:"/cat",
              contentType: 'application/json', 
              type: "POST",
              data: JSON.stringify({path:path,file:file}),
              success: function(data,textStatus,jqXHR){
                //if textStatys 200 or OK
                var logContent=$(".logs .card-block .logContent p");
                logContent.empty();
                for(i=0;i<data.length; i++){
                  $(".logs .card-block .logContent p").append(data[i]+"<br>");
                }
                
              }
            })

          })
        }  
      })
      $('.card.logs').show();
      $('.miRPursuitPanel .subMenu').toggle('hidden');
      $('.miRPursuitPanel .mainMenu').toggle('hidden');
      //end for submenu hidden
    }else{
      $('.miRPursuitPanel .mainMenu').toggle('hidden');
      $('.miRPursuitPanel .subMenu').toggle('hidden');

    }
  })


  //Start miRPursuit
  $('.miRPursuitSettings .runMiRPursuit button').click(function(){
    var path=$('.miRPursuitPanel .openLogMenu').attr('path');

    $.ajax({
      url:"/run",
      type:"POST",
      contentType: 'application/json',
      data: JSON.stringify({path:path}),
      success: function(){
        console.log('done');
        $('.miRPursuitPanel').show();
        //updateProgress();//Might be to soon.
        setInterval(updateProgress,9000);
        
      }
    })



  })

  //Start miRPursuit
  function updateProgress(){
    var path=$('.miRPursuitPanel .openLogMenu').attr('path');
    $.ajax({
      url:"/progress",
      type:"POST",
      contentType: 'application/json',
      data: JSON.stringify({path:path}),
      success: function(data,textStatus,jqXHR){
        console.log(data);
        var state=$('.miRPursuitPanel .row span.state');
        var topState=$('.menu .miRPursuit-bar span.activity');
        var progress=$('.miRPursuitPanel .row .progress-bar');
        var topProgress=$('.menu .miRPursuit-bar .progress-bar');
        var step=$('.miRPursuitPanel .row span.step');
        state.text(data.state);
        topState.text(data.state);
        progress.text(data.progress).width(data.progress);
        topProgress.text(data.progress).width(data.progress);
        step.text(data.step);

        //code to remove setInterval(); Does it remove all of them? For now this is the only one
        data.progress=="100%" ? clearInterval() : console.log(data.progress);

      }
    })
  };




  // Advanced buttons 1 for annotation table
  $('#advancedOptions button.advancedButton1').click(function(){
      $('table.annotationTable .btn.advancedButton1').toggle('hidden');
    });

});