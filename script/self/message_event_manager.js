/*
 * message event manager
 *
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var pointer                    = require('./pointer');
var piece                      = require('../piece');
var scene;
var events; // should define in set_scene not here, or missing piece.other_local_down

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function eval_function() {}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {
	events = {
		piece_other_local_down: piece.other_local_down,
		piece_other_local_move: piece.other_local_move,
		piece_other_local_up: piece.other_local_up,
		pointer_other_local_down: pointer.other_local_down,
		pointer_other_local_move: pointer.other_local_move,
		pointer_other_local_up: pointer.other_local_up,
		eval_function: eval_function,
	};
	scene = sc;
	scene.message.add(function(mes) {
		if (mes === undefined) return;
		if (mes.data === undefined) return;
		if (mes.data.destination === undefined) return;
		if (events[mes.data.destination] === undefined) return;
		events[mes.data.destination](mes);
	});
}
module.exports.set_scene = set_scene;
