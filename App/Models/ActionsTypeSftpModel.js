// Referencia al modelo base de la aplicación
const Model = require('../Model')

function ActionsTypeSftpModel() {
	Model.call(this)
	this.tableName = 'actions_types_ssh2'
}
ActionsTypeSftpModel.prototype = new Model()

module.exports = new ActionsTypeSftpModel()