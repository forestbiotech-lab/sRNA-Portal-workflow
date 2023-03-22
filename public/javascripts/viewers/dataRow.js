
async function loadRows(table,pkColumn,pk){
    return $.post(`/db/api/v1/publictableRow/${table}/${pkColumn}/${pk}`)
}
async function loadAssociations(table){
    return $.post(`/db/api/v1/publictableFKs/${table}`)
}
