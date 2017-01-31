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
  $('img.expandPanel').toggle('hidden');
  $('img.collapsePanel').toggle('hidden');  
}

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
            for(i=0; i<uploads.length; i++){
              row=$('table.annotationTable tbody tr.sample').clone().removeAttr('hidden').removeClass('sample');
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


  //
  $('#myModal .termSearch .btn.search').click(function(){
    term=$('#myModal .termSearch #inlineTextTerm').val();
    $.ajax({
      url: '/search-term?term='+term,
      type: 'POST',
      //data: 'term='+term,
      //application/json;charset=utf-8
      contentType: false,//'application/x-www-form-urlencoded;charset=UTF-8',
      processData: false,
      success: function(data,textStatus,jqXHR){  
        console.log(data);
        table=$('table.termTable');
        $('table.termTable [class*=row]').remove();
        table.removeAttr('hidden');
        for(i=0; i<data.bioportal.length; i++){
          row=$('table.termTable tr.sample').clone().removeAttr('hidden').removeClass('sample').addClass('row'+i);
          row.children('.term').text(data.bioportal[i].prefLabel);
          row.children('.ontology').text(data.bioportal[i].links.ontology.split("/").reverse()[0]);
          row.children('.definition').text(data.bioportal[i].definition);
          row.children('.definition').text(row.children('.definition').text().substring(0,100)+"...");
          row.appendTo('table.termTable tbody');
        }
      }
    })
  })
});