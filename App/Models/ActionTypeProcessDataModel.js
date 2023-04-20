const Model = require('../Model')

function ActionTypeProcessDataModel() {
	Model.call(this)
	this.tableName = 'action_type_process_data'
}
ActionTypeProcessDataModel.prototype = new Model()

module.exports = new ActionTypeProcessDataModel()