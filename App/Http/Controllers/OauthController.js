const TypesLoginsModel = require('../../Models/TypesLoginsModel')
const LoginsAuthorizationsModel = require('../../Models/LoginsAuthorizationsModel')

exports.getListAccess= (req, res)=>{
    if(req.query.token && req.query.token != ''){
        TypesLoginsModel.selectAvailable(req.query.token,(err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 401,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error authorization.'})
                    })
                }else{
                    res.status(401).json({ 'state': 'error', 'messanger': 'Error authorization.'})
                }
            }else{
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

exports.getAuthorizationCode=(req, res)=>{
    if(req.query.state && req.query.state != '' && req.query.redirect_uri && req.query.redirect_uri != '' && req.query.provider && req.query.provider != ''){
        TypesLoginsModel.getProviderAvailable(req.query,(err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error request.'})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': 'Error request.'})
                }
            }else{
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

exports.authorizationCode=(req, res)=>{
    if(req.headers.authorization && req.headers.authorization != '' && req.body.stepName && req.body.stepName != ''){
        let authorization= req.headers.authorization.replace('Bearer ','');
        TypesLoginsModel.getValidStep(req.body, authorization,(err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': 'Error request.'})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': 'Error request.'})
                }
            }else{
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

exports.getUserInfo=(req, res)=>{
    if(req.headers.authorization && req.headers.authorization != ''){
        let accesToken= req.headers.authorization.replace('Bearer ','');
        LoginsAuthorizationsModel.getUserInfoValid(accesToken,(err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
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

exports.getValidCodeSolicitud=(req, res)=>{
    if(req.body.code && req.body.code != '' && req.body.client_id && req.body.client_id != '' && req.body.client_secret && req.body.client_secret != ''){
        LoginsAuthorizationsModel.getValidCodeSolicitud(req.body.code, req.body.client_id, req.body.client_secret, (err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
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

exports.getAuthorizationCodeURL=(req,res)=>{
    if(req.query.state && req.query.state != '' && req.query.redirect_uri && req.query.redirect_uri != ''){
        LoginsAuthorizationsModel.getAuthorizationCode(req.query.state, req.query.redirect_uri, (err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
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

exports.startFast=(req, res)=>{
    if(req.body.token && req.body.token != '' && req.body.stateVtex && req.body.stateVtex != ''){
        LoginsAuthorizationsModel.getValidCodeSolicitudFast(req.body.token, req.body.stateVtex,(err,response)=>{
            if(err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'messanger': err})
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'messanger': err})
                }
            }else{
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