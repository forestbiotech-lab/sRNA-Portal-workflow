/**
   * Created by Bruno Costa 2023-03-27
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Feature = sequelize.define('Feature', {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
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
        allowNull: false
      },
      source: {
        type: DataTypes.STRING(254),
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
      start: {
        type: DataTypes.INTEGER(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      end: {
        type: DataTypes.INTEGER(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      score: {
        type: DataTypes.FLOAT,
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      strand: {
        type: DataTypes.STRING(1),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      phase: {
        type: DataTypes.INTEGER(1),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      sequence_assembly_key: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      sequence_assembly_value: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Feature',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {
          Feature.belongsTo(models.Mature_miRNA, {
            foreignKey: 'accession',              //on Feature_composite
            targetKey: 'accession',  //foreign key
          });
          Feature.belongsTo(models.Pre_miRNA, {
            foreignKey: 'accession',              //on Feature_composite
            targetKey: 'accession',  //foreign key
          });
        }
      },
    });

    return Feature;
  };