const Model = require('../Model')

function ActionsTypeMD5Model() {
	Model.call(this)
	this.tableName = 'actions_types_md5'
}
ActionsTypeMD5Model.prototype = new Model()

ActionsTypeMD5Model.prototype.getActionMD5= function(actionId, callback){
	const statement = `SELECT * FROM actions_types_md5 WHERE actions_types_md5.actions_id=? AND actions_types_md5.deleted=0 AND actions_types_md5.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

module.exports = new ActionsTypeMD5Model()