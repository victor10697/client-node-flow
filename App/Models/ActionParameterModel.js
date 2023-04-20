const Model = require('../Model')

function ActionParameterModel() {
	Model.call(this)
	this.tableName = 'action_parameter'
}
ActionParameterModel.prototype = new Model()

ActionParameterModel.prototype.save = async function (actionParameters) {
	for (let index = 0; index < actionParameters.length; index++) {
		await this.insert(actionParameters[index])
	} 
}

module.exports = new ActionParameterModel()