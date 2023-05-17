'use strict';
const axios = require('axios').default;

function VtexModel(){
	this.url= "";
	this.apiKey= "";
	this.apiToken= "";
	this.startEntity= "";
	this.version= "";
	this.nameApp= "";
	this.titleApp= "";
}

VtexModel.prototype.createConnection= function({
	DB_VTEX_URL=null,
	DB_VTEX_APIKEY=null,
	DB_VTEX_APITOKEN=null,
	DB_VTEX_START_ENTITY= null,
	DB_VTEX_VERSION= null,
	DB_VTEX_NAME= null,
	DB_VTEX_TITLE= null
}){
	this.url= DB_VTEX_URL;
	this.apiKey= DB_VTEX_APIKEY;
	this.apiToken= DB_VTEX_APITOKEN;
	this.startEntity= DB_VTEX_START_ENTITY;
	this.version= DB_VTEX_VERSION;
	this.nameApp= DB_VTEX_NAME;
	this.titleApp= DB_VTEX_TITLE;
};

VtexModel.prototype.getUrl= function(){
	return this.url;
}

VtexModel.prototype.getApiKey= function(){
	return this.apiKey;
}

VtexModel.prototype.getApiToken= function(){
	return this.apiToken;
}

VtexModel.prototype.getStartEntity= function(){
	return this.startEntity;
}

VtexModel.prototype.getVersion= function(){
	return this.version;
}

VtexModel.prototype.getNameApp= function(){
	return this.nameApp;
}

VtexModel.prototype.getTitleApp= function(){
	return this.titleApp;
}

/**
 * Obtener data masterdata 
 * @param acronym (*)  String
 * @param _fields (*)  String
 * @param _where       String
 * @param query        String
 * @param callback (*) Function
 **/
VtexModel.prototype.getMasterdata= function({acronym=null, _fields="_all", _where=null, query=null}, callback){
	if(acronym){
		let requestOptions={
			url: `${this.getUrl()}/api/dataentities/${this.getStartEntity()}_${acronym}/search`,
			method: "GET",
			responseType: "json",
			headers: {
				"X-VTEX-API-AppKey": this.getApiKey(),
				"X-VTEX-API-AppToken": this.getApiToken(),
				'Cache-Control': 'no-cache',
			  	'Pragma': 'no-cache',
			  	'Expires': '0'
			},
			params: {
				_fields:_fields,
				_schema: this.getNameApp()
			}
		};
		if(_where){
			requestOptions.params['_where']= encodeURIComponent(_where);
		}
		if(query && typeof query == 'object'){
			for(const param in query){
				requestOptions.params[param]= query[param];
			}
		}

		axios(requestOptions)
		.then(async (result) => {
			callback(null,result.data); 
			return true;
		})
		.catch(async (error) => {
			callback(error,[]); 
			return false; 
		});
	}else if(callback){
		callback(null, []);
	}else{
		return null;
	}
}

VtexModel.prototype.createMasterdata= function(){
	return this.titleApp;
}

VtexModel.prototype.deleteMasterdata= function(){
	return this.titleApp;
}

module.exports = VtexModel;