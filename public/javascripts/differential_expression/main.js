Vue.component('file-submission',(resolve,reject)=>{
    $.get('/forms/factory/vue/template/file-submission',(data,textStatus,jqXHR)=> {
        resolve({
            template:data,
            props:{
                studyId:Number,
                studyTitle:String,
                organisms: Array,
            },
            data:function(){
                return{
                    ncbi_taxon_id:null,
                    sequence_assemblies:[{}],
                    sequence_assemblyComposite:null

                }
            },
            methods:{
                loadSequenceAssemblies:async function(){
                    this.sequence_assemblyComposite=null
                    let where={
                        organism:this.ncbi_taxon_id
                    }
                    let that=this
                    $.ajax({
                      url:"/db/api/v1/publictableRows/Sequence_assembly_composite/where",
                      method:"POST",
                      data:where
                    }).done((data,textStatus,jqXHR)=>{
                        that.sequence_assemblies=data
                    }).fail(err=>{
                        displayToast("Unable to get sequence_assembly data",err.statusText)
                    })
                },
                chooseMatrixFile:function(){
                    $('.row.file-submission .card-body #upload-files-upload').click();
                    $('.row.file-submission .card-body .progress-bar').text('0%');
                    $('.row.file-submission .card-body .progress-bar').width('0%');
                },
                uploadMatrix:function(event){
                    let target=event.target
                    //TODO on change
                    let that=this
                    //TODO
                    let files = target.files;  //Get item
                    if (files.length == 1){
                        // create a FormData object which will be sent as the data payload in the
                        // AJAX request
                        var formData = new FormData();
                        // loop through all the selected files
                        formData.append('uploads[]', files[0], files[0].name);
                        $.ajax({
                            url: `/de/upload/${this.studyId}`,
                            type: 'POST',
                            data: formData,
                            processData: false,
                            contentType: false,
                            success: that.success,
                            fail: function(jqXHR,textStatus,error){
                                displayToast(`Error uploading file- ${textStatus}`, error)
                                $('.row.file-submission .card-footer form.view-matrix input#filename').val('Error! Try again!')
                            },
                            xhr: that.xhr
                        });
                    }
                },
                success:function(data,textStatus,jqXHR){
                    let filename=data.name
                    let hash=data.hash
                    if(filename=="UnsupportedFile"){
                        alert("Unsupported file type! Try again")
                        $('.row.file-submission .card-body .progress-bar').text('0%');
                        $('.row.file-submission .card-body .progress-bar').width('0%');
                    }else{
                        $('.row.file-submission .card-footer input#file').val(filename)
                        $('.row.file-submission .card-footer form.view-matrix input#filename').val(filename)
                        $('.row.file-submission .card-footer form.view-matrix input#hash').val(hash)
                        //TODO what next
                        $('.row.file-submission .card-footer form.view-matrix input.btn').removeClass('d-none')

                    }
                },
                xhr:function() {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();
                    // listen to the 'progress' event
                    xhr.upload.addEventListener('progress', function(evt) {
                        if (evt.lengthComputable) {
                            // calculate the percentage of upload completed
                            var percentComplete = evt.loaded / evt.total;
                            percentComplete = parseInt(percentComplete * 100);
                            // update the Bootstrap progress bar with the new percentage
                            $('.row.file-submission .card-body .progress-bar').text(percentComplete + '%');
                            $('.row.file-submission .card-body .progress-bar').width(percentComplete + '%');
                            // once the upload reaches 100%, set the progress bar text to done
                            if (percentComplete === 100) {
                                $('.row.file-submission .card-body .progress-bar').html('Done');
                                $('.row.file-submission .card-footer form.view-matrix input.btn.disabled').removeClass('disabled')
                                $('.row.file-submission .card-footer form.view-matrix input.btn').attr('type','submit')
                            }
                        }
                    }, false);
                    return xhr;
                }
            }
        })
    }).fail((jqXHR,textStatus)=>{
        reject({template:`<div>Unable to load: ${textStatus}</div>`})
    })

})
Vue.component('generate-study-list',(resolve,reject)=>{
    $.get('/forms/factory/vue/template/managedStudies',(data,textStatus,jqXHR)=> {
        resolve({
            template: data,
            props:{
                rows:Array,
            },
        })
    })
})

