/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Feature_attribute_list = sequelize.define('Feature_attribute_list', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      feature_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      key: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      value: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Feature_attribute_list',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Feature_attribute_list.belongsTo(models.Feature, {
            foreignKey: 'feature_id',              //on Feature_attribute_list
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Feature_attribute_list;
  };