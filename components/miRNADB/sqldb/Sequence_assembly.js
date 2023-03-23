/**
 * Created by Bruno Costa 2023-03-06
 * Generated by Utilities/createTable.py
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
  const Sequence_assembly = sequelize.define('Sequence_assembly', {
    assembly_key: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: true,
      allowNull: false
    },
    assembly_value: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: true,
      allowNull: false
    },
    organism: {
      type: DataTypes.INTEGER(11),
      autoIncrement: false,
      primaryKey: false,
      allowNull: false
    },
    external_id_key: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    external_id_value: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    project_key: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    project_value: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    genome_build: {
      type: DataTypes.STRING(254),
      autoIncrement: false,
      primaryKey: false,
      allowNull: false
    },
    assembly_date: {
      type: DataTypes.DATE,
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    assembly_level: {
      type: DataTypes.ENUM('genome','chromosome', 'scaffold','contig'),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
    representation: {
      type: DataTypes.ENUM('full','partial'),
      autoIncrement: false,
      primaryKey: false,
      allowNull: true
    },
  }, {
    tableName: 'Sequence_assembly',
    timestamps: false,
    underscored: false,

    classMethods: {
      associate: function associate(models) {
        Sequence_assembly.belongsTo(models.Organism, {
          foreignKey: 'organism',              //on Sequence_assembly
          targetKey: 'ncbi_taxon_id',  //foreign key
        });
        /*Sequence_assembly.belongsToMany(models.Feature, {
          foreignKey: ['assembly_key','assembly_value'],              //on Sequence_assembly
          targetKey: ['sequence_assembly_key','sequence_assembly_value'],  //foreign key
        });*/
      }
    },
  });
  return Sequence_assembly;
};
