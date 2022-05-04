const Model = require('../Model')

function ActionsTypeDatabaseRDSModel() {
	Model.call(this)
	this.tableName = 'databases_rds'
}
ActionsTypeDatabaseRDSModel.prototype = new Model()
ActionsTypeDatabaseRDSModel.prototype.getActionDatabaseRDS= function(actionId, callback){
	const statement = `SELECT * FROM databases_rds WHERE databases_rds.actions_id=? AND databases_rds.deleted=0 AND databases_rds.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

module.exports = new ActionsTypeDatabaseRDSModel()