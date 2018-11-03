/*
 * User pointer
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var conf                       = require('../content_config');
var que_length                 = 5   * g.game.fps;
var start_in_hurry             = 0.1 * g.game.fps;
var timeout_delta_frame        = 3   * g.game.fps;
var drpf                       = 7; // delta radius per frame for creating animation in que
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var player                     = require('./player');
var wm                         = require('./window_manager');
var process                    = require('./process');
var scene;
var player_pointer = [];
var initial_pointer_id = [];
var pointers_pressed = [];

var ii = 0;
while (ii < conf.players.max_players) {
	player_pointer[ii] = [];
	initial_pointer_id[ii] = 0;
	pointers_pressed[ii] = new process.semaphore(0);
	ii++;
}
module.exports.initial_pointer_id = initial_pointer_id;
module.exports.pointers_pressed = pointers_pressed;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) {
	scene = sc;
	scene.pointDownCapture.add(function (ev) {
		var message = common_point_event(ev);
		if (message === false) return;
		var index = message.index;
		var user = player_pointer[index.player][index.pointer];
		if(user.pointer.tag.pointer_pressed) return; // check if pointer is already pressed.
		//<--- development
		var ev_sync = wm.local_scene_player[index.player].point_inverse_down(ev);
		// down(index, ev_sync);
		fire_other_local('pointer_other_local_down', index, ev_sync);
	});
	scene.pointMoveCapture.add(function (ev) {
		var message = common_point_event(ev);
		if (message === false) return;
		var index = message.index;
		var user = player_pointer[index.player][index.pointer];
		if(!user.pointer.tag.pointer_pressed) {// resuming process
			//<--- development
			// down(index, user.pointer.tag.last_ev);
			if (user.pointer.tag.last_ev === undefined) {
				user.pointer.tag.last_ev = wm.local_scene_player[index.player].point_inverse_down(ev);
			}
			fire_other_local('pointer_other_local_down', index, user.pointer.tag.last_ev);
			return;
		}
		//<--- development
		var ev_sync = wm.local_scene_player[index.player].point_inverse(ev);
		// move(index, ev_sync);
		fire_other_local('pointer_other_local_move', index, ev_sync);
	});
	scene.pointUpCapture.add(function (ev) {
		// pointUP is an optional event under the unstable remote env.
		// We should define an auto-pointUp event in this.pointer.update.add (not here). Ken Y.
		var message = common_point_event(ev);
		if (message === false) return;
		var index = message.index;
		var user = player_pointer[index.player][index.pointer];
		if(!user.pointer.tag.pointer_pressed) return; // check if pointer is already unpressed.
		// unpressed process
		//<--- development
		// var ev_sync = wm.local_scene_player[index.player].point_inverse(ev);
		// up(index);
		fire_other_local('pointer_other_local_up', index);
	});
}
module.exports.set_scene = set_scene;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var user = function(player_index, pointer_index, style) {
	pointer_index = pointer_index === undefined ? 1 : pointer_index;
	this.player_index = player_index;
	this.pointer_index = pointer_index;
	var buffer = {current: que_length - 1, latest: que_length - 1, que: []};
	this.buffer = buffer;
	this.buffer.que[this.buffer.latest]	= {xy: {x: style.x, y: style.y}, time: g.game.age};
	var pointer = new g.E({
		scene: scene,
		x: style.x,
		y: style.y,
		width: style.width,
		height: style.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		hidden: false,
		local: style.local,
		tag: {
			type: 'absolute',
			last_ev: undefined,
			player_index: player_index,
			pointer_index: pointer_index,
			last_timestamp: g.game.age,
			pointer_pressed: false,
		},
	});
	this.pointer = pointer;
	this.arrow = new g.Sprite({
		scene: scene,
		src: scene.assets.window_manager_icons,
		x: 0,
		y: -style.arrow.height,
		width: style.arrow.width,
		height: style.arrow.height,
		angle: 0,
		srcX: style.arrow.srcX,
		srcY: style.arrow.srcY,
		srcHeight: style.arrow.width,
		srcWidth: style.arrow.height,
		touchable: false,
	});
	this.pointer.append(this.arrow);
	this.name = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: style.text,
		fontSize: style.fontSize,
		textColor:  style.textColor,
		x: style.arrow.width,
		y: -style.arrow.height,
		touchable: false,
	});
	var b = this.name.calculateBoundingRect();
	var name_height = b.bottom - b.top;
	var name_width  = b.right - b.left;
	this.name.y -= name_height;
	this.name_background = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.pointer.background.off.cssColor,
		opacity: conf.window_icon.pointer.background.off.opacity,
		width: name_width,
		height: name_height - 3,
		x: this.name.x,
		y: this.name.y + 4,
		touchable: false,
		local: true,
	});
	this.pointer.append(this.name_background);
	this.pointer.append(this.name);
	player_pointer[player_index][this.pointer_index] = this;

	var pointer_move = new g.E({
		scene: scene,
		x: style.x,
		y: style.y,
		width: style.width,
		height: style.height,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		hidden: true,
		local: style.local,
	});
	var arrow_move = new g.Sprite({
		scene: scene,
		src: scene.assets.window_manager_icons,
		x: 0,
		y: -style.arrow.height,
		width: style.arrow.width,
		height: style.arrow.height,
		angle: 0,
		srcX: style.arrow.srcX,
		srcY: style.arrow.srcY,
		srcHeight: style.arrow.width,
		srcWidth: style.arrow.height,
		touchable: false,
	});
	pointer_move.append(arrow_move);
	var name_move = new g.Label({
		scene: scene,
		font: conf.default_font,
		text: style.text,
		fontSize: style.fontSize,
		textColor:  style.textColor,
		x: style.arrow.width,
		y: -style.arrow.height,
		touchable: false,
	});
	b = name_move.calculateBoundingRect();
	name_height = b.bottom - b.top;
	name_width  = b.right - b.left;
	name_move.y -= name_height;
	var name_background_move = new g.FilledRect({
		scene: scene,
		cssColor: conf.window_icon.pointer.background.off.cssColor,
		opacity: conf.window_icon.pointer.background.off.opacity,
		width: name_width,
		height: name_height - 3,
		x: this.name.x,
		y: this.name.y + 4,
		touchable: false,
		local: true,
	});
	pointer_move.append(name_background_move);
	pointer_move.append(name_move);

	scene.append(pointer_move);
	scene.append(this.pointer);

	this.pointer.update.add(function() {
		if (!pointer.tag.pointer_pressed) return;
		if ((pointer.tag.last_timestamp + g.game.age) % g.game.fps != 0) return;
		if (pointer.tag.last_timestamp + timeout_delta_frame >= g.game.age) return;
		// unpressed process
		var index = {
			player: pointer.tag.player_index,
			pointer: pointer.tag.pointer_index,
		};
		update_by_operation('off', index.player, undefined);
		//<--- development
		// up(index);
		fire_other_local('pointer_other_local_up', index);
	});
	this.pointer.update.add(function() {
		if (buffer.current == buffer.latest) {
			if (!pointer_move.visible()) return;
			pointer_move.hide();
			return;
		}
		if (!pointer_move.visible()) pointer_move.show();
		var a = buffer.latest - buffer.current;
		a = (a < 0 ? a + que_length : a);
		a = (a > start_in_hurry ? 3 : 1);
		buffer.current = (buffer.current + a) % que_length;
		var p = buffer.que[buffer.current].xy;
		pointer_move.moveTo(p.x, p.y);
		pointer_move.modified();
	});
};
module.exports.user = user;

function update_by_operation (status, player_index, player_id) {
	status = (status === undefined ? 'on' : status);
	player_index = (player_index === undefined ? 0 : player_index);
	player_index = (player_id === undefined ? player_index : player.find_index(player_id));
	if (player_index === false) return false;
	status = (g.game.player.id == player.current[player_index].id ? 'operation_' + status : status);
	wm.draw_modified(
		player_pointer[player_index][initial_pointer_id[player_index]].name_background,
		conf.window_icon.pointer.background[status]);
	return player_index;
}
module.exports.update_by_operation = update_by_operation;
function set_name_background(ops, player_index) {
	wm.draw_modified(
		// direct update is required, not called update_by_operation('off', player_index, undefined);
		player_pointer[player_index][initial_pointer_id[player_index]].name_background,
		conf.window_icon.pointer.background['off']);
}
module.exports.set_name_background = set_name_background;
function initial_pressed(player_index, ev) {
	pointers_pressed[player_index].signal();
	var xy = get_absolute_position(ev);
	var pointer_index = (ev.pointerId > conf.window.max_pointers ? -1 : ev.pointerId);
	var user = player_pointer[player_index][pointer_index];
	if (pointers_pressed[player_index].get_value() == 1){
		// direct update is required, not called update_by_operation('off', player_index, undefined);
		set_name_background('off', player_index);
		player_pointer[player_index][initial_pointer_id[player_index]].pointer.hide();
		initial_pointer_id[player_index] = pointer_index;
		update_by_operation('on', player_index, undefined);
		quing_moveTo(xy, user);
	}
	user.pointer.moveTo(xy.x, xy.y);
	user.pointer.show();
	user.pointer.modified();
}

function set_last_status(pointer_pressed, ev, group) {
	// assumed that all values are not undefined
	group.tag.last_ev = {
		pointerId: ev.pointerId,
		point: {
			x: group.x + ev.prevDelta.x,
			y: group.y + ev.prevDelta.y,
		},
		prevDelta: {
			x: ev.prevDelta.x,
			y: ev.prevDelta.y,
		},
		startDelta: {
			x: ev.startDelta.x,
			y: ev.startDelta.y
		},
	};
	group.tag.last_timestamp = g.game.age;
	group.tag.pointer_pressed = pointer_pressed;
}

function common_point_event(ev) {
	if (!player.validate(ev.player)) return false;
	var player_id = player.find_index(ev.player.id);
	if (ev.pointerId > conf.window.max_pointers) return false;
	var xy = get_absolute_position(ev);
	ev.point.x = xy.x;
	ev.point.y = xy.y;
	return {
		index: {
			player: player_id,
			pointer: ev.pointerId,
		},
	};
}

function other_local_down(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	var index = message.data.index;
	// var ev = message.data.ev;
	var ev = wm.local_scene_player[index.player].point_forward_down(message.data.ev);
	// console.log(ev);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	down(index, ev);
}
module.exports.other_local_down = other_local_down;
function other_local_move(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	var index = message.data.index;
	// var ev = message.data.ev;
	var ev = wm.local_scene_player[index.player].point_forward(message.data.ev);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	move(index, ev);
}
module.exports.other_local_move = other_local_move;
function other_local_up(message) {
	// pointer_other_local_down as destination in message event in message_eventmanager.js
	// var index = message.data.index;
	// var ev = message.data.ev;
	// var ev = wm.local_scene_player[index.player].point_forward_down(message.data.ev);
	//<--- development
	// if (index.player === player.find_index(ev.player.id)) return;
	up(message.data.index);
}
module.exports.other_local_up = other_local_up;

function down(index, ev) {
	set_last_status(true, ev, player_pointer[index.player][index.pointer].pointer);
	initial_pressed(index.player, ev);
}
function move(index, ev) {
	var user = player_pointer[index.player][index.pointer];
	set_last_status(true, ev, user.pointer);
	user.pointer.moveBy(ev.prevDelta.x, ev.prevDelta.y);
	user.pointer.modified();
	quing_fast_moveBy(ev.prevDelta, user);
}
function up(index) {
	var user = player_pointer[index.player][index.pointer];
	user.pointer.tag.pointer_pressed = false;
	pointers_pressed[index.player].wait();
	update_by_operation('off', index.player, undefined); // check later
	if (index.pointer != initial_pointer_id[index.player]) user.pointer.hide();
}

function fire_other_local(function_name, index, ev) {
	// index.player = 1; // test, should consider ev.delta zero is different between 0 and 1
	var mes = {
		data: {
			destination: function_name,
			index: index,
			ev: ev,
		}
	};
	// console.log(mes);
	scene.message.fire(mes);
	return mes;
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Quing buffer
function quing_moveTo(xy, user) {
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	quing_moveBy({x: xy.x - xy0.x, y: xy.y - xy0.y}, user);
}
function quing_moveBy(xy, user) {
	var current_time = g.game.age;
	var dx = xy.x;
	var dy = xy.y;
	var dr      = Math.sqrt(dx * dx + dy * dy);
	var n_steps = Math.ceil(dr / drpf);
	var dxpf    = dx / n_steps;
	var dypf    = dy / n_steps;
	var step = 0;
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	var x = xy0.x;
	var y = xy0.y;
	while (step < n_steps) {
		user.buffer.latest = (user.buffer.latest + 1) % que_length;
		x += dxpf;
		y += dypf;
		user.buffer.que[user.buffer.latest] = {xy: {x: x, y: y}, time: current_time};
		++step;
	}
}
function quing_fast_moveBy(xy, user) {
	var current_time = g.game.age;
	var xy0 = user.buffer.que[user.buffer.latest].xy;
	// will modify later for stable buffer operation, Ken
	user.buffer.latest = (user.buffer.latest + 1) % que_length;
	user.buffer.que[user.buffer.latest] = {xy: {x: xy0.x + xy.x, y: xy0.y + xy.y}, time: current_time};
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function get_absolute_position(ev) {
	if (ev.target === undefined)    return {x: ev.point.x, y: ev.point.y};
	if (ev.target.parent === scene) return {x: ev.point.x + ev.target.x, y: ev.point.y + ev.target.y};
	return {
		x: ev.point.x + ev.target.x + ev.target.parent.x,
		y: ev.point.y + ev.target.y + ev.target.parent.y
	};
}
