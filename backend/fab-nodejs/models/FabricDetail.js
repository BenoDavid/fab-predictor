"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FabricDetail extends Model {
    static associate(models) {}
  }

  FabricDetail.init(
    {
      brand: { type: DataTypes.STRING(100), allowNull: true, field: "Buyer" },
      productCategory: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "ProductCategory",
      },
      productSubCategory: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "ProductSubCatCode",
      },
      season: { type: DataTypes.STRING(100), allowNull: true, field: "Season" },
      style: { type: DataTypes.STRING(100), allowNull: true, field: "STYLE" },
      articleCode: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "ArticleCode",
      },
      color: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "ColorDesc",
      },
      indentStatus: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "IndentStatus",
      },
      indentQty: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "orderqty",
      },
    },
    {
      sequelize,
      modelName: "FabricDetail",
      tableName: "xtDataGenIndentsPoCFAI",
      timestamps: false,
      primaryKey: false,

      noPrimaryKey: true,
    },
  );
  FabricDetail.removeAttribute("id");
  return FabricDetail;
};
