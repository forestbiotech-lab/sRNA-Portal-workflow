const createApp = Vue.createApp
Vue.component('v-select,VueSelect.VueSelect')
window.app=new Vue({
    el:"#app",
    data:{
        bar:"foo",
        tableName:"",
        model:"",
        associations:""
    },
    methods:{
        isFK: function(key){
            try{
                return this.associations[key].foreignKey==key
            }catch(e){
                return false
            }
        }

    },
    async beforeMount(){
        try {
            window.data = {}
            let processedPath=document.location.pathname.replace(/\/$/, "").split("/")
            this.pk =processedPath.pop()
            this.pkColumn=processedPath.pop()
            this.tableName =processedPath.pop()
            this.model = await loadRows(this.tableName,this.pkColumn,this.pk)
            let associations = await loadAssociations(this.tableName)
            this.associations=associations.fks.reduce((acc,cur)=>{
                acc[cur.foreignKey]=Object.assign({},cur)
                return acc
            },{})

        }catch(e){
            displayToast("Error loading table",JSON.stringify(e))
        }
    }
})
