/*
 * Configuration file
 * reversi@self
 * Akashic content
 */
////////////////////////////////////////////////////////////////////////////////////////////
// Constants
////////////////////////////////////////////////////////////////////////////////////////////
var current_time = 0; // set as game.age is zero, replaced with new Date().getTime();

var constant = {
	month_length:     30 * 24 * 60 * 60 * g.game.fps, // 30 * 24 * 60 * 60 second in frame number
	old_time:        -30 * 24 * 60 * 60 * g.game.fps, //
	random_seed_number: current_time,                 // 0 for development
	unit: {x: 32, y: 32, width: 32, height: 32},
};
module.exports.const = constant;

var cell = {
	array: [],
	unit_m1: {x: constant.unit.x - 1, y: constant.unit.y - 1,
		width: constant.unit.width - 1, height: constant.unit.height - 1}
};
var i = 0;
while(i < 20) {// [0, 1 * size, 2 * size, ...]
	cell.array[i] = i * constant.unit.x;
	i++;
}
module.exports.cell = cell;
var cs = cell.array; // cell size array

////////////////////////////////////////////////////////////////////////////////////////////
// Game specific
////////////////////////////////////////////////////////////////////////////////////////////
// Board
var board = {
	an: { // algebraic notation
		x: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
		y: ['1', '2', '3', '4', '5', '6', '7', '8'],
	},
	size: {x: 8, y: 8},
	cell: {
		size: {x: constant.unit.x, y: constant.unit.y},
		properies:{cssColor: 'green' , opacity: 0.5},
	},
	location : {
		x0:     cs[6],
		y0:     cs[1],
		width:  cs[8],
		height: cs[8],
	},
};
module.exports.board = board;

var pile_area = {
	max_pieces: 16,
	background: {cssColor: 'black',   opacity: 0.75},
	location : {
		x0:     cs[15] - 0.2 * cs[1],
		y0:     cs[1],
		width:  cs[1],
		height: cs[3]  + 0.5 * cs[1],
	},
};
module.exports.pile_area = pile_area;

// Piece
var view_angle    = 10;
var piece = {
	n: 64,
	bw_n: 2,
	unselect: {
		background: {cssColor: 'gray',   opacity: 0.0},
	},
	bw: [
		{// white
			opacity: 1.0,
			on_board: {srcX: cs[0], angle: view_angle, opacity: 1.0},
			transit: [
				{srcX: cs[5], angle:  -45 + view_angle},
				{srcX: cs[4], angle:  -45 + view_angle},
				{srcX: cs[3], angle:  -45 + view_angle},
				{srcX: cs[2], angle: -225 + view_angle},
				{srcX: cs[1], angle: -225 + view_angle}
			],
			in_pile: {srcX: cs[2], angle: 270},
			transit_in_pile: [
				{srcX: cs[1], angle: 270}
			],
			transit_time: 200 / 4
		},
		{// black
			opacity: 1.0,
			on_board: {srcX: cs[6], angle: view_angle, opacity: 1.0,},
			transit: [
				{srcX: cs[1], angle:  -45 + view_angle},
				{srcX: cs[2], angle:  -45 + view_angle},
				{srcX: cs[3], angle: -225 + view_angle},
				{srcX: cs[4], angle: -225 + view_angle},
				{srcX: cs[5], angle: -225 + view_angle}
			],
			in_pile: {'srcX': cs[4], 'angle': 270},
			transit_in_pile: [
				{srcX: cs[5], angle: 270}
			],
			transit_time: 200 / 4
		}
	],
};
module.exports.piece = piece;

var game_icon = {
	destruct:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0,  srcY: 0, opacity: 0.80},
			on:  {srcX: 0,  srcY: 0, opacity: 0.80},
		},
	},
};
module.exports.game_icon = game_icon;

////////////////////////////////////////////////////////////////////////////////////////////
// Common, @self
////////////////////////////////////////////////////////////////////////////////////////////

