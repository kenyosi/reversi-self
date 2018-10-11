/*
 * User view
 * @self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var local = {
	floating: false,
	position: {x: 0, y: 0},      // in sync coodination
	scale: {x: 1.0, y: 1.0},     // scale
	inv_scale: {x: 1.0, y: 1.0}, // 1 / scale
	angle: 0.0,                  // in radian
	center: {x: g.game.width / 2, y: g.game.height / 2},
};
module.exports.local = local;

function local_from_sync(ev) {
	return {
		point: vcmult(amb(ev.point, local.position), local.scale),
		startDelta: vcmult(ev.startDelta, local.scale),
		prevDelta: vcmult(ev.prevDelta, local.scale),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
}
module.exports.local_from_sync = local_from_sync;
function sync_from_local(ev) {
	return {
		point: apb(vcmult(local.inv_scale, ev.point), local.position),
		startDelta: vcmult(local.inv_scale, ev.startDelta),
		prevDelta: vcmult(local.inv_scale, ev.prevDelta),
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
}
module.exports.sync_from_local = sync_from_local;

function sync_from_local_down(ev) {
	return {
		point: apb(vcmult(local.inv_scale, ev.point), local.position),
		startDelta: {x: 0, y: 0}, // undefined by point down event
		prevDelta: {x: 0, y: 0},  // undefined by point down event
		player: {id: ev.player.id,},
		pointerId: ev.pointerId,
	};
}
module.exports.sync_from_local_down = sync_from_local_down;

var vcmult = function(a, b) {return {x: a.x * b.x, y: a.y * b.y};};// Multiply scalars in vector returns a vector
var apb = function(a, b) {return {x: a.x + b.x, y: a.y + b.y};};   // a+b, Add two vectors
var amb = function(a, b) {return {x: a.x - b.x, y: a.y - b.y};};   // a-b, Subtruct vector
