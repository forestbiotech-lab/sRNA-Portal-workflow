/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Transcript = sequelize.define('Transcript', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      accession: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      version: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      feature_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      xref: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
    }, {
      tableName: 'Transcript',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Transcript.belongsTo(models.Target, {
            foreignKey: 'id',              //on Transcript
            targetKey: 'transcript_id',  //foreign key  
          });
          Transcript.belongsTo(models.Feature, {
            foreignKey: 'feature_id',              //on Transcript
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Transcript;
  };