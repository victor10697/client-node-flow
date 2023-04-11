const Model = require('../Model')

function StepsLoginsModel() {
	Model.call(this)
	this.tableName = 'steps_logins'
}
StepsLoginsModel.prototype = new Model()

StepsLoginsModel.prototype.getStepPerName= function (stepName, types_logins_id, callback){
	const statement = `SELECT * FROM ${this.tableName} WHERE ${this.tableName}.name=? AND ${this.tableName}.types_logins_id=? AND ${this.tableName}.deleted=0 AND ${this.tableName}.actived=1`;
	this.dbConnection.query(statement, [stepName,types_logins_id], (err, res) => {
		if (err) {
			callback(err, null)
			return
		}

		res = res.length > 0 ? res[0] : null;
		callback(null, res)
	})
};
module.exports = new StepsLoginsModel()