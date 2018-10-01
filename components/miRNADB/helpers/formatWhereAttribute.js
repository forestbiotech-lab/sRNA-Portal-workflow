Sequelize=require('sequelize');
const Op = Sequelize.Op;

module.exports= function formatWhereAttribute(attribute,operator){
  //http://docs.sequelizejs.com/manual/tutorial/querying.html#operators
  operator=Op[operator]
  result={}
  if(typeof attribute == "string"){
    attribute=[attribute]
  }else if(typeof attribute == "object"){
    attribute=attribute || ""
  }
  if(attribute){
    result[operator]=attribute;
    return result
  }
}