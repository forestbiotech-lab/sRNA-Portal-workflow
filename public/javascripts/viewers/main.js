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
            this.tableName =document.location.pathname.replace(/\/$/, "").split("/").pop()
            this.model = await loadTable(this.tableName)
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
