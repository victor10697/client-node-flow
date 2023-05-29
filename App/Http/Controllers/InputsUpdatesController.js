const InputsUpdatesModel = require('../../Models/InputsUpdatesModel');
const NodesFlowsModel = require('../../Models/NodesFlowsModel');
const SourcesModel = require('../../Models/SourcesModel');

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insert = (req, res) => {
    if (req.body && Object.keys(req.body).length > 0) {
        if (req.headers['x-app-key'] && req.headers['x-app-token']) {
            // validamos credenciales de conexion
            SourcesModel.validSource(req.headers['x-app-key'], req.headers['x-app-token'], (error, validSourceT) => {
                if (!error && validSourceT.state && validSourceT.state == 'success') {
                    InputsUpdatesModel.saveInput(req.body, validSourceT.source_id, (error, response) => {
                        if (!error) {
                            NodesFlowsModel.ProcesingInputsNode([{
                                id: response.id,
                                input: JSON.parse(response.bodyRequest),
                                source_id: response.source_id
                            }], (errorA, responseA, code=200) => {
                                InputsUpdatesModel.delete(response.id, (eRi, rRi) => { console.log('eRi', eRi); });
                                if (!errorA) {
                                    if(code > 399){
                                        responseA= { 'state': 'error', 'error': responseA };
                                        res.status(code).json(responseA)
                                    }else{
                                        res.status(code).json({ 'state': 'success', 'result': responseA })
                                    }
                                } else {
                                    res.status(code).json({ 'state': 'error', 'result': errorA })
                                }
                            });
                        } else {
                            res.status(400).json({ 'state': 'error', 'result': error })
                        }
                    });
                } else {
                    res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
                }
            })
        } else {
            res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
        }
    } else {
        res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
    }
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insertSourceName = (req, res) => {
    if (req.body && Object.keys(req.body).length > 0 && req.params.sourceName) {
        if (req.headers['x-app-key'] && req.headers['x-app-token']) {
            // validamos credenciales de conexion
            SourcesModel.validSource(req.headers['x-app-key'], req.headers['x-app-token'], (error, validSourceT) => {
                if (!error && validSourceT.state && validSourceT.state == 'success' && validSourceT.name && typeof validSourceT.name == 'string' && validSourceT.name.toLocaleLowerCase() == req.params.sourceName.toLocaleLowerCase()) {
                    InputsUpdatesModel.saveInput(req.body, validSourceT.source_id, (error, response) => {
                        if (!error) {
                            NodesFlowsModel.ProcesingInputsNode([{
                                id: response.id,
                                input: JSON.parse(response.bodyRequest),
                                source_id: response.source_id
                            }], (errorA, responseA, code=200) => {
                                InputsUpdatesModel.delete(response.id, (eRi, rRi) => { console.log('eRi', eRi); });
                                if (!errorA) {
                                    if(code > 399){
                                        responseA= { 'state': 'error', 'error': responseA };
                                        res.status(code).json(responseA)
                                    }else{
                                        res.status(code).json({ 'state': 'success', 'result': responseA })
                                    }
                                } else {
                                    res.status(code).json({ 'state': 'error', 'result': errorA })
                                }
                            });
                        } else {
                            res.status(400).json({ 'state': 'error', 'result': error })
                        }
                    });
                } else {
                    res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
                }
            })
        } else {
            res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
        }
    } else {
        res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
    }
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insertInternal = (bodyR, res) => {
    if (bodyR && Object.keys(bodyR).length > 0 && bodyR.source_id) {
        InputsUpdatesModel.saveInput(bodyR, bodyR.source_id, (error, response) => {
            if (!error) {
                NodesFlowsModel.ProcesingInputsNode([{
                    id: response.id,
                    input: JSON.parse(response.bodyRequest),
                    source_id: response.source_id
                }], (errorA, responseA, code=200) => {
                    InputsUpdatesModel.delete(response.id, (eRi, rRi) => { console.log('eRi', eRi); });
                    if (!errorA) {
                        res(null, responseA,code)
                    } else {
                        res('error', null,code)
                    }
                });
            } else {
                res('error', null, 403)
            }
        });
    } else {
        res('error', null, 403)
    }
}