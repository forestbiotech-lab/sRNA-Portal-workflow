$(document).ready(function(){

  $('.searchDBform button.DBsearch').on('click',function(){
    let button=$(this);
    clearTable();
    var call=$('.searchDBform select#searchOptions option:selected').attr('call');
    var searchText=$('.searchDBform input#searchText').val()
    $.get({
      url: '/db/v1/api/'+call+'?searchText='+searchText, 
      success: function(data){
        changeButtonStyle(button,'btn-primary','btn-success')
        for (var i = 0; i < data.length; i++) {
          var row=$('table.DBvalues tr.sampleSource').clone()
          
          row=fillRow(row,data[i]);
          //Add values into cell
          $('table.DBvalues tbody').append(row); 
        }
        restoreButtonStyle(button,'btn-success')
      }
    }).fail(function(response){
      changeButtonStyle(button,'btn-primary','btn-danger')

      var row=$('table.DBvalues tr.sampleSource').clone()
      row.addClass('tableRow').addClass('DBvalues').removeClass('sampleSource').removeAttr('hidden');
      row.addClass('tableRow').addClass('error').removeClass('sampleSource').removeAttr('hidden');

      let uniqueCell=row.children('td:nth(0)').clone();
      row.children('td').remove();

      uniqueCell.attr('colspan',4);

      let status=response.status;
      let statusText=response.statusText;
      let responseText=response.responseText;
      
      uniqueCell.append('<p><strong>An error occurred</strong></p>');
      uniqueCell.append('<p>Status: '+status+' '+statusText+'</p>');
      uniqueCell.append('<p>'+responseText+'</p>');
      row.append(uniqueCell);
      $('table.DBvalues tbody').append(row); 
      restoreButtonStyle(button,'btn-danger')
    })
  })




  //Clear table function
  function clearTable(){
    $('table.DBvalues tr.tableRow.DBvalues').remove();
  }
  //Function to add values to row???????
  function fillRow(row,data,rowSpecificClass){
    let rowSpecificClass=rowSpecificClass || 'DBvalues';
    row.addClass('tableRow').addClass(rowSpecificClass).removeClass('sampleSource').removeAttr('hidden');
    row.children('td').each(function(){
      var attribute=$(this).attr('dbAttr');
      var value=data[attribute];
      $(this).text(value);
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
    button.removeClass(fromStyle).addClass(toStyle);
  }

});