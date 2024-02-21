const ActionsModel = require('../../Models/ActionsModel')
const ActionsTypesModel = require('../../Models/ActionsTypesModel')
const ActionsTypeEmailsModel = require('../../Models/ActionsTypeEmailsModel')
const ActionTypeHttpRequestModel = require('../../Models/ActionTypeHttpRequestModel')
const HeadersModel = require('../../Models/HeadersModel')
const ActionTypeProcessDataModel = require('../../Models/ActionTypeProcessDataModel')
const EmailsModel= require('../../Models/EmailsModel')
const ActionsTypeDatabaseRDSModel= require('../../Models/ActionsTypeDatabaseRDSModel')
const ActionsTypeJWTModel= require('../../Models/ActionsTypeJWTModel')
const ActionsTypeMD5Model= require('../../Models/ActionsTypeMD5Model')
const ActionsTypeSftpModel= require('../../Models/ActionsTypeSftpModel')
 
/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res, prconexion=null) => {
    if (typeof prconexion != 'undefined' && prconexion) { ActionsModel?.setConnection(prconexion);}
    ActionsModel.select((error, response)=>{
        if(!error){
            if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify({ 'state': 'success', 'list': response })
                })
            }else{
                res.status(200).json({ 'state': 'success', 'list': response })
            }
        }else{
            if(typeof res == 'function'){
                res({
                    statusCode: 500,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error list sources!' })
                })
            }else{
                res.status(500).json({ 'state': 'error', 'message': 'error list sources!' })
            }
        }
    });
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insert = (req, res) => {
	
}

/**
 * Metodo para salvar un objeto
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.save = (req, res) => {
	
}

/**
 * Metodo para eliminar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.delete = (req, res, prconexion=null) => {
	
    if(req?.params && req?.params?.id){
        if (typeof prconexion != 'undefined' && prconexion) { ActionsModel?.setConnection(prconexion);}
        ActionsModel.remove(req.params.id, (error, response)=>{
            if(!error){
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                }
            }else{
                if(typeof res == 'function'){
                    res({
                        statusCode: 500,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
                    })
                }else{
                    res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
                }
            }
        });
    }else{
        if(typeof res == 'function'){
            res({
                statusCode: 500,
                body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
            })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
        }
    }
}

/**
 * 
 * @param {*} param0 
 * @param {*} callback 
 */