Vue.component('actions-for-selected-study',(resolve,reject)=>{
    $.get('/forms/factory/vue/template/study-actions-for-selection',(data,textStatus,jqXHR)=> {
        resolve({
            template: data,
            props:{
                selectedPK: String,
                numOfAssays: Number,
            }
        })
    })
})


Vue.component('edit-metadata',(resolve,reject)=>{
    $.get(`/forms/factory/fromtable/fks/Study`,(data,textStatus,jqXHR)=>{
        resolve({
            template:data,
            props:{
                selectedRow:Number,
                rows:Array,
                editStudy:Boolean,
            },
            data:function(){
                return{
                    create:false,
                    update:true,
                }},
            computed:{
                form:function(){
                    return this.rows[this.selectedRow]
                },
            },
            methods:{

                updateStudy:function(){
                    let that=this
                    $.ajax({
                        url:"/forms/update/singletable/Study",
                        method:"POST",
                        data:this.form,
                        success:(data,textStatus,jqXHR)=>{
                            that.$emit('updated')
                        }
                    })
                }
            }
        })
    })
})

Vue.component('create-study-form',(resolve,reject)=>{
    $.get(`/forms/factory/fromtable/fks/Study`,(data,textStatus,jqXHR)=>{
        resolve({template:data,
            data:function(){
                return {
                    foreignKeys:"",
                    form:{},
                    update:false,
                    create:true,
                }
            },
            methods: {
                createStudy:function(){
                    let that=this
                    $.ajax({
                        url:"/forms/save/singletable/Study",
                        method:"POST",
                        data:this.form,
                        success:async function(data,textStatus,jqXHR){
                            if(data.id) {
                                let newStudyId = data.id
                                await that.addCreatorToStudy(newStudyId)
                            }
                        }
                    })
                },
                addCreatorToStudy:async function(newStudyId){
                    try{
                        let result=await $.post(`/forms/factory/data/addCreatorToStudy`,{newStudyId})
                        if(result.id){ //Check was created
                            $('.welcome-panel #table-study').collapse('hide')
                            window.location.reload()
                        }

                    }catch (e) {
                        displayToast("Unable to assign you as the creator of the study",e.responseJSON.error.msg)
                    }

                }
            },
        })
    })


})

Vue.component('v-select', VueSelect.VueSelect)
window.app=new Vue({
    el:"#app",
    data:{
        pk:"id",
        rows:[{}],
        isRowSelected:false,
        //selectedRow:-1,
        selectedRow:0,
        selectedPK:null,
        editStudy:false,
        //uploadData:false,
        uploadData:true,
        organisms:[{}],
    },
    methods:{
        selectRow:function(index){
            this.toggleSelection(index)
            this.selectedRow=index
            this.selectedPK=String(this.rows[index][this.pk])
            $(`#studiesList .list-Study table tbody tr`).removeClass("table-info")
            if(this.isRowSelected==true)
                $(`#studiesList .list-Study table tbody tr:nth(${index})`).addClass("table-info")
        },
        toggleSelection:function(row){
            if(this.isRowSelected===false) this.isRowSelected=true
            else if(row==this.selectedRow) {
                this.isRowSelected = false
                this.editStudy = false
                this.uploadData = false
            }
        },
        loadCreateStudyTableForm:async function(){

            console.log("")
        }
    },
    async beforeMount(){
        try {
            window.data = {}
            this.rows=await $.get('/forms/factory/data/managedStudies')
            this.organisms= await $.post('/db/api/v1/publictable/Organism')
        }catch(e){
            displayToast("Error loading table",JSON.stringify(e))
        }
    }
})
