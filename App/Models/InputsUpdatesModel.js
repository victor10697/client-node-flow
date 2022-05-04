const Model = require('../Model')
// const NodesFlowsModel = require('./NodesFlowsModel')

function InputsUpdatesModel() {
	Model.call(this)
	this.tableName = 'inputs_updates'
}
InputsUpdatesModel.prototype = new Model();

/**
 * 
 * @param {*} body -- valiables enviadas por body de la peticion 
 * @returns {*} object -- con las variables a guardar en base de datos
 */
 const getDataSaveInputsRequest= (body) => {
    let bodySave={};
    bodySave= typeof body === 'object' ? JSON.stringify(body) : {string:body};

    return {bodyRequest: bodySave};
}

InputsUpdatesModel.prototype.saveInput= function(bodyS, source_id, callback){
    if(bodyS && Object.keys(bodyS).length > 0){
        let requestSave= {};
            requestSave= getDataSaveInputsRequest(bodyS);
            requestSave.source_id = source_id; 
        this.insert(requestSave, (error, response)=>{
            if(!error){
                callback(null, response);
            }else{
                callback({ 'state': 'error', 'message': 'error register!' }, null)
            }
        });
    }else{
        callback({ 'state': 'error', 'message': 'Content cannot be empty' }, null)
    }
}

module.exports = new InputsUpdatesModel()