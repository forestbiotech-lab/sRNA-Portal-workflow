
async function loadSequenceAssemblies(){
    return $.get("/db/api/v1/sequence_assemblies")
}