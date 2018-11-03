/*
 * User local scene view
 * @self, Akashic content
 * 
 * forward operator: obtain a local position from a global position
 * inverse operator: obtain a global position from a local position
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var game_center = {x: g.game.width / 2, y: g.game.height / 2};
var two_pi_to_360 = 360.0 / (2.0 * Math.PI);
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var player = function() {
	this.set_default();
};
module.exports.player = player;

player.prototype.set_default = function () {
	this.floating = false;
	this.local_zero = {x: 0.0, y: 0.0};
	this.global_zero = {x: 0.0, y: 0.0};
	this.scale = {x: 1.0, y: 1.0};
	this.inv_scale = {x: 1.0, y: 1.0};
	this.angle = 0;
	this.angle360 = 0;
	this.local_center = {x: game_center.x, y: game_center.y};
	this.global_center = {x: game_center.x, y: game_center.y};
	this.set_local_scene();
};

player.prototype.set_local_zero = function (p) { this.local_zero = {x: p.x, y: p.y};};
player.prototype.set_scale = function (p) {
	this.scale = {x: p.x, y: p.y};
	this.inv_scale = {x: 1.0 / p.x, y: 1.0 / p.y};
};
player.prototype.set_angle = function (p) {
	this.angle = p;
	this.angle360 = two_pi_to_360 * p;
};
player.prototype.set_local_scene = function () {
	var cos_r  = Math.cos(this.angle);
	var sin_r  = Math.sin(this.angle);
	var lc = [
		this.local_zero.x + this.local_center.x,
		this.local_zero.y + this.local_center.y
	];
	var gc = [
		this.global_zero.x + this.global_center.x,
		this.global_zero.y + this.global_center.y
	];
	var rfm = [
		[cos_r * this.scale.x, -sin_r * this.scale.y],
		[sin_r * this.scale.x,  cos_r * this.scale.y],
	];
	var rim = [
		[ this.inv_scale.x * cos_r, this.inv_scale.x * sin_r],
		[-this.inv_scale.y * sin_r, this.inv_scale.y * cos_r]
	];
	this.rotate = {
		forward: {
			matrix: [
				[rfm[0][0], rfm[0][1]], // [cos_r * this.scale.x, -sin_r * this.scale.y],
				[rfm[1][0], rfm[1][1]], // [sin_r * this.scale.x,  cos_r * this.scale.y],
			],
			vector: [
				-(rfm[0][0] * gc[0] + rfm[0][1] * gc[1]) + lc[0], // -(cos_r * this.scale.x * gc[0] - sin_r * this.scale.y * gc[1]) + lc[0],
				-(rfm[1][0] * gc[0] + rfm[1][1] * gc[1]) + lc[1], // -(sin_r * this.scale.x * gc[0] + cos_r * this.scale.y * gc[1]) + lc[1],
			],
		},
		inverse: {
			matrix: [
				[rim[0][0], rim[0][1]], // [ this.inv_scale.x * cos_r, this.inv_scale.x * sin_r],
				[rim[1][0], rim[1][1]], // [-this.inv_scale.y * sin_r, this.inv_scale.y * cos_r]
			],
			vector: [
				-(rim[0][0] * lc[0] + rim[0][1] * lc[1]) + gc[0], // this.inv_scale.x * (-( cos_r * lc[0] + sin_r * lc[1])) + gc[0],
				-(rim[1][0] * lc[0] + rim[1][1] * lc[1]) + gc[1], // this.inv_scale.y * (-(-sin_r * lc[0] + cos_r * lc[1])) + gc[1],
			],
		},
	};
};

player.prototype.calc_rect_part = function(p) {
	var wh = {
		x: p.width  / 2.0,
		y: p.height / 2.0
	};
	var whr = a_mult_xy(this.rotate.forward, wh); //x, y
	var w = {
		x: wh.x - whr.x,
		y: wh.y - whr.y
	};
	return w;
};

player.prototype.rect_forward_init = function (rect) {
	var w = this.calc_rect_part(rect);
	var p = a_mult_xy_p_v(this.rotate.forward, rect); //x, y
	p = amb(p, w);
	p.width = rect.width;
	p.height = rect.height;
	p.scaleX = this.scale.x;
	p.scaleY = this.scale.y;
	p.angle = this.angle;
	p.angle360 = this.angle360;
	return p;
};

player.prototype.rect_forward = function (ev, rect) {
	var w = this.calc_rect_part(rect);
	var p = a_mult_xy_p_v(this.rotate.forward, ev.point); //x, y
	p = amb(p, w);
	return {
		point: p,
		startDelta: a_mult_xy(this.rotate.forward, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.forward, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};

player.prototype.rect_forward_down = function (ev, rect) {
	var w = this.calc_rect_part(rect);
	var p = a_mult_xy_p_v(this.rotate.forward, ev.point); //x, y
	p = amb(p, w);
	return {
		point: p,
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};

player.prototype.point_forward = function (ev) {
	var point = a_mult_xy_p_v(this.rotate.forward, ev.point);
	return {
		point: point,
		startDelta: a_mult_xy(this.rotate.forward, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.forward, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.point_forward_down = function (ev) {
	var point = a_mult_xy_p_v(this.rotate.forward, ev.point);
	return {
		// point: a_mult_xy_p_v(this.rotate.forward, ev.point),
		point: point,
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.point_inverse = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.inverse, ev.point),
		startDelta: a_mult_xy(this.rotate.inverse, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.inverse, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.point_inverse_down = function (ev) {
	return {
		point: a_mult_xy_p_v(this.rotate.inverse, ev.point),
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};
player.prototype.rect_inverse_init = function (rect) {
	var w = this.calc_rect_part(rect); // this is not optimzed one
	var p = apb(rect, w);
	p = a_mult_xy_p_v(this.rotate.inverse, p);
	p.width = rect.width;
	p.height = rect.height;
	p.scaleX = 1;   // comes from this.inv_scale.x;
	p.scaleY = 1;   // comes from this.inv_scale.y;
	p.angle  = 0;   // comes from this.angle360
	p.angle360 = 0; // comes from this.angle360;
	return p;
};

player.prototype.rect_inverse = function (ev, rect) {
	var w = this.calc_rect_part(rect); // this is not optimzed one
	var p = apb(rect, w);
	p = a_mult_xy_p_v(this.rotate.inverse, p);
	return {
		point: p,
		startDelta: a_mult_xy(this.rotate.inverse, ev.startDelta),
		prevDelta: a_mult_xy(this.rotate.inverse, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};

player.prototype.rect_inverse_down = function (ev, rect) {
	var w = this.calc_rect_part(rect); // this is not optimzed one
	var p = apb(rect, w);
	p = a_mult_xy_p_v(this.rotate.inverse, p);
	return {
		point: p,
		startDelta: {x: 0, y: 0},
		prevDelta: {x: 0, y: 0},
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
};

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// function vcmult(a, b) {return {x: a.x * b.x, y: a.y * b.y};} // Multiply scalars in vector returns a vector
function apb(a, b) {return {x: a.x + b.x, y: a.y + b.y};}    // a+b, Add two vectors
function amb(a, b) {return {x: a.x - b.x, y: a.y - b.y};}    // a-b, Substruct vector
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
