/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Assay_data = sequelize.define('Assay_data', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      assay: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      raw: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      cpm: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
    }, {
      tableName: 'Assay_data',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Assay_data.belongsTo(models.Annotation, {
            foreignKey: 'id',              //on Assay_data
            targetKey: 'assay_data_id',  //foreign key  
          });
          Assay_data.belongsTo(models.Assay, {
            foreignKey: 'assay',              //on Assay_data
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Assay_data;
  };