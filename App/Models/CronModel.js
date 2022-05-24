const Model = require('../Model')

function CronModel() {
	Model.call(this)
	this.tableName = 'cron_jobs'
}
CronModel.prototype = new Model()
CronModel.prototype.getCronJobs= function(regExpByDate, regExpGeneral, callback){
	const statement = `SELECT * FROM ${this.tableName} WHERE (cron REGEXP '${regExpByDate}' OR cron NOT REGEXP '${regExpGeneral}') AND deleted = 0 AND actived = 1`;
    this.dbConnection.query(statement, [], (error, records) => {
      if (error) callback(error,null)  
      else callback(null,records)
    })
}

module.exports = new CronModel()