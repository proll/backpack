backpack.Box = Backbone.Model.extend({
	defaults: {
		color: 1,
		x: -1,
		y: -1,
		width: 10,
		height: 10,
	},

	initialize: function(options){
		this.set("color", Math.round(Math.random()*4) + 1);
		this.view = new backpack.BoxView({model: this});
	},

	render: function() {
		var $el = this.view.render();;
		return $el;
	},

	position: function (rectModel) {
		this.set("x", rectModel.get("x"), {silent:true});
		this.set("y", rectModel.get("y"), {silent:true});
		this.view.pos(rectModel.get("x"), rectModel.get("y"))
	},

	kill: function () {
		this.view.kill();
		this.off();
		delete this.view;
	}
});