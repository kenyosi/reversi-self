/*
 * message event manager
 *
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
// var player                     = require('./player');
var scene;
var events = {
	// pointer_other_local_down: pointer.other_local_down,
	// pointer_other_local_move: pointer.other_local_move,
	// pointer_other_local_up: pointer.other_local_up,
	eval_function: eval_function,
	// get_piece: local_get_piece,
	// move_piece: local_move_piece,
	// place_piece: local_place_piece,
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function eval_function() {}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {
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
