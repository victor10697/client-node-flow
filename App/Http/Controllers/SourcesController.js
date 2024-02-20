const SourcesModel = require('../../Models/SourcesModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res) => {
    SourcesModel.select((error, response)=>{
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
                    statusCode: 400,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error list sources!' })
                })
            }else{
                res.status(400).json({ 'state': 'error', 'message': 'error list sources!' })
            }
        }
    });
}

/**
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.update = (req, res) => {
    if(req?.params && req?.params?.id && req?.body && Object.keys(req?.body).length > 0){
        SourcesModel.update(req.params.id, req.body, (error, response)=>{
            if(!error){
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'result': response })
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'result': response })
                }
            }else{
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error updated register!' })
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'message': 'error updated register!' })
                }
            }
        });
    }else{
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'error updated!' })
            })
        }else{
            res.status(400).json({ 'state': 'error', 'message': 'error updated!' })
        }
    }
}

/**
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.create = (req, res) => {
    if(req?.body && Object.keys(req?.body).length > 0){
        if(req?.body?.name && req?.body?.description){
            SourcesModel.createOrUpdate(req.body, { 'name': true }, (error, response)=>{
                if(!error){
                    if(typeof res == 'function'){
                        res({
                            statusCode: 200,
                            body: JSON.stringify({ 'state': 'success', 'result': response })
                        })
                    }else{
                        res.status(200).json({ 'state': 'success', 'result': response })
                    }
                }else{
                    if(typeof res == 'function'){
                        res({
                            statusCode: 400,
                            body: JSON.stringify({ 'state': 'error', 'message': error })
                        })
                    }else{
                        res.status(400).json({ 'state': 'error', 'message': error })
                    }
                }
            });
        }else{
            if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error name, description is required!' })
                })
            }else{
                res.status(400).json({ 'state': 'error', 'message': 'error name, description is required!' })
            }
        }
    }else{
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

/**
 * Metodo para eliminar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.delete = (req, res) => {
    if(req?.params && req?.params?.id){
        SourcesModel.remove(req.params.id, (error, response)=>{
            if(!error){
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'message': `Register ${req.params.id} deleted!` })
                }
            }else{
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'message': 'error deleted!' })
                }
            }
        });
    }else{
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
            })
        }else{
            res.status(400).json({ 'state': 'error', 'message': 'error deleted!' })
        }
    }
}

exports.setApiKey = (key) => {
    if(key){
        SourcesModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        SourcesModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        SourcesModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    SourcesModel.closeConnection((response)=>{
        console.log(response);
    });
}