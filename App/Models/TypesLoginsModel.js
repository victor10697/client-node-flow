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
	const _this=this;
	if(!SettingsModel?.getConnection()){
		SettingsModel?.setConnection(_this.getConnection());
		ActionsTypeJWTModel?.setConnection(_this.getConnection());
	}
	ActionsTypeJWTModel.verify(token,(err,res)=>{
		if(err){
			callback('error', null);
			return false;
		}else{
			SettingsModel.getSettings((errorS, settings)=>{
				_this.getListProviders((err, res) => {
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
							providerDefault: settings && settings.providerDefault ? settings.providerDefault : '',
							logoLink: settings && settings.logoLink ? settings.logoLink : ''
						}});
						return true;
					}
				});
			});
		}
	});
}
 
const saveSesionClient= (data, connection=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(connection);
	}

	return new Promise((ress,errr)=>{
		LoginsAuthorizationsModel.createOrUpdate(data,{tokenAuthorization:true},(err,res)=>{
			if (err) {
				console.error('TypesLoginsModel-saveSesionClient', err);
				errr(err)
			}else{
				ress(res);
			}
		});
	});
}
const generateTokenIntial= async function(provider, stateVtex, redirect_uri, callback, _this=null){
	if(!_this){
		console.error('error internal class');
		callback('error internal class', null);
		return;
	}
	_this.generateTokenIntial(provider, async (err, res) => {
		if(!err){
			if(res.length > 0){
				InputsUpdatesController.insertInternal({
					source_id:res[0].sources_id,
					provider: provider
				}, async (errAF, resAF)=>{
					if(errAF){
						console.error('generateTokenIntial->insertInternal',eeerr);
						callback('error get token', null);
						return false;
					}else{
						if(resAF.token && resAF.token !=''){
							try{
								await saveSesionClient({
									tokenAuthorization:resAF.token,
									types_logins_id: res[0].types_logins_id,
									stateVtex: stateVtex,
									redirect_uri: redirect_uri
								},_this.getConnection());
								callback(null, resAF);
								return true;
							}catch(eeerr){
								console.error('generateTokenIntial->saveSesionClient error save session',eeerr);
								callback('error save sesion', null);
								return false;
							}
						}else{
							console.error('generateTokenIntial error create token');
							callback('error step create token', null);
							return false;
						}
					}
				}, _this.getConnection());
			}else{
				console.error('TypesLoginsModel-generateTokenIntial not providers', res);
				callback('error provider not found', null);
				return false;
			}
		}else{
			console.error('TypesLoginsModel-generateTokenIntial', err);
			callback(null, 'error');
			return false;
		}
	});
};

TypesLoginsModel.prototype.getProviderAvailable = async function (data,callback) {
	const _this= this;
	if(!FieldsLoginModel?.getConnection()){
		FieldsLoginModel?.setConnection(_this.getConnection());
	}
	_this.getProviderAvailablePerName(data.provider, async (err, res) => {
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
					if(err2){
						console.error('getProviderAvailable-generateTokenIntial', err2);
						callback(err2,null);
						return false;	
					}
					callback(null,{
						steps:res,
						authorization: res2
					});
					return true;
				},_this);
			}else{
				callback('error data',null);
				return false;
			}
			
		}
	})
}

TypesLoginsModel.prototype.createLogin = async function (data, callback) {
	const _this= this;
	_this.createOrUpdate({
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
				saveStepLogin(data.steps, res.id, _this.getConnection());
			}
			callback(null, res);
		}
	});
}

const saveStepLogin=(steps, type_login_id, prconexion=null)=>{
	if(!SourcesModel?.getConnection()){
		SourcesModel?.setConnection(prconexion);
		StepsLoginsModel?.setConnection(prconexion);
	}
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
								saveFieldsLogin(steps[i].fields, res.id, prconexion);
							}
						}
					});
				}
			});
		}
	}
}

