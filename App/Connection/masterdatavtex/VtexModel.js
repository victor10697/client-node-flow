'use strict';

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

VtexModel.prototype.getUrl= function(){
	return this.url;
}

VtexModel.prototype.getUrl= function(){
	return this.url;
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

module.exports = VtexModel;