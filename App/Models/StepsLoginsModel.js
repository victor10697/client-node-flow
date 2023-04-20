const Model = require('../Model')

function StepsLoginsModel() {
	Model.call(this)
	this.tableName = 'steps_logins'
}
StepsLoginsModel.prototype = new Model()

module.exports = new StepsLoginsModel()