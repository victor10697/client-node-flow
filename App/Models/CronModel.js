const Model = require('../Model')

function CronModel() {
  Model.call(this)
  this.tableName = 'cron_jobs'
}
CronModel.prototype = new Model()

module.exports = new CronModel()