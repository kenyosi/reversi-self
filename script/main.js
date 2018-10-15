/*
 * reversi@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var player                     = require('player');
var piece                      = require('piece');
var stack                      = require('object_group');
var wm                         = require('window_manager');
var set_inital_locations       = require('set_initial_locations');

player.init();

var cell_size_array            = [];
var i = 0;
while (i < 20) {
	cell_size_array[i] = i * conf.board.cell.size.x;
	i++;
}
var cell_size_x_m_1            = conf.board.cell.size.x - 1;
var cell_size_y_m_1            = conf.board.cell.size.y - 1;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function main() {
	var scene = new g.Scene({game: g.game, assetIds: ['reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo']});
	wm.set_scene(scene);
	stack.set_scene(scene);
	piece.set_scene(scene);
	scene.loaded.add(function () { // ev is for future use
		// Pile areas
		var pile_areas = [];
		var lines_in_pile = 2;
		var dx = cell_size_array[1];
		var dy = 4.0 * cell_size_array[1] + 12;
		var ii = 0;
		var flags = [[1, 0, 0, 0], [0, 1, 0, 0]];
		while(ii < conf.piece.bw_n * lines_in_pile) {
			var x_rem = ii % lines_in_pile;
			var nx    = (ii - x_rem) / lines_in_pile;
			pile_areas[ii] = new stack.objects(
				x_rem * dx + conf.pile_area.location.x0 + wm.view.position.x,
				nx * dy    + conf.pile_area.location.y0 + wm.view.position.y,
				conf.pile_area.location.width,
				conf.pile_area.location.height,
				conf.pile_area,
				flags[x_rem]
			);
			ii++;
		}
		piece.set_pile_areas(pile_areas);
		set_inital_locations.set_stack_objects(pile_areas);

		// Board area
		ii = 0;
		while (ii < conf.piece.n) {
			var xy = indTo2D(ii, conf.board.size.x);
			scene.append(
				createBoard(
					cell_size_array[xy[0]] + conf.board.location.x0 + wm.view.position.x,
					cell_size_array[xy[1]] + conf.board.location.y0 + wm.view.position.y,
					cell_size_x_m_1, cell_size_y_m_1, scene
				)
			);
			++ii;
		}

		// pieces in pile areas
		var pieces_pp      = conf.piece.n / conf.piece.bw_n;
		var pieces_in_line = pieces_pp / lines_in_pile;
		var x0            = cell_size_array[15] - 0.2 * cell_size_array[1];
		var y0            = cell_size_array[4] -6;
		dx            = 1 + cell_size_array[1];
		dy            = 6;
		var jj = 0;
		var index   = 0;
		while(jj < conf.piece.bw_n) {
			ii = 0;
			while(ii < pieces_pp) {
				var dp = indTo2D(ii, [pieces_in_line]);
				var details = {
					x: x0 + dp[1] * dx + wm.view.position.x,
					y: y0 - dp[0] * dy + wm.view.position.y,
					bw: jj,
					width: cell_size_x_m_1,
					height: cell_size_y_m_1,
					piece: {
						scene: scene,
						src: scene.assets['reversi_disk'],
						opacity: conf.piece.bw[jj].opacity,
						width: cell_size_x_m_1,
						height: cell_size_y_m_1,
						angle: conf.piece.bw[jj].in_pile.angle,
						srcX: conf.piece.bw[jj].on_board.srcX,
						srcY: 0,
						srcWidth: cell_size_x_m_1,
						srcHeight: cell_size_y_m_1,
					},
					initial: {
						index: index,
						piece: 0,
					},
				};
				var d = piece.create(details);
				index++;
				ii++;
			}
			y0 += 4.0 * cell_size_array[1] + 12;
			jj++;
		}
		jj = 0;
		while (jj < conf.players.max_players) {
			piece.last[jj] = d;
			jj++;
		}

		var initial_piece_locations = [];
		ii = conf.piece.n - 1;
		while (ii >= 0) {
			dp = indTo2D(ii, conf.pile_area.max_pieces);
			var pp = scene.children[piece.index[ii]];
			pile_areas[dp[1]].set_piece(pp, false, false);
			initial_piece_locations[ii] = {x: pp.x, y: pp.y, tag: pp.tag};
			--ii;
		}
		//Store initial piece locations and BW for restarting game
		set_inital_locations.set_initial_object_locations(initial_piece_locations);

		// Create window manager
		scene.setTimeout(function() {wm.create();}, 100);
	});
	g.game.pushScene(scene);
}
module.exports = main;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function indTo2D(ii, dim) {
	var cood = [];
	cood[0] = ii % dim;
	cood[1] = (ii -  cood[0]) / dim;
	return cood;
}

function createBoard(x, y, w, h, scene) {
	return new g.FilledRect({
		scene: scene,
		cssColor: conf.default_label.cssColor,
		opacity: conf.default_label.opacity,
		x: x,
		y: y,
		width: w,
		height: h
	});
}
