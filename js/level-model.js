backpack.Level = Backbone.Model.extend({
	defaults: {
		bottom: 0,
		height: 0,
		floor: 0,
		initW: 0,
		ceiling: 0
	},
	initialize: function (options) {
		this.set("bottom", 	options.bottom);
		this.set("height", 	options.height);
		if(!!options.floor) this.set("floor", 	options.floor);
		if(!!options.initW) this.set("initW", 	options.initW);
		this.set("ceiling", 0);
	},
	put: function (rect, f, leftJustified) {
		if(typeof f == 'undefined') f = true;
		if(typeof leftJustified == 'undefined') leftJustified = true;
		// rect = _.extend(rect, {})
		var newRect = new backpack.Rectangle;
		if(f) {
			if(leftJustified) {
				newRect.setRect(
					this.get("floor"),
					backpack.height - (this.get("bottom")+rect.get("height") + 1),
					rect.get("width"),
					rect.get("height")
				);
			} else {
				// 'ceiling' is used for right-justified rectangles packed on the floor
				newRect.setRect(
					backpack.width - (this.get("ceiling") + rect.get("width")),
					backpack.height - (this.get("bottom") + rect.get("height") + 1),
					rect.get("width"),
					rect.get("height")
				);
				this.set("ceiling", this.get("ceiling") + rect.get("width"));
			}
			this.set("floor", this.get("floor") + rect.get("width"));
		} else {
			newRect.setRect(
				backpack.width -  (this.get("ceiling") + rect.get("width")),
				backpack.height - (this.get("bottom") + this.get("height") + 1),
				rect.get("width"),
				rect.get("height")
			);
			this.set("ceiling", this.get("ceiling") + rect.get("width"));
		}
		return newRect;
	},

	ceilingFeasible: function (rect, existingBoxArr) {
		var testRect = new backpack.Rectangle;
		testRect.setRect(
			backpack.width  - (this.get("ceiling") + rect.get("width")),
			backpack.height - (this.get("bottom") + this.get("height") + 1),
			rect.get("width"),
			rect.get("height")
		);
		var intersected = false;
		for (var i = 0; i < existingBoxArr.length; i++) {
			if(testRect.intersects(existingBoxArr[i])) {
				intersected = true;
				break;
			}
		};
		var fit = rect.get("width") <= (backpack.width - this.get("ceiling") - this.get("initW"));
		return fit && !intersected;
	},

	floorFeasible: function (rect) {
		return rect.get("width") <= (backpack.width - this.get("floor"));
	},

	getSpace: function (f) {
		if(typeof f == 'undefined') f = true;
		if(f) {
			return backpack.width - this.get("floor");
		} else {
			return backpack.width - this.get("ceiling") - this.get("initW");
		}
	}
});
 
	