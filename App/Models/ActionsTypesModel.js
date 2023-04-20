const Model = require('../Model')

function ActionsTypesModel() {
	Model.call(this)
	this.tableName = 'actions_types'
}
ActionsTypesModel.prototype = new Model()

module.exports = new ActionsTypesModel()