const Model = require('../Model')
const FieldsLoginModel = require('./FieldsLoginModel')
const StepsLoginsModel = require('./StepsLoginsModel')
const LoginsAuthorizationsModel = require('./LoginsAuthorizationsModel')
const InputsUpdatesController = require('../Http/Controllers/InputsUpdatesController')
const ActionsTypeJWTModel = require('./ActionsTypeJWTModel')
const SourcesModel = require('./SourcesModel')
const SettingsModel = require('./SettingsModel')
const MD5 = require('md5');
const jwt = require('jsonwebtoken');
const axios = require('axios').default;

function TypesLoginsModel() {
	Model.call(this)
	this.tableName = 'types_logins'
}
TypesLoginsModel.prototype = new Model()

TypesLoginsModel.prototype.selectAvailable = function (token,callback) {
	ActionsTypeJWTModel.verify(token,(err,res)=>{
		if(err){
			callback('error', null);
			return false;
		}else{
			SettingsModel.getSettings((errorS, settings)=>{
				const statement = `SELECT providerName,label,description,iconUrl FROM ${this.tableName} WHERE actived = 1 AND deleted=0 ORDER BY position ASC`;
				this.dbConnection.query(statement, [], (err, res) => {
					if (err) {
						console.log(err);
						callback(null,{list:[], information:{}});
						return false;
					}else{
						callback(null,{list:res, information:{
							welcome: settings && settings.welcome ? settings.welcome : 'Welcome',
							description: settings && settings.description ? settings.description : '',
							textTyc: settings && settings.textTyc ? settings.textTyc : '',
							tycRequerid: settings && settings.tycRequerid ? settings.tycRequerid : false,
							checkDefaultTyc: settings && settings.checkDefaultTyc ? settings.checkDefaultTyc : false,
							messageTycRequerid: settings && settings.messageTycRequerid ? settings.messageTycRequerid : 'accept terms and conditions.',
							textLoader: settings && settings.textLoader ? settings.textLoader : 'Loading...',
							logoUrl: settings && settings.logoUrl ? settings.logoUrl : '',
							textPageFooter: settings && settings.textPageFooter ? settings.textPageFooter : '',
							termsAndConditionsUrl: settings && settings.termsAndConditionsUrl ? settings.termsAndConditionsUrl : '',
							srcScript: settings && settings.srcScript ? settings.srcScript : '',
							srcCSS: settings && settings.srcCSS ? settings.srcCSS : '',
							messageLoginFast: settings && settings.messageLoginFast ? settings.messageLoginFast : '',
							btnNotFast: settings && settings.btnNotFast ? settings.btnNotFast : '',
							setTimeoutAlerts: settings && settings.setTimeoutAlerts ? settings.setTimeoutAlerts : 10000,
							daysExpiresPassword: settings && settings.daysExpiresPassword ? settings.daysExpiresPassword : '',
							providerDefault: settings && settings.providerDefault ? settings.providerDefault : ''
						}});
						return true;
					}
				});
			});
		}
	});
}
 
const saveSesionClient= (data)=>{
	LoginsAuthorizationsModel.createOrUpdate(data,{tokenAuthorization:true},(err,res)=>{});
}
const generateTokenIntial= function(provider, stateVtex, redirect_uri, callback){
	const statement = `SELECT sl.sources_id, sl.types_logins_id FROM types_logins INNER JOIN steps_logins as sl ON sl.types_logins_id=types_logins.id WHERE types_logins.actived=? AND types_logins.deleted=? AND types_logins.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? LIMIT 1`;
	TypesLoginsModel.prototype.dbConnection.query(statement, [1,0,provider,1,0,1], (err, res) => {
		if(!err){
			if(res.length > 0){
				InputsUpdatesController.insertInternal({
					source_id:res[0].sources_id,
					provider: provider
				},(errAF, resAF)=>{
					if(errAF){
						callback(null, 'error');
						return false;
					}else{
						if(resAF.token && resAF.token !=''){
							saveSesionClient({
								tokenAuthorization:resAF.token,
								types_logins_id: res[0].types_logins_id,
								stateVtex: stateVtex,
								redirect_uri: redirect_uri
							});
							callback(null, resAF);
							return true;
						}else{
							callback(null, 'error');
							return false;
						}
					}
				});
			}else{
				callback(null, 'error');
				return false;
			}
		}else{
			callback(null, 'error');
			return false;
		}
	});
};

