const TypesLoginsModel = require('../../Models/TypesLoginsModel')
const LoginsAuthorizationsModel = require('../../Models/LoginsAuthorizationsModel')

exports.getListAccess= (req, res, prconexion=null)=>{
    if(req?.query.token && req?.query.token != ''){
        if (typeof prconexion != 'undefined' && prconexion) { 
            TypesLoginsModel?.setConnection(prconexion);
        }
        TypesLoginsModel.selectAvailable(req.query.token,(err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('getListAccess',err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 401,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error authorization.'})
                    })
                }else{
                    res.status(401).json({ 'state': 'error', 'messanger': 'Error authorization.'})
                }
            }else{
                console.log('getListAccess success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'result': response})
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'result': response})
                }
            }
        });
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('getListAccess authorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messanger': 'Error authorization.'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messanger': 'Error authorization.'})
        }
    }
    
}

exports.getAuthorizationCode=(req, res, prconexion=null)=>{
    if(req?.query?.state && req?.query?.state != '' && req?.query?.redirect_uri && req?.query?.redirect_uri != '' && req?.query?.provider && req?.query?.provider != ''){
        if (typeof prconexion != 'undefined' && prconexion) { 
            TypesLoginsModel?.setConnection(prconexion);
        }
        TypesLoginsModel.getProviderAvailable(req.query,(err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('getAuthorizationCode', err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error request.'})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': 'Error request.'})
                }
            }else{
                console.log('getAuthorizationCode success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'result': response})
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'result': response})
                }
            }
        });
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('getAuthorizationCode authorization');
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'messanger': 'Error request.'})
            })
        }else{
            res.status(400).json({ 'state': 'error', 'messanger': 'Error request.'})
        }
    }
}

exports.authorizationCode=(req, res, prconexion=null)=>{
    if(req?.headers?.authorization && req?.headers?.authorization != '' && req?.body?.stepName && req?.body?.stepName != ''){
        let authorization= req.headers.authorization.replace('Bearer ','');
        if (typeof prconexion != 'undefined' && prconexion) { 
            TypesLoginsModel?.setConnection(prconexion);
        }
        TypesLoginsModel.getValidStep(req.body, authorization,(err,response)=>{ 
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('authorizationCode', err, authorization, req?.body);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error request.'})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': 'Error request.'})
                }
            }else{
                console.log('authorizationCode success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify(response)
                    })
                }else{
                    res.status(200).json(response)
                }
            }
        }); 
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('authorizationCode autorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messange': 'error'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messange': 'error'})
        }
    }
}

exports.getUserInfo=(req, res, prconexion=null)=>{
    if(req?.headers?.authorization && req?.headers?.authorization != ''){
        let accesToken= req.headers.authorization.replace('Bearer ','');
        if (typeof prconexion != 'undefined' && prconexion) { 
            LoginsAuthorizationsModel?.setConnection(prconexion);
        }
        LoginsAuthorizationsModel.getUserInfoValid(accesToken,(err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('getUserInfo', err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
                console.log('getUserInfo success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify(response)
                    })
                }else{
                    res.status(200).json(response)
                }
            }
        }); 
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('getUserInfo error autorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messange': 'error'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messange': 'error'})
        }
    }
}

exports.getValidCodeSolicitud=(req, res, prconexion=null)=>{
    if(req?.body?.code && req?.body?.code != '' && req?.body?.client_id && req?.body?.client_id != '' && req?.body?.client_secret && req?.body?.client_secret != ''){
        if (typeof prconexion != 'undefined' && prconexion) { 
            LoginsAuthorizationsModel?.setConnection(prconexion);
        }
        LoginsAuthorizationsModel.getValidCodeSolicitud(req.body.code, req.body.client_id, req.body.client_secret, (err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('getValidCodeSolicitud', err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
                console.log('getValidCodeSolicitud success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify(response)
                    })
                }else{
                    res.status(200).json(response)
                }
            }
        }); 
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('getValidCodeSolicitud autorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messange': 'error'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messange': 'error'})
        }
    }
}

exports.getAuthorizationCodeURL=(req,res, prconexion=null)=>{
    if(req?.query?.state && req?.query?.state != '' && req?.query?.redirect_uri && req?.query?.redirect_uri != '' && req?.query?.client_id){
        if (typeof prconexion != 'undefined' && prconexion) { 
            LoginsAuthorizationsModel?.setConnection(prconexion);
        }
        LoginsAuthorizationsModel.getAuthorizationCode(req.query.state, req.query.redirect_uri, req?.query?.client_id, (err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('getAuthorizationCodeURL', err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
                console.log('getAuthorizationCodeURL success', response);
                if(typeof res == 'function'){
                    res({
                        statusCode: 302,
                        headers: {
                          Location: response
                        }
                    })
                }else{
                    res.redirect(response)
                }
            }
        }); 
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('getAuthorizationCodeURL authorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messange': 'error request'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messange': 'error request'})
        }
    }
}

exports.startFast=(req, res, prconexion=null)=>{
    if(req?.body?.token && req?.body?.token != '' && req?.body?.stateVtex && req?.body?.stateVtex != ''){
        if (typeof prconexion != 'undefined' && prconexion) { 
            LoginsAuthorizationsModel?.setConnection(prconexion);
        }
        LoginsAuthorizationsModel.getValidCodeSolicitudFast(req.body.token, req.body.stateVtex,(err,response)=>{
            if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
            if(err){
                console.error('startFast', err);
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
                console.log('startFast success');
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify(response)
                    })
                }else{
                    res.status(200).json(response)
                }
            }
        }); 
    }else{
        if(prconexion && typeof prconexion?.end === 'function' && process?.env?.DB_CONNECTION_END == true){console.info('close connection created!'); prconexion.end();}
        console.error('startFast authorization');
        if(typeof res == 'function'){
            res({
                statusCode: 401,
                body: JSON.stringify({ 'state': 'error', 'messange': 'error'})
            })
        }else{
            res.status(401).json({ 'state': 'error', 'messange': 'error'})
        }
    }
}

exports.setApiKey = (key) => {
    if(key){
        LoginsAuthorizationsModel.setApiKey(key);
        TypesLoginsModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        LoginsAuthorizationsModel.setApiToken(token); 
        TypesLoginsModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        LoginsAuthorizationsModel.setUrl(url);
        TypesLoginsModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    LoginsAuthorizationsModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = LoginsAuthorizationsModel.createConnection;