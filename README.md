
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

```bash
  const {NodesFlowsController} = require('client-node-flow-br') 
  
  NodesFlowsController.create({
    body:{
        "name": "nodo_name",
        "label": "Nombre visual del nodo.",
        "sourceName": "Name de la fuente creada",
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