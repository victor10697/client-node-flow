const dbConnection = require('./connection')

function Model() {
	this.columnId = 'id'
	this.dbConnection = dbConnection
}

/**
 * Ejecuta la consulta de registros en la base de datos.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.select = function (result) {
	const statement = `SELECT * FROM ${this.tableName} WHERE deleted = 0`
	this.callbackSelect(statement, [], result)
} 

/**
 * Obtiene los datos de un registro asociado a un determinado Id.
 * @param {*} id Id del registro a consultar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.get = function (id, result) {
	const statement = `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted = 0`
	this.callbackSelectOne(statement, [id], result)
}

/**
 * Eliminar los datos de un registro asociado a un determinado Id.
 * @param {*} id Id del registro a consultar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
 Model.prototype.delete = function (id, result) {
	const statement = `DELETE FROM ${this.tableName} WHERE id = ?`
	this.callbackSelectOne(statement, [id], result)
}

/**
 * Inserta un nuevo registro en la base de datos.
 * @param {Object} record Datos a insertar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.insert = function (record, result) {
	setCurrentDate(record, true)

	let fields = [], wildcards = [], values = []
	for (let i in record) {
		if (record.hasOwnProperty(i)) {
			fields.push(`\`${i}\``)
			wildcards.push('?')
			values.push(record[i])
		}
	}

	const statement = `INSERT INTO ${this.tableName} (${fields.toString()}) VALUES (${wildcards.toString()})`
	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, { id: res.insertId, ...record })
	})
}

/**
 * Actualiza los registros de la base de datos.
 * @param {*} id Id del registro a actualizar
 * @param {*} record Datos a actualizar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.update = function (id, record, result) {
	setCurrentDate(record, false)

	let wildcards = [], values = []
	for (let i in record) {
		if (record.hasOwnProperty(i)) {
			wildcards.push(`\`${i}\` = ?`)
			values.push(record[i])
		}
	}
	values.push(id)

	let statement = `UPDATE ${this.tableName} SET ${wildcards.toString()} WHERE ${this.columnId} = ? AND deleted = 0`
	this.dbConnection.query(statement, values, (err, res) => {
		this.callbackUpdateRecord(err, res, result)
	})
}

/**
 * Actualiza el estado de un registro a eliminado (deleted = 1 y actived = 0)
 * @param {*} id Id del registro a eliminar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.remove = function (id, result) {
	const statement = `UPDATE ${this.tableName} SET deleted = 1, actived = 0 WHERE ${this.columnId} = ? AND deleted = 0`
	const values = [id]

	this.dbConnection.query(statement, values, (err, res) => {
		this.callbackDeleteRecord(err, res, result)
	})
}

/**
 * Inserta un nuevo registro en la base de datos.
 * @param {Object} record Datos a insertar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.replace = function (record, result) {
	setCurrentDate(record, true)

	let fields = [], wildcards = [], values = []
	for (let i in record) {
		if (record.hasOwnProperty(i)) {
			fields.push(`\`${i}\``)
			wildcards.push('?')
			values.push(record[i])
		}
	}

	let statement = `REPLACE INTO ${this.tableName} (${fields.toString()}) VALUES (${wildcards.toString()})`
	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, { id: res.insertId, ...record })
	})
}

Model.prototype.callbackSelect = function (statement, values, result) {
	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, res)
	})
}

Model.prototype.callbackSelectOne = function (statement, values, result) {
	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, res[0])
	})
}

Model.prototype.createOrUpdate = function (record, skipKeys, result) {
	setCurrentDate(record, true)
	let arrOptionUpdateCreate= this.getArrayRequestUpdateOrCreate(record, skipKeys), t= this;

	if(arrOptionUpdateCreate.fieldsUniquied.length > 0 && arrOptionUpdateCreate.fieldsUniquiedValues.length > 0){
		t.validRegisterUniqued(arrOptionUpdateCreate.fieldsUniquied, arrOptionUpdateCreate.fieldsUniquiedValues, (err, res)=>{
			if(!err){
				if(res > 0){ // Registro para actualizacion
					record[t.columnId]= res;
					t.updateRegister(arrOptionUpdateCreate.fieldsUpdate, arrOptionUpdateCreate.valuesUpdates, res, (errU, resU)=>{
						if(!errU){
							delete record.created_at;	
							result(null, record);
						}else{
							result(errU, null);
						}
					});
				}else{ // Registro para creacion
					t.createRegister(arrOptionUpdateCreate.fields, arrOptionUpdateCreate.wildcards, arrOptionUpdateCreate.values, (errC, resC)=>{console.log(errC);
						if(!errC){
							if(resC.insertId){
								record[t.columnId]= resC.insertId
							}
							result(null, record);
						}else{
							result(errC, null);
						}
					});
				}
			}else{
				result(err, null);
			}
		})
	}else if(arrOptionUpdateCreate.fields.length > 0 && arrOptionUpdateCreate.values.length > 0){
		t.createRegister(arrOptionUpdateCreate.fields, arrOptionUpdateCreate.wildcards, arrOptionUpdateCreate.values, (errC, resC)=>{
			if(!errC){
				if(resC.insertId){
					record[t.columnId]= resC.insertId
				}
				result(null, record);
			}else{
				result(errC, null);
			}
		});
	}else{
		result('Error Register', null);
	}
}

/**
 * Metodo para obtener variables de utilidad para actualizar o crear un registro
 * @param {*} record -- variables request
 * @param {*} skipKeys -- variables unicas
 * @returns {*} Objeto con datos de validacion de variables para almacenamiento o actualizacion
 */
