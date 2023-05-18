/**
   * Created by Bruno Costa 2023-04-20
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Mature_has_Pre = sequelize.define('Mature_has_Pre', {
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
        allowNull: false
      },
      mature: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      pre: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      family: {
        type: DataTypes.INTEGER(20),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      lettered_suffix: {
        type: DataTypes.STRING(10),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      numbered_suffix: {
        type: DataTypes.INTEGER(10),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      description: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      xref: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
    }, {
      tableName: 'Mature_has_Pre',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
              Mature_has_Pre.belongsTo(models.Pre_miRNA, {
                foreignKey: 'pre',              //on Mature_has_Pre
                targetKey: 'accession',  //foreign key
              });
              Mature_has_Pre.belongsTo(models.Mature_miRNA, {
                foreignKey: 'mature',              //on Mature_has_Pre
                targetKey: 'accession',  //foreign key
              });
              Mature_has_Pre.belongsTo(models.Feature, {
                foreignKey: 'accession',              //on Mature_has_Pre
                targetKey: 'accession',  //foreign key
              });
        }
      },
    });

    return Mature_has_Pre;
  };