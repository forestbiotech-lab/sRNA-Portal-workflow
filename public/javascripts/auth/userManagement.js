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
    let deployRow=self.closest('tr').next('tr').find('.card-body')
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
  $('td button.get-sessions').on("click",function(){
    let self=$(this)
    let deployRow=self.closest('tr').next('tr').find('.card-body')
    if(deployRow.children().length==0){
      getSessions(self)
    }
  })
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