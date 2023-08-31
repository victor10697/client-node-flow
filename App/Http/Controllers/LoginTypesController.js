const TypesLoginsModel = require('../../Models/TypesLoginsModel')

exports.createLogin=(req, res)=>{
    if(req?.body?.providerName && req?.body?.providerName != ''){
        TypesLoginsModel.createLogin(req.body, (err, response)=>{
            if(!err){
                if(typeof res == 'function'){
                    res({
                        statusCode: 200,
                        body: JSON.stringify({ 'state': 'success', 'result': response })
                    })
                }else{
                    res.status(200).json({ 'state': 'success', 'result': response });
                }
            }else{
                if(typeof res == 'function'){
                    res({
                        statusCode: 400,
                        body: JSON.stringify({ 'state': 'error', 'message': 'Login type information cannot to be saved', 'result': err })
                    })
                }else{
                    res.status(400).json({ 'state': 'error', 'message': 'Login type information cannot to be saved', 'result': err });
                }
            }
        });
    }else{
        if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'state': 'error', 'message': 'error request.' })
            })
        }else{
            res.status(400).json({ 'state': 'error', 'message': 'error request.' });
        }
    }
};


exports.setApiKey = (key) => {
    if(key){
        TypesLoginsModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        TypesLoginsModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        TypesLoginsModel.setUrl(url);    
    }
}
