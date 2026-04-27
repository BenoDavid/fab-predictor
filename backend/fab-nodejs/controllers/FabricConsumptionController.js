// src/controllers/FabricConsumptionController.js
const db = require("../models");
const BaseController = require("./BaseController");
const { FabricConsumption } = db.sequelizeDb2.models;

class FabricConsumptionController extends BaseController {
  constructor() {
    super(FabricConsumption);
  }
}

module.exports = new FabricConsumptionController();
