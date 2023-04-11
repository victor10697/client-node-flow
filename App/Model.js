require('dotenv').config();
const env = process.env;
const DB_CONNECTION = env.DB_CONNECTION ? env.DB_CONNECTION : 'mysql'; 

const Model = require('./Connection/'+DB_CONNECTION+'/Model')
module.exports = Model;