$('.searchDBform button.DBsearch').on('click',function(){
  let context=$(this);
  clearTable();
  loadSearch(context);
})

loadTypeAhead();
