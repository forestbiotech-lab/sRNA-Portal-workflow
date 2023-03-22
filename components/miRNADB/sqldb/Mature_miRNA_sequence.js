/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Mature_miRNA_sequence = sequelize.define('Mature_miRNA_sequence', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      sequence: { 
        type: DataTypes.STRING(30),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Mature_miRNA_sequence',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Mature_miRNA_sequence.belongsTo(models.Mature_miRNA, {
            foreignKey: 'id',              //on Mature_miRNA_sequence
            targetKey: 'sequence_id',  //foreign key  
          }); 
        }
      },
    });

    return Mature_miRNA_sequence;
  };