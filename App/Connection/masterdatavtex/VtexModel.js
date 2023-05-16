const VtexModel= ()=>{
	url= "";
	apiKey= "";
	apiToken= "";

	this.createConnection= ({
		DB_VTEX_URL=null,
		DB_VTEX_APIKEY=null,
		DB_VTEX_APITOKEN=null
	})=>{
		this.url= DB_VTEX_URL;
		this.apiKey= DB_VTEX_APIKEY;
		this.apiToken= DB_VTEX_APITOKEN;
	};
	return this;
}

module.exports = VtexModel;