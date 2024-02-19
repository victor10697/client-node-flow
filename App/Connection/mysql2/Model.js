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
 * Obtiene los datos de un registro asociado a un determinado Id Promesa.
 * @param {*} id Id del registro a consultar.
 */
Model.prototype.getRegister = async function (id) {
	const statement = `SELECT * FROM ${this.tableName} WHERE id = ? AND deleted = 0`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	return new Promise((resolve, reject) => connectDB.query(statement, [id], (err, results) => {
      connectDB.end();
      if (err) {
      	console.error(err);
        reject(err)
      } else if(results[0]){
        resolve(results[0]);
      }else{
      	resolve(null);
      }
    }));
}

/**
 * Obtiene los datos de registros asociado a un determinada relacion Promesa.
 * @param {*} campoRelacion campo al que relaciona con un un id.
 * @param {*} id Id del registro a consultar.
 */
Model.prototype.getRegisterRelacion = async function (campoRelacion, id, active=1) {
	const statement = `SELECT * FROM ${this.tableName} WHERE ${campoRelacion} = ? AND deleted = 0 AND actived=?`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	return new Promise((resolve, reject) => connectDB.query(statement, [id,active], (err, results) => {
      connectDB.end();
      if (err) {
      	console.error(err);
        reject(err)
      } else {
        resolve(results);
      }
    }));
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
Model.prototype.insert = async function (record, result) {
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
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
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
Model.prototype.update = async function (id, record, result) {
	setCurrentDate(record, false)
	const _this= this;

	let wildcards = [], values = []
	for (let i in record) {
		if (record.hasOwnProperty(i)) {
			wildcards.push(`\`${i}\` = ?`)
			values.push(record[i])
		}
	}
	values.push(id)

	let statement = `UPDATE ${this.tableName} SET ${wildcards.toString()} WHERE ${this.columnId} = ? AND deleted = 0`
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		_this.callbackUpdateRecord(err, res, result)
	})
}

/**
 * Actualiza el estado de un registro a eliminado (deleted = 1 y actived = 0)
 * @param {*} id Id del registro a eliminar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.remove = async function (id, result) {
	const statement = `UPDATE ${this.tableName} SET deleted = 1, actived = 0 WHERE ${this.columnId} = ? AND deleted = 0`
	const values = [id]
	const _this= this;

	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		_this.callbackDeleteRecord(err, res, result)
	})
}

/**
 * Inserta un nuevo registro en la base de datos.
 * @param {Object} record Datos a insertar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.replace = async function (record, result) {
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
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}
		result(null, { id: res.insertId, ...record })
	})
}

Model.prototype.callbackSelect = async function (statement, values, result) {
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}
		result(null, res)
	})
}

Model.prototype.callbackSelectOne = async function (statement, values, result) {
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
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
Model.prototype.validRegisterUniqued = async function (fieldsUniquied, fieldsUniquiedValues, result) {
	const statementSelect = `SELECT ${this.columnId} FROM ${this.tableName} WHERE ${fieldsUniquied.join(' AND ')} AND ${this.tableName}.deleted=0 LIMIT 1`;

	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statementSelect, fieldsUniquiedValues, (err, res) => {
		connectDB.end();
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
Model.prototype.updateRegister = async function (fieldsUpdate, values, registreId, result) {
	values.push(registreId);
	const statement = `UPDATE ${this.tableName} SET ${fieldsUpdate} WHERE ${this.columnId}=? AND deleted = 0`
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}else{
			result(null, res)
			return
		}
	})
}
/**
 * Metodo para insertar registros dentro de base datos
 *@param fields -- son las columnas a modificar
 *@param wildcards -- son los valores correctondientes a cada columna a insertar
 *@param values -- son valores que se envian para proteer de ataques sql
 *@param result -- es una funcion donse se retorma la respuesta del proceso realizado
 **/
