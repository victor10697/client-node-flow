const CronModel = require('../../Models/CronModel')
const SourcesModel = require('../../Models/SourcesModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.findAll = (req, res) => {
    CronModel.select((error, response) => {
        if (!error) {
            res.status(200).json({ 'state': 'success', 'list': response })
        } else {
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
    if (req.body && Object.keys(req.body).length > 0) {
        // Desestructurar los valores del cuerpo de la petición
        const { sourceName, cronName, cronDescription, cronTime, cronValues } = req.body
        if (sourceName && sourceName != '') {
            SourcesModel.getSourcePerName(sourceName, (err, resS) => {
                if (err) {
                    res.status(500).json({ 'state': 'error', 'message': 'error request!' })
                } else if (Object.keys(resS).length > 0) {
                    if (cronName && cronTime) {
                        const cronJobRecord = {
                            name: cronName,
                            description: cronDescription ?? null,
                            cron: cronTime,
                            sources_id: resS.id,
                            values: cronValues ?? null
                        };
                        // Se inserta o actualiza los datos del Cron Job
                        CronModel.createOrUpdate(cronJobRecord, { 'name': true }, (err, result) => {
                            if (!err) {
                                res.status(200).json({ 'state': 'success', 'result': result })
                            } else {
                                res.status(500).json({ 'state': 'error', 'message': 'error register!' })
                            }
                        });
                    } else {
                        res.status(500).json({ 'state': 'error', 'message': 'error cronName, cronTime is required!' })
                    }
                } else {
                    res.status(500).json({ 'state': 'error', 'message': 'error request!' })
                }
            });
        } else {
            res.status(500).json({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
        }
    } else {
        res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
    }
}

/**
 * Metodo para eliminar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.delete = (req, res) => {
    if (req.params && req.params.id) {
        CronModel.remove(req.params.id, (error, response) => {
            if (!error) {
                res.status(200).json({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
            } else {
                res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
            }
        });
    } else {
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
    if (regExpByDate && regExpGeneral) {
        CronModel.getCronJobs(regExpByDate, regExpGeneral, (error, response) => {
            if (!error) {
                callback(null, { 'state': 'success', 'result': response })
            } else {
                callback({ 'state': 'error', 'message': error }, null)
            }
        });
    } else {
        callback({ 'state': 'error', 'message': 'error consultas cron!' })
    }
}
