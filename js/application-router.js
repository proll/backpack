backpack.Mixins.AutoResetRouter = {
	_prevRoute: "",
	autoResetRoutes: function() {
		_(this.routes).each(function(destination) {
			this.on("route:" + destination, function(){
				if(this._prevRoute != "" && this._prevRoute != destination){
					this.trigger("reset", this._prevRoute, destination);
					this.trigger("reset:" + this._prevRoute);
				}
				this._prevRoute = destination;
			}, this)
		}, this);
	}
}

backpack.Router = Backbone.Router.extend(_.extend({
	routes: {
		"": "index",
		"t/": "settings",
		"t/:settings": "settings",
		"*default": "default"
	},
	
	settings: function(settings){
		this.trigger("settings:change", settings);
	},

	default: function(){
		console.log('no such route ', arguments);
		this.trigger("404", arguments);
		return false;
	},

	initialize: function(){
		this.autoResetRoutes();
	}
}, backpack.Mixins.AutoResetRouter ));