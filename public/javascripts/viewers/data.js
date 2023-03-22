
async function loadTable(table){
    return $.post(`/db/api/v1/publictable/${table}`)
}
async function loadAssociations(table){
    return $.post(`/db/api/v1/publictableFKs/${table}`)
}
