/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const HasStar = sequelize.define('HasStar', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: true,
        allowNull: false
      },
      miRNA_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      star_miRNA_id: { 
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'HasStar',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          /*HasStar.belongsTo(models.Mature_miRNA, {
            foreignKey: 'miRNA_id',              //on HasStar
            targetKey: 'id',  //foreign key  
          });
          HasStar.belongsTo(models.Mature_miRNA, {
            foreignKey: 'star_miRNA_id',              //on HasStar
            targetKey: 'id',  //foreign key  
          });*/
        }
      },
    });

    return HasStar;
  };