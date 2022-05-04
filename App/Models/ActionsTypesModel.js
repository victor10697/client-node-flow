const Model = require('../Model')

function ActionsTypesModel() {
	Model.call(this)
	this.tableName = 'actions_types'
}
ActionsTypesModel.prototype = new Model()

ActionsTypesModel.prototype.validTypeAction= function(name, result) {
	const statement = `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.name=? AND ${this.tableName}.deleted=0 AND ${this.tableName}.actived=1`;
	this.dbConnection.query(statement, [name], (err, res) => {
		if (err) {
			result(err, null)
			return
		}

		res = res.length > 0 ? {state: 'success', action: res[0]} : {state: 'error', action:{}};
		result(null, res)
	})
}

module.exports = new ActionsTypesModel()