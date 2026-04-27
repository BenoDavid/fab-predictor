// src/routes/FabricConsumptionRouter.js
const FabricConsumptionController = require("../controllers/FabricConsumptionController");
const BaseRouter = require("./BaseRouter");

const FabricConsumptionRouter = new BaseRouter(FabricConsumptionController);

module.exports = FabricConsumptionRouter.getRouter();
