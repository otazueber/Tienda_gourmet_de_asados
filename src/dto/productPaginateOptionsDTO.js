const APP_CONST = require("../commons/constants/appConstants");

class ProductPaginateOptionsDTO {
  constructor(info) {
    this.limit = info.query.limit || APP_CONST.MIN_ITEMS_PER_PAGE;
    this.page = info.query.page || APP_CONST.DEFAULT_NUMBER_PAGE;
    this.sort = info.query.sort;
    this.query = info.query.query;
  }
}
module.exports = ProductPaginateOptionsDTO;
