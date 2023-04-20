const Model = require('../Model')

function HistoryFlowModel() {
	Model.call(this)
	this.tableName = 'history_flow'
}
HistoryFlowModel.prototype = new Model()

HistoryFlowModel.prototype.insert=(data, callback)=>{
	// borrar toda la funcion para guardar historial
};

module.exports = new HistoryFlowModel()