const HistoryFlowModel = require('../../Models/HistoryFlowModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res, prconexion=null) => {
    if (typeof prconexion != 'undefined' && prconexion) { HistoryFlowModel?.setConnection(prconexion);}
	HistoryFlowModel.selectHistory(req,(error, response)=>{
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
                    body: JSON.stringify({ 'state': 'error', 'message': 'error list hisroty flow!' })
                })
            }else{
                res.status(500).json({ 'state': 'error', 'message': 'error list hisroty flow!' })
            }
        }
    });
}

exports.setApiKey = (key) => {
    if(key){
        HistoryFlowModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        HistoryFlowModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        HistoryFlowModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    HistoryFlowModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = HistoryFlowModel.createConnection;