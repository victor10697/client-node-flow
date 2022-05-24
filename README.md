
## Client Node Flow
## Authors

- [@brandliveco](https://github.com/victor10697/client-node-flow#readme)


## Arbol flujos de acción

Con esta libreria podemos hacer uso integraciones de tipo HTTP, procesamiento de datos, envios de correo, querys a bases de datos MYSQL, codificación y descodificación de Json Web Token, encryptación en MD5 y conexiones de SFTP.


## Instalación

Instalar proyecto con npm

```bash
  npm i client-node-flow-br
  cd my-project
```
    
## ¿Que podemos hacer?
    1. Consulta de acciones creadas
    2. Consulta de los tipos de acción creadas
    3. Entrada de datos a procesar por una fuente
    4. Creación de nodos de acción
    5. Creación de configuraciones generales
    6. Creación de fuentes de acción

## Variables del Sistema

| Nombre            | Descripción                                                        | Ejemplo                    |
| ----------------- | ------------------------------------------------------------------ | -------------------------- |
| returnEmpty   | Lo seteamos con true para retorna un objeto vacio dentro de la propiedad "scriptActionPrev" | "scriptActionPrev": "if(condition){returnEmpty=true;}" |
| input | Son los parametros que son enviados desde el cuerpo de la peticion puede ser de tipo Array, Objeto | {"pararm": "body"} |
| responsePrev | Es una varible que retorma una accion padre. El retorno puede ser de tipo Bool, String, Number, Object, Array | "scriptActionPrev": "console.log('responsePrev',responsePrev);" |
| responseNow | Es la respuesta de una acción actual. | "scriptActionPost": "console.log('responseNow',responseNow)" |
| returnAction | Esta opción la utilizamos cuando tenemos una acción de tipo action_type_process_data y es para es seteo de la respuesta final a esta procesamiento de informacion  | "functionProcessData": "returnAction= {'myObject': 'procesed'} " |
| errorHttp |  |  |
| errorData |  |  |
| errorEmail |  |  |
| $GLOBAL | Es un objeto donde almacenamos todas las respuestas de acciones anteriores. | "scriptActionPost": "console.log('Response name_nodo_action_1', $GLOBAL.name_nodo_action_1)" |

## Consulta de acciones creadas

Con este controlador podemos consultar las acciones que an sido creadas para todos los flujos de acción.

```bash
  const {ActionsController} = require('client-node-flow-br')
  
  // Consulta de todas las acciones creadas
  ActionsController.findAll((error,response)=>{
    if(error){
        console.log('error',error);
        return;
    }
    console.log('response',response);
  });

  // Eliminacion de una acción
  ActionsController.delete({params: {id:1}}, (error,response)=>{
    if(error){
        console.log('error',error);
        return;
    }
    console.log('response',response);
  });
```
## Consulta de los tipos de acción creadas

Con este controlador podemos consultar todos los tipos de acciones, eliminación y actualización.

```bash
  const {ActionsTypesController} = require('client-node-flow-br')
  
  // Consulta de todas las tipos acciones creadas
  ActionsTypesController.findAll((error,response)=>{
    if(error){
        console.log('error',error);
        return;
    }
    console.log('response',response);
  });

  // Eliminación de un tipo acción
  ActionsTypesController.delete({params: {id:1}}, (error,response)=>{
    if(error){
        console.log('error',error);
        return;
    }
    console.log('response',response);
  });

  // Actualización de un tipo acción
  ActionsTypesController.update({params: {id:1}}, (error,response)=>{
    if(error){
        console.log('error',error);
        return;
    }
    console.log('response',response);
  });
```
## Entrada de datos a procesar por una fuente

Aqui procesamos un flujo de acción y nos retorna la respuesta del flujo creado para esa fuente o integración. Esta es una de la funcionalidades de mayor utilidad porque es donde se hace el procesamiento de una fuente.

```bash
  const { InputsUpdatesController } = require('client-node-flow-br')
  
  /**
    * Estas son las variables requeridas para procesar una fuente
    * source_id (Int) --Requerido Es el id de la fuente ha procesar
    */
  let valuesNode={source_id:0, ...};

  InputsUpdatesController.insertInternal(valuesNode, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

## Creación de nodos de acción
Para la creació de un node de acción debemos tener presente que tenemos los siguientes tipos:
- action_type_http_request: Usado para consumo de servicios API REST.
- action_type_process_data: Usado para procesamiento de la data con el uso de lenguaje javascript.
- action_type_emails: Usado para el envio de action_type_emails.
- action_type_database_rds: Usado para conexión a bases de datos MYSQL y hacer querys.
- action_type_jwt: Usado para la encriptacion y desencriptación.
- action_type_md5: Usado para codificar un input en MD5.
- action_type_ssh2: Usado para conexiones SFTP eliminado, creacion y actualizacion de archivos y directorios.

Cuando desamos asignar una acción a un node podemos hacerlo de la siguiente manera:

#### action_type_http_request

Con estas configuraciones podemos consumir servicios de tipo API REST por deferentes tipos de metodos como lo son GET, POST, PATCH, DELETE, PUT tenemos la livertad de poder asignar cabeceras y podremos consumir la mayoria de los endpoint. Podemos tener una facilidad de integración con sistemas que usen esta tecnologia en sus sistemas.
```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_http_request", // tipo de acción a ejecutar.
            "url": "http://desarrollo.co", // endpoint de la petición
            "method": "GET", // Metodo de la petición
            "body": "{}", // JSON string con el objeto del cuerpo de la petición.
            "headers": {} // Cabeceras a usar en el endpoint.
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```
#### action_type_process_data

Con estas configuraciones podremos hacer un tratamiento de la nformación que nos retorna de un nodo o crear script para cumplir un objetivo especifico. Cuando ya tendagos lista nuesta respuesta usamos la variable returnAction el cual puede ser cualquier tipo de dato (Object, bool, String, Integer...), todo el proceso de logica lo manejamos en functionProcessData. 

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_process_data", // tipo de acción a ejecutar.
            "nameFuction": "name_function", // Nombre que identifica la funcion
            "functionProcessData": "returnAction= ('Hola mundo');" // Código javascript que hace la manipulación de la data y la retorna con la valirable rerurnAction.
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

#### action_type_emails

Con estas configuraciones podremos notificar via email a varios destinarios sobre alguna acción realizada y le pomemos definir la plantilla que vamos a enviar.

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_emails", // tipo de acción a ejecutar.
            "subject": "Código de acceso", // Asunto del correo
            "template": "Hola {responsePrev.name}, <br> Este es tu código de acceso <h3><strong>{responsePrev.code}</strong></h3>", // Plantilla HTML para el cuerpo del email
            "nameTypeEmail": "Prueba Email", // nombre del envio de email en el sistema
            "listEmails": "['desarrollo@gmail.com',responsePrev.userInfo.email]", // Lista destinarios podemos definir variables de nodos anteriores. 
            "MAIL_HOST": "smtp.desarrollo.com",// host de conexión
            "MAIL_PORT": 2525, // Puerto de conexión
            "MAIL_USERNAME": "SMTP_user", // Usuario de conexión
            "MAIL_PASSWORD": "SMTP_pass", // Contraseña de conexión
            "MAIL_ENCRYPTION": "tls", // Tipo de encriptación
            "MAIL_FROM_NAME": "From Name", Nombre Remitente
            "MAIL_MAILER": "",
            "MAIL_FROM_ADDRESS": "no-reply@midominio.co", // Centa de correo del remitente
            "emails": [] // Lista fija de correos a notificar
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

#### action_type_database_rds

Con estas configuraciones podremos realizar conexiones a base de datos Mysql para hacer querys.

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_database_rds", // tipo de acción a ejecutar.
            "query": "select * from mitabla where id=?;", // Este es el query de la consulta a la base da datos
            "valuesQuey": "[1]", // Son los valores de query que fueron asignados en el condicional ? se ponen en el orden de los condicionales
            "DB_CONNECTION": "mysql", // Es el driver de conexion habilitado
            "DB_HOST": "mihost.com.co", // Es el host donde esta alojado nuestro motor de base de datos
            "DB_PORT": 3306, // Este es el puerto de conexion a la base de datos
            "DB_DATABASE": "mibasededatos", // Este es el nombre de la base de datos a utulizar
            "DB_USERNAME": "miusuario", // Es el nombre de usuario de conexion a la base de datos
            "DB_PASSWORD": "micontraseña" // Es la contraseña de conexion a la base de datos
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

#### action_type_jwt

Con estas configuraciones podremos realizar encriptaciones y dessincrectaciones de objetos para sesion Json Web Token.

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_jwt", // tipo de acción a ejecutar.
            "secret": "secret", // Es la llave secreta de jwt
            "objectEncrypt": "{provider:desarrollo}", // Es un JSON.stringifi de un objeto ha encriptar
            "objectSettings": "{ algorithm: 'HS256', expiresIn: '1h' }", // Podemos asignar parametros de configuración
            "type": "sign" // Podemos deleccionar el tipo de acción encriptado o desencriptado sign|verify
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

#### action_type_md5

Con estas configuraciones podremos realizar encriptaciones en md5 de un string para una acción un input.

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_md5", // Tipo de accion MD5
            "secret": "secret", // Es el string concatenador al valor de ingreso que va ser encriptado
            "value": "input.code" // Es el string que va ser encriptado tomamos valiable de entrada o respuestas de una accion o usamos codigo javascript el return debe ser un string.
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```

#### action_type_ssh2

Con estas configuraciones podremos realizar conexiones a SFTP para realizar consultas de archivos de un direcctorio, mover archivos, eliminar, modificar o validar existentes.

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name", // Nombre del nodo
        "label": "Nombre visual del nodo.", // Nombre visual del nodo
        "sourceName": "Name de la fuente creada", // Nombre de la fuente que va contener el grupo de nodos
        "actionNode": {
            "name":"action_name", // Nombre de la acción
            "scriptActionPrev": "", // script antes de ajecutar una acción.
            "scriptActionPost": "", // script despues de ejecutar una acción.
            "action_type": "action_type_ssh2", // tipo de accion ss2 sftp
            "actionType": "readFile", // readFile|writeFile|appendFile|exists|rename|mkdir|rmdir|deleteFile|list|
            "objectConfig": "{host: 'myDomain', port: '22', username: 'userName', password: 'myPassword'}", // Son los parametros de conexion al servidor de SFTP
            "objectAction": "{path: '', pathFile: '/test/pending/'+responsePrev[0].filename, pathFileOld: '', pathFileNew: '', data: '', coding: 'utf8', opts:''}" // Es un JSON stringifi de los parametros de configuración para extraer o modificar un folder o archivo
        }
    }
  }, (err, res) => {
      if (error) {
        console.log(xerror);
        return;
      }
      console.log(response);
  });
```

## Creación de configuraciones generales

Aqui procesamos un flujo de acción y nos retorna la respuesta del flujo creado para esa fuente o integración. Esta es una de la funcionalidades de mayor utilidad porque es donde se hace el procesamiento de una fuente.

```bash
  const { InputsUpdatesController } = require('client-node-flow-br')
  
  /**
    * Estas son las variables requeridas para procesar una fuente
    * source_id (Int) --Requerido Es el id de la fuente ha procesar
    */
  let valuesNode={source_id:0, ...};

  InputsUpdatesController.insertInternal(valuesNode, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```
## Creación de fuentes de acción

Aqui procesamos un flujo de acción y nos retorna la respuesta del flujo creado para esa fuente o integración. Esta es una de la funcionalidades de mayor utilidad porque es donde se hace el procesamiento de una fuente.

```bash
  const { InputsUpdatesController } = require('client-node-flow-br')
  
  /**
    * Estas son las variables requeridas para procesar una fuente
    * source_id (Int) --Requerido Es el id de la fuente ha procesar
    */
  let valuesNode={source_id:0, ...};

  InputsUpdatesController.insertInternal(valuesNode, (err, res) => {
      if (error) {
        console.log(error);
        return;
      }
      console.log(response);
  });
```