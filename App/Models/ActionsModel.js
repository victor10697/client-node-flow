const Model = require('../Model')

function ActionsModel() {
	Model.call(this)
	this.tableName = 'actions'
}
ActionsModel.prototype = new Model()

ActionsModel.prototype.getActionPerNodeFlowId= function(nodeId, callback){
	const statement = `SELECT actions.*, act.name as action_type FROM actions INNER JOIN actions_types as act ON act.id=actions.action_type_id WHERE actions.nodes_flows_id=? AND actions.deleted=0 AND actions.actived=1 LIMIT 1`;
	this.dbConnection.query(statement, [nodeId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

module.exports = new ActionsModel()