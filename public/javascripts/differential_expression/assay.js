$('document').ready(function(){
	
	$('.row.study-design .card-body button.add-factor').click(function(){
		let self=$(this)
		let tbody=self.siblings('table').find('tbody')
		let delButton=makeButton({icon:"remove",text:"remove"},"btn btn-sm btn-danger")
		let modalityButton=makeButton({icon:"plus",text:"add modality"},"btn btn-sm btn-success",{evt:"click",callback:addModality})
		let factorInput=mkel("input",{type:"text",class:"form"})
		let row=makeRow({id:"factor"},[delButton,factorInput,modalityButton])
		tbody.append(row)
	})

	$('.row.study-design .card-body button.generate-contrasts').click(function(){
	})

	function addModality(){
		let self=$(this)
		let delButton=makeButton({icon:"remove",text:"remove"},"btn btn-sm btn-danger")
		let modalityInput=mkel("input",{type:"text",class:"form"})
		let row=makeRow({id:"factor"},[delButton,"",modalityInput])
		self.closest('tr').after(row)
	}

	class Design{
		constructor(){
			this.design={}
		}
		set factor(factor){
			this.design[factor]={}
		}
		addFactor(factor){
			this.factor=factor
		}
		addModalityToFactor(factor,modality){
			this.design[factor][modality]={}
		}
		removeFactor(factor){
			delete this.design[factor]
		}
		removeModalityFromFactor(factor,modality){
			delete this.design[factor][modality]	
		}
		get exportDesign(){
			return this.design
		}
	}
	var d=new Design()
	d.factor="Virgin"
	d.addFactor('Amadia')
	console.log(d.exportDesign)


})