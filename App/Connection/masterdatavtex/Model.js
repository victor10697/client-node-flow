const dbConnection = require('./connection')

function Model() {
	this.columnId = 'id'
	this.dbConnection = dbConnection
}

Model.prototype.setApiKey= function(ApiKey){
	if(ApiKey){
		this.dbConnection.setApiKey(ApiKey)
	}
}

Model.prototype.setApiToken= function(ApiToken){
	if(ApiToken){
		this.dbConnection.setApiToken(ApiToken)
	}
}

/**
 * Ejecuta la consulta de registros en la base de datos.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.select = function (result) {
	const statement = `${this.tableName}`
	this.callbackSelect(statement, {}, result)
} 

/**
 * Obtiene los datos de un registro asociado a un determinado Id.
 * @param {*} id Id del registro a consultar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.get = function (id, result) {
	const statement = `${this.tableName}`
	this.callbackSelectOne(statement, {id:id}, result)
}

/**
 * Obtiene los datos de un registro asociado a un determinado Id Promesa.
 * @param {*} id Id del registro a consultar.
 */
Model.prototype.getRegister = async function (id) {
	const statement = this.tableName;

	return new Promise((resolve, reject) => this.dbConnection.getMasterdata({
		acronym: statement,
		query: {id:id}
	}, (err, results) => {
      if (err) {
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
	const statement = this.tableName;
	let qr= {actived: active == 1 ? true : false};
	if(campoRelacion && id){
		qr[campoRelacion]= id;
	}else{
		return null;
	}

	return new Promise((resolve, reject) => this.dbConnection.getMasterdata({
		acronym: statement,
		query: qr
	}, (err, results) => {
      if (err) {
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
	this.dbConnection.deleteMasterdata({
		acronym: this.tableName,
		id: id
	}, (err, res)=>{
		if(err){
			result(err, null);
			return;
		}
		result(null, res);
	});
}

/**
 * Inserta un nuevo registro en la base de datos.
 * @param {Object} record Datos a insertar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.insert = function (record, result) {
	setCurrentDate(record, true)

	this.dbConnection.createMasterdata({
		acronym: this.tableName,
		body: record
	}, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, { id: res.id, ...record })
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
	
	// let statement = `UPDATE ${this.tableName} SET ${wildcards.toString()} WHERE ${this.columnId} = ? AND deleted = 0`
	let _this= this;
	this.dbConnection.updateMasterdata({
		acronym: this.tableName,
		body: record,
		id: id
	}, (err, res) => {
		if(err){
			result(err, null);
			return;
		}
		result(null, res);
	})
}

/**
 * Actualiza el estado de un registro a eliminado (deleted = 1 y actived = 0)
 * @param {*} id Id del registro a eliminar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.remove = function (id, result) {
	this.dbConnection.deleteMasterdata({
		acronym: this.tableName,
		id: id
	}, (err, res)=>{
		if(err){
			result(err, null);
			return;
		}
		result(null, res);
	});
}

/**
 * Inserta un nuevo registro en la base de datos.
 * @param {Object} record Datos a insertar.
 * @param {Function} result Función callback a la que se establece el resultado de la ejecución.
 */
Model.prototype.replace = function (record, result) {
	setCurrentDate(record, true)

	result(null, true);
}

Model.prototype.callbackSelect = function (statement, values, result) {
	this.dbConnection.getMasterdata({
		acronym: statement,
		query: values
	}, (err, res) => {
		if (err) {
			result(err, null)
			return
		}
		result(null, res)
	})
}

Model.prototype.callbackSelectOne = function (statement, values, result) {
	this.dbConnection.getMasterdata({
		acronym: statement,
		query: values
	}, (err, res) => {
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
				if(res != "-1"){ // Registro para actualizacion
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
							if(resC.DocumentId){
								record[t.columnId]= resC.DocumentId
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
				if(resC.DocumentId){
					record[t.columnId]= resC.DocumentId
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
			fields.push(i)
			if(i != 'created_at'){
				fieldsUpdate.push(i)
				valuesUpdates.push(record[i])
			}
			
			values.push(record[i])

			if (!skipKeys[i]) {
				updateFields.push(i)
			}

			if(skipKeys[i] && i != 'created_at' && i != 'updated_at'){
				fieldsUniquied.push(i);
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
	const statementSelect = this.tableName;
	let qr={};

	for (var i = 0; i < fieldsUniquied.length; i++) {
		qr[fieldsUniquied[i]]= fieldsUniquiedValues[i];
	}

	this.dbConnection.getMasterdata({
		acronym: statementSelect,
		query: qr
	}, (err, res) => {
		if(!err){
			if(res.length > 0){
				result(null, res[0][this.columnId])
				return
			}else{
				result(null, "-1")
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
	let body= {};
	
	for (var i = 0; i < fieldsUpdate.length; i++) {
		body[fieldsUpdate[i]]= values[i];
	}
	
	this.dbConnection.updateMasterdata({
		acronym: this.tableName,
		body: body,
		id: registreId
	}, (err, res) => {
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
	// const statement = `INSERT INTO ${this.tableName} (${fields.toString()}) VALUES (${wildcards.toString()})`

	fields = fields;
	wildcards= values;
	let body= {};
	
	for (var i = 0; i < fields.length; i++) {
		body[fields[i]]= wildcards[i];
	}

	this.dbConnection.createMasterdata({
		acronym: this.tableName,
		body: body		

	}, (err, res) => {
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

/**
 * METODOS CUSTOM PARA CONSULATAS DE TABLAS ESPECIFICAS 
 **/

/**
 * Metodo para poder eliminar una accion de la tabla action_parameter 
 *@param (*) actionId -- es el ide de la accion a eliminar
 **/
Model.prototype.deleteByActionId = function deleteByActionId(actionId) {
	return this.dbConnection.deleteMasterdata({
		acronym: this.tableName,
		id: actionId
	},(err, res)=>{})
}

/**
 * Es un metodo para obtener una accion por flujo nodo.
 *@param (*) nodeId   -- es el id del nodo de accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta 
 **/
Model.prototype.getActionPerNodeFlowId = function getActionPerNodeFlowId(nodeId, callback) {
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'actions',
		query: {
			nodes_flows_id: nodeId
		}
	}, (errAc, resAc) => {
		if (errAc) {
			callback(errAc, [])
			return
		}else{
			if(typeof resAc == 'object' && resAc[0]){
				_this.dbConnection.getMasterdata({
					acronym: 'actions_types'
				}, (errType, resType)=>{
					if (errType) {
						callback(errType, [])
						return
					}else{
						let resEnd= [];
						for (var i = resAc.length - 1; i >= 0; i--) {
							let objAcT= resAc[i];
							for (var j = 0; j < resType.length; j++) {
								if(objAcT.action_type_id== resType[j].id){
									objAcT.action_type= resType[j].name;
								}
							}
							resEnd= [...resEnd,objAcT];
						}
						callback(null, resEnd)
					}
				});
			}else{
				callback(null, []);
			}
		}
	})
}

/**
 * Metodo para obtener una accion de un nodo tipo RDS
 *@param (*) actionId   -- es el id de una accion
 *@param (*) callback -- es la funcion para retornar la respuesta del proceso de consulta
 **/
Model.prototype.getActionDatabaseRDS = function getActionDatabaseRDS(actions_idactions_id, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'databases_rds',
		query: {
			actions_id: actions_id
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getEmails = function getEmails(actionEmailId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'emails',
		query: {
			action_type_emails_id: actionEmailId
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getActionEmail = function getActionEmail(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'action_type_emails',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				_this.getEmails(res[index].id, (error, response)=>{
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
Model.prototype.getActionJWT = function getActionJWT(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'actions_types_jwt',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getActionMD5 = function getActionMD5(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'actions_types_md5',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getActionSFTP = function getActionSFTP(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'actions_types_ssh2',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.validTypeAction = function validTypeAction(name, result) {
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'actions_types',
		query: {
			name: name
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getHeadersPerActionHttpRequest = function getHeadersPerActionHttpRequest(actionHttpId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'headers',
		query: {
			action_type_http_request_id: actionHttpId
		}
	}, (err, res) => {
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
Model.prototype.getActionHttpRequest = function getActionHttpRequest(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'action_type_http_request',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		if(res.length > 0){
			for (let index = 0; index < res.length; index++) {
				_this.getHeadersPerActionHttpRequest(res[index].id, (error, response)=>{
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
Model.prototype.getActionProcessData = function getActionProcessData(actionId, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'action_type_process_data',
		query: {
			actions_id: actionId
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getCronJobs = function getCronJobs(regExpByDate, regExpGeneral, callback) {
  // const statement = `SELECT * FROM cron_jobs WHERE (cron REGEXP '${regExpByDate}' OR cron NOT REGEXP '${regExpGeneral}') AND deleted = 0 AND actived = 1`;
  let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'cron_jobs'
	}, (error, records) => {
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
Model.prototype.selectHistory = function selectHistory(req, callback){
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
	this.dbConnection.query(statement, [0,1,req.params.source_id].concat(w.params), (err, res) => {
		if (err) {console.log(err);
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
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'nodes_flows',
		query: {
			sources_id: source_id
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.updateNodeParent = function updateNodeParent(nodeFlowId,nodeParent,sourceId){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'nodes_flows',
		query: {
			sources_id: sourceId,
			name: nodeParent
		}
	}, (err, res) => {
		if (err) {
			return false;
		}
		if(res.length > 0){
			_this.update(nodeFlowId,{node_flow_id:res[0].id}, (errA,resA)=>{});
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
Model.prototype.validSource = function validSource(key, token, result) {
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'sources',
		query: {
			key: key,
			token: token
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getSourcePerName = function getSourcePerName(sourceName, result) {
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'sources',
		query: {
			name: sourceName
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getPerToken = function getPerToken(tokenAuthorization, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'logins_authorizations',
		_fields: "id,types_logins_id,codeVerify,state,email,name,userId,redirect_uri,stateVtex,password",
		query: {
			tokenAuthorization: tokenAuthorization,
			state: "pending"
		}
	}, (err, res) => {
		if (err) {
			console.log(err);
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
Model.prototype.validAccessClient = function validAccessClient(accesToken, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'logins_authorizations',
		query: {
			accessToken: accesToken
		}
	}, (err, res) => {
		if (err) {
			console.log(err);
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
Model.prototype.updateSolicitudVTEX = function updateSolicitudVTEX(id,token, callback){
	this.dbConnection.updateMasterdata({
		acronym: "logins_authorizations",
		id: id,
		body: {
			accessToken: token,
			state: "processed"
		}
	}, (err, res) => {
		if (err) {
			console.log(err);
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
Model.prototype.validCodeSolicitudVTEX = function validCodeSolicitudVTEX(code, callback){
	// const statement = `SELECT * FROM logins_authorizations WHERE codeAuthorization=? AND (state=? OR state=?) AND actived = 1 AND deleted=0`;
	// (statement, [code,'processing','pending']
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'logins_authorizations',
		query: {
			codeAuthorization: code
		}
	}, (err, res) => {
		if (err) {
			console.log(err);
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
Model.prototype.getStepPerName = function getStepPerName(stepName, types_logins_id, callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'steps_logins',
		query: {
			name: stepName,
			types_logins_id: types_logins_id
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.getListProviders = function getListProviders(callback){
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'types_logins',
		_fields: "providerName,label,description,iconUrl",
		_sort: "position ASC", 
		query: {
			name: stepName,
			types_logins_id: types_logins_id
		}
	}, (err, res) => {
		if (err) {
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
Model.prototype.generateTokenIntial = function generateTokenIntial(provider, callback){
	// const statement = `SELECT sl.sources_id, sl.types_logins_id FROM types_logins INNER JOIN steps_logins as sl ON sl.types_logins_id=types_logins.id WHERE types_logins.actived=? AND types_logins.deleted=? AND types_logins.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? LIMIT 1`;
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'types_logins',
		query: {
			providerName: provider
		}
	}, (err, res) => {
		if (err) {
			callback(err, null)
			return
		}

		if(res && typeof res == 'object' && res[0]){
			_this.dbConnection.getMasterdata({
				acronym: 'steps_logins',
				query: {
					types_logins_id: res[0].id
				}
			}, (errStep, resStep)=>{
				if(errStep){
					callback(errStep, null)
					return
				}
				let resst = resStep.length > 0 ? res.map((it)=>({sources_id:it.sources_id, types_logins_id: it.types_logins_id})) : null;
				callback(null, resst)
			});
		}else{
			callback(null, null)
		}
	})
}

/**
 * Metodo para proveedor habilitado
 *@param (*) provider -- es el name del provedor seleccionado
 *@param (*) callback -- funcion que retorna el proceso de la funcion
 **/
Model.prototype.getProviderAvailablePerName = function getProviderAvailablePerName(provider, callback){
	// const statement = `SELECT sl.id, sl.name, sl.label, sl.description, sl.nameButtonSubmit, sl.nameButtonClose FROM types_logins INNER JOIN steps_logins as sl ON sl.types_logins_id=types_logins.id WHERE types_logins.actived=? AND types_logins.deleted=? AND types_logins.providerName=? AND sl.actived=? AND sl.deleted=? AND sl.createTokenInitial=? ORDER BY sl.step ASC`;
	let _this= this;
	_this.dbConnection.getMasterdata({
		acronym: 'types_logins',
		query: {
			providerName: provider
		}
	}, (err, res) => {
		if (err) {
			callback(err, null)
			return
		}

		if(res && typeof res=='object' && res[0]){
			_this.dbConnection.getMasterdata({
				acronym: 'steps_logins',
				_sort: "step ASC",
				query: {
					types_logins_id: res[0].id
				}
			}, (errStep, resStep)=>{
				if(errStep){
					callback(errStep, null)
					return
				}

				resStep = resStep.length > 0 ? resStep.map(it=>({ id:it.id, name: it.name, label: it.label, description: it.description, nameButtonSubmit: it.nameButtonSubmit, nameButtonClose: it.nameButtonClose })) : [];
				callback(null, resStep)
			});
		}
	})
}

module.exports = Model