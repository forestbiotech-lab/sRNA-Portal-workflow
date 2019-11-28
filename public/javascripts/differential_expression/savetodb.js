$(documents).ready(function(){

  $('.card.upload-table .card-header button.upload-matrix').click(function(){
    $(this).closest('.card').find('.card-body tbody tr').each(function(){
      let that=$(this)
      let row=[]
      that.children('td').each(function(){
        row.push($(this).text())
      })
      uploadRow(row)
    })
  })




  function uploadRow(row){
    $.ajax({
      url: '/de/savetodatabase',
      type: 'PUT',
      data: row,
      dataType: 'json',
      success: function(data,textStatus,jqXHR){
        
      },error:function(jqXHR,textStatus,err){
  
      }
    })
  }


})