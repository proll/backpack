backpack.App = Backbone.Model.extend({
	initialize:function () {
		var that = this;

		this.router = new backpack.Router;
		this.view = new backpack.ApplicationView;

		this.boxPacker = new backpack.BoxPacker;

		/**
		 * Global event casting
		 */

		/**
		 * USER AUTH EVENTS
		 */
		this.router.on("settings:change", function (settings) {
			// console.log(settings);
			backpack.trigger("settings:change", settings);
		});


		/**
		 * APPLICATION READY
		 */
		backpack.trigger("app:init");
	}
});
