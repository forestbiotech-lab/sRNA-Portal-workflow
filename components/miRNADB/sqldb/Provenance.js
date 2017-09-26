/**
 * Created by Bruno Costa 17-07-2017.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
  const Provenance = sequelize.define('Provenance', {
    id: { //Foreign Key: for a germplasmParents
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    external: {  
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    URL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    }
  }, {
    tableName: 'Provenance',
    timestamps: false,
    underscored: false,

// Not implementing all foreignKeys yet.

    classMethods: {
      associate: function associate(models) {     
        Provenance.belongsTo(models.Annotation,{
          foreignKey: 'id',     //on Provenance
          targetKey: 'provenance',
        })
      }
    },
  });
  

  return Provenance;
};

 