//Vue.component('canvas-datagrid', canvasDatagrid)
Vue.config.ignoredElements = ['canvas-datagrid'];
Vue.component('testing-grid',{
    template:`<canvas-datagrid class="data-grid assay-data" v-bind.prop="grid"></canvas-datagrid>`,
    props:{
      studyId:Number
    },
    data:function(){
        return {
            grid: {
                data: [{}],
            },
            columnIndexesMap:undefined,
        }
    },
    methods:{
        getDatagrid:function(){
          return $('canvas-datagrid.data-grid.assay-data')[0]
        },
        classifyColumns:function(){

        },
        resizeRawColumns:function(){
            let that=this
            this.getRawNames().forEach(col=> {
                that.getDatagrid().fitColumnToValues(col)
            })
        },
        getRawNames:function(){
            let that = this
            return Object.keys(that.columnIndexesMap).filter(col=>col.startsWith("Raw."))
        },
        getCPMNames:function(){
            let that=this
            return Object.keys(that.columnIndexesMap).filter(col=>col.startsWith("CPM."))
        },
        hideCPMColumns:function(){
            let that=this
            this.getCPMNames().forEach(col=> {
                that.getDatagrid().hideColumns(that.columnIndexesMap[col])
            })
        },
        hideRawColumns:function(){
            let that=this
            this.getRawNames().forEach(col=> {
                that.getDatagrid().hideColumns(that.columnIndexesMap[col])
            })
        }
    },
    beforeMount:async function(){
        let data=await $.get(`/db/api/v1/assaydata/${this.studyId}`)
        this.columnIndexesMap=Object.fromEntries(Object.keys(data[0]).map((col,index)=>[col,index]))
        window.columnIndexesMap=Object.fromEntries(Object.keys(data[0]).map((col,index)=>[col,index]))
        this.grid.data=data
    },
    mounted:function(){
        //Updated once
        let that=this
        this.$nextTick(function(){
            setTimeout(function(){
                $('canvas-datagrid.data-grid.assay-data').height(400)
                that.hideCPMColumns()
                that.resizeRawColumns()
            },1000)

        })

    }

})
app=new Vue({
   el:"#app",
    data:{
       cpmExpression:false
    },

})
/*
$(document).ready(function(){
	$('.btn.launch-target-modal').click(function(){

    sequence="AAATTTAAGGTGATCAGTTTTAGC"
    study_id=1
    $.ajax({
      url:`/de/targets/get/db/sequence/target/${study_id}`,
      type: 'POST',
      data:{sequence},
      success:function(data,textStatus,jqXHR){
        data=data.result.data
        let table=makeTableFromNestedArrayMatrix(data)
        $('.modal-body').append(table)
      },error:function(qXHR,textStatus,err){
        console.log(err)
      }
    })
  })
  $('.upload-table .wrapperTable table').bind("loadedAssayData",function(){
    let wrapperTable=$('.upload-table .wrapperTable')
    let wrapperDummy=$('.upload-table .wrapperDummy')
    let table=$('.upload-table .wrapperTable table.table')
    let dummyScrollDiv=$('.upload-table .wrapperDummy .dummy')
    dummyScrollDiv.width(table.width())
    $(function(){
      wrapperDummy.scroll(function(){
          wrapperTable.scrollLeft(wrapperDummy.scrollLeft());
      });
      wrapperTable.scroll(function(){
          wrapperDummy.scrollLeft(wrapperTable.scrollLeft());
      });
    });
  })
})
*/
