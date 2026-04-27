// src/routes/FabricDetailRouter.js
const FabricDetailController = require("../controllers/FabricDetailController");
const BaseRouter = require("./BaseRouter");

const FabricDetailRouter = new BaseRouter(FabricDetailController);

module.exports = FabricDetailRouter.getRouter();
