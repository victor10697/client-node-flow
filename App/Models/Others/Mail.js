const nodemailer = require('nodemailer');

let emailTransportOptions, transporter, mailFromAddress

/**
 * Establece las opciones de configuración del servicio SMTP.
 * @param {Object} settingsObject Objeto con los valores de configuración del servicio SMTP.
 */
exports.setEmailSettings = function (settingsObject) {
	// Se define los parámetros de conexión al servidor SMTP
	mailFromAddress = settingsObject.mail_from_address || ''

	emailTransportOptions = {
		'host': settingsObject.mail_host || '',
		'port': settingsObject.mail_port || '',
		'auth': {
			'user': settingsObject.mail_username || '',
			'pass': settingsObject.mail_password || ''
		}
	}

	// Valor de configuración de tipo de encriptación (TLS, SSL)
	let encryption = String(settingsObject.mail_encryption || '').trim().toLowerCase()
	switch (encryption) {
		case 'tls':
			emailTransportOptions.tls = { rejectUnauthorized: true }
			break;
		case 'ssl':
			emailTransportOptions.secure = true
			break;
	}

	// Se inicializa la conexión con el servidor; y se valida el status de la misma dentro de una Promise
	transporter = nodemailer.createTransport(emailTransportOptions)
	return new Promise((resolve, reject) => {
		transporter.verify(error => {
			if (error) reject(error)
			else resolve({ status: 'OK' })
		})
	})
}

/**
 * Ejecuta el envío del correo electrónico.
 * @param {Object} mailOptions Opciones del correo electrónico a enviar.
 */
exports.sendEmail = (mailOptions) => {
	mailOptions.from = mailFromAddress

	// Se ejecuta el proceso de envío del correo electrónico
	return new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) reject(err)
			else resolve(info)
		})
	})
}

/**
 * Ejecuta el envío del correo electrónico.
 * @param {Object} mailOptions Opciones del correo electrónico a enviar.
 */
 exports.send = async function(settings, mailOptions, callback) {
    await this.setEmailSettings(settings)

	// Se ejecuta el proceso de envío del correo electrónico
	let res= new Promise((resolve, reject) => {
		transporter.sendMail(mailOptions, (err, info) => {
			if (err) callback(err, null)
			else callback(null, info)
		})
	})
}