const Model = require('../Model')

function EmailsModel() {
	Model.call(this)
	this.tableName = 'emails'
}
EmailsModel.prototype = new Model()
EmailsModel.prototype.getEmails= function(actionEmailId, callback){
	const statement = `SELECT * FROM emails WHERE emails.action_type_emails_id=? AND emails.deleted=0 AND emails.actived=1`;
	this.dbConnection.query(statement, [actionEmailId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		callback(null, res)
	})
}
module.exports = new EmailsModel()