const Model = require('../Model')

function ActionsTypeEmailsModel() {
	Model.call(this)
	this.tableName = 'action_type_emails'
}
ActionsTypeEmailsModel.prototype = new Model()

module.exports = new ActionsTypeEmailsModel()