TypesLoginsModel.prototype.getProviderAvailable = async function (data,callback) {
	const statement = `SELECT sl.id, sl.name, sl.label, sl.description, sl.nameButtonSubmit, sl.nameButtonClose FROM ${this.tableName} INNER JOIN steps_logins as sl ON sl.types_logins_id=${this.tableName}.id WHERE ${this.tableName}.actived=? AND ${this.tableName}.deleted=? AND ${this.tableName}.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? ORDER BY sl.step ASC`;
	this.dbConnection.query(statement, [1,0,data.provider,1,0,0], async (err, res) => {
		if (err) {
			console.log(err);
			callback('error data',null);
			return false;
		}else{
			if(res.length > 0){
				for (var i = 0; i < res.length; i++) {
					res[i]['fields'] = [];
					let restFild= await FieldsLoginModel.getRegisterRelacion("steps_logins_id",res[i].id);
					res[i]['fields']= restFild;
				}

				generateTokenIntial(data.provider,data.state,data.redirect_uri,(err2, res2)=>{
					callback(null,{
						steps:res,
						authorization: res2
					});
				});
			}else{
				callback('error data',null);
			}
			
			return true;
		}
	})
}

TypesLoginsModel.prototype.createLogin = async function (data, callback) {
	this.createOrUpdate({
		providerName:data.providerName,
		label:data.label ? data.label : data.providerName,
		description:data.description ? data.description : '',
		actived: data.actived ? data.actived : 0,
		position: data.position ? data.position : 0,
		iconUrl: data.iconUrl ? data.iconUrl : ''
	},{providerName:true},(err,res)=>{
		if(err){
			callback(err, null);
		}else{
			if(data.steps.length > 0){
				saveStepLogin(data.steps, res.id);
			}
			callback(null, res);
		}
	});
}

const saveStepLogin=(steps, type_login_id)=>{
	for (let i = 0; i < steps.length; i++) {
		if(steps[i].name && steps[i].name != '' && steps[i].sourceName && steps[i].sourceName != ''){
			SourcesModel.getSourcePerName(steps[i].sourceName, (errS, resS)=>{
				if(!errS && typeof resS == 'object' && Object.keys(resS).length > 0){
					StepsLoginsModel.createOrUpdate({
						name:steps[i].name && steps[i].name != '' ? steps[i].name : 'error',
						label: steps[i].label ? steps[i].label : '',
						description:steps[i].description ? steps[i].description : '',
						step: steps[i].step ? steps[i].step : 0,
						nameButtonSubmit: steps[i].nameButtonSubmit ? steps[i].nameButtonSubmit : 'Send',
						nameButtonClose: steps[i].nameButtonClose ? steps[i].nameButtonClose : 'Close',
						sources_id: resS.id,
						createAccessToken: steps[i].createAccessToken ? steps[i].createAccessToken : 0,
						createTokenInitial: steps[i].createTokenInitial ? steps[i].createTokenInitial : 0,
						generateVerificationCode: steps[i].generateVerificationCode ? steps[i].generateVerificationCode : 0,
						validCode: steps[i].validCode ? steps[i].validCode : 0,
						errorMessage: steps[i].errorMessage ? steps[i].errorMessage : '',
						actived: steps[i].actived ? steps[i].actived : 1,
						types_logins_id: type_login_id
					},{name:true, types_logins_id:true},(err,res)=>{
						if(!err){
							if(steps[i].fields.length > 0){
								saveFieldsLogin(steps[i].fields, res.id);
							}
						}
					});
				}
			});
		}
	}
}

const saveFieldsLogin=(fields, step_login_id)=>{
	for (let i = 0; i < fields.length; i++) {
		if(fields[i].name && fields[i].name != ''){
			FieldsLoginModel.createOrUpdate({
				name: fields[i].name && fields[i].name != '' ? fields[i].name : 'error',
				label: fields[i].label ? fields[i].label : '',
				type: fields[i].type ? fields[i].type : '',
				actived: fields[i].actived ? fields[i].actived : '',
				value: fields[i].value ? fields[i].value : '',
				maxlength: fields[i].maxlength ? fields[i].maxlength : '',
				minlength: fields[i].minlength ? fields[i].minlength : '',
				checked: fields[i].checked ? fields[i].checked : 'false',
				pattern: fields[i].pattern ? fields[i].pattern : '',
				autocomplete: fields[i].autocomplete ? fields[i].autocomplete : 'false',
				autocorrect: fields[i].autocorrect ? fields[i].autocorrect : 'true',
				disabled: fields[i].disabled ? fields[i].disabled : 'false',
				inputmode: fields[i].inputmode ? fields[i].inputmode : '',
				max: fields[i].max ? fields[i].max : '',
				min: fields[i].min ? fields[i].min : '',
				placeholder: fields[i].placeholder ? fields[i].placeholder : '',
				readonly: fields[i].readonly ? fields[i].readonly : 'false',
				required: fields[i].required ? fields[i].required : 'false',
				optionsSelect: fields[i].optionsSelect ? fields[i].optionsSelect : '',
				description: fields[i].description ? fields[i].description : '',
				class: fields[i].class ? fields[i].class : '',
				iconUrl: fields[i].iconUrl ? fields[i].iconUrl : '',
				steps_logins_id: step_login_id
			},{name:true, steps_logins_id:true},(err,res)=>{
				if(err){
					console.log('err', err);
				}
			});
		}
	}
};

