/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Differential_expression = sequelize.define('Differential_expression', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      logCPM: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      fTest: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      logFC: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      pValue: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      fdr: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      modality1: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      modality2: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      annotation: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Differential_expression',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Differential_expression.belongsTo(models.Modality, {
            foreignKey: 'modality1',              //on Differential_expression
            targetKey: 'id',  //foreign key  
          });
          Differential_expression.belongsTo(models.Modality, {
            foreignKey: 'modality2',              //on Differential_expression
            targetKey: 'id',  //foreign key  
          });
          Differential_expression.belongsTo(models.Mature_miRNA, {
            foreignKey: 'annotation',              //on Differential_expression
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Differential_expression;
  };