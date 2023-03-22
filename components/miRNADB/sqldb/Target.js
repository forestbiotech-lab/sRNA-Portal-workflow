/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Target = sequelize.define('Target', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      transcript_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      mature_miRNA_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      study_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      date: { 
        type: DataTypes.DATE,
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
      type: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      target_description: { 
        type: DataTypes.TEXT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      expectation: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      UPE: { 
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
    }, {
      tableName: 'Target',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Target.belongsTo(models.Mature_miRNA, {
            foreignKey: 'mature_miRNA_id',              //on Target
            targetKey: 'id',  //foreign key  
          });
          Target.belongsTo(models.Transcript, {
            foreignKey: 'transcript_id',              //on Target
            targetKey: 'id',  //foreign key  
          });
          Target.belongsTo(models.Study, {
            foreignKey: 'study_id',              //on Target
            targetKey: 'id',  //foreign key  
          }); 
        }
      },
    });

    return Target;
  };