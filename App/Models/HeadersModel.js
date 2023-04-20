const Model = require('../Model')

function HeadersModel() {
	Model.call(this)
	this.tableName = 'headers'
}
HeadersModel.prototype = new Model()

module.exports = new HeadersModel()