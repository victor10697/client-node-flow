const Model = require('../Model')

function ActionModel() {
	Model.call(this)
	this.tableName = 'actions'
}
ActionModel.prototype = new Model()

module.exports = new ActionModel()