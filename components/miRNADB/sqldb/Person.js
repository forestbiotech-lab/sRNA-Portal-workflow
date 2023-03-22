/**
   * Created by Bruno Costa 2023-03-20
   * Generated by Utilities/createTable.py
   */
  'use strict';

  module.exports = function(sequelize, DataTypes) {
    const Person = sequelize.define('Person', {
      id: {
        type: DataTypes.INTEGER(11),
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      orcid: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      firstName: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      lastName: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: false
      },
      institutional_address: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
      email: {
        type: DataTypes.STRING(254),
        autoIncrement: false,
        primaryKey: false,
        allowNull: true
      },
    }, {
      tableName: 'Person',
      timestamps: false,
      underscored: false,

      classMethods: {
        associate: function associate(models) {    
              Person.belongsTo(models.Has_user_with_role, {
                foreignKey: 'id',              //on Person
                targetKey: 'person',  //foreign key
              });
              Person.belongsTo(models.Managed_by, {
                foreignKey: 'id',              //on Person
                targetKey: 'person',  //foreign key
              });
              Person.belongsTo(models.User, {
                foreignKey: 'id',              //on Person
                targetKey: 'person',  //foreign key
              });
        }
      },
    });

    return Person;
  };