const Model = require('../Model')

function SourcesModel() {
	Model.call(this)
	this.tableName = 'sources'
}
SourcesModel.prototype = new Model()

module.exports = new SourcesModel()