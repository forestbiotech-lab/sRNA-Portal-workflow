$('document').ready(function() {
  var editableColumns = ["output", "type", "operation"]
  const colorLabels=["primary","secondary","success","danger","warning","info","light","dark"]
  $(function () {
  	$('[data-toggle="tooltip"]').tooltip()
  })
  class ColorPicker{
    constructor(colorLabels){
      this.labels=colorLabels
      this.name={}
    }
    pickLabel(name){
      if(this.name[name]){
        return this.name[name]
      }else{
        return this.setNewLabel(name)
      }
    }
    setNewLabel(name){
      this.name[name]=this.labels.pop()
      this.labels.unshift(this.name[name])
      return this.name[name]
    }
  }

  var design = false
  function hideIds(){
  	$('table.assays [colname|=id]').hide()
  	$('table.assays [colname|=modality_id]').hide()
  	$('table.assays [colname|=factor_id]').hide()
  	$('table.assays [colname|=assignment_id]').hide()
  }
  
  function addIds(){
  	$('table.assays tbody tr').each(function(){
  		let row=$(this)
  		let factor=row.find('td[colname|=factor]')
  		let factor_id=row.find('td[colname|=factor_id]')
  		let modality=row.find('td[colname|=modality]')
  		let modality_id=row.find('td[colname|=modality_id]')
  		let assignment_id=row.find('td[colname|=assignment_id]')
  		factor.attr("db-id",factor_id.text())
  		modality.attr("db-id",modality_id.text())
  		modality.attr("db-id-assignment",assignment_id.text())
  	})
  }
  $(function addFormType() {
  	$('table.assays tbody td[colname|=output]').attr('form-type','number')
  })

  hideIds()
  addIds()
  var label=new ColorPicker(colorLabels)
  //-------END---INITIATION ------------------------------------------


  $('.row.study-design .card-body button.add-factor').click(function() {
    addFactor($(this))
  })
  function addFactor(self) {
    let factor = "factor0"
    if (design) {
      factor = design.genFactor()
    } else {
      design = new Design()
      factor = design.genFactor()
    }
    let tbody = self.siblings('table').find('tbody')
    let delFactorButton = makeButton({
      icon: "remove",
      text: "remove"
    }, "btn btn-sm btn-danger remove-factor", {
      evt: "click",
      callback: deleteFactor
    })
    let modalityButton = makeButton({
      icon: "plus",
      text: "add modality"
    }, "btn btn-sm btn-success add-modality", {
      evt: "click",
      callback: addModality
    })
    let factorInput = mkel("input", {
      type: "text",
      class: "form",
      role:"factor",
      placeHolder: factor
    })
    factorInput.addEventListener('change', saveFactor)
    let row = makeRow({
      id: "factor",
      factor: factor
    }, [delFactorButton, factorInput, modalityButton])
    tbody.append(row)
  }

  function saveFactor() {
    self = $(this)
    let factor = self.val().replace(/ /g,"_")
    let oldFactor = self.attr('placeHolder')
    if (uniqueFactorName(factor)) {
      renameFactor(self, oldFactor, factor)
    } else {
      resetInput(self, oldFactor)
      makeToolTipNotification(self, title = "Invalid Factor", msg = "Error: This factor already exists!")
    }
  }
  function saveModality() {
    self = $(this)
    let factor = getFactor(self)
    let newModality = self.val().replace(/ /g,"_")
    let oldModality = getModality(self)
    if (uniqueModalityNameInFactor(newModality, factor)) {
      renameModalityInFactor(self,factor, oldModality, newModality)
    } else {
      resetInput(self, oldModality)
      makeToolTipNotification(self, title = "Invalid Modality", msg = "Error: This modality already exist in this factor!")
    }
  }
  function makeToolTipNotification(self, title, msg) {
    $('.toast').toast('dispose')
    let toast = makeToast(title, msg)
    $('.toaster').append(toast)
    $('.toaster .toast').last().on('hide.bs.toast', function() {
      $(this).remove()
    })
    $('.toast').toast('show')
  }
  function resetInput(self, oldValue) {
    self.val("")
    self.attr('placeHolder', oldValue)
  }
  function uniqueFactorName(factor) {
    return design.exportFactor(factor) == undefined
  }
  function uniqueModalityNameInFactor(newModality, factor) {
    return design.exportFactor(factor)[newModality] == undefined
  }
  function renameFactor(self, oldFactor, factor) {
  	dbConstructiveActionFactor(self,factor)
    let multiSelectsAndExtractedIds=extractAndUnassignIdsForAllModalities(self,oldFactor)
    design.renameFactor(oldFactor, factor)
    let cell = self.closest('td')
    self.closest('tbody').find(`tr[factor|=${oldFactor}]`).attr("factor", factor)
    cell.html(factor)
    cell.off('dblclick')
    cell.dblclick(convertToForm)
    reselectAllOptionsOnModalitiesInFactor(multiSelectsAndExtractedIds)
  }
  function renameModalityInFactor(self,factor, oldModality, newModality) {
  	dbConstructiveActionModality(self,factor,newModality)
    let multiselectAndIds=extractAndUnassignIds(self)
    design.renameModalityInFactor(factor,oldModality,newModality)
    let cell = self.closest('td')
    self.closest('tr').attr("modality", newModality)
    cell.html(newModality)
    cell.off('dblclick')
    cell.dblclick(convertToForm)
    reselectAllOptionsOnModality(multiselectAndIds)
  }
  function extractAndUnassignIdsForAllModalities(self,factor){
    result=[]
    self.closest('tbody').find(`tr[id|=modality][factor|=${factor}]`).each(function(){
      result.push(extractAndUnassignIds($(this)))
    })
    return result
  }
  function extractAndUnassignIds(self){
    let multiselect=self.closest('tr').find('td select')
    let selectedIds=extractSelectedIds(multiselect)
    unselectAllOptionsOnModality(multiselect)
    return {multiselect,selectedIds}
  }  
  function reselectAllOptionsOnModalitiesInFactor(arg){
    arg=arg || []
    arg.forEach(modality=>{
      reselectAllOptionsOnModality(modality)
    })
  }  
  function convertToForm() {
    let self = $(this)
    let type = self.closest('tr').attr('id')
    let value = self.text()
    let formInput = mkel('input', {
      type: 'text',
      class: "form",
      placeHolder: value
    })
    formInput.addEventListener('change', (type=="factor"? saveFactor : saveModality))
    self.html(formInput)
  }
  function extractSelectedIds(multiselect){
    return multiselect.find('option:selected').map(function(a, item){return item.value;});
  }
  function unselectAllOptionsOnModality(multiselect){
    let extractedIds=extractSelectedIds(multiselect)
    Object.keys(extractedIds).forEach(key=>{
       let id=extractedIds[key]
        multiselect.multiselect('deselect',id,true)
     })
  }
  function reselectAllOptionsOnModality(arg){
    let multiselect=arg.multiselect
    let previouslySelectedIds=arg.selectedIds || {}
    Object.keys(previouslySelectedIds).forEach(key=>{
       let id=previouslySelectedIds[key]
        multiselect.multiselect('select',id,true)
     })      
  }


  async function deleteModality(action,self) {
    self = self || $(this)
    let factor = getFactor(self)
    let modality = getModality(self)
    design.removeModalityFromFactor(modality, factor)
    let multiselect=self.closest('tr').find('select')
    unselectAllOptionsOnModality(multiselect)
    let modalityId=self.closest('tr').attr('db-id')
    let result=await destroyEntry(table="Modality",{id:modalityId})
    self.closest('tr').remove()
  }
  async function deleteFactor() {
    let self = $(this)
    let factor = getFactor(self)
    deselectOptionsForAllModalitiesInFactor(self,factor)
    design.removeFactor(factor)
    let factorId=self.closest('tr').attr('db-id')
    let result=await destroyEntry(table="Factor",{id:factorId})
    self.closest(`tr[factor|=${factor}]`).remove()
  }
  function deselectOptionsForAllModalitiesInFactor(button,factor){
    let modalityRows=button.closest('tbody').find(`tr[id|=modality][factor|=${factor}] td button.remove-modality`)
    modalityRows.each(function(){
      deleteModality(null,$(this)) 
    })
  }
  function addModality() {
    let self = $(this)
    let factor = getFactor(self)
    let modality = design.genModalityInFactor(factor)
    let delModalityButton = makeButton({
      icon: "remove",
      text: "remove"
    }, "btn btn-sm btn-danger remove-modality", {
      evt: "click",
      callback: deleteModality
    })
    let modalityInput = mkel("input", {
      type: "text",
      class: "form",
      role:"modality",
      placeHolder: modality
    })
    modalityInput.addEventListener('change', saveModality)
    var assayAttr=[];$('table.assays tbody td[colname|=name]').each(function(){
      let text=$(this).closest('tr').find('td[colname|=factor]').text().length
      assayAttr.push({
        //disabled:($(this).closest('tr').find('td[colname|=factor] span').length>0? true: null),  //disabled is one of those elements that if present disables whether or not it's available condition is ok by the way!
        name:$(this).text(),
        id:$(this).closest('tr').find('td[colname|=id]').text(),
        value:$(this).closest('tr').find('td[colname|=id]').text()
      })
    })
    let select=makeSelect({class:"form-control d-none modality-multiselect",multiple:"multiple"},assayAttr)
    let row = makeRow({
      id: "modality",
      factor,
      modality
    },[delModalityButton, select, modalityInput])
    self.closest('tr').after(row)
    let placedSelect=self.closest('tr').next().find('select')
    placedSelect.multiselect({
          enableClickableOptGroups: true,
          enableCollapsibleOptGroups: true,
          maxHeight: 200,
          onChange:identifyAssays
    });
    placedSelect.multiselect({
      onChange: function(option, checked, select) {
        alert('onChange triggered ...');
      }
    });
 
    async function identifyAssays(option, checked, select) {
      let self=$(this)[0].$select
      let modalityId=self.closest('tr').attr('db-id')
      let self2=this.$select
      let factor=getFactor(self)
      let modality=getModality(self)
      let table=$('table.assays')
      let assay=new Assay(option[0].id,option[0].label)
      let assayRow=$(`table.assays tbody tr[id|=${assay.id}]`)
      let tdFactor=assayRow.find('td[colname|=factor]')
      let tdModality=assayRow.find('td[colname|=modality]')
      if(checked){
        let result=await createEntry(table="Assay_Modality",attribute={assay_id:assay.id,modality_id:modalityId})
        let assignmentId=result.id
        let factorBadge=mkel('span',{class:`badge badge-${labels.pickLabel(factor)}`})
        factorBadge.textContent=factor
        tdFactor.html(factorBadge)
        let modalityBadge=mkel('span',{class:`badge badge-${labels.pickLabel(modality)}`})
        modalityBadge.textContent=modality
        tdModality.html(modalityBadge)
        tdModality.attr('db-id-assignment',assignmentId)
          
        toggleAssayInOtherMultiSelects(self,assay,true)  
      }else{
        let assignmentId=tdModality.attr('db-id-assignment')
        let result=await destroyEntry(table="Assay_Modality",{id:assignmentId})

        tdFactor.empty()
        tdModality.empty()
        toggleAssayInOtherMultiSelects(self,assay,false)  
      }

    }
  }
  function toggleAssayInOtherMultiSelects(multiselect,assay,deactivate){
    multiselect.prop('selected',true)
    let otherSelects=$('table.design-factory tr[id|=modality] select:not(:selected)')
    otherSelects.find(`option[value|=${assay.id}]`).attr('disabled',deactivate)
    otherSelects.multiselect('rebuild')
    multiselect.prop('selected',false)
  }
  function getFactor(self) {
    let row=self.closest('tr')
    return row.attr('factor')
  }
  function getModality(self) {
    return self.closest('tr').attr('modality')
  }


  //-------------------------Generate-CONTRASTS----------------------------------
  $('.row.study-design .card-body button.generate-contrasts').click(function() {
    let self = $(this)
    
    let designObject=design.exportDesign
    

    let designCard=getDesignCard()

    function getDesignCard(){
      let designCard=self.closest('.card-body').next('.card-body.design-matrix')
      if(designCard.length==0){
        designCard=mkel('div', {
          class: "card-body design-matrix"
          }
        )
        self.closest('.card-body').after(designCard)
        designCard=self.closest('.card-body').next('.card-body.design-matrix')          
      }
      return designCard
    }
    designCard.empty()
    
    

    Object.keys(designObject).forEach(factor1=>{
      Object.keys(designObject).forEach(factor2=>{
      	Object.keys(designObject[factor1]).forEach(modality1=>{
          Object.keys(designObject[factor2]).forEach(modality2=>{
            if(! modality1.startsWith("__") && ! modality2.startsWith("__")){ 
                       
              let spanFactor1 = mkel('span', {
                class: `badge badge-${label.pickLabel(factor1)}`
              })
              let spanFactor2 = mkel('span', {
                class: `badge badge-${label.pickLabel(factor2)}`
              })
              let spanModality1 = mkel('span', {
                class: `badge badge-${label.pickLabel(modality1)}`
              })
              let spanModality2 = mkel('span', {
                class: `badge badge-${label.pickLabel(modality2)}`
              })
              let card = mkel('div', {
                class: "container"
              })
              let checkbox = mkel('input', {
                class: "form-check-input",
                type:"checkbox"
              })


              //let spanFactor2=spanFactor.cloneNode(true)
              //let spanModality2=spanModality.cloneNode(true)
              spanFactor1.textContent=factor1
              spanFactor2.textContent=factor2
              spanModality1.textContent=modality1
              spanModality2.textContent=modality2
              card.append(checkbox)
              card.append(spanFactor1)
              card.append(spanModality1)
              card.append(spanFactor2)
              card.append(spanModality2)
              designCard.append(card)
            }
          })
        })
      })
    })
  })
  //------------END-----GEN--CONSTRASTS-----

  async function dbConstructiveActionModality(self,factor,newModality){
  	let row=self.closest('tr')
  	let dbName=row.attr('db-name')
  	let dbId=row.attr('db-id')
  	let factorId=row.closest('tbody').find(`tr[id|=factor][factor|=${factor}]`).attr('db-id')
  	if(dbId==undefined){
  	    let result=await createEntry(table="Modality",inserts={name:newModality,factor_id:factorId})
  		dbId=await result.id
  		setDbId(row,await dbId)
  		setDbName(row,newModality)
  	}else{
  		if(newModality!=dbName){
  			let result = await updateEntry(table="Modality",inserts={name:newModality,id:dbId})
  			if(result){
  			  setDbName(row,newModality)
  			}
  		}
  	}
  	function setDbId(row,dbId){
  		row.attr('db-id',dbId)
  	}
  	function setDbName(row,name){
  		row.attr('db-name',name)
  	}  	
  }

  async function dbConstructiveActionFactor(self,newFactor){
  	let row=self.closest('tr')
  	let dbName=row.attr('db-name')
  	let dbId=row.attr('db-id')
  	if(dbId==undefined){
  		let result=await createEntry(table="Factor",inserts={name:newFactor})
  		dbId=result.id
  		setDbId(row,await dbId)
  		setDbName(row,newFactor)
  	}else{
  		if(newFactor!=dbName){
  			let result=await updateEntry(table="Factor",inserts={name:newFactor,id:dbId})
  		}
  	}
  	function setDbId(row,dbId){
  		row.attr('db-id',dbId)
  	}
  	function setDbName(row,name){
  		row.attr('db-name',name)
  	}
  }

  //----------------DB---ACTIONS--------------
  function createEntry(tablename,attributes){
  	return $.ajax({
  		url:`/forms/create/entry/${tablename}`,
  		data: attributes,
  		type: "POST",
  	    success:((data,textStatus,jqXHR) =>{
    	  //TODO save Id of created element
    	}),
    	error:((qXHR,textStatus,err)=>{
	        makeToolTipNotification(self, textStatus,err)
    	})
  	})
  }
  function updateEntry(tablename,attributes){
  	return $.ajax({
  		url:`/forms/update/entry/${tablename}`,
  		data: attributes,
  		type: "POST",
  	    success:((data,textStatus,jqXHR) =>{
    	  //TODO save Id of created element
    	}),
    	error:((qXHR,textStatus,err)=>{
	        makeToolTipNotification(self, textStatus,err)
    	})
  	})
  }
  function destroyEntry(tablename,attributes){
	return $.ajax({
  		url:`/forms/destroy/entry/${tablename}`,
  		data: attributes,
  		type: "POST",
  	    success:((data,textStatus,jqXHR) =>{
    	  //TODO save Id of created element
    	}),
    	error:((qXHR,textStatus,err)=>{
	        makeToolTipNotification(self, textStatus,err)
    	})
  	})
  }
  //---------END---DB---ACTIONS---------------

  $('table.assays td').dblclick(function() {
    let self = $(this)
    if (editable(self)) {

      let currentText = self.text()
      let cellInput = mkel("input", {
        type: (self.attr("form-type")? self.attr("form-type"):"text"),
        class: "form",
        text: currentText
      })
      cellInput.addEventListener('change', saveValue)
      self.html(cellInput)
    }
  })
  function saveValue() {
    let self = $(this)
    let text = self.val()
    let attrName = self.closest('td').attr('colname')
    let id = self.closest('tr').find('td[colname|=id]').text()

    let data = {
      id
    }
    data[attrName] = text
    $.ajax({
      url: "/forms/update/singleTable/Assay",
      type: "POST",
      data,
      success(data, textStatus, jqXHR) {
        revertCell(self)
      },
      error(qXHR, textStatus, err) {
        console.log('not saving!')
        makeToolTipNotification(self, err, textStatus)
      }

    })
  }
  function revertCell(self) {
    let value = self.val()
    let td = self.closest('td')
    td.html(value)
  }
  function editable(self) {
    if (editableColumns.indexOf(self.attr('colname')) == -1) {
      return false
    } else {
      return true
    }
  }

  class Design {
    constructor() {
      this.design = {}
      this._serial = 0
    }
    set serial(serial) {
      this._serial = serial
    }
    get serial() {
      this._serial += 1
      return this._serial
    }
    genFactor() {
      let factor = `factor${this.serial}`
      this.design[factor]={}
      return factor
    }
    genModalityInFactor(factor) {
      let serial = Object.keys(this.design[factor]).length   ///Circle back to this because if might add extra increments
      let modality = `modality${serial}`
      this.design[factor][modality] = {}
      return modality
    }
    factorAttributes(factor,tr){
      this.design[factor]['__tr__']=tr
      this.design[factor]['__button__']=tr.find('td button.add-modality')
      this.design[factor]['__form__']=tr.find('td input[role|=factor]')
    }
    modalityAttributes(factor,modality,tr){
      this.design[factor][modality]['__tr__']=tr
      this.design[factor][modality]['__mutiselect__']=tr.find('td select.modality-multiselect')
      this.design[factor][modality]['__form__']=tr.find('td input[role|=modality]')
    }
    exportFactor(factor) {
      return this.design[factor]
    }
    exportModality(factor,modality) {
      return this.design[factor][modality]
    }    
    removeFactor(factor) {
      delete this.design[factor]
    }
    removeModalityFromFactor(modality, factor) {
      delete this.design[factor][modality]
    }
    get exportDesign() {
      return this.design
    }
    renameFactor(oldName, newName) {
      if(["__tr__","__button__","__form__"].indexOf(newName)>-1) throw new Error('Reserved namespace')
      this.design[newName] = Object.assign({}, this.design[oldName])
      delete this.design[oldName]
    }
    renameModalityInFactor(factor, oldName, newName) {
      if(["__tr__","__button__","__form__"].indexOf(newName)>-1) throw new Error('Reserved namespace')
      if (this.exportFactor(factor) != undefined) {
        this.design[factor][newName] = Object.assign({}, this.design[factor][oldName])
        delete this.design[factor][oldName]
      }
    }
  }

  class Assay{
    constructor(id,name){
      this._name=name,
      this._id=id
    }
    set name(name){
      this.name=name
    }
    get name(){
      return this._name
    }
    set id(id){
      this.id=id
    }
    get id(){
      return this._id
    }
  }

  $('table.assays tbody tr').each(function(){
  	let self=$(this)
  	let assayName=self.find('td[colname|=name]').text().toString()
  	let assayId=self.find('td[colname|=id]').text().toString()
  	let assay=new Assay(assayId,assayName)

  	let designFactory=$('.card-body.design-factory table.design-factory')
  	let factor=assayGetFactor(self)
  	let modality=assayGetModality(self)
  	let factorId=assayGetFactor_id(self)
  	let modalityId=assayGetModality_id(self)
  	let assignmentId=assayGetAssignment_id(self)
  	if(factor!=null){
      if(factorExists(designFactory,factor)){
        if(modalityExistsInFactor(designFactory,factor,modality)){
          assignAssayToModality(designFactory,factor,modality,assay)
        }else{
          //TODO Not tested yet
          addSavedModality(designFactory,factor,modality,modalityId)
          assignAssayToModality(designFactory,factor,modality,assay)
        }
      }else{
        addSavedFactor(designFactory,factor,factorId)
        addSavedModality(designFactory,factor,modality,modalityId)
        //TODO
        assignAssayToModality(designFactory,factor,modality,assay)
      }
  	}
  })
  function assayGetFactor(self){
  	return self.find('td[colname|=factor]').text()  || null
  }
  function assayGetModality(self){
  	return self.find('td[colname|=modality]').text()
  }
  function assayGetModality_id(self){
  	return self.find('td[colname|=modality]').attr('db-id')
  }
  function assayGetFactor_id(self){
  	return self.find('td[colname|=factor]').attr('db-id')
  }
  function assayGetAssignment_id(self){
  	return self.find('td[colname|=modality]').attr('db-id-assignment')
  }    
  function factorExists(designFactory,factor){
    return designFactory.find(`tr[factor|=${factor}]`).length>0
  }
  function modalityExistsInFactor(designFactory,factor,modality){
    return designFactory.find(`tr[factor|=${factor}][modality|=${modality}]`).length>0
  }
  function addSavedFactor(designFactory,factor,factorId){
    let addFactorButton=designFactory.closest('.card-body.design-factory').find('button.add-factor')
    let generatedFactor=clickFactor(designFactory,addFactorButton,factor,factorId)
    renameClickedFactor(generatedFactor,factor)
    function clickFactor(designFactory,button,factor,factorId){
      button.click()
      let newFactorRow=designFactory.find(`tr#factor`).last()
      newFactorRow.attr('db-name',factor)
      newFactorRow.attr('db-id',factorId)
      let generatedFactor=newFactorRow.attr('factor')
      design.factorAttributes(generatedFactor,newFactorRow)
      return generatedFactor
    }
    function renameClickedFactor(generatedFactor,factor){
      let factorForm=design.exportFactor(generatedFactor).__form__
      factorForm.val(factor)
      renameFactor(factorForm,generatedFactor,factor)
    }
  }
  function addSavedModality(designFactory,factor,modality,modalityId){
    let newModalityButton=design.exportFactor(factor).__button__
    let generatedModality=clickModalityButton(designFactory,newModalityButton,modality,modalityId)
    renameClickedModality(generatedModality,factor,modality)
       
    function clickModalityButton(designFactory,button,modality,modalityId){
      button.click()
      let newModalityRow=designFactory.find(`tr#modality[factor|=${factor}]`).first()
      newModalityRow.attr('db-id',modalityId)
      newModalityRow.attr('db-name',modality)
      let generatedModality=newModalityRow.attr('modality')
      design.modalityAttributes(factor,generatedModality,newModalityRow)
      return generatedModality
    }
    function renameClickedModality(generatedModality,factor,modality){
      let modalityForm=design.exportModality(factor,generatedModality).__form__  
      modalityForm.val(modality)
      renameModalityInFactor(modalityForm,factor,generatedModality,modality)
    }
  }
  function assignAssayToModality(factoryDesign,factor,modality,assay){
    let multiselectForm=design.exportModality(factor,modality).__mutiselect__
    multiselectForm.multiselect('select',assay.id)
  }

//--------------------------Calculate CPMs -----------------------------------
  $('.card.assay-list button.calculate-cpms').click(function(){
  	let data={assayIds:[]} //Assay ids
  	$('table.assays tbody td[colname|=output]').each(function(){
  	  let self=$(this)
  	  let output=self.text()
      if(output.length>0){
        let assayId=self.closest('tr').attr('id')
        data.assayIds.push(assayId)  
      }  
  	})
    if(data.assayIds.length>0){
      let studyId=$('.card-header.studyInfo').attr('studyId')
        $.ajax({
          url:`/de/assays/${studyId}/CPM`,
          data,
          type:"POST",
          success:((data,textStatus,jqXHR) =>{
            loadingPanel()
            trackProgress(data)
          }),
          error:((qXHR,textStatus,err)=>{
              makeToolTipNotification(self, textStatus,err)
          })
        })
    }else{
      makeToolTipNotification(self,"No outputs","Add output numbers first!")
    }
  })

  function trackProgress(data){
  	let loading=true
  	let port="8080"
  	let hostname=document.location.hostname
  	let address=`${(hostname=="localhost" ? "ws" : "wss")}://${hostname}:${port}`
  	let protocol=data
  	startWebSocket(address,protocol,callback)
  	function callback(data){
  	    if(loading){
  	     loadingPanel()  
  	     loading=false
  	    }
  	    
  		let parsedData=JSON.parse(data)

  		if(parsedData.assayId){
  		  let assayId=parsedData.assayId
  		  let target=$(`table.assays tbody tr[id|=${assayId}]`).find('td[colname|=output]')
  		
  		  if(parsedData.size){
            let size=parsedData.size
            addProgressBar(size,target)  		    
  		  }else if(parsedData.successes){
  		    updateProgressBar(parsedData.successes,target)
  		  }
  		}else{
  		  Object.keys(parsedData).forEach(key=>{
            let assayId=key
            let target=$(`table.assays tbody tr[id|=${assayId}]`).find('td[colname|=output]')
            updateProgressBar(parsedData[key].successes,target)
  		  })
  		}



  		function addProgressBar(size,target){
          let progress=mkel('div',{class:"progress"})
          let progressbar=mkel('div',{
            "class":"progress-bar",
            "role":"progressbar",
            "aria-valuenow":"0",
            "aria-valuemin":"0",
            "aria-valuemax":"100",
            "aria-valuenow":"0",
            "aria-valuemin":"0",
            "aria-valuemax":"100",
            "entries":size
           })
          target.attr('output',target.text())
          progress.append(progressbar)
          target.html(progress)
  		}
  		function updateProgressBar(successes,target){
   		    let progressbar=target.find('.progress-bar')
  		    let size=progressbar.attr('entries')
  		    let updatedValues=successes.length
  		    let percentComplete=updatedValues/parseInt(size)*100
  		    progressbar.width(percentComplete+"%")
  		    progressbar.text(Math.round(percentComplete)+"%")
  		}
  	}
  }
//-------------------END-------Calculate CPMs -----------------------------------

})