const saveFieldsLogin= async (fields, step_login_id, prconexion=null)=>{
	if(!FieldsLoginModel?.getConnection()){
		FieldsLoginModel?.setConnection(prconexion);
	}
	let fieldsRegistered= await FieldsLoginModel.getRegisterRelacion('steps_logins_id',step_login_id);
	let fieldsActive= [];
	for (let i = 0; i < fields.length; i++) {
		if(fields[i].name && fields[i].name != ''){
			let exitField=false;
			for (var j = 0; j < fieldsRegistered.length; j++) {
				if(fields[i].name == fieldsRegistered[j].name){
					exitField=true;
				}
			}
			if(exitField==true){
				fieldsActive= [...fieldsActive,fields[i].name];
			}
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
				tabIndex: fields[i].tabIndex ? fields[i].tabIndex : '',
				autofocus: fields[i].autofocus ? fields[i].autofocus : 'false',
				steps_logins_id: step_login_id
			},{name:true, steps_logins_id:true},(err,res)=>{
				if(err){
					console.log('err', err);
				}
			});
		}
	}

	for (let i = 0; i < fieldsRegistered.length; i++) {
		let exitField=false;
		for (var j = 0; j < fieldsActive.length; j++) {
			if(fieldsActive[j] == fieldsRegistered[i].name){
				exitField=true;
			}
		}

		if(exitField == false){
			FieldsLoginModel.createOrUpdate({
				name: fieldsRegistered[i].name && fieldsRegistered[i].name != '' ? fieldsRegistered[i].name : 'error',
				steps_logins_id: step_login_id,
				actived: 0
			},{name:true, steps_logins_id:true},(err,res)=>{
				if(err){
					console.log('err', err);
				}
			});
		}
	}
};

TypesLoginsModel.prototype.getValidStep= function (data, authorization, callback){
	const _this=this;
	if(!ActionsTypeJWTModel?.getConnection() || !LoginsAuthorizationsModel?.getConnection() || !StepsLoginsModel?.getConnection()){
		ActionsTypeJWTModel?.setConnection(_this.getConnection());
		LoginsAuthorizationsModel?.setConnection(_this.getConnection());
		StepsLoginsModel?.setConnection(_this.getConnection());
	}

	ActionsTypeJWTModel.verify(authorization,(err,res)=>{
		if(err){
			console.error('TypesLoginsModel.prototype.getValidStep-ActionsTypeJWTModel.verify',err);
			callback('error', null);
			return false;
		}else{
			LoginsAuthorizationsModel.getPerToken(authorization,(errLA,resLA)=>{
				if(errLA){
					console.error('TypesLoginsModel.prototype.getValidStep-LoginsAuthorizationsModel.getPerToken',errLA);
					callback('error', null);
					return false;
				}else if(resLA.types_logins_id && resLA.id){
					StepsLoginsModel.getStepPerName(data.stepName, resLA.types_logins_id, (errSN, resSN)=>{
						if(errSN){
							callback('error', null);
							return false;
						}else if(resSN){
							console.log('success valid TypesLoginsModel.prototype.getValidStep - ProcessStepValid');
							ProcessStepValid(resSN, data, resLA, res.settings, callback, _this);
						}else{
							callback('error', null);
							return false;
						}
					});
				}else{
					console.error('TypesLoginsModel.prototype.getValidStep-LoginsAuthorizationsModel.getPerToken not found per authorization', authorization);
					callback('error', null);
					return false;
				}
			});
		}
	});
};

