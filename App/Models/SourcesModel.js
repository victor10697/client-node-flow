const Model = require('../Model')

function SourcesModel() {
	Model.call(this)
	this.tableName = 'sources'
}
SourcesModel.prototype = new Model()

SourcesModel.prototype.validSource= function(key, token, result) {
	const statement = `SELECT id FROM ${this.tableName} WHERE ${this.tableName}.key=? AND ${this.tableName}.token=? AND ${this.tableName}.deleted=0 AND ${this.tableName}.actived=1`;
	this.dbConnection.query(statement, [key, token], (err, res) => {
		if (err) {
			result(err, null)
			return
		}

		res = res.length > 0 ? {state: 'success', source_id: res[0].id} : {state: 'error', source_id:null};
		result(null, res)
	})
}

SourcesModel.prototype.getSourcePerName= function(sourceName, result) {
	const statement = `SELECT id FROM ${this.tableName} WHERE ${this.tableName}.name=? AND ${this.tableName}.deleted=0 AND ${this.tableName}.actived=1`;
	this.dbConnection.query(statement, [sourceName], (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		res = res.length > 0 ? res[0] : {};
		result(null, res)
	})
}

module.exports = new SourcesModel()