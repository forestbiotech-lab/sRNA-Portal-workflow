/**
 * Created by Bruno Costa 17-07-2017.
 */
'use strict';

module.exports = function(sequelize, DataTypes) {
  const SRNA_sequence = sequelize.define('SRNA_sequence', {
    id: { //Foreign Key: for a germplasmParents
      type: DataTypes.INTEGER(11),
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
      unique: true,
    },
    sequence: {  //Foreign Key to species.
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    length: {
      type: DataTypes.INTEGER(5),
      allowNull: false,
    }
  }, {
    tableName: 'SRNA_sequence',
    timestamps: false,
    underscored: false,

// Not implementing all foreignKeys yet.

    classMethods: {
      associate: function associate(models) {     
        SRNA_sequence.belongsTo(models.Annotation,{
          foreignKey: 'id',     //on SRNA_sequence
          targetKey: 'sRNA',
        })
      }
    },
  });
  

  return SRNA_sequence;
};

 