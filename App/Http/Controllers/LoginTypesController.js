const TypesLoginsModel = require('../../Models/TypesLoginsModel')

exports.createLogin=(req, res, prconexion=null)=>{
    if(req?.body?.providerName && req?.body?.providerName != ''){
        if (typeof prconexion != 'undefined' && prconexion) { 
            TypesLoginsModel?.setConnection(prconexion);
        }
        TypesLoginsModel.createLogin(req.body, (err, response)=>{
            if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
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
        if(prconexion && typeof prconexion?.end === 'function'){console.info('close connection created!'); prconexion.destroy();}
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

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    TypesLoginsModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = TypesLoginsModel.createConnection;