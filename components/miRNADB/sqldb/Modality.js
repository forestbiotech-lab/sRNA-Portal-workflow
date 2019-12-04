/**
   * Created by Bruno Costa 28-04-2018
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Modality = sequelize.define('Modality', {
      id: { 
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
    name: DataTypes.STRING(254),
    factor_id: DataTypes.INTEGER(11),
  }, {
      tableName: 'Modality',
      timestamps: false,
      underscored: false,

     classMethods: {
        associate: function associate(models) {    
          Modality.belongsTo(models.Factor, {
            foreignKey: 'factor_id',              //on Modality
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Modality;
  };