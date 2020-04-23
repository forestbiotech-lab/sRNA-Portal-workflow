module.exports=class queryModel{
	constructor(tableConnections,db){
		this.tableConnections=tableConnections
		this.model={}
		this.db=db
	}
	buildQueryModel(){
		let self=this
		let model=this.model
		let keys=Object.keys(this.tableConnections)
		keys.forEach((key,index)=>{
			if(index==0) model['include']=[]
			let value=self.tableConnections[key]
			if(key.match(/^[A-Z]/)==null){
			  model[key]=value	
			}else{
			  if(self.db[key]) model['include'].push(self.appendModels({model:self.db[key]},value))	
			}
		})
	}
	appendModels(model,nextModel){
        let self=this
		Object.keys(nextModel).forEach((key,index)=>{
			if(index==0) model['include']=[]
			let value=nextModel[key]
			if(key.match(/^[A-Z]/)==null){
			  model[key]=value	
			}else{
			  if(self.db[key]) model['include'].push(self.appendModels({model:self.db[key]},value))	
			}
		})
		return model

	}
	get query(){
		return this.model
	}
}