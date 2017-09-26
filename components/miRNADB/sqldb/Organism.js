/**
 * Created by Bruno Costa 17-07-2017.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
  const Organism = sequelize.define('Organism', {
    id: { //Foreign Key: for a germplasmParents
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    ncbi_taxon_id: {  
      type: DataTypes.INTEGER(20),
      allowNull: false,
    },
    genus: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    species: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    tableName: 'Organism',
    timestamps: false,
    underscored: false,

// Not implementing all foreignKeys yet.

    classMethods: {
      associate: function associate(models) {     
        Organism.belongsTo(models.Annotation,{
          foreignKey: 'id',     //on Organism
          targetKey: 'organism',
        })
      }
    },
  });
  

  return Organism;
};

 