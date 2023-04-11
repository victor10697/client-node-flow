const axios = require('axios')
const settingsModel = require('../models/SettingsModel')

function VTEX(response) {
	this.vtexSettings = {
		'X-VTEX-API-AppKey': '',
		'X-VTEX-API-AppToken': '',
		'accountName': '',
		'environment': ''
	}
	handleSetVTEXProperties(this, response)
}

/**
 * Consulta la información de un pedido en VTEX.
 * @param {String} orderId Id del pedido en VTEX.
 * @param {Function} response Callback que se ejecuta en el retorno de la petición.
 */
VTEX.prototype.getOrderInformation = function (orderId, response) {
	let config = {
		'url': this.getBaseUrl(['api/oms/pvt/orders', orderId]),
		'method': 'GET'
	}

	// Se ejecuta el llamado a la API
	this.callRequest(config, response)
}

/**
 * Archiva una promoción en VTEX.
 * @param {String} promotionId Id de la promoción
 * @param {Function} response Callback que se ejecuta en el retorno de la petición.
 */
VTEX.prototype.inactivatePromotion = function (promotionId, response) {
	let config = {
		'url': this.getBaseUrl(['api/rnb/pvt/archive/calculatorConfiguration', promotionId]),
		'method': 'POST'
	}
	// Se ejecuta el llamado a la API
	this.callRequest(config, response)
}

/**
 * Ejecuta una petición a la API de VTEX.
 * @param {Object} config Parámetros de la petición a VTEX.
 * @param {Function} result Callback que se ejecuta en el retorno de la petición.
 */
VTEX.prototype.callRequest = function (config, result) {
	// Se parametriza las opciones de autenticación del llamado de la API de VTEX
	config.headers = {}
	config.headers['X-VTEX-API-AppKey'] = this.vtexSettings['X-VTEX-API-AppKey']
	config.headers['X-VTEX-API-AppToken'] = this.vtexSettings['X-VTEX-API-AppToken']

	// Se ejecuta la petición
	axios(config).then(function (response) {
		result(null, response.data)
	}).catch(function (error) {
		result({ message: error }, null)
	})
}

VTEX.prototype.getBaseUrl = function (fragments) {
	let baseUrl = `https://${this.vtexSettings.accountName}.${this.vtexSettings.environment}.com.br`
	if (fragments) {
		baseUrl += `/${fragments.join('/')}`
	}
	return baseUrl
}

function handleSetVTEXProperties(thisRef, response) {
	// Se consulta en base de datos los datos de configuración
	settingsModel.select((err, settings) => {
		if (err) {
			response.status(500).json({ 'message': err.message || 'Some error ocurred while getting settings records' })
		} else {
			// Se recorre los registros de configuración para obtener los valores de autenticación en VTEX
			settings.forEach(settingsItem => {
				// Se valida si se tiene un nombre y un valor definidos
				if (settingsItem.name && settingsItem.value) {
					// Se establece el valor en el objeto "vtexSettings" (si existe)
					if (thisRef.vtexSettings.hasOwnProperty(settingsItem.name)) {
						thisRef.vtexSettings[settingsItem.name] = settingsItem.value
					}
				}
			})

			for (let key in thisRef.vtexSettings) {
				if (thisRef.vtexSettings.hasOwnProperty(key)) {
					if (!thisRef.vtexSettings[key]) {
						response({ 'message': `Settings value '${key}' is not defined` })
						return
					}
				}
			}

			response(null, thisRef)
		}
	})
}

module.exports = VTEX