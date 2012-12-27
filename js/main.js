window.backpack = {
	Models: {},
	Collections: {},
	Views: {},
	Routers: {},
	Templates: {},
	Mixins: {},
	Widgets: {},
	width: 500,
	height: 1200,
	prerenderTemplates: function(){
		_.each($(".template"), function(templateEl){
			var $templateEl = $(templateEl),
				templateName = $templateEl.attr("id");
			backpack.Templates[templateName] =  _.template($templateEl.html());
		});
	},
	init: function() {
		this.prerenderTemplates();
		backpack.app = new backpack.App({ });
		// Init Backbone history
		Backbone.history.start({pushState: true});

		// Catch links and trigger router
		$(document).on("click", "a", function(evt){
			if($(this).attr("target")) return true;
			evt.stopPropagation();
			evt.preventDefault();
			backpack.app.router.navigate($(this).attr("href"), {trigger: true});
			return false;
		});
	}
};

$(document).ready(function(){
	_.extend(backpack, Backbone.Events);
	backpack.init();
});
