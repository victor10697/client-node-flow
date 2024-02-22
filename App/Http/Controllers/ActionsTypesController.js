const ActionsTypesModel = require('../../Models/ActionsTypesModel')

/**
 * Metodo para obtener lista registros
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.findAll = (req, res, prconexion=null) => {
    if (typeof prconexion != 'undefined' && prconexion) { ActionsTypesModel?.setConnection(prconexion);}
    ActionsTypesModel.select((error, response)=>{
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
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
                    body: JSON.stringify({ 'state': 'error', 'message': 'error list actions types!' })
                })
            }else{
                res.status(500).json({ 'state': 'error', 'message': 'error list  actions types!' })
            }
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
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.update = (req, res, prconexion=null) => {
    if(req?.params && req?.params?.id && req.body && Object.keys(req?.body).length > 0){
        if (typeof prconexion != 'undefined' && prconexion) { ActionsTypesModel?.setConnection(prconexion);}
        ActionsTypesModel.update(req.params.id, req.body, (error, response)=>{
            if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
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
                        statusCode: 500,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error updated register!' })
                    })
                }else{
                    res.status(500).json({ 'state': 'error', 'message': 'error updated register!' })
                }
            }
        });
    }else{
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
        if(typeof res == 'function'){
            res({
                statusCode: 500,
                body: JSON.stringify({ 'state': 'error', 'message': 'error updated!' })
            })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error updated!' })
        }
    }
}

/**
 * Metodo para actualizar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.create = (req, res, prconexion=null) => {
    if(req?.body && Object.keys(req?.body).length > 0){
        if(req?.body?.name){
            if (typeof prconexion != 'undefined' && prconexion) { ActionsTypesModel?.setConnection(prconexion);}
            ActionsTypesModel.createOrUpdate(req.body, { name: true, 'created_at': true }, (error, response)=>{ 
                if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
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
                            statusCode: 500,
                            body: JSON.stringify({ 'state': 'error', 'message': 'error register!' })
                        })
                    }else{
                        res.status(500).json({ 'state': 'error', 'message': 'error register!' })
                    }
                }
            });
        }else{ 
            if(typeof res == 'function'){
                res({
                    statusCode: 500,
                    body: JSON.stringify({ 'state': 'error', 'message': 'error name is required!' })
                })
            }else{
                res.status(500).json({ 'state': 'error', 'message': 'error name is required!' })
            }
        }
    }else{
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
        if(typeof res == 'function'){
            res({
                statusCode: 500,
                body: JSON.stringify({ 'state': 'error', 'message': 'Content cannot be empty' })
            })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'Content cannot be empty' })
        }
    }
}

/**
 * Metodo para eliminar un registro
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.delete = (req, res, prconexion=null) => {
	
    if(req?.params && req?.params?.id){
        if (typeof prconexion != 'undefined' && prconexion) { ActionsTypesModel?.setConnection(prconexion);}
        ActionsTypesModel.remove(req.params.id, (error, response)=>{
            if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
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
                        statusCode: 500,
                        body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
                    })
                }else{
                    res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
                }
            }
        });
    }else{
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); }
        if(typeof res == 'function'){
            res({
                statusCode: 500,
                body: JSON.stringify({ 'state': 'error', 'message': 'error deleted!' })
            })
        }else{
            res.status(500).json({ 'state': 'error', 'message': 'error deleted!' })
        }
    }
}

exports.setApiKey = (key) => {
    if(key){
        ActionsTypesModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        ActionsTypesModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        ActionsTypesModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    ActionsTypesModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = ActionsTypesModel.createConnection;