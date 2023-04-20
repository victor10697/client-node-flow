const Model = require('../Model')

function ActionsTypeDatabaseRDSModel() {
	Model.call(this)
	this.tableName = 'databases_rds'
}
ActionsTypeDatabaseRDSModel.prototype = new Model()

module.exports = new ActionsTypeDatabaseRDSModel()