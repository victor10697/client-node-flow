const Model = require('../Model')
const axios = require('axios').default;
const md5 = require('md5');

const ActionsModel = require('./ActionsModel')
const ActionTypeHttpRequestModel = require('./ActionTypeHttpRequestModel')
const ActionTypeProcessDataModel = require('./ActionTypeProcessDataModel')
const ActionsTypeEmailsModel = require('./ActionsTypeEmailsModel')
const ActionsTypeDatabaseRDSModel = require('./ActionsTypeDatabaseRDSModel')
const ActionsTypeJWTModel = require('./ActionsTypeJWTModel')
const ActionsTypeMD5Model = require('./ActionsTypeMD5Model')
const ActionsTypeSftpModel = require('./ActionsTypeSftpModel')
const {conectionSFTP} = require('./SftpModel')
const InputsUpdatesModel = require('./InputsUpdatesModel')
const HistoryFlowModel = require('./HistoryFlowModel')
const Mail= require('./Others/Mail')

function NodesFlowsModel() {
	Model.call(this)
	this.tableName = 'nodes_flows'
}
NodesFlowsModel.prototype = new Model()

NodesFlowsModel.prototype.getNodesFlowPerSource= async function(source_id, callback){
	const statement = `SELECT * FROM nodes_flows WHERE nodes_flows.sources_id=? AND nodes_flows.deleted=0 AND nodes_flows.actived=1 ORDER BY id ASC`;
	this.dbConnection.query(statement, [source_id], (err, res) => {
		if (err) {
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

NodesFlowsModel.prototype.updateNodeParent= function(nodeFlowId,nodeParent,sourceId){
	const statement = `SELECT id FROM nodes_flows WHERE nodes_flows.name=? AND nodes_flows.sources_id=? AND nodes_flows.deleted=0 AND nodes_flows.actived=1 ORDER BY id ASC`;
	this.dbConnection.query(statement, [nodeParent,sourceId], (err, res) => {
		if (err) {
			return false;
		}
		if(res.length > 0){
			this.update(nodeFlowId,{node_flow_id:res[0].id}, (errA,resA)=>{});
		}
		return true;
	})
}
/**
 * Metodos para obtener arbol de acciones
 */
/**
 * Metodo para obtener orbol de accion de una entrada de informacion
 * @param {*} listNodeFlow 
 * @returns 
 */
const getTreeNodeFlow=async (listNodeFlow) => { 
	let tree = {};
	if(listNodeFlow.length > 0){
		let nodeFatherPrincipal=  listNodeFlow.filter((node) => !node.node_flow_id);
		if(nodeFatherPrincipal.length == 1){
			for (let index = 0; index < nodeFatherPrincipal.length; index++) {
				processChildrenNode(tree, [nodeFatherPrincipal[index].name], nodeFatherPrincipal[index], listNodeFlow);	
			}
		}
		
	}
	return tree;
}
/**
 * Metodo para iniciar proceso de construccion de arbol
 * @param {*} tree 
 * @param {*} nameTree 
 * @param {*} children 
 * @param {*} listNodeFlow 
 */
const processChildrenNode= async function(tree, nameTree, children, listNodeFlow){
	let hasChildren= listNodeFlow.filter((node) => node.node_flow_id == children.id);
	setValueTreeCascade(tree, nameTree, children, hasChildren, listNodeFlow);
}
/**
 * Metodo para setear valores en el arbol de accion
 * @param {*} tree 
 * @param {*} nameTreeTM 
 * @param {*} objTM 
 * @param {*} childrenTM 
 * @param {*} listNodeFlow 
 */
const setValueTreeCascade= async function(tree, nameTreeTM, objTM, childrenTM, listNodeFlow){
	let arrIndexTmp=[], lengthName=0, nameTree=[], children= [], obj={};
	nameTree=nameTreeTM; children=childrenTM; obj=objTM; lengthName=nameTree.length;

	for (let index = 0; index < lengthName; index++) {
		arrIndexTmp.push(nameTree[index]);
		if((index+1) == lengthName){
			eval(`tree.${arrIndexTmp.join('.')}=${JSON.stringify(obj)}`);
			if(children.length > 0){
				let nameArr= []; 
				nameArr= nameTree;
				eval(`tree.${arrIndexTmp.join('.')}.children={}`);
				for (let index2 = 0; index2 < children.length; index2++) {
					eval(`tree.${arrIndexTmp.join('.')}.children.${children[index2].name}=${JSON.stringify(children[index2])}`); 
					let hasChildren= listNodeFlow.filter((node) => node.node_flow_id == children[index2].id);
					nameArr.push(children[index2].name);
					setValueTreeCascade(tree, nameArr, children[index2], hasChildren, listNodeFlow);
					nameArr.splice((nameArr.length-1), 1);
				}
			}
		}else {
			if(eval(`tree.${arrIndexTmp.join('.')}`) === undefined){
				eval(`tree.${arrIndexTmp.join('.')}={children: {}}`);
			}
			arrIndexTmp.push('children');
		}	
	}
}
// FIN Metodos para obtener arbol 

/**
 * Metodo de inicia procesamiento de una funte de entada contra un arbol de accion
 * @param {*} input 
 * @param {*} source_id 
 * @param {*} callback 
 */
const processInputNodeFlowForSource= async (input, inputId, source_id, callback) => {
	await NodesFlowsModel.prototype.getNodesFlowPerSource(source_id, async (error, listNodeFlow)=>{
		let lengthListFlow= listNodeFlow.length;
		if(lengthListFlow > 0){
			let treeNode= await getTreeNodeFlow(listNodeFlow);
			if(Object.keys(treeNode).length > 0){
				await ProcessTreeNode(input, inputId, treeNode, async (errorPT, responsePT)=>{
					if(!errorPT){
						callback(null, responsePT)
						return true;
					}else{
						callback(errorPT, {})
						return false;
					}
				},lengthListFlow);
			}else{
				callback(null, false)
				return true;
			}
		}else{
			callback(null, true)
			return true;
		}		
	})
}
/** Metodos Procesamiento de arbol de accion */
/**
 * Metodo de inicio procesamiento arbol de accion
 * @param {*} input
 * @param {*} treeNode 
 * @param {*} callback 
 */
var countFlow={},$GLOBAL={};
const ProcessTreeNode= async (input, inputId, treeNode, callback, lengthListFlow) => {
	countFlow['input_'+inputId]=0;
	for (var tree in treeNode){
		await ProcessActionNode(treeNode[tree], input,  inputId, {}, callback, lengthListFlow);
	}
	return true;
}

const ProcessActionNode= async (node,input, inputId,responseAnt,callback,lengthListFlow)=>{
	await getActionNode(node.id, async (error, resAction)=>{
		if(!error && typeof resAction == 'object' && resAction.length > 0){
			for (let index = 0; index < resAction.length; index++) {
				await ProcessActionPerType(resAction[index], input, inputId, responseAnt, async (errorAct, responseAct)=>{
					if(!errorAct){
						if(node.children != undefined){
							for (var treeC in node.children){
								await ProcessActionNode(node.children[treeC],input,inputId,responseAct, callback,lengthListFlow);
							}
						}
						listenerTree(inputId,lengthListFlow, callback, responseAct);
					}else{
						listenerTree(inputId,lengthListFlow, callback, errorAct);
					}
				});		
			}
		}else{
			listenerTree(inputId,lengthListFlow, callback, error);
		}
	});
}

const ProcessActionPerType= async (action, input, inputId, responsePrev, callback)=>{
	let returnEmpty= false;
	if(action.scriptActionPrev){
		eval(`${action.scriptActionPrev}`);
	}
	if(returnEmpty === true){callback(null, []); return false;}

	switch (action.action_type) {
		case 'action_type_emails':
			await ProcessActionTypeEmail(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_process_data':
			await ProcessActionTypeProcessData(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_http_request':
			await ProcessActionTypeHTTPRequest(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_database_rds':
			await ProcessActionTypeDatabaseRDS(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_jwt':
			await ProcessActionTypeJWT(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_md5':
			await ProcessActionTypeMD5(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		case 'action_type_ssh2':
			await ProcessActionTypeSSH2(action, input, inputId, responsePrev, (error, response)=>{
				if(!error){
					callback(null, response)
					return true;
				}else{
					callback(null, []);
					return false;
				}
			})
			break;
		default:
			callback(null, [])
			break;
	}
}

const ProcessActionTypeEmail= async (action, input, inputId, responsePrev, callback)=>{
	await ActionsTypeEmailsModel.getActionEmail(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessEmail(response[index], input, inputId, responsePrev, (errorEmail, responseNow)=>{
					if(!errorEmail){
						console.log('response Email',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeDatabaseRDS= async (action, input, inputId, responsePrev, callback)=>{
	await ActionsTypeDatabaseRDSModel.getActionDatabaseRDS(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessDatabaseRDS(response[index], input, inputId, responsePrev, (errorRDS, responseNow)=>{
					if(!errorRDS){
						console.log('response database',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeJWT= async (action, input, inputId, responsePrev, callback)=>{
	await ActionsTypeJWTModel.getActionJWT(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessJWTAction(response[index], input, inputId, responsePrev, (errorData, responseNow)=>{
					if(!errorData){
						console.log('response Process Data',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeMD5= async (action, input, inputId, responsePrev, callback)=>{
	await ActionsTypeMD5Model.getActionMD5(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessMD5Action(response[index], input, inputId, responsePrev, (errorData, responseNow)=>{
					if(!errorData){
						console.log('response Process MD5',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeSSH2= async (action, input, inputId, responsePrev, callback)=>{
	await ActionsTypeSftpModel.getActionSFTP(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessSSH2Action(response[index], input, inputId, responsePrev, (errorData, responseNow)=>{
					if(!errorData){
						console.log('response Process SSH2',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeProcessData= async (action, input, inputId, responsePrev, callback)=>{
	await ActionTypeProcessDataModel.getActionProcessData(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessDataAction(response[index], input, inputId, responsePrev, (errorData, responseNow)=>{
					if(!errorData){
						console.log('response Process Data',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
			return true;
		}
	})
}

const ProcessActionTypeHTTPRequest= async (action, input, inputId, responsePrev, callback)=>{
	await ActionTypeHttpRequestModel.getActionHttpRequest(action.id, async (error, response)=>{
		if(!error){
			for (let index = 0; index < response.length; index++) {
				await ProcessHttpRequest(response[index], input, inputId, responsePrev, (errorHttp, responseNow)=>{
					if(!errorHttp){
						console.log('response Http',responseNow);
					}
					if(action.scriptActionPost){
						eval(`${action.scriptActionPost}`);
					}
					if(response.length == (parseInt(index)+1)){
						$GLOBAL[action.name]= responseNow;
						callback(null, responseNow);
						return true;
					}
				})
			}
		}else{
			callback(null, []);
		}
	})
}

const ProcessHttpRequest= async (httpProcess, input, inputId, responsePrev, callback)=>{
	var requestOptions = {
		url: httpProcess.url,
		method: httpProcess.method.toUpperCase(),
		responseType: 'json'
	};
	let bodyHttp= {};
	eval(`bodyHttp=${httpProcess.body}`)
	switch (httpProcess.method.toUpperCase()) {
		case 'GET':
				requestOptions.params= bodyHttp;
			break;
	
		default:
				requestOptions.data= bodyHttp;
			break;
	}

	let myHeaders = {};
	if(httpProcess.headers && typeof httpProcess.headers == 'object'){
		for (let index = 0; index < httpProcess.headers.length; index++) {
			myHeaders[httpProcess.headers[index].key]= httpProcess.headers[index].value;					
		}
	}				
	requestOptions.headers= myHeaders;
	if(!Array.isArray(responsePrev) && typeof responsePrev == 'object'){
		for (var resPrev in responsePrev){
			if(typeof resPrev == 'string' && resPrev != 0){
				requestOptions.url= requestOptions.url.replace(new RegExp('{responsePrev.'+resPrev+'}', 'g'), encodeURIComponent(responsePrev[resPrev]));
			}
		}
	}
	for (var inp in input){
		requestOptions.url= requestOptions.url.replace(new RegExp('{input.'+inp+'}', 'g'), encodeURIComponent(input[inp]));
	}
	await axios(requestOptions)
	.then(async (result) => {
		HistoryFlowModel.insert({
			response: typeof result.data === 'object' ? JSON.stringify(result.data) : result.data,
			request: typeof requestOptions === 'object' ? JSON.stringify(requestOptions) : requestOptions,
			actions_id: httpProcess.actions_id,
			inputs_updates_id:  inputId
		}, (errorIn,resIn)=>{});
		callback(null,result.data); 
		return true;
	})
	.catch(async (error) => {console.log('error HTTP',error);
		HistoryFlowModel.insert({
			error: typeof error === 'object' ? JSON.stringify(error) : error,
			request: typeof requestOptions === 'object' ? JSON.stringify(requestOptions) : requestOptions,
			actions_id: httpProcess.actions_id,
			inputs_updates_id:  inputId
		}, (errorIn,resIn)=>{});
		callback(error,{}); 
		return false; 
	});
}

const ProcessDataAction= async (action, input, inputId, responsePrev, callback)=>{
	let returnAction={};
	eval(`${action.functionProcessData}`);

	HistoryFlowModel.insert({
		response: typeof returnAction === 'object' ? JSON.stringify(returnAction) : returnAction,
		request: typeof responsePrev === 'object' ? JSON.stringify(responsePrev) : responsePrev,
		actions_id: action.actions_id,
		inputs_updates_id:  inputId
	}, (errorIn,resIn)=>{});

	callback(null, returnAction);
}

const ProcessJWTAction= async (action, input, inputId, responsePrev, callback)=>{
	if(action.type=='sign'){
		ActionsTypeJWTModel.singJWT(action, input, responsePrev, (err, res)=>{
			HistoryFlowModel.insert({
				response: JSON.stringify({token:res}),
				request: action.objectEncrypt,
				actions_id: action.actions_id,
				inputs_updates_id:  inputId
			}, (errorIn,resIn)=>{});
			callback(null,{token:res});
			return;
		});
	}else if(action.type=='verify'){
		ActionsTypeJWTModel.verifyJWT(action, input, responsePrev,(err, res)=>{
			HistoryFlowModel.insert({
				response: JSON.stringify({decoded:res}),
				request: action.objectEncrypt,
				actions_id: action.actions_id,
				inputs_updates_id:  inputId
			}, (errorIn,resIn)=>{});
			callback(null,{decoded:res});
			return;
		});
	}else{
		callback(null, {token:"error"});
		return;
	}
}

const ProcessMD5Action= async (action, input, inputId, responsePrev, callback)=>{
	let returnMD5={};
	let valueMD5= "";
	eval(`valueMD5=${action.value}`)

	returnMD5.encrypt= md5(action.secret+valueMD5);
	HistoryFlowModel.insert({
		response: typeof returnMD5 === 'object' ? JSON.stringify(returnMD5) : returnMD5,
		request: typeof responsePrev === 'object' ? JSON.stringify(responsePrev) : responsePrev,
		actions_id: action.actions_id,
		inputs_updates_id:  inputId
	}, (errorIn,resIn)=>{});

	callback(null, returnMD5);
}

const ProcessSSH2Action= async (action, input, inputId, responsePrev, callback)=>{
	let actionType="";
	let objectConfig= {};
	let objectAction= {};
	eval(`objectConfig=${action.objectConfig}`);
	eval(`objectAction=${action.objectAction}`);
	actionType= action.actionType;

	if(typeof objectConfig == 'object' && typeof objectAction == 'object' && Object.keys(objectConfig).length > 0 && Object.keys(objectAction).length > 0 && actionType != ''){
		conectionSFTP(objectConfig).startAction(actionType, objectAction, (err, res)=>{
			HistoryFlowModel.insert({
				response: JSON.stringify({decoded:res}),
				request: action.objectEncrypt,
				actions_id: action.actions_id,
				inputs_updates_id:  inputId
			}, (errorIn,resIn)=>{});
			callback(null,res);
			return;
		});
	}
}

const ProcessEmail= async (emailProcess, input, inputId, responsePrev, callback) => {
	let settingsEmail= {
		mail_host: emailProcess.MAIL_HOST,
		mail_port: emailProcess.MAIL_PORT,
		mail_username: emailProcess.MAIL_USERNAME,
		mail_password: emailProcess.MAIL_PASSWORD,
		mail_encryption: emailProcess.MAIL_ENCRYPTION
	},
	listEmailsT=[];
	eval(`listEmailsT=${emailProcess.listEmails};`)
	if(typeof listEmailsT == 'object'){
		for (let i = 0; i < listEmailsT.length; i++) {
			emailProcess.emails.push({email:listEmailsT[i]});
		}
	}
	if(emailProcess.emails.length > 0){
		let listEmails= [];
		for (let index = 0; index < emailProcess.emails.length; index++) {
			listEmails.push(emailProcess.emails[index].email);
		}
		let optionsEmail= {
			to: listEmails.join(','),
			subject: emailProcess.MAIL_FROM_NAME,
			html: emailProcess.template,
			from: emailProcess.MAIL_FROM_ADDRESS
		};

		if(typeof responsePrev == 'object' && !Array.isArray(responsePrev)){
			for (var resPrev in responsePrev){
				if(typeof resPrev == 'string' && resPrev != 0){
					let varReplace= typeof responsePrev[resPrev] == 'object' ? JSON.stringify(responsePrev[resPrev]) : responsePrev[resPrev];
					optionsEmail.html= optionsEmail.html.replace(new RegExp('{responsePrev.'+resPrev+'}', 'g'), varReplace);
				}
			}
		}

		if(typeof input == 'object' && !Array.isArray(input)){
			for (var inp in input){
				if(typeof inp == 'string' && inp != 0){
					let varReplace2= typeof input[inp] == 'object' ? JSON.stringify(input[inp]) : input[inp];
					optionsEmail.html= optionsEmail.html.replace(new RegExp('{input.'+inp+'}', 'g'), varReplace2);
				}
			}
		}

		await Mail.send(settingsEmail, optionsEmail, async (errorEmail, responseEmail)=>{
			if(!errorEmail){
				HistoryFlowModel.insert({
					response: typeof responseEmail === 'object' ? JSON.stringify(responseEmail) : responseEmail,
					request: typeof settingsEmail === 'object' ? JSON.stringify(settingsEmail) : settingsEmail,
					actions_id: emailProcess.actions_id,
					inputs_updates_id:  inputId
				}, (errorIn,resIn)=>{});
				callback(null, responseEmail);
			}else{
				HistoryFlowModel.insert({
					request: typeof settingsEmail === 'object' ? JSON.stringify(settingsEmail) : settingsEmail,
					actions_id: emailProcess.actions_id,
					error: typeof errorEmail === 'object' ? JSON.stringify(errorEmail) : errorEmail,
					inputs_updates_id:  inputId
				}, (errorIn,resIn)=>{});
				callback(errorEmail, [])
			}
		});
	}else{
		callback(null, []);
	}
}

const ProcessDatabaseRDS= async (rdsProcess, input, inputId, responsePrev, callback) => {
	if(rdsProcess.DB_CONNECTION && rdsProcess.DB_CONNECTION != '' && rdsProcess.query != '' && rdsProcess.query){
		let conection= require('../Connection/'+rdsProcess.DB_CONNECTION.toLocaleLowerCase()+'/connectionDynamic');
			let valuesQueyProcess=[];

			eval(`valuesQueyProcess=${rdsProcess.valuesQuey};`);
			
			conection({
				host: rdsProcess.DB_HOST,
				port: rdsProcess.DB_PORT,
				database: rdsProcess.DB_DATABASE,
				user: rdsProcess.DB_USERNAME,
				password: rdsProcess.DB_PASSWORD,
				statement: rdsProcess.query,
    			values: valuesQueyProcess
			}, (errRDS, resRDS)=>{
				if (errRDS) {
					HistoryFlowModel.insert({
						request: typeof rdsProcess === 'object' ? JSON.stringify(rdsProcess) : rdsProcess,
						actions_id: emailProcess.actions_id,
						error: typeof errRDS === 'object' ? JSON.stringify(errRDS) : errRDS,
						inputs_updates_id:  inputId
					}, (errorIn,resIn)=>{});
					callback(null, [])
					return
				}else{
					HistoryFlowModel.insert({
						response: typeof resRDS === 'object' ? JSON.stringify(resRDS) : resRDS,
						request: typeof rdsProcess === 'object' ? JSON.stringify(rdsProcess) : rdsProcess,
						actions_id: rdsProcess.actions_id,
						inputs_updates_id:  inputId
					}, (errorIn,resIn)=>{});
					callback(null, resRDS)
					return
				}
			});		
	}else{
		callback(null, []);
	}
}

const getActionNode= async (nodeId, callback)=>{
	await ActionsModel.getActionPerNodeFlowId(nodeId, (error, response)=>{
		if(!error){
			callback(null, response);
			return true;
		}else{
			callback(null, []);
			return false;
		}
	});
}

const listenerTree= function (inputId,longitud,callback,responseAct) {
	countFlow['input_'+inputId]++;
	if(countFlow['input_'+inputId] == longitud){
		callback(null, responseAct);
	}
};
/** Fin procesamiento arbol de accion */

NodesFlowsModel.prototype.getTreeNode= async (source_id, callback) => {
	NodesFlowsModel.prototype.getNodesFlowPerSource(source_id, async (error, listNodeFlow)=>{
		let lengthListFlow= listNodeFlow.length;
		if(lengthListFlow > 0){
			let treeNode= await getTreeNodeFlow(listNodeFlow);
			if(Object.keys(treeNode).length > 0){
				callback(null, treeNode);
			}else{
				callback(null, {})
			}
		}else{
			callback(null, {})
		}		
	})
}

NodesFlowsModel.prototype.ProcesingInputsNode= async (inputs, callback) => {
	if(typeof inputs == 'object'){
		for (let index = 0; index < inputs.length; index++) {
			InputsUpdatesModel.update(inputs[index].id, {processStatus:'processing'}, (errorIn,resIn)=>{});
			await processInputNodeFlowForSource(inputs[index].input, inputs[index].id, inputs[index].source_id, async (error, response)=>{
				if(!error){
					InputsUpdatesModel.update(inputs[index].id, {processStatus:'processed'}, (errorIn,resIn)=>{})
				}else{
					InputsUpdatesModel.update(inputs[index].id, {processStatus:'invalid'}, (errorIn,resIn)=>{})
				}
				if((parseInt(inputs.length)-1) === index ){
					callback(null, response)
					return true;
				}
			})
		}
		if(inputs.length === 0){
			callback(null, [])
		}
	}else{
		callback('Error inputs!', null)
	}	
}

module.exports = new NodesFlowsModel()