"use strict";

const XLSX = require("xlsx");
const path = require("path");

function readFabricDetailExcel(filePath) {
  const workbook = XLSX.readFile(path.resolve(filePath));
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  return XLSX.utils.sheet_to_json(sheet, { defval: null });
}

module.exports = readFabricDetailExcel;
