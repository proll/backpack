backpack.BoxPackerView =  Backbone.View.extend({
	el: ".wrap",
	_isRendered: 	false,
	defaults: {
		_isRendered: false
	},

	events: {
		"change [name=packAlgorithm]": "changePackAlgorithm",
		"click [name=boxType]": "changeBoxType"
	},

	addBox: function ($box) {
		return this.$keeper.append($box);
	},

	clear: function () {
		this.$keeper.html();
	},

	render: function() {
		var that = this,
			viewData = {};

		this.$keeper = this.$el.find(".box-keeper");
		$(window).resize(function (e) {
			that.model.trigger("keeper:change", that.$keeper.width());
		})
		// this.$el.html(this.template(viewData));
		this._isRendered = true;
	},

	changePackAlgorithm: function (e) {
		this.model.trigger("packAlgorithm:change", $(e.currentTarget).val())
	},

	changeBoxType: function (e) {
		this.model.trigger("boxType:change", $(e.currentTarget).val())
	}
});