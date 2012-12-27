backpack.ApplicationView = Backbone.View.extend({

	el: "body",
	template: "application",

	initialize: function(){
		this.template = backpack.Templates[this.template];
	}

});