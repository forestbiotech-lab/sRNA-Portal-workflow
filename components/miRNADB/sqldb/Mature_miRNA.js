/**
   * Created by Bruno Costa 2021-07-07
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Mature_miRNA = sequelize.define('Mature_miRNA', {
      id: { 
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      accession: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      name: { 
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      family: { 
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
    }, {
      tableName: 'Mature_miRNA',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
          Mature_miRNA.belongsTo(models.Annotation, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'mature_miRNA_id',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.Differential_expression, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'annotation',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.HasStar, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'miRNA_id',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.HasStar, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'star_miRNA_id',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.Mature_has_Pre, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'mature_miRNA_id',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.Mature_miRNA_sequence, {
            foreignKey: 'sequence_id',              //on Mature_miRNA
            targetKey: 'id',  //foreign key  
          });
          Mature_miRNA.belongsTo(models.Target, {
            foreignKey: 'id',              //on Mature_miRNA
            targetKey: 'mature_miRNA_id',  //foreign key  
          }); 
          Mature_miRNA.belongsTo(models.Feature, {
            foreignKey: 'accession',              //on Mature_miRNA
            targetKey: 'attr_id',  //foreign key  
          }); 
        }
      },
    });

    return Mature_miRNA;
  };