Model.prototype.createRegister = async function (fields, wildcards, values, result) {
	const statement = `INSERT INTO ${this.tableName} (${fields.toString()}) VALUES (${wildcards.toString()})`
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	connectDB.query(statement, values, (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
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

/**
 * METODOS CUSTOM PARA CONSULATAS DE TABLAS ESPECIFICAS 
 **/

/**
 * Metodo para poder eliminar una accion de la tabla action_parameter 
 *@param (*) actionId -- es el ide de la accion a eliminar
 **/
Model.prototype.deleteByActionId = async function deleteByActionId(actionId) {
	const statement = `DELETE FROM ${this.tableName} WHERE action_id = ?`
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
		setTimeout(connectDB.end, 1500);
	} catch (errDB){
			console.error('errDB', errDB);
	}
	return connectDB.query(statement, [actionId],(err, res)=>{})
}

/**
 * Es un metodo para obtener una accion por flujo nodo.
 *@param (*) nodeId   -- es el id del nodo de accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta 
 **/
Model.prototype.getActionPerNodeFlowId = async function getActionPerNodeFlowId(nodeId, callback) {
	const statement = `SELECT actions.*, act.name as action_type FROM actions INNER JOIN actions_types as act ON act.id=actions.action_type_id WHERE actions.nodes_flows_id=? AND actions.deleted=0 AND actions.actived=1 LIMIT 1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [nodeId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo RDS
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionDatabaseRDS = async function getActionDatabaseRDS(actionId, callback){
	const statement = `SELECT * FROM databases_rds WHERE databases_rds.actions_id=? AND databases_rds.deleted=0 AND databases_rds.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo Emails
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getEmails = async function getEmails(actionEmailId, callback){
	const statement = `SELECT * FROM emails WHERE emails.action_type_emails_id=? AND emails.deleted=0 AND emails.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionEmailId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo email
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionEmail = async function getActionEmail(actionId, callback){
	const statement = `SELECT * FROM action_type_emails WHERE action_type_emails.actions_id=? AND action_type_emails.deleted=0 AND action_type_emails.actived=1`;
	let thisT= this;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				thisT.getEmails(res[index].id, (error, response)=>{
					if (!error) {
						res[index].emails=response;
					} else {
						res[index].emails=[];
					}

					if(res.length == (parseInt(index)+1)){
						callback(null, res)
					}
				})
			}
		}else{
			callback(null, res)
		}
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo JWT
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionJWT = async function getActionJWT(actionId, callback){
	const statement = `SELECT * FROM actions_types_jwt WHERE actions_types_jwt.actions_id=? AND actions_types_jwt.deleted=0 AND actions_types_jwt.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo MD5
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionMD5 = async function getActionMD5(actionId, callback){
	const statement = `SELECT * FROM actions_types_md5 WHERE actions_types_md5.actions_id=? AND actions_types_md5.deleted=0 AND actions_types_md5.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo SFTP
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionSFTP = async function getActionSFTP(actionId, callback){
	const statement = `SELECT * FROM actions_types_ssh2 WHERE actions_types_ssh2.actions_id=? AND actions_types_ssh2.deleted=0 AND actions_types_ssh2.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo SFTP
 *@param (*) name   -- es el nombre de una accion
 *@param (*) result -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.validTypeAction = async function validTypeAction(name, result) {
	const statement = `SELECT * FROM actions_types WHERE actions_types.name=? AND actions_types.deleted=0 AND actions_types.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [name], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}

		res = res.length > 0 ? {state: 'success', action: res[0]} : {state: 'error', action:{}};
		result(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo HTTP
 *@param (*) actionHttpId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getHeadersPerActionHttpRequest = async function getHeadersPerActionHttpRequest(actionHttpId, callback){
	const statement = `SELECT * FROM headers WHERE headers.action_type_http_request_id=? AND headers.deleted=0 AND headers.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionHttpId], (err, res) => {
		connectDB.end();
		if (err) {
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo HTTP
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionHttpRequest = async function getActionHttpRequest(actionId, callback){
	const statement = `SELECT * FROM action_type_http_request WHERE action_type_http_request.actions_id=? AND action_type_http_request.deleted=0 AND action_type_http_request.actived=1`;
	let thisT= this;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				thisT.getHeadersPerActionHttpRequest(res[index].id, (error, response)=>{
					if (!error) {
						res[index].headers=response;
					} else {
						res[index].headers=[];
					}

					if(res.length == (parseInt(index)+1)){
						callback(null, res)
					}
				})
			}
		}else{
			callback(null, res)
		}
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo ProcessData
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionProcessData = async function getActionProcessData(actionId, callback){
	const statement = `SELECT * FROM action_type_process_data WHERE action_type_process_data.actions_id=? AND action_type_process_data.deleted=0 AND action_type_process_data.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [actionId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}
		callback(null, res)
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo ProcessData
 *@param (*) regExpByDate   -- exprecion regular para buscar un registro para activar tarea programada
 *@param (*) regExpGeneral   -- exprecion regular para buscar registros generales para activar tarea programada
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getCronJobs = async function getCronJobs(regExpByDate, regExpGeneral, callback) {
  const statement = `SELECT * FROM cron_jobs WHERE (cron REGEXP '${regExpByDate}' OR cron NOT REGEXP '${regExpGeneral}') AND deleted = 0 AND actived = 1`;
  const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
  connectDB.query(statement, [], (error, records) => {
  	connectDB.end();
    if (error) callback(error, null)
    else callback(null, records)
  })
}

/**
 * Metodo para obtener una accion de un nodo tipo ProcessData
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
function getQueryHistory(req){
	let w='', 
		hoy= new Date()
		dia= hoy.getDay(),
		mes= hoy.getMonth(),
		anio= hoy.getFullYear();
		mes= (parseInt(mes)+1);
		mes= mes < 10 ? '0'+mes : mes;
		fecha= `${anio}-${mes}-${dia}`;
		params= [];

	w+= ` AND DATE(history_flow.created_at) = ?`;
	if(req.query.createdAt && req.query.createdAt != ''){
		params.push(req.query.createdAt);
	}else{
		params.push(fecha);
	}
	if(req.query.searchInput && req.query.searchInput != ''){
		w+= ` AND inp.bodyRequest LIKE ?`;
		params.push(`%${req.query.searchInput}%`);
	}
	if(req.query.inputStatus && req.query.inputStatus != ''){
		w+= ` AND inp.processStatus= ?`;
		params.push(req.query.inputStatus);
	}
	return {where:w,params:params};
}

/**
 * Metodo para obtener una historial de acciones flujos de accion
 *@param (*) req   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.selectHistory = async function selectHistory(req, callback){
	let w= getQueryHistory(req);
	const statement =  `SELECT 
							node.name as node_name,
							node.label as node_label,
							act.name as action_name,
							sour.name as source,
							sour.key as source_key,
							inp.bodyRequest as input,
							inp.processStatus as input_status,
							history_flow.request,
							history_flow.response,
							history_flow.error,
							history_flow.created_at 
						FROM 
							history_flow
							INNER JOIN inputs_updates AS inp
								ON inp.id = history_flow.inputs_updates_id
							INNER JOIN actions AS act
								ON act.id = history_flow.actions_id
							INNER JOIN nodes_flows AS node
								ON node.id = act.nodes_flows_id
							INNER JOIN sources AS sour
								ON sour.id = node.sources_id
						WHERE 
							history_flow.deleted=? AND 
							history_flow.actived=? AND
							inp.source_id=? 
							${w.where}`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [0,1,req.params.source_id].concat(w.params), (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

/**
 * Metodo para obtener un nodo por fuente id
 *@param (*) source_id   -- es el id de una fuente
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getNodesFlowPerSource = async function getNodesFlowPerSource(source_id, callback){
	const statement = `SELECT * FROM nodes_flows WHERE nodes_flows.sources_id=? AND nodes_flows.deleted=0 AND nodes_flows.actived=1 ORDER BY id ASC`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [source_id], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

/**
 * Metodo para actualizar un nodo padre
 *@param (*) nodeFlowId   -- es el id de una fuente
 *@param (*) nodeParent   -- nombre de nodo padre
 *@param (*) sourceId -- es el id de la fuente
 **/
Model.prototype.updateNodeParent = async function updateNodeParent(nodeFlowId,nodeParent,sourceId){
	const statement = `SELECT id FROM nodes_flows WHERE nodes_flows.name=? AND nodes_flows.sources_id=? AND nodes_flows.deleted=0 AND nodes_flows.actived=1 ORDER BY id ASC`;
	let thisT= this;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [nodeParent,sourceId], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			return false;
		}
		if(res.length > 0){
			thisT.update(nodeFlowId,{node_flow_id:res[0].id}, (errA,resA)=>{});
		}
		return true;
	})
}

/**
 * Metodo para validar un fuente
 *@param (*) key   -- llave de la fuente
 *@param (*) token   -- token de la fuente
 *@param (*) result -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.validSource = async function validSource(key, token, result) {
	const statement = `SELECT id,name FROM sources WHERE sources.key=? AND sources.token=? AND sources.deleted=0 AND sources.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [key, token], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}

		res = res.length > 0 ? {state: 'success', source_id: res[0].id, source_name: res[0].name} : {state: 'error', source_id:null};
		result(null, res)
	})
}

/**
 * Metodo para obtener el id de una fuente por nombre de la fuente
 *@param (*) sourceName   -- llave de la fuente
 *@param (*) result -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getSourcePerName = async function getSourcePerName(sourceName, result) {
	const statement = `SELECT id FROM sources WHERE sources.name=? AND sources.deleted=0 AND sources.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [sourceName], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			result(err, null)
			return
		}
		res = res.length > 0 ? res[0] : {};
		result(null, res)
	})
}

/**
 * METODOS PARA EL MANEJO DEL LOGIN 
 **/

/**
 * Metodo para obtener token de autorizacion
 *@param (*) tokenAuthorization   -- token registro de autenticacion
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getPerToken = async function getPerToken(tokenAuthorization, callback){
	const statement = `SELECT id,types_logins_id,codeVerify,state,email,name,userId,redirect_uri,stateVtex,password FROM logins_authorizations WHERE tokenAuthorization=? AND state='pending' AND actived = 1 AND deleted=0`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [tokenAuthorization], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback('error',null);
			return false;
		}else{
			callback(null,(res.length > 0 ? res[0] : {}));
			return true;
		}
	})
}

/**
 * Metodo para validar accesos a un cliente
 *@param (*) accesToken   -- token registro de validacion
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.validAccessClient = async function validAccessClient(accesToken, callback){
	const statement = `SELECT * FROM logins_authorizations WHERE accessToken=? AND actived = 1 AND deleted=0`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [accesToken], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback('error',null);
			return false;
		}else{
			callback(null,(res.length > 0 ? res[0] : {}));
			return true;
		}
	})
}

/**
 * Metodo para actualizar registros de una solicitud de acceso
 *@param (*) id   -- id registro actualizar
 *@param (*) token   -- token registro actualizacion
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.updateSolicitudVTEX = async function updateSolicitudVTEX(id,token, callback){
	const statement = `UPDATE logins_authorizations SET accessToken=?, state=? WHERE id=?`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [token,'processed',id], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback('error',null);
			return false;
		}else{
			callback(null, res);
			return true;
		}
	})
}

/**
 * Metodo para validar accesos a un cliente
 *@param (*) code -- token registro de validacion
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.validCodeSolicitudVTEX = async function validCodeSolicitudVTEX(code, callback){
	const statement = `SELECT * FROM logins_authorizations WHERE codeAuthorization=? AND (state=? OR state=?) AND actived = 1 AND deleted=0`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [code,'processing','pending'], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback('error',null);
			return false;
		}else{
			callback(null, res);
			return true;
		}
	})
}

/**
 * Metodo para obtener un paso por nombre
 *@param (*) stepName -- nombre de un paso
 *@param (*) types_logins_id -- id tipo de login 
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getStepPerName = async function getStepPerName(stepName, types_logins_id, callback){
	const statement = `SELECT * FROM steps_logins WHERE steps_logins.name=? AND steps_logins.types_logins_id=? AND steps_logins.deleted=0 AND steps_logins.actived=1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [stepName,types_logins_id], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, null)
			return
		}

		res = res.length > 0 ? res[0] : null;
		callback(null, res)
	})
}

/**
 * Metodo para obtener listado de logins
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getListProviders = async function getListProviders(callback){
	const statement = `SELECT providerName,label,description,iconUrl FROM types_logins WHERE actived = 1 AND deleted=0 ORDER BY position ASC`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, null)
			return
		}

		res = res.length > 0 ? res : null;
		callback(null, res)
	})
}

/**
 * Metodo para obtener listado de logins
 *@param (*) provider -- es el name del provedor seleccionado
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.generateTokenIntial = async function generateTokenIntial(provider, callback){
	const statement = `SELECT sl.sources_id, sl.types_logins_id FROM types_logins INNER JOIN steps_logins as sl ON sl.types_logins_id=types_logins.id WHERE types_logins.actived=? AND types_logins.deleted=? AND types_logins.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? LIMIT 1`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [1,0,provider,1,0,1], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, null)
			return
		}

		res = res.length > 0 ? res : null;
		callback(null, res)
	})
}

/**
 * Metodo para proveedor habilitado
 *@param (*) provider -- es el name del provedor seleccionado
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getProviderAvailablePerName = async function getProviderAvailablePerName(provider, callback){
	const statement = `SELECT sl.id, sl.name, sl.label, sl.description, sl.nameButtonSubmit, sl.nameButtonClose FROM types_logins INNER JOIN steps_logins as sl ON sl.types_logins_id=types_logins.id WHERE types_logins.actived=? AND types_logins.deleted=? AND types_logins.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? ORDER BY sl.step ASC`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}
	connectDB.query(statement, [1,0,provider,1,0,0], (err, res) => {
		connectDB.end();
		if (err) {
			console.error(err);
			callback(err, null)
			return
		}

		res = res.length > 0 ? res : [];
		callback(null, res)
	})
}

/**
 * Metodo para limpiar datos de una tabla
 **/
Model.prototype.truncate = async function truncate(){
	const statement = `TRUNCATE TABLE ${this.tableName}`;
	const connectDB= this.dbConnection;
	try{
		await connectDB.connect();
	} catch (errDB){
			console.error('errDB', errDB);
	}

	return new Promise(async(resp, er)=>{
		connectDB.query(statement, (err, res) => {
			connectDB.end();
			if (err) {
				console.error(err);
				er(err)
			}

			res = res.length > 0 ? res : [];
			resp(res);
		});
	});
}

module.exports = Model