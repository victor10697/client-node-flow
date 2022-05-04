const { Client } = require('ssh2');

/**
 * Crea coneccion sftp para hacer manipulaciones en directorios remotos 
 * @autor Victor Garcia
 * @param config - Son los parametros de confiuracion de conexion al SFTP
 * @return Object - Objeto con todos los metodos disponibles
 **/
const conectionSFTP=(config={})=>{
  let _this= {};

  /**
   * Metodo para obtener contenido de un archivo almacenado en un directorio SFTP
   * @param pathFile (String) es la ruta del archivo a obtener contenido
   * @param coding (String) tipo de codificacion del contenido
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.readFile= ({pathFile='', coding='utf8'}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.readFile(pathFile, coding, (err, text) => {
          if (err){
            conn.end();
            callback('error path', null);
            return false;
          }
          conn.end();
          callback(null, text);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo para escribir contenido de un archivo almacenado en un directorio SFTP
   * @param pathFile (String) es la ruta del archivo a obtener contenido
   * @param coding (String) tipo de codificacion del contenido
   * @param data (String) data a escribir sobre el archivo
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.writeFile= ({pathFile='', data='', coding='utf8'}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.writeFile(pathFile, data, coding, (err, text) => {
          if (err){
            conn.end();
            callback('error path', null);
            return false;
          }
          conn.end();
          callback(null, text);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo para agregar contenido de un archivo almacenado en un directorio SFTP
   * @param pathFile (String) es la ruta del archivo a obtener contenido
   * @param coding (String) tipo de codificacion del contenido
   * @param data (String) data a escribir sobre el archivo
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.appendFile= ({pathFile='', data='', coding='utf8'}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.appendFile(pathFile, data, coding, (err) => {
          if (err){
            conn.end();
            callback('error path', null);
            return false;
          }
          conn.end();
          callback(null, 'Successfully append!');
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo para validar si existe un archivo almacenado en un directorio SFTP
   * @param pathFile (String) es la ruta del archivo a obtener contenido
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.exists= ({pathFile=''}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.exists(pathFile, (res) => {
          conn.end();
          callback(null, res);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo renombrar archivos de un SFTP
   * @param pathFileOld (String) es la ruta del archivo nombre antiguo
   * @param pathFileNew (String) es la ruta del archivo nombre nuevo
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.rename= ({pathFileOld='', pathFileNew=''}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.rename(pathFileOld, pathFileNew, (res) => {
          conn.end();
          callback(null, res);
          return true;
        });
      });
    }).connect(config);
  }
  
  /**
   * Metodo crear un directorio sobre un SFTP
   * @param path (String) es la ruta de la carpeta y nombre
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.mkdir= ({path=''}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.mkdir(path, (res) => {
          conn.end();
          callback(null, res);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo eliminar un directorio sobre un SFTP
   * @param path (String) es la ruta de la carpeta y nombre
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.rmdir= ({path=''}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.rmdir(path, (res) => {
          conn.end();
          callback(null, res);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo eliminar un archivo sobre un SFTP
   * @param pathFile (String) es la ruta de la carpeta y nombre
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.deleteFile= ({pathFile=''}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.unlink(pathFile, (res) => {
          conn.end();
          callback(null, 'File deleted!');
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo listar lo que contiene un directorio sobre el sftp
   * @param path (String) es la ruta del directorio
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.list= ({path='', opts=null}, callback)=>{
    const conn = new Client();
    conn.on('ready', () => {
      conn.sftp((err, sftp) => { 
        if (err){
          conn.end();
          callback('error conection', null);
          return false;
        }

        sftp.readdir(path, opts, (err, list) => {
          if (err){
            conn.end();
            callback('error path', null);
            return false;
          }
          conn.end();
          callback(null, list);
          return true;
        });
      });
    }).connect(config);
  }

  /**
   * Metodo listar lo que contiene un directorio sobre el sftp
   * @param path (String) es la ruta del directorio
   * @param callback (Function) metodo de respuesta al proceso sobre el sftp devuenve un error y response
   **/
  _this.startAction= (type='', opts={}, callback)=>{
    if(type!='' && typeof opts == 'object' && Object.keys(opts).length > 0){
      if(typeof _this[type] == 'function'){
        _this[type](opts, (err,res)=>{
          if(err){
            callback(err, null);
            return false;
          }else{
            callback(null, res);
            return true;
          }
        })
      }else{
        callback('error type request!', null);
        return false;
      }
    }else{
      callback('error request!', null);
      return false;
    }
  }

  return _this;
}

/*
  Variables configuracion (objectConfig)
  {
    host: -- host de servidor
    port: -- puerto de conexion
    username: -- usuario de accesso al servidor
    privateKey: -- llave privada del servidor
    password: -- contraseña conexion sftp
  }

  Variables accion plugins (objectAction)
  {
    path: -- es la ruta o directorio en el servidor de sfttp
    pathFile: -- es el directorio con el nombre del archivo a manipular
    pathFileOld: -- nombre actual de un archivo a ser renombrado
    pathFileNew: -- nuevo nombre de un archivo a ser renombrado
    data: -- es el contendo interno de un archivo
    coding: -- codificacion de un contenido de un archivo
    opts: -- Opciones filtros listar
  }

  Opciones de accion
  - list -- Listar archivos y carpetas
  - deleteFile -- Eliminar un archivo
  - rmdir -- Eliminar carpeta
  - mkdir -- Crear una carpeta
  - rename -- Renombrar un archivo
  - exists -- validar si existe un directorio
  - appendFile -- agregar contenido dentro de un archivo
  - writeFile -- escribir contenido dentro de un archivo
  - readFile -- Leer contenido de un archivo
*/
module.exports = {conectionSFTP:conectionSFTP};