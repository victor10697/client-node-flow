const TypesLoginsModel = require('../../Models/TypesLoginsModel')

exports.createLogin=(req, res)=>{
    if(req.body.providerName && req.body.providerName != ''){
        TypesLoginsModel.createLogin(req.body, (err, response)=>{
            if(!err){
                res.status(200).json({ 'state': 'success', 'result': response });
            }else{
                res.status(400).json({ 'state': 'error', 'message': 'Login type information cannot to be saved', 'result': err });
            }
        });
    }else{
        res.status(400).json({ 'state': 'error', 'message': 'error request.' });
    }
};

