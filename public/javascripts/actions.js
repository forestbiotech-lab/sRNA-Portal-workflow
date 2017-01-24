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
});