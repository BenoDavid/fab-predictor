"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FabricConsumption extends Model {
    static associate(models) {}
  }

  FabricConsumption.init(
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

      style: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      color: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      fabric_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      buyer: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      season: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      order_qty: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      unit: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      articleNo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      brand: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      productCategory: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      productSubCategory: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      booking_cons: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      qty: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },

      mark_cons: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "FabricConsumption",
      tableName: "vw_FabricConsumption_WithStyleFeed",
      timestamps: false,
    },
  );

  return FabricConsumption;
};
