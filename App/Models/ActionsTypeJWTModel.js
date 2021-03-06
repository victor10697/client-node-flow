const Model = require('../Model')
const jwt = require('jsonwebtoken');
const SettingsModel = require('./SettingsModel')

function ActionTypeJWTModel() {
	Model.call(this)
	this.tableName = 'actions_types_jwt'
}
ActionTypeJWTModel.prototype = new Model()

ActionTypeJWTModel.prototype.getActionJWT= function(actionId, callback){
	const statement = `SELECT * FROM actions_types_jwt WHERE actions_types_jwt.actions_id=? AND actions_types_jwt.deleted=0 AND actions_types_jwt.actived=1`;
	this.dbConnection.query(statement, [actionId], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

ActionTypeJWTModel.prototype.singJWT= (actionConfig, input, responsePrev, callback)=>{
	let secret= "nodeflow20220119",
		objectEncrypt={},
		objectSettings={ algorithm: 'RS256' };
	eval(`objectEncrypt=${actionConfig.objectEncrypt}; objectSettings=${actionConfig.objectSettings}; secret='${actionConfig.secret}';`);

	jwt.sign(objectEncrypt, secret, objectSettings, function(err, token) {
		if(err){
			callback(null,err);
		}else{
			callback(null,token);
		}	
		return true;
	});
};
ActionTypeJWTModel.prototype.verifyJWT= (actionConfig,input, responsePrev,callback)=>{
	let secret= "nodeflow20220119",
		objectEncrypt={},
		objectSettings={ algorithm: 'RS256' };
	eval(`objectEncrypt=${actionConfig.objectEncrypt}; objectSettings=${actionConfig.objectSettings}; secret='${actionConfig.secret}';`);
	
	let token= objectEncrypt.token ? objectEncrypt.token : '';

	jwt.verify(token, secret, objectSettings, function(err, decoded) {
		if(err){
			callback(null,err);
		}else{
			callback(null,decoded);
		}	
		return true;
	});
};
const getDataJSON=(string)=>{
	let obj={},
		stringARR= string.replace('{','').replace('}','').split(',');
	
	for (let i = 0; i < stringARR.length; i++) {
		let keyVar= stringARR[i].split(':');
		obj[keyVar[0].trim()]=keyVar[1].replace(/'/g,'').trim();
		
	}

	return obj;
};
ActionTypeJWTModel.prototype.verify= (token,callback)=>{
	SettingsModel.getSettings((err,res)=>{
		if(err){
			callback('error', null);
			return false;
		}else{
			let secret= res.secretJWT ? res.secretJWT : '',
			objectSettings= res.settingJWT ? (getDataJSON(res.settingJWT)) : { algorithm: 'RS256' };
			jwt.verify(token, secret, objectSettings, function(errJ, decoded) {
				if(errJ){
					callback('error',null);
					return false;
				}else{
					callback(null,{decoded:decoded,settings:res});
					return true;
				}	
			});
		}
	});
};
module.exports = new ActionTypeJWTModel()