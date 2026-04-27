// src/controllers/FabricDetailController.js
const db = require("../models");
const BaseController = require("./BaseController");
const { FabricDetail } = db.sequelizeDb1.models;

const readFabricDetailExcel = require("../utils/readFabricDetailExcel");

class FabricDetailController extends BaseController {
  constructor() {
    super(FabricDetail);
  }

  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        searchField,
        sortBy,
        sortOrder = "ASC",
        ...filters
      } = req.query;

      // 🔹 Read Excel data
      let data = readFabricDetailExcel("./FabricConsumption.xlsx");

      // 🔹 Apply Filters
      if (Object.keys(filters).length) {
        data = data.filter((row) =>
          Object.entries(filters).every(
            ([key, value]) =>
              row[key] != null &&
              String(row[key]).toLowerCase() === String(value).toLowerCase(),
          ),
        );
      }

      // 🔍 Search (Specific Field)
      if (search && searchField) {
        data = data.filter(
          (row) =>
            row[searchField] &&
            String(row[searchField])
              .toLowerCase()
              .includes(search.toLowerCase()),
        );
      }

      // 🔍 Global Search
      else if (search) {
        data = data.filter((row) =>
          Object.values(row).some(
            (val) =>
              val && String(val).toLowerCase().includes(search.toLowerCase()),
          ),
        );
      }

      // 🔃 Sorting
      if (sortBy) {
        data.sort((a, b) => {
          if (a[sortBy] == null) return 1;
          if (b[sortBy] == null) return -1;

          return sortOrder.toUpperCase() === "DESC"
            ? String(b[sortBy]).localeCompare(String(a[sortBy]))
            : String(a[sortBy]).localeCompare(String(b[sortBy]));
        });
      }

      // 📦 Pagination
      const totalItems = data.length;
      const start = (page - 1) * limit;
      const paginatedData = data.slice(start, start + Number(limit));

      // ✅ Response
      res.status(200).json({
        status: 200,
        message: "FabricDetails fetched successfully from Excel",
        result: paginatedData,
        pagination: {
          totalItems,
          totalPages: Math.ceil(totalItems / limit),
          currentPage: Number(page),
          pageSize: Number(limit),
        },
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: [],
      });
    }
  }
}

module.exports = new FabricDetailController();
