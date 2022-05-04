const Model = require('../Model')
const HeadersModel = require('./HeadersModel')

function ActionTypeHttpRequestModel() {
	Model.call(this)
	this.tableName = 'action_type_http_request'
}
ActionTypeHttpRequestModel.prototype = new Model()

ActionTypeHttpRequestModel.prototype.getActionHttpRequest= function(actionId, callback){
	const statement = `SELECT * FROM action_type_http_request WHERE action_type_http_request.actions_id=? AND action_type_http_request.deleted=0 AND action_type_http_request.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				HeadersModel.getHeadersPerActionHttpRequest(res[index].id, (error, response)=>{
					if (!error) {
						res[index].headers=response;
					} else {
						res[index].headers=[];
					}

					if(res.length == (parseInt(index)+1)){
						callback(null, res)
					}
				})
			}
		}else{
			callback(null, res)
		}
	})
}

module.exports = new ActionTypeHttpRequestModel()