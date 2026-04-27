const express = require("express");
const router = express.Router();

const FabricConsumptionRouter = require("./FabricConsumptionRouter");
const FabricDetailRouter = require("./FabricDetailRouter");

router.use("/fabric-details", FabricDetailRouter);

router.use("/fabric-consumption", FabricConsumptionRouter);

module.exports = router;
