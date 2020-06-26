$(document).ready(()=>{
  

  function addTableSorter(element){
    //Currently applies to tables with CLASS .resizableTable
    //Table Sorter: https://mottie.github.io/tablesorter/docs/example-widget-resizable.html
    element.tablesorter({
      // initialize zebra striping and resizable widgets on the table
      widgets: [ 'resizable' ],
      widgetOptions: {
        resizable_addLastColumn : true
      }
    });
  }
  addTableSorter($('table'))
})