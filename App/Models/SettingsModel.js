// Referencia al modelo base de la aplicación
const Model = require('../Model')
const axios = require('axios').default;

function SettingsModel() {
	Model.call(this)
	this.tableName = 'settings'
}
SettingsModel.prototype = new Model()

/**
 * Registra los datos de configuración en la base de datos.
 * @param {Array[]} records Matriz de datos a insertar.
 * @param {Function} result Callback que se invoca al finalizar la ejecución de la función.
 */
SettingsModel.prototype.saveRecords = function (settings, result) {
	// Se obtiene las fechas de creación y actualización de registros en la base de daots
	let records=[];
	for (let key in settings) {
		records.push({
			name:key,
			label:key,
			value: settings[key] || null
		})
	}

	for (let index = 0; index < records.length; index++) {
		this.createOrUpdate(records[index],{name: true}, (error,response)=>{
			if((records.length - 1) == index){
				if(!error){
					result(null, response);
					return;
				}else{
					result(error, null);
					return;
				}
			}
		});
	}
}

SettingsModel.prototype.getSettings = function (callback) {
	this.select((err, res) => {
		let objSettings={};
		if (err) {
			callback(err, null)
			return
		}

		for (let index = 0; index < res.length; index++) {
			objSettings[res[index].name]= res[index].value;
		}
		
		callback(null, objSettings)
	})
}

/**
 * Salvar log en fuente externa
 * @param error // error del proceso
 * @param response // respuesta del proceso
 * @param code // codigo generado 
 **/
SettingsModel.prototype.saveLog = function (error, response, id) {
	if((error || response) && id){
		const _this= this;
		_this.select((err, res) => {
			_this.closeConnection(null);
			let objSettings={};
			if (err) {
				console.log(err, null);
			}

			for (let index = 0; index < res.length; index++) {
				objSettings[res[index].name]= res[index].value;
			}
			
			if(objSettings?.urlLog && objSettings?.methodLog && objSettings?.activeLog && (objSettings?.activeLog=='1' || objSettings?.activeLog== 1 || objSettings?.activeLog==true || objSettings?.activeLog=='true') ){

				let log= null;
				if(response && typeof response == "object"){
					log= JSON.stringify(response);
				}else if(response) {
					log= response;
				}else if(error && typeof error == "object"){
					log= JSON.stringify(error);
				}else if(error){
					log= error;
				}else{
					log= "Not found error";
				}

				let options= {
					url: objSettings?.urlLog,
					method: objSettings?.methodLog,
					data: {
						id: id ? id : (new Date().getTime()),
						log: log
					},
					headers: objSettings?.headersLog ? JSON.parse(objSettings?.headersLog) : {},
					responseType: 'json'
				};
				
				axios(options)
				.then(async (result) => {
					console.log('Response log', result);
				})
				.catch(async (error) => {
					console.log('Error log', error);
				});

			}
		})
	}
	
}

module.exports = new SettingsModel()