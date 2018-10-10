/*
 * Set initial locations
 * reversi@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var wm                         = require('window_manager');
var pointer                    = require('pointer');
var piece                      = require('piece');
var stack_objects;

var initial_object_locations = [];
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_stack_objects(obj) { stack_objects = obj;}
module.exports.set_stack_objects = set_stack_objects;
function set_initial_object_locations(obj) {initial_object_locations = obj;}
module.exports.set_initial_object_locations = set_initial_object_locations;

function pieces (scene) {
	// move_view(-view.position.x, -view.position.y); // reset view
	// Initialize all semaphoes
	var jj = 0;
	while (jj < conf.players.max_players) {
		wm.player_operations[jj].set_value(conf.window.max_multi_operation); // inital value
		pointer.pointers_pressed[jj].set_value(0); // inital value
		var ii = 0;
		var length_status = piece.status.length;
		while (ii < length_status) {
			var gid = piece.disk_id[ii];
			piece.status[gid].pointdown.processed[jj].set_value(0);
			ii++;
		}
		jj++;
	}
	// Create empty pile areas
	var length_stack_objects = stack_objects.length;
	for (var i = 0; i < length_stack_objects; i++) stack_objects[i].disk_id = [];
	// Restore initial location and black and white
	ii = 0;
	while(ii < conf.disk.n) {
		var pp = scene.children[piece.index[ii]];
		var pv = initial_object_locations[ii];
		pp.x   = pv.x;
		pp.y   = pv.y;
		pp.tag = pv.tag;
		wm.draw_modified(pp.children[0], conf.disk.unselect.background);
		//Fill disks in pile areas
		var dp = indTo2D(ii, [conf.pile_area.max_disks]);
		stack_objects[dp[1]].set_disk(pp, false, false);
		ii++;
	}
}
module.exports.pieces = pieces;

function indTo2D(ii, dim) {
	var cood = [];
	cood[0] = ii % dim;
	cood[1] = (ii -  cood[0]) / dim;
	return cood;
}
