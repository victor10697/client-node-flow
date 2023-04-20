const Model = require('../Model')

function ActionTypeHttpRequestModel() {
	Model.call(this)
	this.tableName = 'action_type_http_request'
}
ActionTypeHttpRequestModel.prototype = new Model()

module.exports = new ActionTypeHttpRequestModel()