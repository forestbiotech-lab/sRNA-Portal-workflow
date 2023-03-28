//Vue.component('canvas-datagrid', canvasDatagrid)
Vue.config.ignoredElements = ['canvas-datagrid'];
Vue.component('testing-grid',{
    template:`<canvas-datagrid class="data-grid assay-data" v-bind.prop="grid"></canvas-datagrid>`,
    props:{
        grid: Object,
        schema:Array,
    },

})
app=new Vue({
   el:"#app",
    data:{
       cpmExpression:false,
       grid: {
           data: [{}],
       },
       columnIndexesMap:undefined,
       schema:[{}]
    },
    methods:{
        toogleExpression:function(){
          console.log(this.cpmExpression)
          if(this.cpmExpression){
              this.hideRawColumns()
              this.showCPMColumns()
          }else{
              this.hideCPMColumns()
              this.showRawColumns()
          }

        },
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
        showCPMColumns:function(){
            let that=this
            let cpmNames=this.getCPMNames()
            that.getDatagrid().unhideColumns(that.columnIndexesMap[cpmNames[0]],that.columnIndexesMap[cpmNames[cpmNames.length-1]])
        },
        hideRawColumns:function(){
            let that=this
            this.getRawNames().forEach(col=> {
                that.getDatagrid().hideColumns(that.columnIndexesMap[col])
            })
        },
        showRawColumns:function(){
            let that=this
            let rawNames=this.getRawNames()
            that.getDatagrid().unhideColumns(that.columnIndexesMap[rawNames[0]],that.columnIndexesMap[rawNames[rawNames.length-1]])
        },
        groupRawColumns:function() {
            let rawNames=this.getRawNames()
            $('canvas-datagrid.data-grid.assay-data')[0].groupColumns(rawNames[0], rawNames.pop())
        }
    },
    beforeMount:async function(){
        let data=await $.get(`/db/api/v1/assaydata/${$("#app").attr('study-id')}`)
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
                that.groupRawColumns()
                that.resizeRawColumns()

            },1000)

        })

    }
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
