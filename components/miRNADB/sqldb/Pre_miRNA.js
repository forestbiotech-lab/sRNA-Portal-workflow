/**
   * Created by Bruno Costa 2023-03-25
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Pre_miRNA = sequelize.define('Pre_miRNA', {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      accession: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      family: {
        type: DataTypes.INTEGER(6),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      lettered_suffix: {
        type: DataTypes.STRING(3),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      numbered_suffix: {
        type: DataTypes.INTEGER(3),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      sequence_id: {
        type: DataTypes.INTEGER(20),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Pre_miRNA',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
              Pre_miRNA.belongsTo(models.Mature_has_Pre, {
                foreignKey: 'accession',              //on Pre_miRNA
                targetKey: 'pre_miRNA',  //foreign key
              });
              Pre_miRNA.belongsTo(models.Feature, {
                foreignKey: 'accession',              //on Pre_miRNA
                targetKey: 'accession',  //foreign key
              });
              Pre_miRNA.belongsTo(models.Feature_composite, {
                foreignKey: 'accession',              //on Pre_miRNA
                targetKey: 'accession',  //foreign key
              });
              Pre_miRNA.belongsTo(models.Pre_miRNA_sequence, {
                foreignKey: 'sequence_id',              //on Pre_miRNA
                targetKey: 'id',  //foreign key
              });
        }
      },
    });

    return Pre_miRNA;
  };