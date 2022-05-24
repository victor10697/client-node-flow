const CronModel= require('../../Models/CronModel')
 
/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res) => {
    CronModel.select((error, response)=>{
        if(!error){
            res.status(200).json({ 'state': 'success', 'list': response })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error list sources!' })
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
 exports.delete = (req, res) => {
	
    if(req.params && req.params.id){
        CronModel.remove(req.params.id, (error, response)=>{
            if(!error){
                res.status(200).json({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
            }else{
                res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
            }
        });
    }else{
        res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
    }
}

/**
 * Metodo para obtener crons activos
 * @param regExpByDate -- Expresion regular fecha a consultar
 * @param regExpGeneral -- Expresion regular general
 * @param callback -- Respuesta de la peticion
 */
 exports.getCronJobs = (regExpByDate, regExpGeneral, callback) => {
    if(regExpByDate && regExpGeneral){
        CronModel.getCronJobs(regExpByDate, regExpGeneral, (error, response)=>{
            if(!error){
                callback(null,{ 'state': 'success', 'result': response })
            }else{
                callback({ 'state': 'error', 'message': error }, null)
            }
        });
    }else{
        callback({ 'state': 'error', 'message': 'error consultas cron!' })
    }
}

