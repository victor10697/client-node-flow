const InputsUpdatesModel = require('../../Models/InputsUpdatesModel');
const NodesFlowsModel = require('../../Models/NodesFlowsModel');
const SourcesModel = require('../../Models/SourcesModel');
const SettingsModel = require('../../Models/SettingsModel');

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insert = (req, res, prconexion=null) => {
    const idInput= req?.body?.id ? req?.body?.id : null;
    if (typeof prconexion != 'undefined' && prconexion) { 
        SourcesModel?.setConnection(prconexion);
        InputsUpdatesModel?.setConnection(prconexion);
        NodesFlowsModel?.setConnection(prconexion);
        SettingsModel?.setConnection(prconexion);
    }
    if (req?.body && Object.keys(req?.body).length > 0) {
        if (req?.headers['x-app-key'] && req?.headers['x-app-token']) {
            // validamos credenciales de conexion
            SourcesModel.validSource(req.headers['x-app-key'], req.headers['x-app-token'], (error, validSourceT) => {
                if (!error && validSourceT.state && validSourceT.state == 'success' && validSourceT.source_name && typeof validSourceT.source_name == 'string') {
                    InputsUpdatesModel.saveInput(req.body, validSourceT.source_id, (error, response) => {
                        if (!error) {
                            NodesFlowsModel.ProcesingInputsNode([{
                                id: response.id,
                                input: JSON.parse(response.bodyRequest),
                                source_id: response.source_id
                            }], (errorA, responseA, code=200) => {
                                // Save log 
                                SettingsModel.saveLog(errorA, responseA, idInput);
                                InputsUpdatesModel.delete(response.id, (eRi, rRi) => { console.log('eRi', eRi); 
                                    if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                                    if (!errorA) {
                                        if(code > 399){
                                            responseA= { 'state': 'error', 'message': responseA };
                                            if(typeof res == 'function'){
                                                res({
                                                    statusCode: code,
                                                    body: JSON.stringify(responseA)
                                                })
                                            }else{
                                                res.status(code).json(responseA)
                                            }
                                        }else{
                                            if(typeof res == 'function'){
                                                res({
                                                    statusCode: code,
                                                    body: JSON.stringify(responseA)
                                                })
                                            }else{
                                                res.status(code).json({ 'state': 'success', 'result': responseA })
                                            }
                                        }
                                    } else {
                                        if(typeof res == 'function'){
                                            res({
                                                statusCode: code,
                                                body: JSON.stringify({ 'state': 'error', 'result': errorA })
                                            })
                                        }else{
                                            res.status(code).json({ 'state': 'error', 'result': errorA })
                                        }
                                    }
                                });
                            });
                        } else {
                            // Save log 
                            SettingsModel.saveLog(error, null, idInput);
                            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                            if(typeof res == 'function'){
                                res({
                                    statusCode: 400,
                                    body: JSON.stringify({ 'state': 'error', 'result': error })
                                })
                            }else{
                                res.status(400).json({ 'state': 'error', 'result': error })
                            }
                        }
                    });
                } else {
                    SettingsModel.saveLog('Unauthorized access!', null, idInput);
                    if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                    if(typeof res == 'function'){
                        res({
                            statusCode: 401,
                            body: JSON.stringify({ 'state': 'error', 'message': 'Unauthorized access!' })
                        })
                    }else{
                        res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
                    }
                }
            })
        } else {
            SettingsModel.saveLog('Unauthorized access!', null, idInput);
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
            if(typeof res == 'function'){
                res({
                    statusCode: 401,
                    body: JSON.stringify({ 'state': 'error', 'message': 'Unauthorized access!' })
                })
            }else{
                res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
            }
        }
    } else {
        SettingsModel.saveLog('Unauthorized access!', null, idInput);
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'Content cannot be empty' })
            })
        }else{
            res.status(400).json({ 'state': 'error', 'message': 'Content cannot be empty' })
        }
    }
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insertSourceName = (req, res, prconexion=null) => {
    const idInput= req?.body?.id ? req?.body?.id : null;
    if (typeof prconexion != 'undefined' && prconexion) { 
        SourcesModel?.setConnection(prconexion);
        InputsUpdatesModel?.setConnection(prconexion);
        NodesFlowsModel?.setConnection(prconexion);
        SettingsModel?.setConnection(prconexion);
    }
    if (req?.body && Object.keys(req?.body).length > 0 && req?.params?.sourceName) {
        if (req?.headers['x-app-key'] && req?.headers['x-app-token']) {
            // validamos credenciales de conexion
            SourcesModel.validSource(req.headers['x-app-key'], req.headers['x-app-token'], (error, validSourceT) => {
                if (!error && validSourceT.state && validSourceT.state == 'success' && validSourceT.source_name && typeof validSourceT.source_name == 'string' && validSourceT.source_name.toLocaleLowerCase() == req.params.sourceName.toLocaleLowerCase()) {
                    InputsUpdatesModel.saveInput(req.body, validSourceT.source_id, (error, response) => {
                        if (!error) {
                            NodesFlowsModel.ProcesingInputsNode([{
                                id: response.id,
                                input: JSON.parse(response.bodyRequest),
                                source_id: response.source_id
                            }], (errorA, responseA, code=200) => {
                                SettingsModel.saveLog(errorA, responseA, idInput);
                                InputsUpdatesModel.delete(response.id, (eRi, rRi) => { 
                                    console.log('eRi', eRi); 
                                    if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                                    if (!errorA) {
                                        if(code > 399){
                                            responseA= { 'state': 'error', 'message': responseA };
                                            if(typeof res == 'function'){
                                                res({
                                                    statusCode: code,
                                                    body: JSON.stringify(responseA)
                                                })
                                            }else{
                                                res.status(code).json(responseA)
                                            }
                                        }else{
                                            if(typeof res == 'function'){
                                                res({
                                                    statusCode: code,
                                                    body: JSON.stringify(responseA)
                                                })
                                            }else{
                                                res.status(code).json({ 'state': 'success', 'result': responseA })
                                            }
                                        }
                                    } else {
                                        if(typeof res == 'function'){
                                            res({
                                                statusCode: code,
                                                body: JSON.stringify({ 'state': 'error', 'result': errorA })
                                            })
                                        }else{
                                            res.status(code).json({ 'state': 'error', 'result': errorA })
                                        }
                                    }
                                });
                            });
                        } else {
                            SettingsModel.saveLog(error, null, idInput);
                            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                            if(typeof res == 'function'){
                                res({
                                    statusCode: 400,
                                    body: JSON.stringify({ 'state': 'error', 'result': error })
                                })
                            }else{
                                res.status(400).json({ 'state': 'error', 'result': error })
                            }
                        }
                    });
                } else {
                    SettingsModel.saveLog('Unauthorized access!', null, idInput);
                    if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
                    if(typeof res == 'function'){
                        res({
                            statusCode: 401,
                            body: JSON.stringify({ 'state': 'error', 'message': 'Unauthorized access!' })
                        })
                    }else{
                        res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
                    }
                }
            })
        } else {
            SettingsModel.saveLog('Unauthorized access!', null, idInput);
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
            if(typeof res == 'function'){
                res({
                    statusCode: 401,
                    body: JSON.stringify({ 'state': 'error', 'message': 'Unauthorized access!' })
                })
            }else{
                res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
            }
        }
    } else {
        SettingsModel.saveLog('Unauthorized access!', null, idInput);
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END === 'on'){console.info('close connection created!'); prconexion.end();}
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'Content cannot be empty' })
            })
        }else{
            res.status(400).json({ 'state': 'error', 'message': 'Content cannot be empty' })
        }
    }
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insertInternal = (bodyR, res, prconexion=null) => {
    if (bodyR && Object.keys(bodyR).length > 0 && bodyR.source_id) {
        if (typeof prconexion != 'undefined' && prconexion) { 
            InputsUpdatesModel?.setConnection(prconexion);
            NodesFlowsModel?.setConnection(prconexion);
        }
        InputsUpdatesModel.saveInput(bodyR, bodyR.source_id, (error, response) => {
            if (!error) {
                NodesFlowsModel.ProcesingInputsNode([{
                    id: response.id,
                    input: JSON.parse(response.bodyRequest),
                    source_id: response.source_id
                }], (errorA, responseA, code=200) => {
                    InputsUpdatesModel.delete(response.id, (eRi, rRi) => { 
                        console.log('eRi', eRi);
                        if (!errorA) {
                            res(null, responseA,code)
                        } else {
                            res('error', null,code)
                        } 
                    });
                });
            } else {
                res('error', null, 403)
            }
        });
    } else {
        res('error', null, 403)
    }
}

exports.setApiKey = (key) => {
    if(key){
        InputsUpdatesModel.setApiKey(key);
        NodesFlowsModel.setApiKey(key); 
        SourcesModel.setApiKey(key);
    }
}

exports.setApiToken = (token) => {
    if(token){
        InputsUpdatesModel.setApiToken(token);
        NodesFlowsModel.setApiToken(token);
        SourcesModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        InputsUpdatesModel.setUrl(url);
        NodesFlowsModel.setUrl(url);
        SourcesModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    InputsUpdatesModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = InputsUpdatesModel.createConnection;