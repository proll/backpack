backpack.BoxItems = Backbone.Collection.extend({
	model: backpack.Box,
	kill: function(){
		_.each(this.models, function(model) {
			model.kill();
		});
		this.remove(this.models);
	}
});