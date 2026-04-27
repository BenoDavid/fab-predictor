// src/controllers/BaseController.js
//for test purpose
const { Sequelize } = require('sequelize');
const { Op } = require("sequelize");

class BaseController {
  constructor(model) {
    this.model = model;
  }
  async getAllByCustomKey(req, res) {
    try {
      // Extract query parameters for pagination, filtering, and sorting
      const { ...filters } = req.body;

      // Set up filtering
      const filterOptions = {};


      for (const key in filters) {
        filterOptions[key] = filters[key];
      }

      // Combine all options and fetch data
      const items = await this.model.findAll({
        where: filterOptions
      });

      // Respond with paginated data and metadata
      res.status(200).json({
        status: 200,
        message: `${this.model.name} fetched successfully`,
        result: items
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: [],
      });
    }
  }
  async getAll(req, res) {
    try {
      // Extract query parameters for pagination, filtering, and sorting
      const { fromDate, toDate, page = 1, limit = 10, search,
        searchField, sortBy = 'createdAt', sortOrder = 'DESC', ...filters } = req.query;

      // Set up pagination
      const offset = (page - 1) * limit;
      const paginationOptions = { offset: parseInt(offset), limit: parseInt(limit) };

      // Set up sorting
      const sortOptions = [[sortBy, sortOrder.toUpperCase()]];

      // Set up filtering
      const filterOptions = {};
      for (const key in filters) {
        filterOptions[key] = filters[key];
      }

      // 🔍 Dynamic field search
      if (search && searchField) {
        filterOptions[searchField] = {
          [Sequelize.Op.like]: `%${search}%`
        };
      }

      // 🔍 Global search across all model fields
      else if (search) {
        const searchConditions = [];

        for (const attribute of Object.keys(this.model.rawAttributes)) {
          searchConditions.push({
            [attribute]: { [Sequelize.Op.like]: `%${search}%` }
          });
        }

        filterOptions[Sequelize.Op.or] = searchConditions;
      }

      if (fromDate && toDate) {
        const startDate = new Date(fromDate);
        const endDate = new Date(toDate);

        // Adjust endDate to include the entire day
        endDate.setHours(23, 59, 59, 999);

        filterOptions.createdAt = {
          [Sequelize.Op.between]: [startDate, endDate],
        };
      }
      // Combine all options and fetch data
      const items = await this.model.findAndCountAll({
        where: filterOptions,
        // order: sortOptions,
        // ...paginationOptions
      });

      // Respond with paginated data and metadata
      res.status(200).json({
        status: 200,
        message: `${this.model.name}s fetched successfully`,
        result: items.rows,
        pagination: {
          totalItems: items.count,
          totalPages: Math.ceil(items.count / limit),
          currentPage: parseInt(page),
          pageSize: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: [],
      });
    }
  }

  async getById(req, res) {
    try {
      const item = await this.model.findByPk(req.params.id);
      if (item) {
        res.status(200).json({
          status: 200,
          message: `${this.model.name}s fetched successfully`,
          result: item,
        });
      }else{
         res.status(204).json({
          status: 404,
          message: `Item not found`,
          result: {},
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: {},
      });
    }
  }
  async getOneByCustomKey(req, res) {
    try {
      // Extract query parameters for pagination, filtering, and sorting
      const { ...filters } = req.body;

      // Set up filtering
      const filterOptions = {};


      for (const key in filters) {
        filterOptions[key] = filters[key];
      }

      // Combine all options and fetch data
      const item = await this.model.findOne({
        where: filterOptions
      });

      // Respond with paginated data and metadata
      res.status(200).json({
        status: 200,
        message: `${this.model.name} fetched successfully`,
        result: item
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message+"gjgd",
        result: {},
      });
    }
  }
  async create(req, res) {
    try {
      const item = await this.model.create(req.body);
      res.status(200).json({
        status: 200,
        message: `${this.model.name} created successfully`,
        result: item
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: {}
      });
    }
  }
  async createBatch(req, res) {
    try {
      // Assuming the request body contains an array of items to create
      const items = Array.isArray(req.body) ? req.body : [req.body];

      // Create all records in batch
      const createdItems = await this.model.bulkCreate(items);

      res.status(200).json({
        status: 200,
        message: `${this.model.name}s created successfully`,
        result: createdItems
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: []
      });
    }
  }


  async update(req, res) {
    try {
      const [updated] = await this.model.update(req.body, {
        where: { id: req.params.id }
      });
      if (updated) {
        const item = await this.model.findByPk(req.params.id);
        res.status(200).json({
          status: 200,
          message: `${this.model.name}s updated successfully`,
          result: item,
        });

      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: {},
      });
    }
  }
  async updateBatch(req, res) {
    try {
      const { ids, data } = req.body;
      const [updated] = await this.model.update(data, {
        where: { id: ids },
      });

      if (updated) {
        const updatedItems = await this.model.findAll({
          where: { id: ids },
        });

        res.status(200).json({
          status: 200,
          message: `${this.model.name}s updated successfully`,
          result: updatedItems,
        });
      } else {
        res.status(404).json({
          status: 404,
          message: "No records found to update",
          result: [],
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: [],
      });
    }
  }

  async updateWithFilter(req, res) {
    try {
      const { ...filters } = req.query;
      // Set up filtering
      const filterOptions = {};
      for (const key in filters) {
        filterOptions[key] = filters[key];
      }
      const [updated] = await this.model.update(req.body, {
        where: filterOptions
      });
      if (updated) {
        res.status(200).json({
          status: 200,
          message: `${this.model.name}s updated successfully`,
          result: updated,
        });
      } else {
        res.status(200).json({
          status: 200,
          message: `no data found for update`,
          result: null,
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: null,
      });
    }
  }
  async updateBulkDataEach(req, res) {
    try {
      const updates = req.body; // array of objects

      if (!Array.isArray(updates) || updates.length === 0) {
        return res.status(400).json({
          status: 400,
          message: "Request body must be an array",
          result: null,
        });
      }

      const results = [];

      for (const item of updates) {
        const { id, ...data } = item;

        if (!id) continue;

        const [updated] = await this.model.update(data, { where: { id } });

        results.push({ id, updated });
      }

      res.status(200).json({
        status: 200,
        message: `${this.model.name}s updated successfully`,
        result: results,
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: null,
      });
    }
  }

  async delete(req, res) {
    try {
      const deleted = await this.model.destroy({
        where: { id: req.params.id }
      });
      if (deleted) {
        res.status(200).json({
          status: 200,
          message: `${this.model.name}s deleted successfully`,
          result: {},
        });
      }
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: error.message,
        result: null,
      });
    }
  }
}

module.exports = BaseController;
