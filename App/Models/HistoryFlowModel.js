const Model = require('../Model')

function HistoryFlowModel() {
	Model.call(this)
	this.tableName = 'history_flow'
}
HistoryFlowModel.prototype = new Model()

HistoryFlowModel.prototype.insert=(data, callback)=>{
	// borrar toda la funcion para guardar historial
};

const getQueryHistory= (req)=>{
	let w='', 
		hoy= new Date()
		dia= hoy.getDay(),
		mes= hoy.getMonth(),
		anio= hoy.getFullYear();
		mes= (parseInt(mes)+1);
		mes= mes < 10 ? '0'+mes : mes;
		fecha= `${anio}-${mes}-${dia}`;
		params= [];

	w+= ` AND DATE(history_flow.created_at) = ?`;
	if(req.query.createdAt && req.query.createdAt != ''){
		params.push(req.query.createdAt);
	}else{
		params.push(fecha);
	}
	if(req.query.searchInput && req.query.searchInput != ''){
		w+= ` AND inp.bodyRequest LIKE ?`;
		params.push(`%${req.query.searchInput}%`);
	}
	if(req.query.inputStatus && req.query.inputStatus != ''){
		w+= ` AND inp.processStatus= ?`;
		params.push(req.query.inputStatus);
	}
	return {where:w,params:params};
};

HistoryFlowModel.prototype.selectHistory= function(req, callback){
	let w= getQueryHistory(req);
	const statement =  `SELECT 
							node.name as node_name,
							node.label as node_label,
							act.name as action_name,
							sour.name as source,
							sour.key as source_key,
							inp.bodyRequest as input,
							inp.processStatus as input_status,
							history_flow.request,
							history_flow.response,
							history_flow.error,
							history_flow.created_at 
						FROM 
							history_flow
							INNER JOIN inputs_updates AS inp
								ON inp.id = history_flow.inputs_updates_id
							INNER JOIN actions AS act
								ON act.id = history_flow.actions_id
							INNER JOIN nodes_flows AS node
								ON node.id = act.nodes_flows_id
							INNER JOIN sources AS sour
								ON sour.id = node.sources_id
						WHERE 
							history_flow.deleted=? AND 
							history_flow.actived=? AND
							inp.source_id=? 
							${w.where}`;
	this.dbConnection.query(statement, [0,1,req.params.source_id].concat(w.params), (err, res) => {
		if (err) {console.log(err);
			callback(err, [])
			return
		}

		callback(null, res)
	})
}

module.exports = new HistoryFlowModel()