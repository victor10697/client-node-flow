const Model = require('../Model')

function ActionsModel() {
	Model.call(this)
	this.tableName = 'actions'
}
ActionsModel.prototype = new Model()

module.exports = new ActionsModel()