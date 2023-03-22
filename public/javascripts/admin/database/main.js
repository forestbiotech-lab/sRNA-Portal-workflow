const createApp = Vue.createApp
Vue.component('v-select,VueSelect.VueSelect')
window.app=new Vue({
    el:"#app",
    data:{
        bar:"foo",
        sequence_assemblies:[]
        tableName:""
    },
    methods:{

    },
    async beforeMount(){
        window.data={}

        window.data.sequence_assemblies=await loadSequenceAssemblies()
        this.sequence_assemblies=window.data.sequence_assemblies
    }
})

