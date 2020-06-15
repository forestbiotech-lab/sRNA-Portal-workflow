$(document).ready(function(){

  function toggleBan(newState,userId){
    $.ajax({
      url:"/auth/ban",
      data:{
        newState,
        userId
      },
      success:function(data,textStatus,jqXHR){

      },
      fail:function(jqXHR,textStatus,error){

      }
    })
  }
  function toggleActive(newstate){

  }
  function getSessions(){

  }

  $("td .active-switch").on("change",function(){
    let self=$(this)
    let row=self.closest('tr')
    let userId=row.attr("user-id")
    let newState=self.find('input').val()
    toggleActive(newState,userId)
  })
  $("td .ban-switch").on("change",function(){
    let self=$(this)
    let row=self.closest('tr')
    let userId=row.attr("user-id")
    let newState=self.find('input').val()
    toggleBan(newState,userId)
  })
})