const ProcessStepValid= async (dataStep, input, LoginAuthorization, settings,callback, _this=null)=>{
	input.source_id=dataStep.sources_id;
	InputsUpdatesController.insertInternal(input, async (errAF, resAF)=>{
		if(errAF){
			callback('error',null);
			return false;
		}else{
			let validCode=true, errorValid=false,generateCodeAccessValid={};
			await updateInforUser(resAF,LoginAuthorization, _this);
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
				errorValid= await updateLoginAuthorizationGenerateVerificationCode(resAF,LoginAuthorization, _this);
			}
			if(dataStep.validCode==1){
				validCode= await updateLoginAuthorizationValidCode(resAF,LoginAuthorization, _this);
			}
			if(validCode==false){
				errorValid=true;
			}
			let createUpdateLoginAuthorizationAccessToken=false;
			if(dataStep.createAccessToken==1 && validCode==true){
				generateCodeAccessValid= await updateLoginAuthorizationAccessToken(resAF,LoginAuthorization,settings, _this);
				errorValid=generateCodeAccessValid.error;
				if(generateCodeAccessValid.error===false){
					createUpdateLoginAuthorizationAccessToken=true;
					resAF= generateCodeAccessValid.response;
				}
			}
			if(resAF.hashPassword){
				let resValidPassword= await validPasswordClient(resAF.hashPassword,LoginAuthorization,settings, _this);
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
	}, _this?.getConnection());
};

const validPasswordClient= async (hash, registroLogin, settings, _this=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(_this?.getConnection());
	}
	let valid= true;
	if(hash && typeof hash == 'string' && hash == registroLogin.codeVerify){
		await savePasswordVTEX(registroLogin,settings);
		LoginsAuthorizationsModel.delete(registroLogin.id,(err,res)=>{});
	}else{
		valid= false;
	}
	return {
		valid: valid,
		response:{setPasswordSuccess:true}
	}
}

const updateInforUser= async (resAction,registroLogin, _this=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(_this?.getConnection());
	}
	try{
		if(resAction.authorizedEmailLogin && typeof resAction.authorizedEmailLogin == 'string' && resAction.authorizedEmailLogin != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {email:resAction.authorizedEmailLogin} );
		}
		if(resAction.authorizedUserIdLogin && typeof resAction.authorizedUserIdLogin == 'string' && resAction.authorizedUserIdLogin != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {userId:resAction.authorizedUserIdLogin} );
		}
		if(resAction.authorizedNameLogin && typeof resAction.authorizedNameLogin == 'string' && resAction.authorizedNameLogin != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {name:resAction.authorizedNameLogin} );
		}
		if(resAction.codeAuthorization && typeof resAction.codeAuthorization == 'string' && resAction.codeAuthorization != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {codeAuthorization:resAction.codeAuthorization} );
		}
		if(resAction.authorizedPassword && typeof resAction.authorizedPassword == 'string' && resAction.authorizedPassword != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {password:resAction.authorizedPassword} );
		}
	}catch(e){
		console.log('error', e);
	}
};

/**
 * Actualizacion de cliente
 * */
const updateUserLg= (ModelDB, id, data)=>{
	return new Promise(async (resp,err)=>{
		ModelDB.update(id,data,(errdb,res)=>{
			if(errdb){
				console.error('updateUserLg', errdb);
				err(errdb);
			}else{
				resp(true);
			}
		});
	});
};

const updateLoginAuthorizationGenerateVerificationCode= (resAction,registroLogin, _this=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(_this?.getConnection());
	}

	return new Promise( async (resp, errr) =>{
		if(resAction.sendCodeValidate && typeof resAction.sendCodeValidate == 'string' && resAction.sendCodeValidate != ''){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {codeVerify:resAction.sendCodeValidate} );
			resp(false);
		}else{
			resp(true);
		}	
	});
};

const updateLoginAuthorizationValidCode= (resAction,registroLogin, _this=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(_this?.getConnection());
	}

	return new Promise( async (resp, errr) =>{
		if(!resAction.insertCodeValidate || (resAction.insertCodeValidate != registroLogin.codeVerify)){
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {error:'Invalid code.'} );
			resp(false);
		}else{
			await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {error:'Success code.',state:'processing'} );
			resp(true);
		}	
	});
};

