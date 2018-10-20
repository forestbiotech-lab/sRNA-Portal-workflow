/**
   * Created by Bruno Costa 28-04-2018
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Pre_miRNA_sequence = sequelize.define('Pre_miRNA_sequence', {
      id: { 
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
        unique: true,
      },
    sequence: DataTypes.STRING(700),
  }, {
      tableName: 'Pre_miRNA_sequence',
      timestamps: false,
      underscored: false,

     classMethods: {
        associate: function associate(models) {    
          Pre_miRNA_sequence.belongsTo(models.Pre_miRNA, {
            foreignKey: 'id',              //on Pre_miRNA_sequence
            targetKey: 'sequence_id',  //foreign key  
          }); 
        }
      },
    });

    return Pre_miRNA_sequence;
  };