const Model = require('../Model')
const ActionsTypeJWTModel = require('./ActionsTypeJWTModel')
const jwt = require('jsonwebtoken');
const SettingsModel = require('./SettingsModel')

function LoginsAuthorizationsModel() {
	Model.call(this)
	this.tableName = 'logins_authorizations'
}
LoginsAuthorizationsModel.prototype = new Model();

LoginsAuthorizationsModel.prototype.getUserInfoValid= function(accesToken, callback){
	if(!ActionsTypeJWTModel?.getConnection()){
		ActionsTypeJWTModel?.setConnection(this.getConnection());
	}
	let thisT= this;
	thisT.validAccessClient(accesToken, (err,dataLogin)=>{
		if(err){
			callback('access denied.', null);
		}else{
			if(Object.keys(dataLogin).length > 0){
				ActionsTypeJWTModel.verify(dataLogin.accessToken,(errAT,resAT)=>{
					if(errAT){
						callback('Token Expired Error', null);
						return false;
					}else{
						thisT?.delete(dataLogin.id, (err, res) => {if (err) {console.log(err);} });
						callback(null, {
							id: dataLogin.userId,
							email: dataLogin.email,
							name: dataLogin.name
						});	
						return true;
					}
				});
			}else{
				callback('access denied.', null);
				return false;
			}
		}
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

const updateSolicitudVTEX= function(id,token){
	return new Promise((resp, eerr)=>{
		const statement = `UPDATE logins_authorizations SET accessToken=?, state=? WHERE id=?`;
		LoginsAuthorizationsModel.prototype.updateSolicitudVTEX(id, token, (err, res) => {
			if (err) {
				console.log(err)
				eerr(err);
				return;
			}
			resp(res);
		})
	});
};

const validCodeSolicitudVTEX= async function(code,settings,callback){
	LoginsAuthorizationsModel.prototype.validCodeSolicitudVTEX(code, async (err, res) => {
		if (err) {
			console.error('LoginsAuthorizationsModel validCodeSolicitudVTEX', err);
			callback('error',null);
			return false;
		}else if(res.length > 0){
			let secret= settings.secretJWT && settings.secretJWT !='' ? settings.secretJWT.trim() : '12345',
				objectEncrypt={
					"status": 'success',
					"email": encodeURIComponent(res[0].email)
				};
			jwt.sign(objectEncrypt, secret, function(errt, token) {
				if(errt){
					console.error('LoginsAuthorizationsModel validCodeSolicitudVTEX jwt', errt);
					callback(null,errt);
				}else{
					try{
						await updateSolicitudVTEX(res[0].id,token);
					}catch(eeeer){
						console.error(eeeer);
					}
					console.log('LoginsAuthorizationsModel validCodeSolicitudVTEX success');
					callback(null,{
						access_token: token,
						expires_in: settings.expires_in
					});
				}	
				return true;
			});
		}else{
			callback('access denied.', null);
		}
	})
};
LoginsAuthorizationsModel.prototype.getValidCodeSolicitud= function(code,client_id,client_secret,callback){
	if(!SettingsModel?.getConnection()){
		SettingsModel?.setConnection(this.getConnection());
	}
	if(code && client_id && client_secret && code!='' && client_id!='' && client_secret!=''){
			SettingsModel.getSettings((err,settings)=>{
				if(err){
					callback('error', null);
					return false;
				}else if((settings.client_id && settings.client_id==client_id) && (settings.client_secret && settings.client_secret==client_secret)){
					let secret= settings.secretJWT ? settings.secretJWT : '',
					objectSettings= settings.settingJWT ? (getDataJSON(settings.settingJWT)) : { algorithm: 'RS256' };
					jwt.verify(code, secret, objectSettings, function(errJ, decoded) {
						if(errJ){
							console.error('getValidCodeSolicitud', errJ);
							callback('errorToken',null);
							return false;
						}else{
							validCodeSolicitudVTEX(code,settings,(errVSV,resVSV)=>{
								if(errVSV){
									console.error('access denied. validCodeSolicitudVTEX', errJ);
									callback('access denied.', null);
									return false;
								}else{
									callback(null, resVSV);
									return true;
								}
							});
						}	
					});
				}else{
					console.error('access denied get settings');
					callback('access denied', null);
					return false;
				}
			});
	}else{
		console.error('access denied per parameters');
		callback('access denied.', null);
		return false;
	}
}

LoginsAuthorizationsModel.prototype.getAuthorizationCode= function(state,redirect_uri,client_id,callback){
	if(!SettingsModel?.getConnection()){
		SettingsModel?.setConnection(this.getConnection());
	}
	SettingsModel.getSettings((err,settings)=>{
		if(err){
			callback('error', null);
		}else{
			let listUris= settings.redirectUriAuthorizations && settings.redirectUriAuthorizations != '' ? settings.redirectUriAuthorizations.split(',') : [];
			let validUri= listUris.filter((uri)=>{
				return (uri.indexOf(redirect_uri) > -1 || redirect_uri.indexOf(encodeURIComponent(uri)) > -1 );
			});
			if(validUri.length > 0 && settings?.client_id === client_id){
				let secret= settings.secretJWT && settings.secretJWT !='' ? settings.secretJWT.trim() : '12345',
				objectEncrypt={
					"status": 'success',
					"redirect_uri": encodeURIComponent(settings.redirect_uri)
				};
				jwt.sign(objectEncrypt, secret, function(errjwt, token) {
					if(err){
						callback(errjwt,null);
					}else{
						let redirectLogin= `${settings.pageLoginUrl}?state=${state}&redirect_uri=${encodeURIComponent(redirect_uri)}&token=${token}`;
						callback(null, redirectLogin);
					}	
					return true;
				});
			}else{
				callback('error redirect_uri', null);
			}
		}
	});

}

const getAccessVtex=(decoded,settings,stateVtex,responseVtex)=>{
	if(decoded.email && decoded.name && decoded.userId && decoded.redirect_uri){
		let secret= settings.secretJWT && settings.secretJWT !='' ? settings.secretJWT.trim() : '12345',
		objectEncrypt={
			"status": 'success',
			"email": encodeURIComponent(decoded.email)
		};
		jwt.sign(objectEncrypt, secret, function(err, token) {
			if(err){
				responseVtex('error Token',null);
			}else{
				let redirect_uri= `${decodeURIComponent(decoded.redirect_uri)}?code=${token}&state=${stateVtex}`;
				LoginsAuthorizationsModel.prototype.tableName = 'logins_authorizations';
				LoginsAuthorizationsModel.prototype.createOrUpdate({
					name: decodeURIComponent(decoded.name),
					userId: decodeURIComponent(decoded.userId),
					email: decodeURIComponent(decoded.email),
					redirect_uri: decodeURIComponent(decoded.redirect_uri),
					stateVtex: stateVtex,
					codeAuthorization: token,
					state: 'processing'
				},{userId:true},(ee,ss)=>{console.log(ee)})
				
				responseVtex(null,{
					"codeAuthorization" : token,
					"redirect_uri": encodeURIComponent(redirect_uri)
				});
			}
		});
	}else{
		responseVtex('error Token',null);
	}
}
LoginsAuthorizationsModel.prototype.getValidCodeSolicitudFast= function(code,stateVtex,callback){
	if(!SettingsModel?.getConnection()){
		SettingsModel?.setConnection(this.getConnection());
	}
	if(code && code !='' && stateVtex && stateVtex!=''){
		SettingsModel.getSettings((err,settings)=>{
			if(err){
				callback('error', null);
				return false;
			}else{
				let secret= settings.secretJWT ? settings.secretJWT : '',
				objectSettings= settings.settingJWT ? (getDataJSON(settings.settingJWT)) : { algorithm: 'RS256' };
				jwt.verify(code, secret, objectSettings, function(errJ, decoded) {
					if(errJ){
						callback('errorToken',null);
						return false;
					}else{
						getAccessVtex(decoded,settings,stateVtex,(errVtex,resVtex)=>{
							if(errVtex){
								callback(errVtex,null);
								return false;
							}
							callback(null,resVtex);
							return true;
						});

					}	
				});
			}
		});
	}else{
		callback('access denied.', null);
		return false;
	}
}

module.exports = new LoginsAuthorizationsModel()