// Players
var local_feature = false;
module.exports.players = {
	max_players: 2,
	admin : [true, false, false, false],
	default: [
		{id: '-9999', name: '', head: 'Player1: 参加中', timestamp: constant.old_unix_time, time_warning: 0, player_plate: 0, player_plate_status: 0, login: false, group: 'admin'},
		{id: '-9999', name: '', head: 'Player2: 募集します', timestamp: constant.old_unix_time, time_warning: 0, player_plate: 0, player_plate_status: 0, login: false, group: 'user'},
		{id: '-9999', name: '', head: 'Player3: 募集します', timestamp: constant.old_unix_time, time_warning: 0, player_plate: 0, player_plate_status: 0, login: false, group: 'user'},
		{id: '-9999', name: '', head: 'Player4: 募集します', timestamp: constant.old_unix_time, time_warning: 0, player_plate: 0, player_plate_status: 0, login: false, group: 'user'},
	],
	window_pointer: [
		{text: 'P1', x: cs[15] + 8, y: cs[1] + 14, width: cs[2], height: cs[2], fontSize: 30, textColor: '#0062ff',
			arrow:{srcX:  1, srcY: 130, width: 12, height: 12}, local: local_feature,
		},
		{text: 'P2', x: cs[15] + 8, y: cs[5] + 27, width: cs[2], height: cs[2], fontSize: 30, textColor: '#ff0000',
			arrow:{srcX: 17, srcY: 130, width: 12, height: 12}, local: local_feature,
		},
		{text: 'P3', x: cs[10] + 8, y: cs[5] + 27, width: cs[2], height: cs[2], fontSize: 30, textColor: '#00ff00',
			arrow:{srcX: 33, srcY: 130, width: 12, height: 12}, local: local_feature,
		},
		{text: 'P4', x: cs[08] + 8, y: cs[5] + 27, width: cs[2], height: cs[2], fontSize: 30, textColor: '#ff00ff',
			arrow:{srcX: 49, srcY: 130, width: 12, height: 12}, local: local_feature,
		},
	],
	cell: {
		state: {
			size: {x: 2, y: 2},
			time: 1.0 * g.game.fps,
		},
	},
	item: {
		operating: [
			{cssColor: '#0062ff',   opacity: 1.0}, //P0
			{cssColor: '#ff0000',   opacity: 1.0}, //P1
			{cssColor: '#00ff00',   opacity: 1.0}, //P2
			{cssColor: '#ff00ff',   opacity: 1.0}, //P3
		],
		waiting: [
			{cssColor: '#0062ff',   opacity: 0.5}, //P0
			{cssColor: '#ff0000',   opacity: 0.5}, //P1
			{cssColor: '#00ff00',   opacity: 0.5}, //P2
			{cssColor: '#ff00ff',   opacity: 0.5}, //P3
		],
	},
	time: {
		life:   constant.month_length, // no logout
		warning:    constant.month_length - 40,
	},
};

////////////////////////////////////////////////////////////////////////////////////////////
// Help board
var help_board = {
	height: g.game.height,
	width: g.game.width,
	scroll_height: g.game.height,
	label: {
		cssColor: 'black',
		opacity: 0.60,
	},
	background: {
		cssColor: '#CCCCCC',
		opacity: 0.85,
	},
	text: [
		{x: 20, y:  20, font_size: 16, s: '遊び方'},
		{x: 20, y:  48, font_size: 12, s: '駒はドラッグ&ドロップで置きます'},
		{x: 20, y:  60, font_size: 12, s: 'タップすると白黒反転します'},
		{x: 20, y:  82, font_size: 12, s: 'Player1は配信者さん'},
		{x: 20, y:  94, font_size: 12, s: 'Player2は駒を最初に触った視聴者さんです'},
		{x: 20, y: 106, font_size: 12, s: '右の中央にプレイヤーの最初の2文字を表示します'},
		{x: 20, y: 128, font_size: 12, s: '自分の名前をスワイプすると退席します'},
		{x: 20, y: 140, font_size: 12, s: '3分間駒を動かさないと退席します'},
		{x: 20, y: 162, font_size: 12, s: 'アイコン'},
		{x: 20, y: 174, font_size: 12, s: '[□] 視点移動/固定、[？] ヘルプ表示/非表示'},
		{x: 20, y: 188, font_size: 12, s: ''},
		{x: 20, y: 208, font_size: 12, s: 'このボタンを押すと盤をひっくり返します'},
		{x: 20, y: 210, font_size: 12, s: ''},
	],
};
module.exports.help_board = help_board;

