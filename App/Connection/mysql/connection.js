const mysql = require('mysql')
// Referencia a las variables definidas en el archivo .env
const env = process.env

// Parámetros de conexión con la base de datos MySQL (ver archivo .env)
const paramsConexion = {
	host: env.DB_HOST || 'localhost',
	port: env.DB_PORT || '3306',
	database: env.DB_DATABASE || '',
	user: env.DB_USERNAME || 'root',
	password: env.DB_PASSWORD || '',
	connectTimeout: env.DB_CONNECT_TIMEOUT || 3600000
}

const connection = mysql.createConnection(paramsConexion)

module.exports = connection