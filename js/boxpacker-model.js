backpack.BoxPacker = Backbone.Model.extend({
	defaults: {
		minBoxWidth: 50,
		maxBoxWidth: 100,
		minBoxHeight: 50,
		maxBoxHeight: 100,
		boxCount: 100,
		packAlgorithm: "FCNR",
		boxType: "random",
		_levelOF: 0
	},

	initialize: function(options) {
		options = options || {};
		var obj = {model: this};

		this.view = new backpack.BoxPackerView(obj);
		this.view.render();

		backpack.width = this.view.$keeper.width();


		this.boxCollection = new backpack.BoxItems();
		this.createBoxes(this.get("boxCount"));

		this.sizeBoxes(this.get("boxType"));
		var that = this;
		setTimeout(function () {
			that.pack(that.get("packAlgorithm"));
		}, 500);

		this.on("keeper:change", 		this.keeperChange, this)
		this.on("boxType:change", 		this.sizePackBoxes, this);
		this.on("packAlgorithm:change", this.pack, this);
	},


	keeperChange: function (w) {
		w = Math.floor(w);
		if(backpack.width != w) {
			backpack.width = w;
			this.pack(this.get("packAlgorithm"));
		}
	},


	createBoxes:function (num) {
		for (var i = 0; i<num; i++) {
			var currentBox = new backpack.Box(),
				$box = currentBox.render();
			this.view.addBox($box);
			this.boxCollection.add(currentBox);
		};
		this.trigger("create:finish");
	},

	sizeBoxes: function (boxType) {
		var that = this;
		switch(boxType) {
			case "square":
				that.squareBoxes();
				break;
			case "rectangle":
				that.rectangleBoxes();
				break;
			case "isorectangle":
				that.isoRectangleBoxes();
				break;
			case "isowidthrectangle":
				that.isoWidthRectangleBoxes();
				break;
			case "random":
				that.randomizeBoxes();
				break;
			default: 
				that.squareBoxes();
				break;
		}
	},

	sizePackBoxes: function (boxType) {
		this.set("boxType", boxType);
		this.resetPosition();
		this.sizeBoxes(boxType);
		var that = this;
		// setTimeout(function () {
			that.pack(that.get("packAlgorithm"));
		// }, 1500);
	},


	squareBoxes: function(){
		var that = this;
		_.each(that.boxCollection.models, function (box, i) {
			var flag = Math.round(Math.random());
			box.set("width", flag ? that.get("minBoxWidth") : that.get("maxBoxWidth"));
			box.set("height", flag ? that.get("minBoxHeight") : that.get("maxBoxHeight"));
		})
	},

	rectangleBoxes: function(){
		var that = this;
		_.each(that.boxCollection.models, function (box, i) {
			box.set("width", Math.round(Math.random()) ? that.get("minBoxWidth") : that.get("maxBoxWidth"));
			box.set("height", Math.round(Math.random()) ? that.get("minBoxHeight") : that.get("maxBoxHeight"));
		})
	},

	isoRectangleBoxes: function(){
		var that = this;
		_.each(that.boxCollection.models, function (box, i) {
			box.set("width", that.get("minBoxWidth"));
			box.set("height", that.get("maxBoxHeight"));
		})
	},

	isoWidthRectangleBoxes: function(){
		var that = this;
		_.each(that.boxCollection.models, function (box, i) {
			box.set("width", that.get("minBoxWidth"));
			box.set("height", that.get("minBoxHeight") + Math.round(Math.random()*(that.get("maxBoxHeight") - that.get("minBoxHeight"))));
		})
	},

	randomizeBoxes: function(){
		var that = this;
		_.each(that.boxCollection.models, function (box, i) {
			box.set("width", that.get("minBoxWidth") + Math.round(Math.random()*(that.get("maxBoxWidth") - that.get("minBoxWidth"))));
			box.set("height", that.get("minBoxHeight") + Math.round(Math.random()*(that.get("maxBoxHeight") - that.get("minBoxHeight"))));
		})
	},

	pack: function (packAlgorithm) {
		var that = this;
		this.set("packAlgorithm", packAlgorithm);
		switch(packAlgorithm) {
			case "FCNR": 
				that.packFCNR();
				break;
			case "Burke":
				that.packBurke();
				break;
			case "OF":
				that.packOF();
				break;
			case "BFL":
				that.packBFL();
				break;
			default:
				that.packFCNR();
				break;
		}
	},

	resetPosition: function(){
		var box;
		for (var i = this.boxCollection.models.length - 1; i >= 0; i--) {
			box = this.boxCollection.models[i];
			box.position(new Backbone.Model({x:-100,y: backpack.height - this.get("maxBoxHeight")}));
		};
	},




	/*
	*
	* PACKING
	*
	*/
	// FCNR - Floor Сeiling No Rotation - best level packing
	packFCNR: function () {
		var unpackedArr = this.boxCollection.models.slice();
		// sort height decreasing
		unpackedArr.sort(function (box0, box1) {return box1.get("height") - box0.get("height");});


		// create 1st level and put 1st box
		var levelsArr = [],
			level = new backpack.Level(
				{
					bottom: 0,
					height: unpackedArr[0].get("height"), 
					floor: 	0,
					initW: 	unpackedArr[0].get("width")
				}),
			packedArr = [];

		packedArr.push(level.put(unpackedArr[0]));
		levelsArr.push(level);
		unpackedArr[0].position(packedArr[0]);


		var i =0,
			j = 0,
			found,
			packed = false,
			min;

		// FCNR method level packing
		for (i = 1; i < unpackedArr.length; i++) {
			found = -1;
			packed = false;
			min = backpack.width;

			for (j = 0; j < levelsArr.length; j++) {
				if(levelsArr[j].floorFeasible(unpackedArr[i])) {
					if(levelsArr[j].getSpace() < min) {	
						found = j;
						min = levelsArr[j].getSpace();
					}
				}
			};
			

			if (found > -1) { // floor-pack on existing level
				packedArr.push(levelsArr[found].put(unpackedArr[i]));
				packed = true;
			} else {
				found = -1;
				min = backpack.width;
				for (j = 0; j < levelsArr.length; j++) {
					if (levelsArr[j].ceilingFeasible(unpackedArr[i], packedArr)) {
						if (levelsArr[j].getSpace(false) < min) {
							found = j;
							min = levelsArr[j].getSpace(false);
							// debugger;
						}
					}
				}
				if (found > -1) { // ceiling-pack on existing level
					packedArr.push(levelsArr[found].put(unpackedArr[i], false));
					packed = true;
				} else { // a new level
					var lastLevel = levelsArr[levelsArr.length - 1],
					newLevel = new backpack.Level({
						bottom: lastLevel.get("bottom") + lastLevel.get("height"),
						height: unpackedArr[i].get("height"), 
						floor: 	0, 
						initW: 	unpackedArr[i].get("width")
					});

					packedArr.push(newLevel.put(unpackedArr[i]));
					packed = true;
					levelsArr.push(newLevel);
				}
			}

			// SCORE: if succesfully packed position iterated box to new packed coords
			if(packed) {
				unpackedArr[i].view.$el.css({"transition-delay": "0."+i+"s"});
				unpackedArr[i].position(packedArr[packedArr.length - 1]);
			}
		}
		return packedArr;
	},


	// Burke Packing - unlevel height pack
	packBurke: function () {
		var unpackedArr = this.boxCollection.models.slice(),
			gapArr = [],
			packedArr = [],
			i = 0,
			j = 0;

		// console.log(unpackedArr)
		unpackedArr.sort(function (box0, box1) {return box1.get("height") - box0.get("height");});
		unpackedArr.sort(function (box0, box1) {return box1.get("width") - box0.get("width");});

		for(i = 0; i < backpack.width; i++) {
			gapArr.push(0);
		}


		var min,
			coordX = 0,
			gapWidth,
			ind,
			fit,
			curFit,
			lowest,
			k = 0;
		while(unpackedArr.length) {
			if(k++ > 10000) {
				console.log(unpackedArr.length);
				console.error("While overload");
				return;
			}
			// find lowest gap
			min = gapArr[0];
			coordX = 0;
			for (i = 1; i < gapArr.length; i++) {
				if(gapArr[i] < min) {
					min = gapArr[i];
					coordX = i;
				}
			};

			i = coordX + 1;
			gapWidth = 1;
			while((i < gapArr.length) && (gapArr[i] == gapArr[i - 1])) {
				gapWidth++;
				i++;
			}


			// find best fitting for pack rectangle
			ind = -1;
			fit = 0;
			for(j = 0; j < unpackedArr.length; j++) {
				curFit = unpackedArr[j].get("width") / gapWidth;
				if((curFit < 1) && (curFit > fit)) {
					fit = curFit;
					ind = j;
				}
			}

			if(ind > -1) {
				// place best fitting rectangle using placement policy 'Leftmost'
				var newRect = new backpack.Rectangle;
				newRect.setRect(
					coordX,
					backpack.height - (gapArr[coordX] + unpackedArr[ind].get("height")),
					unpackedArr[ind].get("width"),
					unpackedArr[ind].get("height")
				);

				packedArr.push(newRect);
				// raise elements of array to appropriate height
				for (j = coordX; j < coordX + unpackedArr[ind].get("width"); j++) {
					gapArr[j] += unpackedArr[ind].get("height");
				}
				// SCORE: packed and we have to remove from unpackedArr
				unpackedArr[ind].view.$el.css({"transition-delay": "0."+k+"s"});
				unpackedArr[ind].position(newRect);
				unpackedArr.splice(ind, 1);
				// console.log(newRect);
				
			} else {
				// raise gap to height of the lowest neighbour
				if( coordX == 0 ){
					lowest = gapArr[gapWidth];
				} else if ((coordX + gapWidth) == gapArr.length){
					lowest = gapArr[gapArr.length - gapWidth - 1];
				} else if (gapArr[coordX - 1] < gapArr[coordX + gapWidth]) {
					lowest = gapArr[coordX - 1];
				} else {
					lowest = gapArr[coordX + gapWidth];
				}

				for (j = coordX; j < coordX + gapWidth; j++) {
					gapArr[j] = lowest;
				};
			}

		}
		return packedArr;
	},


	// Online Fit - Burke online algo
	packOF: function(){
		this.set("_levelOF", 0);

		var rects = this.boxCollection.models.slice(),
			packedArr = [],
			gapArr = [],
			emptyAreasArr = [],
			ind = 0,
			i = 0,
			packed = false;

		for(i = 0; i < backpack.width; i++) {
			gapArr.push(0);
		}

		for (ind = 0; ind < rects.length; ind++) {
			packed  = false;
			// Search the list of empty areas for sufficient space to pack
			if (emptyAreasArr.length) {
				var fitInd = -1;
				for (i = 0; i < emptyAreasArr.length; i++) {
					if (   emptyAreasArr[i].get("width") >= rects[ind].get("width")
						&& emptyAreasArr[i].get("height") >= rects[ind].get("height")) {
						fitInd = i;
						break;
					}
				}
				if (fitInd > -1) {
					// pack into empty area
					var toPackRect =  new backpack.Rectangle;
					toPackRect.setRect(
								emptyAreasArr[fitInd].get("x"),
								emptyAreasArr[fitInd].get("y") + emptyAreasArr[fitInd].get("height") - rects[ind].get("height"),
								rects[ind].get("width"),
								rects[ind].get("height")
					);
					packedArr.push(toPackRect);
					packed = true;

					// split area
					var newAreaRect =  new backpack.Rectangle;
					if ( 	emptyAreasArr[fitInd].get("width")  - rects[ind].get("width") > 
							emptyAreasArr[fitInd].get("height") - rects[ind].get("height")
						) {
						// vertically
						newAreaRect.setRect(
							emptyAreasArr[fitInd].get("x"), 
							emptyAreasArr[fitInd].get("y"), 
							rects[ind].get("width"),
							emptyAreasArr[fitInd].get("height") - rects[ind].get("height")
						);
						emptyAreasArr.push(newAreaRect);
						emptyAreasArr[fitInd].adjust(rects[ind].get("width"), 0, 0, 0);
					} else {
						// horizontally
						newAreaRect.setRect(
							emptyAreasArr[fitInd].get("x") + rects[ind].get("width"),
							emptyAreasArr[fitInd].get("y") + emptyAreasArr[fitInd].get("height") - rects[ind].get("height"),
							emptyAreasArr[fitInd].get("width") - rects[ind].get("width"),
							rects[ind].get("height")
						);
						emptyAreasArr.push(newAreaRect);
						emptyAreasArr[fitInd].adjust(0, 0, 0, -rects[ind].get("height"));
					}
					continue;
				}
			}

			// search the linear array for available packing width
			var index = this.packOFsearchMinGap(gapArr, rects[ind].get("width"));
			// analyze packing place
			if (this.get("_levelOF") > gapArr[index]) {
				var emptyAreaRect = new backpack.Rectangle,
					areaWidth = 0;
				i = index;
				while (gapArr[i++] == gapArr[index]) {
					areaWidth++;
				}

				emptyAreaRect.setRect(
					index, 
					backpack.height - this.get("_levelOF"),
					areaWidth,
					this.get("_levelOF") - gapArr[index]
				);
				emptyAreasArr.push(emptyAreaRect);
			} else {
				var level = gapArr[index],
					areaIndex = index + 1;
				while (areaIndex < index + rects[ind].get("width")) {
					if (gapArr[areaIndex] < level) {
						var emptyAreaRect = new backpack.Rectangle,
							areaWidth = 0,
							x = areaIndex;
						level = gapArr[areaIndex];

						while (gapArr[areaIndex++] == level && areaIndex < index + rects[ind].get("width")) {
							areaWidth++;
						}
						emptyAreaRect.setRect(
							x, 
							backpack.height - gapArr[index], 
							areaWidth, 
							gapArr[index] - level);
						emptyAreasArr.push(emptyAreaRect);
					} else {
						areaIndex++;
					}
				}
			}
			// pack
			var toPackRect = new backpack.Rectangle;
			toPackRect.setRect(
				index, 
				backpack.height - (this.get("_levelOF") + rects[ind].get("height")),
				rects[ind].get("width"),
				rects[ind].get("height")
			);
			packedArr.push(toPackRect);
			packed = true;

			// raise gap
			for (i = index; i < index + rects[ind].get("width"); i++) {
				gapArr[i] = this.get("_levelOF") + rects[ind].get("height");
			}

			// SCORE: packing
			if(packed) {
				// console.log(rects[ind].view.$el);
				rects[ind].view.$el.css({"transition-delay": "0."+ind+"s"});
				rects[ind].position(packedArr[packedArr.length - 1]);
			}
		}

		return packedArr;
	},

	// pack OF misc search function
	packOFsearchMinGap: function(gap, width){
		// find lowest gap
		var min = gap[0],
			coordX = 0,
			i = 0;
		for (i = 1; i < gap.length; i++) {
			if (gap[i] < min) {
				min = gap[i];
				coordX = i;
			}
		}
		
		i = coordX + 1;
		var gapWidth = 1;
		while (i < gap.length && gap[i] == gap[i - 1]) {
			gapWidth++;
			i++;
		}
		if (gapWidth >= width) {
			this.set("_levelOF", gap[coordX]);
			return coordX;
		} else {
			// if doesn't fit, raise gap to height of the lowest neighbour
			var lowest;
			if (coordX == 0) {
				lowest = gap[gapWidth];
			} else if (coordX + gapWidth == gap.length) {
				lowest = gap[gap.length - gapWidth - 1];
			} else if (gap[coordX - 1] < gap[coordX + gapWidth]) {
				lowest = gap[coordX - 1];
			} else {
				lowest = gap[coordX + gapWidth];
			}
			var newGap = gap.slice(),
				j = 0;
			for (j = coordX; j < coordX + gapWidth; j++) {
				newGap[j] = lowest;
			}
			// and search again
			return this.packOFsearchMinGap(newGap, width);
		}
	},


	/*
	* BFL - Best Fit Level - Best level algo
	*/
	packBFL: function() {
		var rects = this.boxCollection.models.slice(),
			packedArr = [],
			levelsArr = [],
			level = new backpack.Level({
				bottom: 0, 
				height: rects[0].get("height")
			}),
			i = 0,
			j = 0,
			packed = false;
	
		packedArr.push(level.put(rects[0]));
		rects[0].position(packedArr[0]);
		levelsArr.push(level);
	
		for (i = 1; i < rects.length; i++) {
			packed = false;
			var min = backpack.width,
				found = -1;
			for (j = 0; j < levelsArr.length; j++) {
				if (  
					(levelsArr[j].get("height") >= rects[i].get("height") || j == levelsArr.length - 1)
					&& levelsArr[j].floorFeasible(rects[i])
					&& levelsArr[j].getSpace() - rects[i].get("width") < min) {
						found = j;
						min = levelsArr[j].getSpace() - rects[i].get("width");
				}
			}
			if (found > -1) {
				packedArr.push(levelsArr[found].put(rects[i]));
				packed = true;
				if (   found == (levelsArr.length - 1)
					&& levelsArr[found].get("height") < rects[i].get("height")) {
					levelsArr[found].set("height", rects[i].get("height"));
				}
			} else {
				var lastLevel = levelsArr[levelsArr.length - 1],
					newLevel = new backpack.Level({
								bottom: 	lastLevel.get("bottom") + lastLevel.get("height"),
								height: 	rects[i].get("height")
							});
				packedArr.push(newLevel.put(rects[i]));
				packed = true;
				levelsArr.push(newLevel);
			}
			// SCORE: if succesfully packed position iterated box to new packed coords
			if(packed) {
				rects[i].view.$el.css({"transition-delay": "0."+i+"s"});
				rects[i].position(packedArr[packedArr.length - 1]);
			}
		}
		return packedArr;
	}
});
