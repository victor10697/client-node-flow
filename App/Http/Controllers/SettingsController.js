const settingsModel = require('../../Models/SettingsModel')

exports.findAll = (req, res) => {
	settingsModel.select((err, data) => {
		if (err) {
			res.status(500).json({ 'message': err.message || 'Some error ocurred while retrieving' })
			return
		}

		// Se valida si en la URL se define como parámetro de tipo GET que los registros se envíen en formato JSON
		if (req.query.type == 'JSON') {
			let jsonList = {}
			data.forEach(setting => {
				if (setting.name) {
					if (!jsonList.hasOwnProperty(setting.name)) {
						jsonList[setting.name] = setting.value
					}
				}
			})
			res.json(jsonList)
		} else {
			res.json(data)
		}
	})
}

exports.insert = (req, res) => {
	// Se valida el cuerpo de la petición
	if (!req.body) {
		res.status(400).json({ 'message': 'Content cannot be empty' })
		return
	}

	// Se valida el cuerpo de la petición
	if (!req.body.name) {
		res.status(400).json({ 'message': 'Settings name is not defined' })
		return
	}
 
	settingsModel.createOrUpdate(req.body, { 'name': true, 'created_at': true }, (err, data) => {
		if (err) {
			res.status(500).json({ 'message': err.message || 'Some error ocurred while creating' })
		} else {
			res.status(200).json(data)
		}
	})
}

exports.save = (req, res) => {
	// Se valida el cuerpo de la petición
	if (!req.body) {
		res.status(400).json({ 'message': 'Content cannot be empty' })
		return
	}

	settingsModel.saveRecords(req.body, (err, data) => {
		if (err) {
			res.status(500).json({ 'message': err.message || 'Some error ocurred while creating' })
		} else {
			res.json({ message: 'Settings was updated successfully',data:data })
		}
	})
}