Model.prototype.getArrayRequestUpdateOrCreate = function (record, skipKeys) {
	let fieldsUpdate=[], fields = [], wildcards = [], valuesUpdates = [], values = [], updateFields = [], fieldsUniquied= [], fieldsUniquiedValues= [];

	for (let i in record) {
		if (record.hasOwnProperty(i)) {
			fields.push(`\`${i}\``)
			if(i != 'created_at'){
				fieldsUpdate.push(`\`${i}\`=?`)
				valuesUpdates.push(record[i])
			}
			
			wildcards.push('?')
			values.push(record[i])

			if (!skipKeys[i]) {
				updateFields.push(`\`${i}\` = VALUES(\`${i}\`)`)
			}

			if(skipKeys[i] && i != 'created_at' && i != 'updated_at'){
				fieldsUniquied.push(`${this.tableName}.${i}=?`);
				fieldsUniquiedValues.push(record[i]);
			}
		}
	}

	return {
		fieldsUpdate: fieldsUpdate,
		valuesUpdates: valuesUpdates,
		fields: fields,
		wildcards: wildcards,
		values: values,
		updateFields: updateFields,
		fieldsUniquied: fieldsUniquied,
		fieldsUniquiedValues: fieldsUniquiedValues
	};
}

/**
 * Metodo para consultar valor unico en base de datos
 * @param {*} fieldsUniquied -- campos unicos
 * @param {*} fieldsUniquiedValues -- valores de los campos unicos
 * @param {*} result function callback response 
 * @returns invoca function cno dos parametros uno con error y el otro con id si el registro existe o -1 si no xiste
 */
Model.prototype.validRegisterUniqued = function (fieldsUniquied, fieldsUniquiedValues, result) {
	const statementSelect = `SELECT ${this.columnId} FROM ${this.tableName} WHERE ${fieldsUniquied.join(' AND ')} AND ${this.tableName}.deleted=0 LIMIT 1`;
	this.dbConnection.query(statementSelect, fieldsUniquiedValues, (err, res) => {
		if(!err){
			if(res.length > 0){
				result(null, res[0][this.columnId])
				return
			}else{
				result(null, -1)
				return
			}
		}else{
			result(err, null)
			return
		}
	})
}

/**
 * Metodo para actualizar parametros por id de registro
 * @param {*} fieldsUpdate 
 * @param {*} values 
 * @param {*} registreId 
 * @param {*} result 
 */
Model.prototype.updateRegister = function (fieldsUpdate, values, registreId, result) {
	values.push(registreId);
	const statement = `UPDATE ${this.tableName} SET ${fieldsUpdate} WHERE ${this.columnId}=? AND deleted = 0`

	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}else{
			result(null, res)
			return
		}
	})
}

Model.prototype.createRegister = function (fields, wildcards, values, result) {
	const statement = `INSERT INTO ${this.tableName} (${fields.toString()}) VALUES (${wildcards.toString()})`

	this.dbConnection.query(statement, values, (err, res) => {
		if (err) {
			result(err, null)
			return
		}else{
			result(null, res)
			return
		}
	})
}

Model.prototype.callbackUpdateRecord = callbackUpdateRecord
Model.prototype.callbackDeleteRecord = callbackUpdateRecord

/**
 * Permite definir un bloque de sentencias dentro de una transacción SQL.
 * @param {Function} callback Función con las sentencias a ejecutar dentro de la transacción.
 */
Model.prototype.executeTransaction = function (callback) {
	//dbConnection.beginTransaction(callback)
}

/**
 * Método que ejecuta las acciones posteriores a la ejecución de la sentencia.
 * UPDATE o DELETE en la base de datos.
 */
function callbackUpdateRecord(error, response, result) {
	if (error) {
		result(error, null)
		return
	}
	if (response.affectedRows == 0) {
		result({ kind: "not_found" }, null)
		return
	}
	result(null, response)
}

/**
 * Establece la fecha actual de sistema en las propiedades 'created_at' y 'updated_at' del objeto de datos.
 * @param {Object} record Objeto de datos donde se establece las fechas.
 * @param {Boolean} create Valor que indica si el registro es de creación (TRUE) o actualización (FALSE).
 */
function setCurrentDate(record, create = true) {
	const mySQLDateString = getCurrentDate()

	if (create) {
		record.created_at = mySQLDateString
	} else {
		delete record.created_at
	}
	record.updated_at = mySQLDateString
}
Model.prototype.setCurrentDate = setCurrentDate

function getCurrentDate() {
	const isoDate = new Date()
	const mySQLDateString = isoDate.toJSON().slice(0, 19).replace('T', ' ')
	return mySQLDateString
}
Model.prototype.getCurrentDate = getCurrentDate

module.exports = Model