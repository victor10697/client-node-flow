const Model = require('../Model')

function HeadersModel() {
	Model.call(this)
	this.tableName = 'headers'
}
HeadersModel.prototype = new Model()

HeadersModel.prototype.getHeadersPerActionHttpRequest= function(actionHttpId, callback){
	const statement = `SELECT * FROM headers WHERE headers.action_type_http_request_id=? AND headers.deleted=0 AND headers.actived=1`;
	this.dbConnection.query(statement, [actionHttpId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

module.exports = new HeadersModel()