////////////////////////////////////////////////////////////////////////////////////////////
// confirm board
var window_manager_confirm = {
	height: 32 * 3,
	width: 32 * 5,
	label: {
		cssColor: 'black',
		opacity: 1.0,
	},
	background: {
		cssColor: '#CCCCCC',
		opacity: 1.0,
	},
	text: [
		{x: 4, y:  0  + 14, font_size: 12, s: 'Player2、退席します'},
		{x: 4, y:  32 + 2, font_size: 12, s: 'よろしいですか？'},
	],
};
module.exports.window_manager_confirm = window_manager_confirm;

////////////////////////////////////////////////////////////////////////////////////////////
// Comment
var comment = {
	que:{size: 128},
	speed: 2,
	lines: 8,
	y0: cs[8] + 5,
	properies: {
		fontSize: 16,
		cssColor: 'white',
		opacity: 1.0,
		strokeColor: 'black',
		strokeWidth: 0.33
	},
};
module.exports.comment = comment;

////////////////////////////////////////////////////////////////////////////////////////////
// Window manager

module.exports.status_bar = {
	text: [
		'Testing message'
	],
	x: cs[6],
	y: g.game.height - cs[1],
	width: cs[11],
	height: cs[1],
	background : {
		off: {cssColor: '#FFFFFF',   opacity: 0.5}
	}
};

var window = {
	max_prevDelta: cs[2] * cs[2], // per frame
	max_pointers: 16,             // per player
	max_multi_operation: 1,       // per player
};
module.exports.window = window;

var window_icon = {
	zoom:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0,  srcY: 32, opacity: 0.80},
			on:  {srcX: 32, srcY: 32, opacity: 0.80},
		},
		local: false,
	},
	camera:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0,  srcY: 0, opacity: 0.80},
			on:  {srcX: 32, srcY: 0, opacity: 0.80},
		},
		local: false,
	},
	login:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0,  srcY: 32, opacity: 0.80},
			on:  {srcX: 32, srcY: 32, opacity: 0.80},
		},
		local: false,
	},
	admin:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0,  srcY: 64, opacity: 0.80},
			on:  {srcX: 32, srcY: 64, opacity: 0.80},
		},
		local: false,
	},
	help:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 32, srcY: 96, opacity: 0.80},
			on:  {srcX: 32, srcY: 96, opacity: 0.80},
		},
		local: true,
	},
	restart_game:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0, srcY: 96, opacity: 0.80},
			on:  {srcX: 0, srcY: 96, opacity: 0.80},
		},
		local: false,
	},
	yes:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 0, srcY: 96, opacity: 0.80},
			on:  {srcX: 0, srcY: 96, opacity: 0.80},
		},
	},
	no:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.80},
			on:  {cssColor: 'yellow',  opacity: 0.80},
		},
		icon:{
			off: {srcX: 32, srcY: 96, opacity: 0.80},
			on:  {srcX: 32, srcY: 96, opacity: 0.80},
		},
	},
	pointer:{
		background:{
			off: {cssColor: '#DDDDDD', opacity: 0.8},
			on:  {cssColor: 'white',  opacity: 0.8},
			operation_off: {cssColor: '#FFFF88', opacity: 0.8},
			operation_on:  {cssColor: '#FFFF00',  opacity: 0.8},
		},
	},
};
module.exports.window_icon = window_icon;

////////////////////////////////////////////////////////////////////////////////////////////
// Button
var default_button = {
	cssColor: 'green',
	opacity: 0.5,
};
module.exports.default_button = default_button;

////////////////////////////////////////////////////////////////////////////////////////////
// Fonts
var default_label = {
	fontSize: 12,
	cssColor: default_button.cssColor,
	opacity: default_button.opacity,
};
module.exports.default_label = default_label;

var here_font = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: default_label.fontSize,
});
module.exports.default_font = here_font;

var comment_font = new g.DynamicFont({
	game: g.game,
	fontFamily: g.FontFamily.SansSerif,
	fontWeight: 1,
	size: comment.properies.fontSize,
	fontColor: comment.properies.cssColor,
	strokeColor: comment.properies.strokeColor,
	strokeWidth: comment.properies.strokeWidth,
});
module.exports.comment_font = comment_font;
