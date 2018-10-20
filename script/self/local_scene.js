/*
 * User local scene view
 * @self, Akashic content
 * 
 * 
 * forward operator: obtain a local position from a global position
 * inverse operator: obtain a global position from a local position
 * 
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var game_center = {x: g.game.width / 2, y: g.game.height / 2};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var player = function(player_index) {
	this.player_index = player_index === undefined ? 0 : player_index;
	this.floating = false;
	// this.local_zero = {x: 0.0, y: 0.0};
	// this.scale = {x: 1.0, y: 1.0};
	// this.inv_scale = {x: 1.0, y: 1.0};
	// this.angle = 0.0;
	this.local_zero = {x: 75.0, y: 50.0};
	this.scale = {x: 2.0, y: 2.0};
	this.inv_scale = {x: 0.5, y: 0.5};
	this.angle = Math.PI / 3.0;
	this.local_center = {x: game_center.x, y: game_center.y};
	this.rotate = this.set_rotate_angle(this.angle);
};
module.exports.player = player;

player.prototype.set_rotate_angle = function (r) {
	var cos_r  = Math.cos(r);
	var sin_r  = Math.sin(r);
	var zc = [
		this.local_zero.x + this.local_center.x,
		this.local_zero.y + this.local_center.y
	];
	return {
		forward: {
			matrix: [
				[this.scale.x * cos_r, -this.scale.y * sin_r],
				[this.scale.x * sin_r,  this.scale.y * cos_r]
			],
			vector: [
				-( cos_r * zc[0] - sin_r * zc[1]) + this.local_center.x,
				-( sin_r * zc[0] + cos_r * zc[1]) + this.local_center.y
			],
		},
		inverse: {
			matrix: [
				[ this.inv_scale.x * cos_r, this.inv_scale.x * sin_r],
				[-this.inv_scale.y * sin_r, this.inv_scale.y * cos_r]
			],
			vector: [
				this.inv_scale.x * (-( cos_r * this.local_center.x + sin_r * this.local_center.y) + zc[0]),
				this.inv_scale.y * (-(-sin_r * this.local_center.x + cos_r * this.local_center.y) + zc[1])
			],
		},
	};
};

player.prototype.forward = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.forward, ev.point),
		// startDelta: a_mult_xy_p_v(this.rotate.forward, ev.startDelta),
		// prevDelta: a_mult_xy_p_v(this.rotate.forward, ev.prevDelta),
		startDelta: a_mult_xy(this.rotate.forward, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.forward, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.forward_down = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.forward, ev.point),
		// startDelta: {x: this.rotate.forward.vector[0], y: this.rotate.forward.vector[1]},
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.inverse = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.inverse, ev.point),
		// startDelta: vcmult(this.inv_scale, a_mult_xy_p_v(this.rotate.inverse, ev.startDelta)),
		// prevDelta: vcmult(this.inv_scale, a_mult_xy_p_v(this.rotate.inverse, ev.prevDelta)),
		startDelta: a_mult_xy(this.rotate.inverse, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.inverse, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.inverse_down = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.inverse, ev.point),
		// startDelta: vcmult(this.inv_scale, {x: this.rotate.inverse.vector[0], y: this.rotate.inverse.vector[1]}),
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function vcmult(a, b) {return {x: a.x * b.x, y: a.y * b.y};} // Multiply scalars in vector returns a vector
// function apb(a, b) {return {x: a.x + b.x, y: a.y + b.y};}    // a+b, Add two vectors
// function amb(a, b) {return {x: a.x - b.x, y: a.y - b.y};}    // a-b, Substruct vector
function a_mult_xy(a, xy) {
	// Multiply scalars in vector returns a vector
	return {
		x: a.matrix[0][0] * xy.x + a.matrix[0][1] * xy.y,
		y: a.matrix[1][0] * xy.x + a.matrix[1][1] * xy.y,
	};
}
function a_mult_xy_p_v(a, xy) {
	// Multiply scalars in vector returns a vector
	return {
		x: a.matrix[0][0] * xy.x + a.matrix[0][1] * xy.y + a.vector[0],
		y: a.matrix[1][0] * xy.x + a.matrix[1][1] * xy.y + a.vector[1],
	};
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// var local = {
// 	floating: false,
// 	position: {x: 0, y: 0},      // in sync coodination
// 	scale: {x: 1.0, y: 1.0},     // scale
// 	inv_scale: {x: 1.0, y: 1.0}, // 1 / scale
// 	angle: 0.0,                  // in radian
// 	center: {x: g.game.width / 2, y: g.game.height / 2},
// };
// module.exports.local = local;

// function local_from_sync(ev) {
// 	return {
// 		point: vcmult(amb(ev.point, local.position), local.scale),
// 		startDelta: vcmult(ev.startDelta, local.scale),
// 		prevDelta: vcmult(ev.prevDelta, local.scale),
// 		player: {id: ev.player.id,},
// 		pointerId: ev.pointerId,
// 	};
// }
// module.exports.local_from_sync = local_from_sync;
// function sync_from_local(ev) {
// 	return {
// 		point: apb(vcmult(local.inv_scale, ev.point), local.position),
// 		startDelta: vcmult(local.inv_scale, ev.startDelta),
// 		prevDelta: vcmult(local.inv_scale, ev.prevDelta),
// 		player: {id: ev.player.id,},
// 		pointerId: ev.pointerId,
// 	};
// }
// module.exports.sync_from_local = sync_from_local;

// function sync_from_local_down(ev) {
// 	return {
// 		point: apb(vcmult(local.inv_scale, ev.point), local.position),
// 		startDelta: {x: 0, y: 0}, // undefined by point down event
// 		prevDelta: {x: 0, y: 0},  // undefined by point down event
// 		player: {id: ev.player.id,},
// 		pointerId: ev.pointerId,
// 	};
// }
// module.exports.sync_from_local_down = sync_from_local_down;
