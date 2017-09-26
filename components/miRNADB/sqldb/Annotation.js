/**
 * Created by Bruno Costa 17-07-2017.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
  const Annotation = sequelize.define('Annotation', {
    id: { //Foreign Key: for a germplasmParents
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    accession: {  //Foreign Key to species.
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: { //Foreign Key to Institution id
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    score: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    library: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    }, 
    assay: {
      type: DataTypes.INTEGER(11),
      allowNull: true,
    }, 
    sRNA: {
      type: DataTypes.INTEGER(200),
      allowNull: false,
    }, 
    provenance: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
    }, 
    organism: {
      type: DataTypes.INTEGER(200),
      allowNull: false,
    }
  }, {
    tableName: 'Annotation',
    timestamps: false,
    underscored: false,

// Not implementing all foreignKeys yet.

    classMethods: {
      associate: function associate(models) {     
        Annotation.belongsTo(models.SRNA_sequence,{
          foreignKey: 'sRNA',     //on Annotation
          targetKey: 'id',
        })
        Annotation.belongsTo(models.Provenance,{
          foreignKey: 'provenance',     //on Annotation
          targetKey: 'id',
        })
        Annotation.belongsTo(models.Organism,{
          foreignKey: 'organism',     //on Annotation
          targetKey: 'id',
        })
      }
    },
  });
  

  return Annotation;
};

 