var cnt = 0;
backpack.BoxView = Backbone.View.extend({
	tagName: 		"div",
	className: 		"box",
	_isRendered: 	false,

	initialize: function(){
		// this.model.on("change:x", function (model, x) {this.$el.css({left:  x})},this)
		// this.model.on("change:y", function (model, y) {this.$el.css({top: y})},this)
		// this.model.on("change:y", function (model, y) {this.$el.css({top: backpack.height - y - this.model.get("height")})},this)
		this.model.on("change:width", function (model, width) {this.$el.css({width: width})},this)
		this.model.on("change:height", function (model, height) {this.$el.css({height: height})},this)
	},

	render: function() {
		this.$el.addClass("box-animated");
		this.$el.addClass("box-color" + this.model.get("color"));
		this.$el.css({
			width: 	this.model.get("width"),
			height: this.model.get("height")
		});
		this._isRendered = true;
		return this.$el;
	},

	pos: function(x, y) {
		this.$el.css({
			top: backpack.height - y - this.model.get("height"),
			left: x
		});
	},

	kill: function () {
		this.$el.remove();
	}
});