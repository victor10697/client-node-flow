const Model = require('../Model')

function FieldsLoginModel() {
	Model.call(this)
	this.tableName = 'fields_login'
}
FieldsLoginModel.prototype = new Model()

module.exports = new FieldsLoginModel()