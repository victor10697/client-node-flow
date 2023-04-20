const Model = require('../Model')

function EmailsModel() {
	Model.call(this)
	this.tableName = 'emails'
}
EmailsModel.prototype = new Model()

module.exports = new EmailsModel()