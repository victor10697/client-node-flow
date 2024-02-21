const settingsModel = require('../../Models/SettingsModel')

exports.findAll = (req, res, prconexion) => {
	if (typeof prconexion != 'undefined' && prconexion) { 
        settingsModel?.setConnection(prconexion);
    }
	settingsModel.select((err, data) => {
		if (err) {
			if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'message': err.message || 'Some error ocurred while retrieving' })
                })
            }else{
				res.status(400).json({ 'message': err.message || 'Some error ocurred while retrieving' })
			}
			return
		}

		// Se valida si en la URL se define como parámetro de tipo GET que los registros se envíen en formato JSON
		if (req?.query?.type == 'JSON') {
			let jsonList = {}
			data.forEach(setting => {
				if (setting.name) {
					if (!jsonList.hasOwnProperty(setting.name)) {
						jsonList[setting.name] = setting.value
					}
				}
			})
			if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify(jsonList)
                })
            }else{
				res.json(jsonList)
			}
		} else {
			if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify(data)
                })
            }else{
				res.json(data)
			}
		}
	})
}

exports.insert = (req, res, prconexion) => {
	if (typeof prconexion != 'undefined' && prconexion) { 
        settingsModel?.setConnection(prconexion);
    }
	// Se valida el cuerpo de la petición
	if (!req?.body) {
		if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'message': 'Content cannot be empty' })
            })
        }else{
			res.status(400).json({ 'message': 'Content cannot be empty' })
		}
		return
	}

	// Se valida el cuerpo de la petición
	if (!req?.body?.name) {
		if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'message': 'Settings name is not defined' })
            })
        }else{
			res.status(400).json({ 'message': 'Settings name is not defined' })
		}
		return
	}
 
	settingsModel.createOrUpdate(req.body, { 'name': true, 'created_at': true }, (err, data) => {
		
		if (err) {
			if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'message': err.message || 'Some error ocurred while creating' })
                })
            }else{
				res.status(400).json({ 'message': err.message || 'Some error ocurred while creating' })
			}
		} else {
			if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify(data)
                })
            }else{
				res.status(200).json(data)
			}
		}
	})
}

exports.save = (req, res, prconexion) => {
	if (typeof prconexion != 'undefined' && prconexion) { 
        settingsModel?.setConnection(prconexion);
    }
	// Se valida el cuerpo de la petición
	if (!req?.body) {
		if(typeof res == 'function'){
            res({
                statusCode: 400,
                body: JSON.stringify({ 'message': 'Content cannot be empty' })
            })
        }else{
			res.status(400).json({ 'message': 'Content cannot be empty' })
		}
		return
	}

	settingsModel.saveRecords(req.body, (err, data) => {
		
		if (err) {
			if(typeof res == 'function'){
                res({
                    statusCode: 400,
                    body: JSON.stringify({ 'message': err.message || 'Some error ocurred while creating' })
                })
            }else{
				res.status(400).json({ 'message': err.message || 'Some error ocurred while creating' })
			}
		} else {
			if(typeof res == 'function'){
                res({
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Settings was updated successfully',data:data })
                })
            }else{
				res.json({ message: 'Settings was updated successfully',data:data })
			}
		}
	})
}

exports.setApiKey = (key) => {
    if(key){
        settingsModel.setApiKey(key);    
    }
}

exports.setApiToken = (token) => {
    if(token){
        settingsModel.setApiToken(token);    
    }
}

exports.setUrl = (url) => {
    if(url){
        settingsModel.setUrl(url);    
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    settingsModel.closeConnection((response)=>{
        console.log(response);
    });
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.createConnection = settingsModel.createConnection;