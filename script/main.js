/*
 * reversi@self
 * Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('./content_config');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var piece                      = require('./piece');
var stack                      = require('./object_group');
var set_inital_locations       = require('./set_initial_locations');
var wm                         = require('./self/window_manager');

var cs = conf.cell.array;
var csm1 = conf.cell.unit_m1;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function main() {
	wm.init();
	var scene = new g.Scene({game: g.game, assetIds:
		['reversi_disk', 'window_manager_icons', 'help_screen', 'help_screen_solo']
	});
	wm.set_scene(scene);
	stack.set_scene(scene);
	piece.set_scene(scene);
	scene.loaded.add(function () {
		// local view points
		var player_index = -1;
		// wm.local_scene_player[player_index].set_local_zero({x: +20.0, y: -10.0});
		// wm.local_scene_player[player_index].set_scale({x: 0.5, y: 0.5});
		// wm.local_scene_player[player_index].set_angle(2.0 * Math.PI / 8.0);
		// wm.local_scene_player[player_index].set_local_scene();

		// Pile areas
		var pile_areas = [];
		var lines_in_pile = 2;
		var dx = cs[1];
		var dy = cs[4] + 12;
		var ii = 0;
		var flags = [[1, 0, 0, 0], [0, 1, 0, 0]];
		while(ii < conf.piece.bw_n * lines_in_pile) {
			var x_rem = ii % lines_in_pile;
			var nx    = (ii - x_rem) / lines_in_pile;
			var details = {
				x: x_rem * dx + conf.pile_area.location.x0 + wm.view.position.x,
				y: nx * dy    + conf.pile_area.location.y0 + wm.view.position.y,
				width: conf.pile_area.location.width,
				height: conf.pile_area.location.height,
				background: {
					cssColor: conf.pile_area.background.cssColor,
					opacity: conf.pile_area.background.opacity,
				},
			};
			pile_areas[ii] = new stack.objects(details, flags[x_rem]);
			ii++;
		}
		piece.set_pile_areas(pile_areas);
		set_inital_locations.set_stack_objects(pile_areas);

		// Board area
		ii = 0;
		while (ii < conf.piece.n) {
			var xy_index = indTo2D(ii, conf.board.size.x);
			var xywh = {
				x: cs[xy_index[0]] + conf.board.location.x0 + wm.view.position.x, 
				y: cs[xy_index[1]] + conf.board.location.y0 + wm.view.position.y,
				width: csm1.x,
				height: csm1.y
			};
			var b = createBoard(xywh, player_index, scene);
			scene.append(b);
			++ii;
		}

		// pieces in pile areas
		var pieces_pp      = conf.piece.n / conf.piece.bw_n;
		var pieces_in_line = pieces_pp / lines_in_pile;
		// var x0            = cs[15] - 0.2 * cs[1];
		var x0            = cs[10] - 0.2 * cs[1];
		var y0            = cs[4] - 6;
		dx            = 1 + cs[1];
		dy            = 6;
		var jj = 0;
		var index   = 0;
		while(jj < conf.piece.bw_n) {
			ii = 0;
			while(ii < pieces_pp) {
				var dp = indTo2D(ii, [pieces_in_line]);
				details = {
					x: x0 + dp[1] * dx + wm.view.position.x,
					y: y0 - dp[0] * dy + wm.view.position.y,
					bw: jj,
					width: csm1.x,
					height: csm1.y,
					piece: {
						scene: scene,
						src: scene.assets['reversi_disk'],
						opacity: conf.piece.bw[jj].opacity,
						width: csm1.x,
						height: csm1.y,
						angle: conf.piece.bw[jj].in_pile.angle,
						srcX: conf.piece.bw[jj].on_board.srcX,
						srcY: 0,
						srcWidth: csm1.x,
						srcHeight: csm1.y,
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
			y0 += cs[4] + 12;
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

function createBoard(p, player_index, scene) {
	var local_p = wm.local_scene_player[player_index].forward_xy(p);
	var local_scene = wm.local_scene_player[player_index];
	return new g.FilledRect({
		scene: scene,
		cssColor: conf.default_label.cssColor,
		opacity: conf.default_label.opacity,
		x: local_p.x,
		y: local_p.y,
		// x: local_p.x - (1.0 - local_scene.scale.x) * p.width / 2.0,
		// y: local_p.y - (1.0 - local_scene.scale.y) * p.height / 2.0,
		// width: local_scene.scale.x * p.width,
		// height: local_scene.scale.y * p.height,
		width: p.width,
		height: p.height,
		angle: local_scene.angle360,
		scaleX: local_scene.scale.x,
		scaleY: local_scene.scale.y,
		tag: {
			global: p
		}
	});
}
