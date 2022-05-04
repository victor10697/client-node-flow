const HistoryFlowModel = require('../../Models/HistoryFlowModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res) => {
	HistoryFlowModel.selectHistory(req,(error, response)=>{
        if(!error){
            res.status(200).json({ 'state': 'success', 'list': response })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error list hisroty flow!' })
        }
    });
}