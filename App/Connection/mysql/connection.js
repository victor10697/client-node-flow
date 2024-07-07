const mysql = require('mysql')
// Referencia a las variables definidas en el archivo .env
const env = process.env;
const connectionGlobal= env?.DB_CONNECTION_GLOBAL && (env?.DB_CONNECTION_GLOBAL=== 'OFF' || env?.DB_CONNECTION_GLOBAL==='off') ? false : true;

// Parámetros de conexión con la base de datos MySQL (ver archivo .env)
var connection = null;
if(connectionGlobal === true){
	console.info('connectionGlobal success');
	if(env?.DB_CONNECTION_POOL && (env?.DB_CONNECTION_POOL=== true  || env?.DB_CONNECTION_POOL=== 'TRUE' || env?.DB_CONNECTION_POOL=== 'true')){
		connection = mysql.createPool({
			host: env?.DB_HOST || 'localhost',
			port: env?.DB_PORT || '3306',
			database: env?.DB_DATABASE || '',
			user: env?.DB_USERNAME || 'root',
			password: env?.DB_PASSWORD || '',
			connectTimeout: parseInt(env?.DB_CONNECT_TIMEOUT) || 30000,
			connectionLimit: parseInt(env?.DB_CONNECTION_LIMIT) || 100
		});
	}else{
		connection = mysql.createConnection({
			host: env?.DB_HOST || 'localhost',
			port: env?.DB_PORT || '3306',
			database: env?.DB_DATABASE || '',
			user: env?.DB_USERNAME || 'root',
			password: env?.DB_PASSWORD || '',
			connectTimeout: parseInt(env?.DB_CONNECT_TIMEOUT) || 30000
		});

		connection.connect(function(errDB) {
		  if (errDB) {
		    console.error('error connecting: ', 'error connecting: ' + errDB.stack,  errDB);
		    connection= null;
		  }else{
		  	console.info('createConnection success');
		  }
		});
	}
}else{
	console.info('connectionGlobal off');
}

const reconnectiondbGlobal= function(){
	if(connectionGlobal === true){
		console.info('reconnectiondbGlobal');
		createConnection({
			host: env?.DB_HOST || 'localhost',
			port: env?.DB_PORT || '3306',
			database: env?.DB_DATABASE || '',
			user: env?.DB_USERNAME || 'root',
			password: env?.DB_PASSWORD || '',
			connectTimeout: parseInt(env?.DB_CONNECT_TIMEOUT) || 30000
		}).then(res=>{connection=res;}).catch(err=>(console.error(err)));
	}
};

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
				connectTimeout: params?.DB_CONNECT_TIMEOUT || parseInt(env?.DB_CONNECT_TIMEOUT) || 30000,
				connectionLimit: params?.DB_CONNECTION_LIMIT || parseInt(env?.DB_CONNECTION_LIMIT) || 100
			});
			console.info('createConnection pool success');
			res(newconection);
		}else{
			newconection = mysql.createConnection({
				host: params?.DB_HOST || env?.DB_HOST || 'localhost',
				port: params?.DB_PORT || env?.DB_PORT || '3306',
				database: params?.DB_DATABASE || env?.DB_DATABASE || '',
				user: params?.DB_USERNAME || env?.DB_USERNAME || 'root',
				password: params?.DB_PASSWORD || env?.DB_PASSWORD || '',
				connectTimeout: params?.DB_CONNECT_TIMEOUT || parseInt(env?.DB_CONNECT_TIMEOUT) || 30000
			});

			newconection.connect(function(errDB) {
			  if (errDB) {
			    console.error('error connecting: ', errDB);
			    res(null);
			    return;
			  }
			  console.info('createConnection success');
			  res(newconection);
			});
		}

	});
};

module.exports = {
	connection,
	createConnection,
	reconnectiondbGlobal
}