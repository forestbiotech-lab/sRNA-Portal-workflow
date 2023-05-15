window.app=new Vue({
  data:{
    active:2
  },


})
$(document).ready(function(){
  function getSessions(self){
    $.ajax({
      url:"/auth/list/sessions",
      method:"POST",
      data:{},
      success:function(data,textStatus,jqXHR){
        loadTable(data,self)
      },
      fail:function(jqXHR,textStatus,error){
        console.log(jqXHR)
      }      
    })
  }
  function loadTable(data,self){
    let deployRow=self.closest('.card-header').next('#active-sessions').find('.card-body')
    if (data.length>0){    
      let table=mkel("table",{class:"table"})
      let headerNames=Object.keys(data[0])
      headerNames[0]="Revoke"
      let header=makeRow({"session-id":data[0].id},headerNames,{},true)
      deployRow.append(table)
      table.append(header)
      data.forEach(datum=>{
        let values=[]
        Object.keys(datum).forEach(key=>{
          if(key=="id"){
            values.push(makeButton({text:"",icon:"remove"},"btn btn-danger btn-sm"))
            /**
            @param {object}         content       text and icon
            @param {string/object}  attributes    button class or/ list of attributes
            @param {object}         action        Action for button
            function makeButton(content,classlist,action){
            **/
          }else{
            values.push(datum[key])
          }
        })
        table.append(makeRow({},values,{}))
      })
    }else{
      let p=mkel("p",{class:"text-center"})
      p.textContent="No active session"
      deployRow.append(p)
    }
  }


  $('button.active-sessions').click(function(){
    self=$(this)
    let deployRow=self.closest('h3').next('#active-sessions').find('.card-body')
    if(deployRow.children().length==0){
      getSessions(self)
    }
  })
  function encodeConfirmationToken(){
    let confirmationToken=$('input.hidden-confirmationToken').val()
    let encodedConfirmationToken=encodeURIComponent(confirmationToken)
    $('input.confirmationToken').val(encodedConfirmationToken)
  }
  encodeConfirmationToken()
})
