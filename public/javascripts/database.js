$(document).ready(function(){

  $('.searchDBform button.DBsearch').on('click',function(){
    var call=$('.searchDBform select#searchOptions option:selected').attr('call');
    var searchText=$('.searchDBform input#searchText').val()
    $.get({
      url: '/db/v1/api/'+call+'?searchText='+searchText, 
      success: function(data){
        clearTable();
        for (var i = 0; i < data.length; i++) {
          var row=$('table.DBvalues tr.sampleSource').clone()
          row.addClass('tableRow').addClass('DBvalues').removeClass('sampleSource').removeAttr('hidden');
          row=fillRow(row,data[i]);
          //Add values into cell
          $('table.DBvalues tbody').append(row); 
        }
      }
    })
  })




  //Clear table function
  function clearTable(){
    $('table.DBvalues tr.tableRow.DBvalues').remove();
  }
  //Function to add values to row???????
  function fillRow(row,data){
    row.children('td').each(function(){
      var attribute=$(this).attr('dbAttr');
      var value=data[attribute];
      $(this).text(value);
    })
    return row;
  }

});