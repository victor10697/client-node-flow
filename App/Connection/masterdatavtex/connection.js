const VtexModel = require('./VtexModel')
const connection= new VtexModel();
// Referencia a las variables definidas en el archivo .env
const env = process.env

// Parámetros de conexión con la base de datos MySQL (ver archivo .env)
const paramsConexion = {
	DB_VTEX_URL: env.DB_VTEX_URL || 'https://{{accountName}}.{{environment}}.com.br',
	DB_VTEX_APIKEY: env.DB_VTEX_APIKEY || '',
	DB_VTEX_APITOKEN: env.DB_VTEX_APITOKEN || '',
	DB_VTEX_START_ENTITY: env.DB_VTEX_START_ENTITY || 'lgbr',
	DB_VTEX_VERSION: env.DB_VTEX_VERSION || 'v1',
	DB_VTEX_NAME: env.DB_VTEX_NAME || 'login_brandlive',
	DB_VTEX_REST_RANGE: env.DB_VTEX_REST_RANGE || 'resources=0-1000',
	DB_VTEX_TITLE: env.DB_VTEX_TITLE || 'Login BRANDLIVE'
}
connection.createConnection(paramsConexion)

module.exports = connection