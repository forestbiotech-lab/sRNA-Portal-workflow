$(document).ready(function(){
	$('.btn.launch-target-modal').click(function(){

    sequence="AAATTTAAGGTGATCAGTTTTAGC"
    study_id=1
    $.ajax({
      url:`/de/targets/get/db/sequence/target/${study_id}`,
      type: 'POST',
      data:{sequence},
      success:function(data,textStatus,jqXHR){
        data=data.result.data
        let table=makeTableFromNestedArrayMatrix(data)
        $('.modal-body').append(table)
      },error:function(qXHR,textStatus,err){
        console.log(err)
      }
    })
  })
	
})