$(document).ready(()=>{
  $('body').on("loadedSelect",()=>{
    let personInfo=$(".welcome-panel span.person-name")
    let select=$('.form-Study select[id|=responsible]')
    let formGroup=select.closest('.form-group')
    formGroup.find('button').remove()
    select.remove()
    let hiddenResponsible=makeInput({type:"hidden",name:"responsible",value:personInfo.attr("person-id")})
    formGroup.append(hiddenResponsible)
    let shownResponsible=makeInput({type:"text",value:personInfo.text(),disabled:"true"})
    formGroup.append(shownResponsible)
    $(function () {
      $('[data-toggle="popover"]').popover()
    })
  })
})