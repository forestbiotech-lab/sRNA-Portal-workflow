/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Assay_Modality = sequelize.define('Assay_Modality', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      assay_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      modality_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Assay_Modality',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Assay_Modality.belongsTo(models.Assay, {
            foreignKey: 'assay_id',              //on Assay_Modality
            targetKey: 'id',  //foreign key  
          });
          Assay_Modality.belongsTo(models.Modality, {
            foreignKey: 'modality_id',              //on Assay_Modality
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Assay_Modality;
  };