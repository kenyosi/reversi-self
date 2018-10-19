/*
 * Piece box
 * reversi@self, Akashic content
 */
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var co                         = require('./content_config');
var pi                         = require('./piece');
var wm                         = require('./self/window_manager');

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialization
var scene;
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function set_scene(sc) { scene = sc;}
module.exports.set_scene = set_scene;

var objects = function(x, y, w, h, style, f) {
	f = (f === undefined ? [0, 0, 0, 0] : f);
	this.max_disks = co.pile_area.max_disks;
	this.min_dy    = 6; //4
	this.disk_id   = [];
	this.flag      = f;
	this.last_view = wm.view.position;
	var x0_fill    = -1;
	var y0_fill    = 5;
	this.area = new g.E({
		scene: scene,
		x: x,
		y: y,
		width: w,
		height: h,
		scaleX: 1,
		scaleY: 1,
		touchable: false,
		tag: { type: 'board'},
	});
	this.area.append(
		new g.FilledRect({
			scene: scene,
			cssColor: style.background.cssColor,
			opacity: style.background.opacity,
			x: x0_fill,
			y: y0_fill,
			width: w,// - x0_fill,
			height: h - y0_fill
		}));
	scene.append(this.area);
	this.p = scene.children[scene.children.length - 1];
};

objects.prototype.set_disk = function (e1, by_hand, re_draw) {
	by_hand = (by_hand === undefined ? true : by_hand);
	re_draw = (re_draw === undefined ? true : re_draw);
	if (!wm.eInE(e1, this.p, this.flag)) return 0;
	var dil = this.disk_id.length;
	if (dil >= this.max_disks) return -1;
	var max_y = this.area.y + this.area.height - 32 / 2 - 6; //<----
	e1.y = (e1.y <= max_y ? e1.y : max_y);
	var ii = 0;
	while (ii < dil) {
		var dii = pi.disk_id.indexOf(this.disk_id[ii].id);
		var dij = pi.index[dii];
		this.disk_id[ii].x = scene.children[dij].x;
		this.disk_id[ii].y = scene.children[dij].y;
		if (re_draw) this.disk_id[ii].p = scene.children[dij];
		++ii;
	}
	this.min_dy = (wm.view.zooming ? 3 : 6);//<----
	e1.x = this.p.x;
	this.disk_id.push({id: e1.id, x: e1.x, y: e1.y, p: e1});
	this.disk_id.sort(function(a, b) {return (a.y > b.y ? -1 : 1);});
	var dy = [];
	var y0 = this.disk_id[0].y;
	ii = 1;
	var dl = this.disk_id.length;
	var ds = 0;
	while(ii < dl) {
		var y1 = this.disk_id[ii].y;
		var ya = y0 - y1;// - ds;
		var yb = (ya >= this.min_dy ? ya : this.min_dy);
		dy.push(yb);
		ds = yb - ya;
		this.disk_id[ii].y -= ds;
		y0 = this.disk_id[ii].y;
		++ii;
	}
	ii = dl - 1;
	ds = (this.disk_id[ii].y > this.area.y ? this.disk_id[ii].y : this.area.y) - this.disk_id[ii].y;
	this.disk_id[ii].y += ds;
	this.disk_id[ii].p.y = this.disk_id[ii].y;
	if (re_draw) this.disk_id[ii].p.modified(); // this is required
	while(ii > 0) {
		var iim1 = ii - 1;
		ya = dy[iim1] - ds;
		dy[iim1] = (ya >= this.min_dy ? ya : this.min_dy);
		ds = dy[iim1] - ya;
		this.disk_id[iim1].y   = this.disk_id[ii].y + dy[iim1];
		this.disk_id[iim1].p.y = this.disk_id[iim1].y;
		if (re_draw) this.disk_id[iim1].p.modified();
		--ii;
	}
	var co_disk_bw = co.disk.bw[e1.tag.bw];
	if (by_hand) {
		var length_this_disk_id =  this.disk_id.length;
		for (var i = 0; i < length_this_disk_id; i++) {
			var p = this.disk_id[i];
			pi.to_top(p.id, scene.children);
		}
		wm.draw_modified(e1.children[1], co_disk_bw.transit_in_pile[0]);
		scene.setTimeout(function () {
			wm.draw_modified(e1.children[1], co_disk_bw.in_pile);
		},  co_disk_bw.transit_time);
	}
	else {
		wm.draw_modified(e1.children[1], co_disk_bw.in_pile);
	}
	return 1;
	
};

objects.prototype.get_disk = function (e0) { // status is for future reference
	// if (!wm.eInE(e0, this.p)) return; //
	// var this_disk_id_index = this.disk_id.findIndex((item, index, a) => (item.id == e0.id))
	var this_disk_id_index = find_index_of_id(e0, this.disk_id);
	if (this_disk_id_index < 0) return;

	this.disk_id.splice(this_disk_id_index, 1);
	var co_disk_bw = co.disk.bw[e0.tag.bw];
	wm.draw_modified(e0.children[1], co_disk_bw.transit_in_pile[0]);
	scene.setTimeout(function () {
		wm.draw_modified(e0.children[1], co_disk_bw.on_board);
	},  	co_disk_bw.transit_time);
};
module.exports.objects = objects;

objects.prototype.redraw = function () {
	var length_this_disk_id =  this.disk_id.length;
	for (var i = 0; i < length_this_disk_id; i++) {
		var p = this.disk_id[i];
		pi.to_top(p.id, scene.children);
	}
	// wm.draw_modified(e1.children[1], co_disk_bw.transit_in_pile[0]);
	// wm.draw_modified(e1.children[1], co_disk_bw.in_pile);
};

function find_index_of_id(object, db) {
	var ldb = db.length;
	var ii = 0;
	while(ii < ldb) {
		if (object.id == db[ii].id) return ii;
		ii++;
	}
	return -1;
}
