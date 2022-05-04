// Referencia al modelo base de la aplicación
const Model = require('../Model')

function ActionsTypeSftpModel() {
	Model.call(this)
	this.tableName = 'actions_types_ssh2'
}
ActionsTypeSftpModel.prototype = new Model()

ActionsTypeSftpModel.prototype.getActionSFTP= function(actionId, callback){
	const statement = `SELECT * FROM actions_types_ssh2 WHERE actions_types_ssh2.actions_id=? AND actions_types_ssh2.deleted=0 AND actions_types_ssh2.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

module.exports = new ActionsTypeSftpModel()