TypesLoginsModel.prototype.getValidStep= (data, authorization, callback)=>{
	ActionsTypeJWTModel.verify(authorization,(err,res)=>{
		if(err){
			callback('error', null);
			return false;
		}else{
			LoginsAuthorizationsModel.getPerToken(authorization,(errLA,resLA)=>{
				if(errLA){
					callback('error', null);
					return false;
				}else if(resLA.types_logins_id && resLA.id){
					StepsLoginsModel.getStepPerName(data.stepName, resLA.types_logins_id, (errSN, resSN)=>{
						if(errSN){
							callback('error', null);
							return false;
						}else if(resSN){
							ProcessStepValid(resSN, data, resLA, res.settings, callback);
						}else{
							callback('error', null);
							return false;
						}
					});
				}else{
					callback('error', null);
					return false;
				}
			});
		}
	});
};

const ProcessStepValid= (dataStep, input, LoginAuthorization, settings,callback)=>{
	input.source_id=dataStep.sources_id;
	InputsUpdatesController.insertInternal(input,(errAF, resAF)=>{
		if(errAF){
			callback('error',null);
			return false;
		}else{
			let validCode=true, errorValid=false,generateCodeAccessValid={};
			updateInforUser(resAF,LoginAuthorization);
			if(resAF.authorizedEmailLogin){
				LoginAuthorization.email= resAF.authorizedEmailLogin;
				delete resAF.authorizedEmailLogin;
			} 
			if(resAF.authorizedUserIdLogin){
				LoginAuthorization.userId= resAF.authorizedUserIdLogin;
				delete resAF.authorizedUserIdLogin;
			}
			if(resAF.authorizedNameLogin){
				LoginAuthorization.name= resAF.authorizedNameLogin;
				delete resAF.authorizedNameLogin;
			}
			if(dataStep.generateVerificationCode==1){
				errorValid=updateLoginAuthorizationGenerateVerificationCode(resAF,LoginAuthorization);
			}
			if(dataStep.validCode==1){
				validCode= updateLoginAuthorizationValidCode(resAF,LoginAuthorization);
			}
			if(validCode==false){
				errorValid=true;
			}
			let createUpdateLoginAuthorizationAccessToken=false;
			if(dataStep.createAccessToken==1 && validCode==true){
				generateCodeAccessValid=updateLoginAuthorizationAccessToken(resAF,LoginAuthorization,settings);
				errorValid=generateCodeAccessValid.error;
				if(generateCodeAccessValid.error===false){
					createUpdateLoginAuthorizationAccessToken=true;
					resAF= generateCodeAccessValid.response;
				}
			}
			if(resAF.hashPassword){
				let resValidPassword=validPasswordClient(resAF.hashPassword,LoginAuthorization,settings);
				if(resValidPassword.valid){
					errorValid=false;
					resAF=resValidPassword.response;
				}else{
					errorValid=true;
				}
			}
			if(errorValid==true){
				callback(null, {error:dataStep.errorMessage});
				return false;
			}else{
				if(resAF.sendCodeValidate){resAF.sendCodeValidate='success';}
				if(resAF.insertCodeValidate){resAF.insertCodeValidate='success';}

				if(dataStep.createAccessToken==1 && validCode==true && settings.activeLoginFast==true){
					createTokenAppFast(LoginAuthorization,settings,(tokenApp)=>{
						resAF.tokenAppAuthorization=tokenApp;
						callback(null, resAF);
						return true;
					})
				}else{
					callback(null, resAF);
					return true;	
				}
		
			}	
		}
	});
};

const validPasswordClient=(hash, registroLogin, settings)=>{
	let valid= true;
	if(hash && typeof hash == 'string' && hash == registroLogin.codeVerify){
		savePasswordVTEX(registroLogin,settings);
		LoginsAuthorizationsModel.delete(registroLogin.id,(err,res)=>{});
	}else{
		valid= false;
	}
	return {
		valid: valid,
		response:{setPasswordSuccess:true}
	}
}