const SaveAction= ({name=null, scriptActionPrev=null, scriptActionPost=null, action_type_id=null, nodes_flows_id=null}, callback, prconexion=null)=>{
    if(name && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { ActionsModel?.setConnection(prconexion);}
        ActionsModel.createOrUpdate({name:name, scriptActionPost:scriptActionPost, scriptActionPrev:scriptActionPrev, action_type_id:action_type_id, nodes_flows_id:nodes_flows_id}, {nodes_flows_id:true}, (error, response)=>{
            if(!error){
                callback(null, response);
            }else{
                callback(error, null)
            }
        });
    }else{
        callback(error, null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
const saveTypeHttpRequestAction= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionTypeHttpRequestModel?.setConnection(prconexion);
            HeadersModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionTypeHttpRequestModel.createOrUpdate({
                    actions_id: resultA.id, 
                    url: data.url, 
                    method: data.method,
                    body: typeof data.body == 'object' && Object.keys(data.body).length > 0 ? JSON.stringify(data.body) : data.body
                }, {actions_id:true }, (errorATHTTP,reponseATHTTP) => {
                    if(!errorATHTTP){
                        resultA.action_type_http_request= reponseATHTTP;
                        let lengthHeaders= Object.keys(data.headers).length, countHeader=0;
                        if(lengthHeaders > 0){
                            for (const header in data.headers) {
                                HeadersModel.createOrUpdate({
                                    key:header, 
                                    value:data.headers[header], 
                                    action_type_http_request_id:reponseATHTTP.id
                                },{key:true, action_type_http_request_id:true}, (errorHeader, responseHeader)=>{
                                    countHeader++;
                                    if(errorHeader){
                                        console.log('error register header', errorHeader);
                                    }
                                    
                                    if(countHeader == lengthHeaders){
                                        callback(null, resultA)
                                    }
                                })
                            }
                        }else{
                            callback(null, resultA)
                        }
                    }else{
                        callback(errorATHTTP, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
const saveTypeProcessData= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){ 
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionTypeProcessDataModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionTypeProcessDataModel.createOrUpdate({
                    actions_id: resultA.id, 
                    name: data.nameFuction,
                    functionProcessData: data.functionProcessData
                }, {actions_id:true }, (errorAPData,reponseAPData) => {
                    if(!errorAPData){
                        resultA.action_type_process_data= reponseAPData;   
                        callback(null, resultA)
                    }else{
                        callback(errorAPData, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
const saveTypeEmails= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypeEmailsModel?.setConnection(prconexion);
            EmailsModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionsTypeEmailsModel.createOrUpdate({
                    actions_id: resultA.id, 
                    template: data.template, 
                    name: data.nameTypeEmail,
                    subject: data.subject ? data.subject : '',
                    listEmails: data.listEmails ? data.listEmails : '',
                    MAIL_HOST: data.MAIL_HOST ? data.MAIL_HOST : '',
                    MAIL_PORT: typeof data.MAIL_PORT == 'string' ? 0 : data.MAIL_PORT,
                    MAIL_USERNAME: data.MAIL_USERNAME ? data.MAIL_USERNAME : '',
                    MAIL_PASSWORD: data.MAIL_PASSWORD ? data.MAIL_PASSWORD : '',
                    MAIL_ENCRYPTION: data.MAIL_ENCRYPTION ? data.MAIL_ENCRYPTION : '',
                    MAIL_FROM_NAME: data.MAIL_FROM_NAME ? data.MAIL_FROM_NAME : '',
                    MAIL_MAILER: data.MAIL_MAILER ? data.MAIL_MAILER : '',
                    MAIL_FROM_ADDRESS: data.MAIL_FROM_ADDRESS ? data.MAIL_FROM_ADDRESS : ''
                }, {actions_id:true }, (errorAEMAIL,reponseAEMAIL) => {
                    if(!errorAEMAIL){
                        resultA.action_type_emails= reponseAEMAIL;
                        let lengthEmails= data.emails.length, countEmail=0;
                        if(lengthEmails > 0){
                            for (let index = 0; index < data.emails.length; index++) {
                                EmailsModel.createOrUpdate({
                                    email: data.emails[index],  
                                    action_type_emails_id:reponseAEMAIL.id
                                },{email:true, action_type_emails_id:true}, (errorEmail, responseEmail)=>{
                                    countEmail++;
                                    if(errorEmail){
                                        console.log('error register header', errorEmail);
                                    }
                                    
                                    if(countEmail == lengthEmails){
                                        callback(null, resultA)
                                    }
                                })
                            }
                        }else{
                            callback(null, resultA)
                        }
                    }else{console.log('errorAEMAIL', errorAEMAIL);
                        callback(errorAEMAIL, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
 const saveTypeDatabaseRDS= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypeDatabaseRDSModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionsTypeDatabaseRDSModel.createOrUpdate({
                    actions_id: resultA.id, 
                    query: data.query, 
                    valuesQuey: data.valuesQuey,
                    DB_CONNECTION: data.DB_CONNECTION ? data.DB_CONNECTION : 'mysql',
                    DB_HOST: data.DB_HOST ? data.DB_HOST : '127.0.0.1',
                    DB_PORT: typeof data.DB_PORT == 'string' ? 3306 : data.DB_PORT,
                    DB_DATABASE: data.DB_DATABASE ? data.DB_DATABASE : '',
                    DB_USERNAME: data.DB_USERNAME ? data.DB_USERNAME : '',
                    DB_PASSWORD: data.DB_PASSWORD ? data.DB_PASSWORD : ''
                }, {actions_id:true }, (errorRDS,reponseRDS) => {
                    if(!errorRDS){
                        callback(null, reponseRDS)
                    }else{
                        callback(errorRDS, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
 const saveTypeJWT= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypeJWTModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionsTypeJWTModel.createOrUpdate({
                    actions_id: resultA.id, 
                    secret: data.secret, 
                    objectEncrypt: data.objectEncrypt,
                    objectSettings: data.objectSettings,
                    type: data.type
                }, {actions_id:true}, (errorJWT,reponseJWT) => {
                    if(!errorJWT){
                        callback(null, reponseJWT)
                    }else{
                        callback(errorJWT, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
 const saveTypeMD5= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypeMD5Model?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionsTypeMD5Model.createOrUpdate({
                    actions_id: resultA.id, 
                    secret: data.secret, 
                    value: data.value
                }, {actions_id:true}, (errorMD5,reponseMD5) => {
                    if(!errorMD5){
                        callback(null, reponseMD5)
                    }else{
                        callback(errorMD5, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * 
 * @param {*} data 
 * @param {*} action_type_id 
 * @param {*} callback 
 */
 const saveTypeSSH2= (data, action_type_id, callback, prconexion=null)=>{
    if(data && action_type_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypeSftpModel?.setConnection(prconexion);
        }
        SaveAction({name:data.name, scriptActionPost:data.scriptActionPost, scriptActionPrev:data.scriptActionPrev, nodes_flows_id:data.nodes_flows_id, action_type_id: action_type_id}, (errorA, resultA)=>{
            if(!errorA){
                ActionsTypeSftpModel.createOrUpdate({
                    actions_id: resultA.id, 
                    actionType: data.actionType.trim(),
                    objectConfig: data.objectConfig, 
                    objectAction: data.objectAction
                }, {actions_id:true}, (errorMD5,reponseMD5) => {
                    if(!errorMD5){
                        callback(null, reponseMD5)
                    }else{
                        callback(errorMD5, null)
                    }
                })
            }else{
                callback(errorA, null)
            }
        })
    }else{
        callback('error register!', null)
    }
}

/**
 * Metodo para creacion una accion con todos sus parametro dependiendo el tipo de accion
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.createAction = (nodeFlowId,dataAction, res, prconexion=null) => {
    if(dataAction && dataAction.action_type && dataAction.name && typeof dataAction == 'object' && Object.keys(dataAction).length > 0){
        dataAction.nodes_flows_id=nodeFlowId;
        if (typeof prconexion != 'undefined' && prconexion) { 
            ActionsTypesModel?.setConnection(prconexion);
        }
        ActionsTypesModel.validTypeAction(dataAction.action_type, (error, response)=>{
            if(!error && response.state && response.state == 'success'){
                    switch (response.action.name) {
                        case 'action_type_http_request':
                            if(dataAction.url && dataAction.method){
                                saveTypeHttpRequestAction(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_process_data':
                            if(dataAction.functionProcessData && dataAction.nameFuction){
                                saveTypeProcessData(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_emails':
                            if(dataAction.nameTypeEmail && dataAction.template){
                                saveTypeEmails(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_database_rds':
                            if(dataAction.query){
                                saveTypeDatabaseRDS(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_jwt':
                            if(dataAction){
                                saveTypeJWT(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_md5':
                            if(dataAction){
                                saveTypeMD5(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        case 'action_type_ssh2':
                            if(dataAction){
                                saveTypeSSH2(dataAction, response.action.id, (errorAction, responseAction)=>{
                                    if(!errorAction){
                                        console.log('Register action success');
                                    }else{
                                        console.log('Register action error');
                                    }
                                },prconexion)
                            }else{
                                console.log('Register action error'); 
                            }
                            break;
                        default:
                            console.log('Register action error');
                            break;
                    }
            }else{
                console.log('Register action error');
            }
        });
        
    }else{
        console.log('Register action error');
    }
}


exports.setApiKey = (key) => {
    if(key){
        ActionsModel.setApiKey(key);
        ActionsTypesModel.setApiKey(key);
        ActionsTypeEmailsModel.setApiKey(key);
        ActionTypeHttpRequestModel.setApiKey(key);
        HeadersModel.setApiKey(key);
        ActionTypeProcessDataModel.setApiKey(key);
        EmailsModel.setApiKey(key);
        ActionsTypeDatabaseRDSModel.setApiKey(key);    
        ActionsTypeJWTModel.setApiKey(key);
        ActionsTypeMD5Model.setApiKey(key);
        ActionsTypeSftpModel.setApiKey(key);
    }
}

exports.setApiToken = (token) => {
    if(token){
        ActionsModel.setApiToken(token);
        ActionsTypesModel.setApiToken(token);
        ActionsTypeEmailsModel.setApiToken(token);
        ActionTypeHttpRequestModel.setApiToken(token);
        HeadersModel.setApiToken(token);
        ActionTypeProcessDataModel.setApiToken(token);
        EmailsModel.setApiToken(token);
        ActionsTypeDatabaseRDSModel.setApiToken(token);
        ActionsTypeJWTModel.setApiToken(token);
        ActionsTypeMD5Model.setApiToken(token);
        ActionsTypeSftpModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        ActionsModel.setUrl(url);
        ActionsTypesModel.setUrl(url);
        ActionsTypeEmailsModel.setUrl(url);
        ActionTypeHttpRequestModel.setUrl(url);
        HeadersModel.setUrl(url);
        ActionTypeProcessDataModel.setUrl(url);
        EmailsModel.setUrl(url);
        ActionsTypeDatabaseRDSModel.setUrl(url);
        ActionsTypeJWTModel.setUrl(url);
        ActionsTypeMD5Model.setUrl(url);
        ActionsTypeSftpModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    ActionsModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = ActionsModel.createConnection;