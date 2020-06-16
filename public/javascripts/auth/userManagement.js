$(document).ready(function(){

  function toggleElement(newState,userId,url,self){
    $.ajax({
      url,
      method:"POST",
      data:{
        newState,
        userId
      },
      success:function(data,textStatus,jqXHR){
        console.log("ok")
      },
      fail:function(jqXHR,textStatus,error){
        toggleState(self,newState)
      }
    })
  }
  function getSessions(){

  }

  $("td .active-switch").on("change",function(){
    let self=$(this)
    let row=self.closest('tr')
    let userId=row.attr("user-id")
    let input=self.find('input')
    let newState=input.val()
    toggleElement(newState,userId,"/auth/active",input)
  })
  $("td .ban-switch").on("change",function(){
    let self=$(this)
    let row=self.closest('tr')
    let userId=row.attr("user-id")
    let input=self.find('input')
    let newState=input.prop("checked")
    toggleElement(newState,userId,"/auth/ban",input)
  })
  function toggleState(self,currentState){
    if(currentState==true){
      self.prop('checked',false)
    }else{
      self.prop('checked',true)
    }
  }

})