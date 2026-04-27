// baseRouter.js
//for test purpose
const express = require('express');

class BaseRouter {
  constructor(controller) {
    this.controller = controller;
    this.router = express.Router();
    this.setupRoutes();
  }

  setupRoutes() {
    // Default CRUD routes
    this.router.get('/', this.controller.getAll.bind(this.controller));
    this.router.get('/:id', this.controller.getById.bind(this.controller));
    this.router.post('/', this.controller.create.bind(this.controller));
    this.router.post('/createBatch', this.controller.createBatch.bind(this.controller));

    this.router.post('/customGet', this.controller.getOneByCustomKey.bind(this.controller));
    this.router.post('/customGetAll', this.controller.getAllByCustomKey.bind(this.controller));

    this.router.put('/:id', this.controller.update.bind(this.controller));
    this.router.post('/updateBatch', this.controller.updateBatch.bind(this.controller));
    this.router.patch('/updateWithFilter', this.controller.updateWithFilter.bind(this.controller));
    this.router.patch('/updateBulkDataEach', this.controller.updateBulkDataEach.bind(this.controller));

    this.router.delete('/:id', this.controller.delete.bind(this.controller));
  }

  addCustomRoute(method, path, handler) {
    this.router[method](path, handler.bind(this.controller));
  }
  getRouter() {
    return this.router;
  }

}

module.exports = BaseRouter;


