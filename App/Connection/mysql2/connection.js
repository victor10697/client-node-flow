const mysql = require('mysql2')
// Referencia a las variables definidas en el archivo .env
const env = process.env;
const connectionGlobal= env?.DB_CONNECTION_GLOBAL && (env?.DB_CONNECTION_GLOBAL=== 'ON' || env?.DB_CONNECTION_GLOBAL==='on') ? true : false;

// Parámetros de conexión con la base de datos MySQL (ver archivo .env)
var connection = null;
if(connectionGlobal === true){
	if(env?.DB_CONNECTION_POOL && (env?.DB_CONNECTION_POOL=== true  || env?.DB_CONNECTION_POOL=== 'TRUE' || env?.DB_CONNECTION_POOL=== 'true')){
		connection = mysql.createPool({
			host: env?.DB_HOST || 'localhost',
			port: env?.DB_PORT || '3306',
			database: env?.DB_DATABASE || '',
			user: env?.DB_USERNAME || 'root',
			password: env?.DB_PASSWORD || '',
			connectTimeout: env?.DB_CONNECT_TIMEOUT || 60000,
			connectionLimit: env?.DB_CONNECTION_LIMIT || 1000
		});
	}else{
		connection = mysql.createConnection({
			host: env?.DB_HOST || 'localhost',
			port: env?.DB_PORT || '3306',
			database: env?.DB_DATABASE || '',
			user: env?.DB_USERNAME || 'root',
			password: env?.DB_PASSWORD || '',
			connectTimeout: env?.DB_CONNECT_TIMEOUT || 60000
		});
	}
}

const createConnection = (params)=>{
	return new Promise(async function(res,err) {
		let newconection=null;
		if(env?.DB_CONNECTION_POOL && (env?.DB_CONNECTION_POOL=== true  || env?.DB_CONNECTION_POOL=== 'TRUE' || env?.DB_CONNECTION_POOL=== 'true')){
			newconection = mysql.createPool({
				host: params?.DB_HOST || env?.DB_HOST || 'localhost',
				port: params?.DB_PORT || env?.DB_PORT ||'3306',
				database: params?.DB_DATABASE || env?.DB_DATABASE ||'',
				user: params?.DB_USERNAME || env?.DB_USERNAME ||'root',
				password: params?.DB_PASSWORD || env?.DB_PASSWORD ||'',
				connectTimeout: params?.DB_CONNECT_TIMEOUT || env?.DB_CONNECT_TIMEOUT || 60000,
				connectionLimit: params?.DB_CONNECTION_LIMIT || env?.DB_CONNECTION_LIMIT || 1000
			});
			res(newconection);
		}else{
			newconection = mysql.createConnection({
				host: params?.DB_HOST || env?.DB_HOST || 'localhost',
				port: params?.DB_PORT || env?.DB_PORT || '3306',
				database: params?.DB_DATABASE || env?.DB_DATABASE || '',
				user: params?.DB_USERNAME || env?.DB_USERNAME || 'root',
				password: params?.DB_PASSWORD || env?.DB_PASSWORD || '',
				connectTimeout: params?.DB_CONNECT_TIMEOUT || env?.DB_CONNECT_TIMEOUT || 60000
			});

			newconection.connect(function(errDB) {
			  if (errDB) {
			    console.error('error connecting: ', errDB);
			    err('error connecting: ' + errDB.stack);
			    return;
			  }

			  res(newconection);
			});
		}

	});
};

module.exports = {
	connection,
	createConnection
}