backpack.Rectangle = Backbone.Model.extend({
	initialize: function () {
	},
	setRect: function (x,y,width,height) {
		this.set("x", x);
		this.set("y", y);
		this.set("width", width);
		this.set("height", height);
	},
	intersects: function (rect) {
		return !(
			rect.get("x") 						> this.get("x") + this.get("width") ||
			rect.get("x") + rect.get("width") 	< this.get("x") ||
			rect.get("y") 						> this.get("y") + this.get("height") ||
			rect.get("y") + rect.get("height") 	< this.get("y") 
		);
	},
	adjust: function(dx0, dy0, dx1, dy1) {
		this.set("x", this.get("x") + dx0);
		this.set("y", this.get("y") + dy0);

		this.set("width", this.get("width") + dx1 - dx0);
		this.set("height", this.get("height") + dy1 - dy0);
	}
})