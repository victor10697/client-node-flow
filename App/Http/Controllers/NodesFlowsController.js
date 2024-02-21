const NodesFlowsModel = require('../../Models/NodesFlowsModel')
const SourcesModel = require('../../Models/SourcesModel')
const ActionsController = require('./ActionsController')

/**
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.create = (req, res, prconexion) => {
    if (req?.body && Object.keys(req?.body).length > 0) {
        if (req?.body?.name && req?.body?.label && req?.body?.sourceName && req?.body?.sourceName != '') {
            if (typeof prconexion != 'undefined' && prconexion) { 
                SourcesModel?.setConnection(prconexion);
                NodesFlowsModel?.setConnection(prconexion);
            }
            SourcesModel.getSourcePerName(req.body.sourceName, (err, resS) => {
                if (err) {
                    if(typeof res == 'function'){
                        res({
                            statusCode: 400,
                            body: JSON.stringify({ 'state': 'error', 'message': 'error request!' })
                        })
                    }else{
                        res.status(400).json({ 'state': 'error', 'message': 'error request!' })
                    }
                } else if (Object.keys(resS).length > 0) {
                    NodesFlowsModel.createOrUpdate({
                        "name": req.body.name,
                        "label": req.body.label,
                        "sources_id": resS.id,
                        "node_flow_id": null
                    }, { 'name': true, 'sources_id': true }, (error, response) => {
                        if (!error) {
                            if (req.body.nodeParent && req.body.nodeParent != '') {
                                NodesFlowsModel.updateNodeParent(response.id, req.body.nodeParent, resS.id);
                            }
                            if (req.body.actionNode && typeof req.body.actionNode == 'object' && Object.keys(req.body.actionNode).length > 0) {
                                ActionsController.createAction(response.id, req.body.actionNode, null, prconexion);
                            }
                            setTimeout(function() {
                                
                                if(typeof res == 'function'){
                                    res({
                                        statusCode: 200,
                                        body: JSON.stringify({ 'state': 'success', 'result': response })
                                    })
                                }else{
                                    res.status(200).json({ 'state': 'success', 'result': response })
                                }
                            }, 5000);
                        } else {
                            if(typeof res == 'function'){
                                res({
                                    statusCode: 400,
                                    body: JSON.stringify({ 'state': 'error', 'message': 'error register!' })
                                })
                            }else{
                                res.status(400).json({ 'state': 'error', 'message': 'error register!' })
                            }
                        }
                    });
                } else {
                    
                    if(typeof res == 'function'){
                        res({
                            statusCode: 400,
                            body: JSON.stringify({ 'state': 'error', 'message': 'error request!' })
                        })
                    }else{
                        res.status(400).json({ 'state': 'error', 'message': 'error request!' })
                    }
                }
            });
        } else {
            if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
                })
            }else{
                res.status(400).json({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
            }
        }
    } else {
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

exports.getTreeNode = (req, res, prconexion) => {
    if (typeof prconexion != 'undefined' && prconexion) { 
        NodesFlowsModel?.setConnection(prconexion);
    }
    NodesFlowsModel.getTreeNode(req?.params?.sources_id, (error, response) => {
        if (!error) {
            if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify({ tree: response })
                })
            }else{
                res.status(200).json({ tree: response })
            }
        } else {
            if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ error: error })
                })
            }else{
                res.status(400).json({ error: error })
            }
        }
    })
}

exports.setApiKey = (key) => {
    if(key){
        NodesFlowsModel.setApiKey(key);
        SourcesModel.setApiKey(key)
        ActionsController.setApiKey(key)    
    }
}

exports.setApiToken = (token) => {
    if(token){
        NodesFlowsModel.setApiToken(token);
        SourcesModel.setApiToken(token);
        ActionsController.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        NodesFlowsModel.setUrl(url);
        SourcesModel.setUrl(url);
        ActionsController.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    NodesFlowsModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = NodesFlowsModel.createConnection;