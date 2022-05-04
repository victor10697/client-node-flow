const NodesFlowsModel = require('../../Models/NodesFlowsModel')
const SourcesModel = require('../../Models/SourcesModel')
const ActionsController= require('./ActionsController')
/**
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.create = (req, res) => {
    if(req.body && Object.keys(req.body).length > 0){
        if(req.body.name && req.body.label && req.body.sourceName && req.body.sourceName !=''){
            SourcesModel.getSourcePerName(req.body.sourceName, (err, resS)=>{
                if(err){
                    res.status(500).json({ 'state': 'error', 'message': 'error request!' })
                }else if(Object.keys(resS).length > 0){
                    NodesFlowsModel.createOrUpdate({
                        "name": req.body.name,
                        "label": req.body.label,
                        "sources_id": resS.id,
                        "node_flow_id": null
                    }, { 'name': true, 'sources_id': true }, (error, response)=>{
                        if(!error){
                            if(req.body.nodeParent && req.body.nodeParent != ''){
                                NodesFlowsModel.updateNodeParent(response.id,req.body.nodeParent,resS.id); 
                            }
                            if(req.body.actionNode && typeof req.body.actionNode == 'object' && Object.keys(req.body.actionNode).length > 0){
                                ActionsController.createAction(response.id,req.body.actionNode); 
                            }
                            res.status(200).json({ 'state': 'success', 'result': response })
                        }else{
                            res.status(500).json({ 'state': 'error', 'message': 'error register!' })
                        }
                    });
                }else{
                    res.status(500).json({ 'state': 'error', 'message': 'error request!' })
                }
            });
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
        }
    }else{
        res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
    }
}

exports.getTreeNode=(req, res) => {
    NodesFlowsModel.getTreeNode(req.params.sources_id, (error, response)=>{
        if (!error) {
            res.status(200).json({ tree: response })
        } else {
            res.status(200).json({ error: error }) 
        }
    })
}