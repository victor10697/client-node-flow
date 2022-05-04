const Model = require('../Model')

function ActionTypeProcessDataModel() {
	Model.call(this)
	this.tableName = 'action_type_process_data'
}
ActionTypeProcessDataModel.prototype = new Model()

ActionTypeProcessDataModel.prototype.getActionProcessData= function(actionId, callback){
	const statement = `SELECT * FROM action_type_process_data WHERE action_type_process_data.actions_id=? AND action_type_process_data.deleted=0 AND action_type_process_data.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

module.exports = new ActionTypeProcessDataModel()