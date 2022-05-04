const InputsUpdatesModel = require('../../Models/InputsUpdatesModel');
const NodesFlowsModel = require('../../Models/NodesFlowsModel'); 
const SourcesModel = require('../../Models/SourcesModel');    

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insert = (req, res) => {
    if(req.body && Object.keys(req.body).length > 0){
        if(req.headers['x-app-key'] && req.headers['x-app-token']){
            // validamos credenciales de conexion
            SourcesModel.validSource(req.headers['x-app-key'], req.headers['x-app-token'], (error, validSourceT) => {
                if (!error && validSourceT.state && validSourceT.state == 'success') {
                    InputsUpdatesModel.saveInput(req.body, validSourceT.source_id, (error, response)=>{
                        if(!error){
                            NodesFlowsModel.ProcesingInputsNode([{
                                id: response.id,
                                input: JSON.parse(response.bodyRequest),
                                source_id: response.source_id
                            }], (errorA, responseA)=>{
                                InputsUpdatesModel.delete(response.id,(eRi,rRi)=>{console.log('eRi',eRi);});
                                if(!errorA){
                                    res.status(200).json({ 'state': 'success', 'result': responseA })
                                }else{
                                    res.status(200).json({ 'state': 'error', 'result': errorA })
                                }
                            });
                        }else{
                            res.status(200).json({ 'state': 'error', 'result': error })
                        }
                    });
                } else {
                    res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
                }
            })
        }else{ 
            res.status(401).json({ 'state': 'error', 'message': 'Unauthorized access!' })
        }
    }else{
        res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
    }
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.insertInternal = (bodyR, res) => {
	if(bodyR && Object.keys(bodyR).length > 0 && bodyR.source_id){
        InputsUpdatesModel.saveInput(bodyR, bodyR.source_id, (error, response)=>{
            if(!error){
                NodesFlowsModel.ProcesingInputsNode([{
                    id: response.id,
                    input: JSON.parse(response.bodyRequest),
                    source_id: response.source_id
                }], (errorA, responseA)=>{
                    InputsUpdatesModel.delete(response.id,(eRi,rRi)=>{console.log('eRi',eRi);});
                    if(!errorA){
                        res(null,responseA)
                    }else{
                        res('error',null)
                    }
                });
            }else{
                res('error',null)
            }
        });
    }else{
        res('error',null)
    }
}