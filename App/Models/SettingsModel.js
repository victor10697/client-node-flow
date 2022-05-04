// Referencia al modelo base de la aplicación
const Model = require('../Model')

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

module.exports = new SettingsModel()