const Model = require('../Model')

function ActionsTypeMD5Model() {
	Model.call(this)
	this.tableName = 'actions_types_md5'
}
ActionsTypeMD5Model.prototype = new Model()

module.exports = new ActionsTypeMD5Model()