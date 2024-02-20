const LoginsAuthorizationsModel = require('../../Models/LoginsAuthorizationsModel')
const InputsUpdatesModel = require('../../Models/InputsUpdatesModel')
const env = process.env

/**
 * Metodo para limpieza de datos basura
 * @param (Request Http) req -- Variables de la peticion
 * @param (Response Http) res -- Respuesta de la peticion
 */
 exports.clearDataBases = async (req, res, fncallback) => {
    try{
        if(env?.DB_CONNECTION === 'mysql2' || env?.DB_CONNECTION === 'mysql'){
            const truncateLoginsAuthorizationsModel= await LoginsAuthorizationsModel.truncate();
            console.log('truncateLoginsAuthorizationsModel', truncateLoginsAuthorizationsModel);
            const truncateInputsUpdatesModel= await InputsUpdatesModel.truncate();
            console.log('truncateInputsUpdatesModel', truncateInputsUpdatesModel);
            if (typeof fncallback === 'function') { fncallback();}
        }

        res.status(200).json({ 'state': 'success' })
    }catch (eerr) {
        res.status(401).json({ 'state': 'error', error: eerr })
    }
}

/**
 * Metodo para cerrar conexion base de datos
 */
 exports.closeConnection = () => {
    LoginsAuthorizationsModel.closeConnection((response)=>{
        console.log(response);
    });
}