const updateLoginAuthorizationAccessToken= async (resAction,registroLogin,settings, _this=null)=>{
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(_this?.getConnection());
	}
	let resErr= false, objSave={};
	if(!resAction.codeAuthorization || !registroLogin.email || registroLogin.email == '' || !registroLogin.userId || registroLogin.userId==''){
		resErr= true;
		await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, {error:'Invalid access token.'} );
	}else{
		objSave={
			codeAuthorization:resAction.codeAuthorization,
		};
		await updateUserLg(LoginsAuthorizationsModel, registroLogin.id, objSave );
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
	if(!LoginsAuthorizationsModel?.getConnection()){
		LoginsAuthorizationsModel?.setConnection(TypesLoginsModel.prototype.getConnection());
	}
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
	if(!registroLogin?.userId || registroLogin?.userId == ''){
		return false;	
	}
	console.log('start save password', registroLogin, settings);
	let requestOptions = {
		url: settings?.urlEntityPassword,
		method: 'PATCH',
		responseType: 'json',
		data: {
		  id:registroLogin?.userId,
		  confirmation:registroLogin?.codeVerify,
		  password:registroLogin?.password,
		  accesskey:registroLogin?.userId
		},
		headers: {
			'X-VTEX-API-AppKey': settings?.apiKeyVtex,
			'X-VTEX-API-AppToken': settings?.apiTokenVtex
		}
	};

	console.log('eliminacion con asociaciones por telefono',settings?.urlEntityClients, settings?.relationClients, settings?.clearClients);
	//contituar con la eliminacion con asociaciones por telefono
	if(settings?.urlEntityClients && settings?.relationClients && settings?.clearClients && settings?.clearClients != '' && (settings?.clearClients==true || settings?.clearClients=='true' || settings?.clearClients== 1 || settings?.clearClients == '1') ){
		console.log('Start cleanner clients!');
		await clearClients({id:registroLogin?.userId, settings:settings, password: registroLogin?.password, confirmation:registroLogin?.codeVerify, accesskey:registroLogin?.userId});
	}

	await axios(requestOptions);
	
	return true;
}

// funcion para eliminar clientes
const clearClients= async ({id=null, settings=null, password=null, confirmation=null, accesskey=null})=>{
	if(id && settings && password){
		// obtenreregistro clientes
		let clientRegister= await getClientsVTEX({key:'id', value:id, fields: settings?.relationClients, settings:settings});

		if(typeof clientRegister == 'object' && clientRegister.length > 0){
			// si existe el cliente
			let clientsRelations= await getClientsVTEX({key: settings?.relationClients, value: clientRegister[0][settings?.relationClients], settings:settings});
			clientsRelations= clientsRelations.filter(it=>(it.id != id));

			for (let i = 0; i < clientsRelations.length; i++) {
				deletePasswordVTEX({id: clientsRelations[i]?.id, settings:settings, password:password, confirmation:confirmation, accesskey:accesskey});
			}
		}

	}

	return true;
}

//funcion que elimina registro dentro de clientes
const deletePasswordVTEX= async ({id=null, settings=null, password=null, confirmation=null, accesskey=null})=>{
	if(id && settings && password){
		let requestOptions = {
			url: settings.urlEntityPassword,
			method: 'PATCH',
			responseType: 'json',
			data: {
				id:id,
				password:password,
				confirmation:confirmation,
				accesskey:accesskey
			},
			headers: {
				'X-VTEX-API-AppKey': settings.apiKeyVtex,
				'X-VTEX-API-AppToken': settings.apiTokenVtex
			}
		};
		
		try {
			await axios(requestOptions)
			console.log('delete client', id);
		} catch (error) {
			// Handle errors
			console.log('error delete client', error);
		}
	}
}

// funcion que busca clientes
const getClientsVTEX= async ({key=null, value=null, fields= 'id', settings=null})=>{
	if(key && value && settings){
		let requestOptions = {
			url: `${settings.urlEntityClients}?${key}=${value}&_fields=${fields}`,
			method: 'GET',
			responseType: 'json',
			data: {},
			headers: {
				'X-VTEX-API-AppKey': settings.apiKeyVtex,
				'X-VTEX-API-AppToken': settings.apiTokenVtex
			}
		};
		
		try {
			let res = await axios(requestOptions);
			console.log('clients', res?.data);
			return res?.data ?? [];
		} catch (error) {
			// Handle errors
			console.log('error search client', error);
			return [];
		}
	}else{
		return [];
	}
}

module.exports = new TypesLoginsModel()