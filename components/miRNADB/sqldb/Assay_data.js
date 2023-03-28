/**
   * Created by Bruno Costa 2023-03-27
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Assay_data = sequelize.define('Assay_data', {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: true
      },
      assay: {
        type: DataTypes.INTEGER(11),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      mature_miRNA: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      raw: {
        type: DataTypes.INTEGER(11),
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
              Assay_data.belongsTo(models.Assay, {
                foreignKey: 'assay',              //on Assay_data
                targetKey: 'id',  //foreign key
              });
              Assay_data.belongsTo(models.Mature_miRNA, {
                foreignKey: 'mature_miRNA',              //on Assay_data
                targetKey: 'accession',  //foreign key
              });

        }
      },
    });

    return Assay_data;
  };