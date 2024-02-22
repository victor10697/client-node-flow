const CronModel = require('../../Models/CronModel')
const SourcesModel = require('../../Models/SourcesModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.findAll = (req, res, prconexion=null) => {
    if (typeof prconexion != 'undefined' && prconexion) { CronModel?.setConnection(prconexion);}
    CronModel.select((error, response) => {
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
        if (!error) {
            if (typeof res == 'function') {
                res({
                    statusCode: 200,
                    body: JSON.stringify({ 'state': 'success', 'list': response })
                })
            } else {
                res.status(200).json({ 'state': 'success', 'list': response })
            }
        } else {
            if (typeof res == 'function') {
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error list crons!' })
                })
            } else {
                res.status(400).json({ 'state': 'error', 'message': 'error list crons!' })
            }
        }
    });
}

/**
 * Metodo para insertar registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.insert = (req, res, prconexion=null) => {
    if (req.body && Object.keys(req.body).length > 0) {
        // Desestructurar los valores del cuerpo de la petición
        const { sourceName, cronName, cronDescription, cronTime, cronValues, actived = 0 } = req.body
        if (sourceName && sourceName != '') {
            if (typeof prconexion != 'undefined' && prconexion) { 
                CronModel?.setConnection(prconexion);
                SourcesModel?.setConnection(prconexion);
            }
            SourcesModel.getSourcePerName(sourceName, (err, resS) => {
                if (err) {
                    res.status(400).json({ 'state': 'error', 'message': 'error request!' })
                } else if (Object.keys(resS).length > 0) {
                    if (cronName && cronTime) {
                        const cronJobRecord = {
                            name: cronName,
                            description: cronDescription ?? null,
                            cron: cronTime,
                            sources_id: resS.id,
                            values: cronValues ?? null,
                            actived: actived
                        };
                        // Se inserta o actualiza los datos del Cron Job
                        CronModel.createOrUpdate(cronJobRecord, { 'name': true }, (err, result) => {
                            if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
                            if (!err) {
                                if (typeof res == 'function') {
                                    res({
                                        statusCode: 200,
                                        body: JSON.stringify({ 'state': 'success', 'result': result })
                                    })
                                } else {
                                    res.status(200).json({ 'state': 'success', 'result': result })
                                }
                            } else {
                                if (typeof res == 'function') {
                                    res({
                                        statusCode: 400,
                                        body: JSON.stringify({ 'state': 'error', 'message': 'error register!' })
                                    })
                                } else {
                                    res.status(400).json({ 'state': 'error', 'message': 'error register!' })
                                }
                            }
                        });
                    } else {
                        if (typeof res == 'function') {
                            res({
                                statusCode: 400,
                                body: JSON.stringify({ 'state': 'error', 'message': 'error cronName, cronTime is required!' })
                            })
                        } else {
                            res.status(400).json({ 'state': 'error', 'message': 'error cronName, cronTime is required!' })
                        }
                    }
                } else {
                    if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
                    if (typeof res == 'function') {
                        res({
                            statusCode: 400,
                            body: JSON.stringify({ 'state': 'error', 'message': 'error request!' })
                        })
                    } else {
                        res.status(400).json({ 'state': 'error', 'message': 'error request!' })
                    }
                }
            });
        } else {
            if (typeof res == 'function') {
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
                })
            } else {
                res.status(400).json({ 'state': 'error', 'message': 'error name, label, sources_id is required!' })
            }
        }
    } else {
        if (typeof res == 'function') {
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'Content cannot be empty' })
            })
        } else {
            res.status(400).json({ 'state': 'error', 'message': 'Content cannot be empty' })
        }
    }
}

/**
 * Metodo para eliminar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
exports.delete = (req, res, prconexion=null) => {
    if (req.params && req.params.id) {
        if (typeof prconexion != 'undefined' && prconexion) { CronModel?.setConnection(prconexion);}
        CronModel.remove(req.params.id, (error, response) => {
            if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
            if (!error) {
                if (typeof res == 'function') {
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                    })
                } else {
                    res.status(200).json({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                }
            } else {
                if (typeof res == 'function') {
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
                    })
                } else {
                    res.status(400).json({ 'state': 'error', 'message': 'error deleted!' })
                }
            }
        });
    } else {
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
        if (typeof res == 'function') {
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
            })
        } else {
            res.status(400).json({ 'state': 'error', 'message': 'error deleted!' })
        }
    }
}

/**
 * Metodo para obtener crons activos
 * @param regExpByDate -- Expresion regular fecha a consultar
 * @param regExpGeneral -- Expresion regular general
 * @param callback -- Respuesta de la peticion
 */
exports.getCronJobs = (regExpByDate, regExpGeneral, callback, prconexion=null) => {
    if (regExpByDate && regExpGeneral) {
        if (typeof prconexion != 'undefined' && prconexion) { CronModel?.setConnection(prconexion);}
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

exports.setApiKey = (key) => {
    if (key) {
        CronModel.setApiKey(key);
        SourcesModel.setApiKey(key);
    }
}

exports.setApiToken = (token) => {
    if (token) {
        CronModel.setApiToken(token);
        SourcesModel.setApiToken(token);
    }
}

exports.setUrl = (url) => {
    if (url) {
        CronModel.setUrl(url);
        SourcesModel.setUrl(url);
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    CronModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = CronModel.createConnection;