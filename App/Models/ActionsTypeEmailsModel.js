const Model = require('../Model')
const EmailsModel = require('./EmailsModel')

function ActionsTypeEmailsModel() {
	Model.call(this)
	this.tableName = 'action_type_emails'
}
ActionsTypeEmailsModel.prototype = new Model()
ActionsTypeEmailsModel.prototype.getActionEmail= function(actionId, callback){
	const statement = `SELECT * FROM action_type_emails WHERE action_type_emails.actions_id=? AND action_type_emails.deleted=0 AND action_type_emails.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				EmailsModel.getEmails(res[index].id, (error, response)=>{
					if (!error) {
						res[index].emails=response;
					} else {
						res[index].emails=[];
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

module.exports = new ActionsTypeEmailsModel()