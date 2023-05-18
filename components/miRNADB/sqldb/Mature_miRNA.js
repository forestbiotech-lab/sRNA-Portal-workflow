/**
   * Created by Bruno Costa 2023-03-25
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Mature_miRNA = sequelize.define('Mature_miRNA', {
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
        allowNull: true
      },
      arm: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      sequence_id: {
        type: DataTypes.INTEGER(100),
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
      tableName: 'Mature_miRNA',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {
              Mature_miRNA.belongsTo(models.Mature_has_Pre, {
                foreignKey: 'accession',              //on Mature_miRNA
                targetKey: 'mature',  //foreign key
              });
              Mature_miRNA.belongsTo(models.Mature_miRNA_sequence, {
                foreignKey:'sequence_id',              //on Mature_miRNA
                targetKey: 'id',  //foreign key
              });
              Mature_miRNA.belongsTo(models.Feature_composite, {
                foreignKey: 'accession',              //on Mature_miRNA
                targetKey: 'accession',  //foreign key
              });
              Mature_miRNA.hasMany(models.Assay_data, {
                //hasMany inversts fk and tk
                foreignKey:'mature_miRNA',
                targetKey: 'accession'
              });
              Mature_miRNA.belongsTo(models.Feature, {
                foreignKey: 'accession',              //on Mature_miRNA
                targetKey: 'accession',  //foreign key
              });
        }
      },
    });

    return Mature_miRNA;
  };