const updateInforUser= (resAction,registroLogin)=>{
	if(resAction.authorizedEmailLogin && typeof resAction.authorizedEmailLogin == 'string' && resAction.authorizedEmailLogin != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{email:resAction.authorizedEmailLogin},(err,res)=>{});
	}
	if(resAction.authorizedUserIdLogin && typeof resAction.authorizedUserIdLogin == 'string' && resAction.authorizedUserIdLogin != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{userId:resAction.authorizedUserIdLogin},(err,res)=>{});
	}
	if(resAction.authorizedNameLogin && typeof resAction.authorizedNameLogin == 'string' && resAction.authorizedNameLogin != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{name:resAction.authorizedNameLogin},(err,res)=>{});
	}
	if(resAction.codeAuthorization && typeof resAction.codeAuthorization == 'string' && resAction.codeAuthorization != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{codeAuthorization:resAction.codeAuthorization},(err,res)=>{});
	}
	if(resAction.authorizedPassword && typeof resAction.authorizedPassword == 'string' && resAction.authorizedPassword != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{password:resAction.authorizedPassword},(err,res)=>{});
	}
};
const updateLoginAuthorizationGenerateVerificationCode= (resAction,registroLogin)=>{
	let resErr= false;
	if(resAction.sendCodeValidate && typeof resAction.sendCodeValidate == 'string' && resAction.sendCodeValidate != ''){
		LoginsAuthorizationsModel.update(registroLogin.id,{codeVerify:resAction.sendCodeValidate},(err,res)=>{});
	}else{
		resErr= true;
	}
	return resErr;
};

const updateLoginAuthorizationValidCode= (resAction,registroLogin)=>{
	let res= true; 
	if(!resAction.insertCodeValidate || (resAction.insertCodeValidate != registroLogin.codeVerify)){
		res= false;
		LoginsAuthorizationsModel.update(registroLogin.id,{error:'Invalid code.'},(err,res)=>{});
	}else{
		LoginsAuthorizationsModel.update(registroLogin.id,{error:'Success code.',state:'processing'},(err,res)=>{});
	}
	return res;
};

const updateLoginAuthorizationAccessToken= (resAction,registroLogin,settings)=>{
	let resErr= false, objSave={};
	if(!resAction.codeAuthorization || !registroLogin.email || registroLogin.email == '' || !registroLogin.userId || registroLogin.userId==''){
		resErr= true;
		LoginsAuthorizationsModel.update(registroLogin.id,{error:'Invalid access token.'},(err,res)=>{});
	}else{
		objSave={
			codeAuthorization:resAction.codeAuthorization,
		};
		LoginsAuthorizationsModel.update(registroLogin.id,objSave,(err,res)=>{});
	}

	let redirect_uri= `${decodeURIComponent(registroLogin.redirect_uri)}?code=${objSave.codeAuthorization}&state=${registroLogin.stateVtex}`;
	return {error:resErr, response:{
		"codeAuthorization" : objSave.codeAuthorization,
		"redirect_uri": encodeURIComponent(redirect_uri)
	}};
};

const createTokenAppFast=(registroLogin,settings,callbackTokenApp)=>{
	if(registroLogin.email && registroLogin.email != '' && registroLogin.userId && registroLogin.userId!=''){
		let secret= settings.secretJWT && settings.secretJWT !='' ? settings.secretJWT.trim() : '12345',
		objectEncrypt={
			"status": 'success',
			"email": encodeURIComponent(registroLogin.email),
			"userId": encodeURIComponent(registroLogin.userId),
			"name": encodeURIComponent(registroLogin.name),
			"redirect_uri": encodeURIComponent(registroLogin.redirect_uri)
		};
		jwt.sign(objectEncrypt, secret, function(err, token) {
			if(err){
				callbackTokenApp('errorToken');
			}else{
				callbackTokenApp(token);
			}
		});
	}else{
		callbackTokenApp('errorToken');
	}
}

const updateLoginAuthorizationAccessVTEX= (resAction,registroLogin)=>{
	let resErr= false, objSave={};
	if(!resAction.access_token || resAction.access_token == '' || !registroLogin.email || registroLogin.email == '' || !registroLogin.userId || registroLogin.userId==''){
		resErr= true;
		LoginsAuthorizationsModel.update(registroLogin.id,{error:'Invalid access token.'},(err,res)=>{});
	}else{
		objSave={
			accessToken:MD5(resAction.access_token),
			expiresIn:resAction.expiresIn ? resAction.expiresIn : (60*60*24*3),
			idToken:resAction.access_token,
			state:'processed'
		};
		LoginsAuthorizationsModel.update(registroLogin.id,objSave,(err,res)=>{});
	}

	return {error:resErr, response:{
		"access_token" : objSave.accessToken,
		"expires_in" : objSave.expiresIn,
		"id_token" : objSave.idToken,
		"token_type" : "Bearer"
	}};
};

const savePasswordVTEX= async (registroLogin,settings)=>{
	let requestOptions = {
		url: settings.urlEntityPassword,
		method: 'PATCH',
		responseType: 'json',
		data: {
		  id:registroLogin.userId,
		  confirmation:registroLogin.codeVerify,
		  password:registroLogin.password
		},
		headers: {
			'X-VTEX-API-AppKey': settings.apiKeyVtex,
			'X-VTEX-API-AppToken': settings.apiTokenVtex
		}
	};
	
	await axios(requestOptions)
}

module.exports = new TypesLoginsModel()