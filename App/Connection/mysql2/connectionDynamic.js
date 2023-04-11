const mysql = require('mysql2')
// Parámetros de conexión con la base de datos MySQL (ver archivo .env)
const connection = ({
    host= 'localhost',
    port='3306',
    database= '',
    user='root',
    password='',
    statement= '',
    values= []
}, callback)=>{
    let paramsConexion = {
        host: host,
        port: port,
        database: database,
        user: user,
        password: password
    }
    let conetion=mysql.createConnection(paramsConexion);
    conetion.query(statement, values, (errRDS, resRDS) => {
        if (errRDS) {
            callback(null, errRDS)
            return
        }else{
            callback(null, resRDS)
            return
        }
    }) 
}

module.exports = connection