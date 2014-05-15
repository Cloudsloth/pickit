/**
*	@filename	Pickit.js
*	@author		kolton
*	@edits		cloudsloth
*	@desc		smarter item pickups
*/

/*
I have made 'better' versions of a few functions

checkItem -> checkSwag
pickItems -> grabGoodItems

for these new versions, you do not need to init pickit files
that is because the test pickit is declared below!

to test this, you need to run a bot script using pickit.grabGoodItems()
instead of pickit.pickItems()

I added two new functions

dropItems(method, character)
	method -> "trade" or "drop"
	character -> optional, for trade
	trade is non-working as of yet
deliver(unit, method, character)
	called by dropItems
*/

var Pickit = {
	gidList: [],
	beltSize: 1,
	ignoreLog: [4, 5, 6, 22, 41, 76, 77, 78, 79, 80, 81], // Ignored item types for item logging
	//currpick: {},
	testpickits: [{
		//###these weren't working, so the test pickit is now declared in the checkSwag function###
		//I added two test pickits in here
		//the first will pick up any Harlequin's Crest(shako)
		//the second is for a rare cruel fools ias flail
		//the shako pickit is for testing, the flail one
		//is to show how a good rare pickit might look
		"name": "shako",
		"classids": [422],
		"weight": {
			"stack": 6,
			"high": 3,
			"mid": 2,
			"low": 1,
			"PickAt": 8
			},
		"stats": {
			"itemallskills": {
				"stack": 0,
				"high": 2,
				"mid": 0,
				"low": 0
				},
			"itemmagicbonus": {
				"stack": 0,
				"high": 50,
				"mid": 0,
				"low": 0
				},
			"damageresist": {
				"stack": 0,
				"high": 0,
				"mid": 10,
				"low": 0
				}
			}
		},
		{
		//name doesn't do anything, but will be useful in writing pickits
		"name": "fools cruel ias flails etc",
		//pickits are primarily about classID's
		//it will only evaluate items of these classid's with this pickit
		"classids": [21, 217, 114],
		"weight": {
			// weight values are used to determine if an item is worthwhile
			// a 300ed 40as 2os weapon has 3x high rolls
			// because high's are weighted at 3, the total is 9
			// PickAt is set to 8 to try and grab items that are worthwhile
			"stack": 6,
			"high": 3,
			"mid": 2,
			"low": 1,
			"PickAt": 8
			},
		"stats": {
		// each item will be checked to see how many of these minimum stat values it has
		// stack - when you can get a prefix+suffix i.e. 400edam from cruel+fools
		// high - the minimum high roll
		// mid - the minimum medium roll
		// low - the lowest worthwhile roll
			"enhanceddamage": {
				"stack": 350,
				"high": 250,
				"mid": 200,
				"low": 150
				},
			"ias": {
				"stack": 0,
				"high": 40,
				"mid": 30,
				"low": 10
				},
			"itemtohitperlevel": {
				"stack": 0,
				"high": 16,
				"mid": 0,
				"low": 0
				},
			"tohit": {
				"stack": 0,
				"high": 250,
				"mid": 200,
				"low": 100
				},
			"sockets": {
				"stack": 0,
				"high": 2,
				"mid": 0,
				"low": 0
				}
			}
		}],
		
		
		/*
		//###pickit template. add more stats as needed###
		{
		"name": "",
		"classids": [],
		"weight": {
			"stack": 6,
			"high": 3,
			"mid": 2,
			"low": 1,
			"PickAt": 8
			}
		"stats": {
			"stat1": {
				"stack": 0,
				"high": 0,
				"mid": 0,
				"low": 0
				},
			"stat2": {
				"stack": 0,
				"high": 0,
				"mid": 0,
				"low": 0
				},
			"stat3": {
				"stack": 0,
				"high": 0,
				"mid": 0,
				"low": 0
				},
			"stat4": {
				"stack": 0,
				"high": 0,
				"mid": 0,
				"low": 0
				}
			}
		}
		###end pickit template###
		*/
		
	checkSwag: function(unit){
		function checkMatch(){
			function checkStat(stat){
				var statid = NTIPAliasStat[stat];
				say(NTIPAliasStat[stat] + " / " + stat + ": " + unit.getStat(statid));
				delay(200);
				if(mypickit.stats[stat].stack != 0 && unit.getStat(statid) >= mypickit.stats[stat].stack){say(stat + " is a stack"); stacks += 1; return true}
				if(mypickit.stats[stat].high != 0 && unit.getStat(statid) >= mypickit.stats[stat].high){say(stat + " is a high"); highs += 1; return true}
				if(mypickit.stats[stat].mid != 0 && unit.getStat(statid) >= mypickit.stats[stat].mid){say(stat + " is a mid"); mids += 1; return true}
				if(mypickit.stats[stat].low != 0 && unit.getStat(statid) >= mypickit.stats[stat].min){say(stat + " is a low"); lows += 1; return true}
				return false
				}
			function checkFlag(flag){
				if(mypickit.flags[flag] != 0 && unit.getFlag(NTIPAliasFlag[flag]) >= mypickit.flags[flag]){highs += 1; return true}
				return false
				}
			//var currpick = pickit;
			//say("Pickit has " + Object.keys(pickit).length + " keys");
			var lows = 0,
				mids = 0,
				highs = 0,
				stacks = 0,
				mypickit = {
					//I added two test pickits in here
					//the first will pick up any Harlequin's Crest(shako)
					//the second is for a rare cruel fools ias flail
					//the shako pickit is for testing, the flail one
					//is to show how a good rare pickit might look
					"name": "shako",
					"classids": [422],
					"weight": {
						"stack": 6,
						"high": 3,
						"mid": 2,
						"low": 1,
						"PickAt": 8
						},
					"stats": {
						"itemallskills": {
							"stack": 0,
							"high": 2,
							"mid": 0,
							"low": 0
							},
						"itemmagicbonus": {
							"stack": 0,
							"high": 50,
							"mid": 0,
							"low": 0
							},
						"damageresist": {
							"stack": 0,
							"high": 0,
							"mid": 10,
							"low": 0
							}
						}
					};
			if(mypickit.classids.indexOf(unit.classid) == -1){return false}
			if(!unit.getFlag(0x10)){result = -1; return true}
			//Object.keys(mypickit.flags).forEach(checkFlag);
			say("pickit stats: " + Object.keys(mypickit.stats).length);
			Object.keys(mypickit.stats).forEach(checkStat);
			delay(200);
			say(lows + " lows, " + mids + " mids, " + highs + " highs, " + stacks + " stacks");
			delay(300);
			var total = (lows * mypickit.weight.low + 
				mids * mypickit.weight.mid +
				highs * mypickit.weight.high +
				stacks * mypickit.weight.stack);
			say("total: " + total);
			if(total >= mypickit.weight.PickAt){
				result = 1;
				return true
				}
			if(false/*needed for other things*/){
				//return whatever
				//crafting/cubing/etc
				}
			return false
			}
		var result = 0, line = null;	
		
		//check potions
		checkMatch();
		//line = Pickit.testpickits.findIndex(checkMatch()); // findIndex
		return {result: result, line: line}
		},	
	
	deliver: function(item, method, character){
		var gid = item.gid;
		if(method == "drop"){
			if(me.itemoncursor){
				me.cancel();
				}
			var tries = 0;
			do{item.toCursor();
				delay(500);
				tries += 1;
				}
			while(!me.itemoncursor()/* && tries < 5*/)
			me.cancel();
			}

		if(method == "trade"){
			//check if character to trade with is present!
			var inventorylocations = [1, 3, 6, 7];
			while(inventorylocations.indexOf(getUnit(4, -1, -1, gid).location) != -1){
				var tradestate = getTradeInfo(0);
				switch(tradestate){
					case 0: // waiting
						delay(2000);
						break;
					case 2: // received request
						tradeOk();
						delay(1000);
						break;
					case 3: // in trade screen
						while(!me.itemOnCursor()){
							// can I access stash from trade screen??
							item.toCursor();
							delay(500);
							}
						while(item.location() != 5){
							//clickItem(0, x, y, 5); // maybe 2?
							delay(500);
							}
						if(checkmaster){
							acceptTrade();
							delay(1000)
							checkmaster = false;
							}
						break;
					case 5: // other player accepted
						break;
					case 7: // I accepted
						delay(3000);
						break;
					}
				if(this.itemGone(gid)){
					break;
					}
				}
			}
		},
	/*
	dropItems: function(method, character){
		// methods: drop or trade
		// character: if trade, character to give it to
		function ItemStats(unit) {
			this.ilvl = unit.ilvl;
			this.itemType = unit.itemType;
			this.quality = unit.quality;
			this.classid = unit.classid;
			this.code = unit.code;
			this.name = unit.name;
			this.x = unit.x;
			this.y = unit.y;
			this.sizex = unit.sizex; // cache for CanFit
			this.sizey = unit.sizey;
			this.gid = unit.gid;
			}
		var status, gid, item, canFit,
			checklist = [],
			noSpaceList = [];
		while (!me.idle) {
			delay(40);
			}
		item = getUnit(4);
		if (item) {
			do {
				if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= Config.PickRange) {
					checklist.push(new ItemStats(item));
					}
				} while (item.getNext());
			}
		while (checklist.length > 0) {
			if (me.dead) {
				return false;
				}
			gid = checklist[0].gid;
			if (gid) {
				item = getUnit(4, -1, -1, gid);
				if (item && (item.mode === 3 || item.mode === 5)) {
					status = this.checkSwag(item);zzz
					if(status.result && !me.itemoncursor){
						this.deliver(item, method, character);
						}
					}
				}
			pickList.shift();
			}
		},	
	*/	
	
	grabGoodItems: function(){
		function ItemStats(unit) {
			this.ilvl = unit.ilvl;
			this.itemType = unit.itemType;
			this.quality = unit.quality;
			this.classid = unit.classid;
			this.code = unit.code;
			this.name = unit.name;
			this.x = unit.x;
			this.y = unit.y;
			this.sizex = unit.sizex; // cache for CanFit
			this.sizey = unit.sizey;
			this.gid = unit.gid;
			}
		Town.clearBelt();

		var status, gid, item, canFit,
			needMule = false,
			checklist = [],
			noSpaceList = [];
		if (me.dead) {
			return false;
			}
		while (!me.idle) {
			delay(40);
			}
		item = getUnit(4);
		if (item) {
			do {
				if ((item.mode === 3 || item.mode === 5) && getDistance(me, item) <= Config.PickRange) {
					checklist.push(new ItemStats(item));
					}
				} while (item.getNext());
			}
		checklist.sort(this.sortItems);
		say("checklist length: " + checklist.length);
		while (checklist.length > 0) {
			if (me.dead) {
				return false;
				}
			gid = checklist[0].gid;
			if (gid) {
				item = getUnit(4, -1, -1, gid);
				if (item && (item.mode === 3 || item.mode === 5)) {
					status = this.checkSwag(item);
					say("checkSwag result: " + status.result);
					if (status.result && this.canPick(checklist[0])) {
						canFit = Storage.Inventory.CanFit(checklist[0]) || [4, 22, 76, 77, 78].indexOf(checklist[0].itemType) > -1;
						say("canFit: " + canFit);
						if (canFit) {
							say("picking item");
							this.pickItem(item, status.result, status.line);
							} else {
							noSpaceList.push(new ItemStats(item));
							}
						}
					}
				}
			checklist.shift();
			}
		if (noSpaceList.length) {
			print(noSpaceList.length + " item(s) can't fit.");
			}
		while (noSpaceList.length > 0) {
			gid = noSpaceList[0].gid;

			if (gid) {
				item = getUnit(4, -1, -1, gid);

				if (item && (item.mode === 3 || item.mode === 5)) {
					status = this.checkSwag(item);

					if (status.result && this.canPick(noSpaceList[0])) {
						canFit = Storage.Inventory.CanFit(noSpaceList[0]) || [4, 22, 76, 77, 78].indexOf(noSpaceList[0].itemType) > -1;

						if (!canFit && Config.FieldID && Town.fieldID()) {
							canFit = Storage.Inventory.CanFit(noSpaceList[0]) || [4, 22, 76, 77, 78].indexOf(noSpaceList[0].itemType) > -1;
							}

						if (!canFit && this.canMakeRoom()) {
							print("�c7Trying to make room for " + this.itemColor(noSpaceList[0]) + noSpaceList[0].name);

							if (!Town.visitTown()) {
								print("�c7Not enough room for " + this.itemColor(noSpaceList[0]) + noSpaceList[0].name);

								return false;
								}

							item = getUnit(4, -1, -1, gid);
							canFit = Storage.Inventory.CanFit(noSpaceList[0]) || [4, 22, 76, 77, 78].indexOf(noSpaceList[0].itemType) > -1;
							}

						if (item) {
							if (canFit) {
								this.pickItem(item, status.result, status.line);
							} else {
								Misc.itemLogger("No room for", noSpaceList[0]);
								print("�c7Not enough room for " + this.itemColor(noSpaceList[0]) + noSpaceList[0].name);

								needMule = true;
								}
							}
						}
					}
				}

			noSpaceList.shift();
			}

		if (needMule && AutoMule.getInfo() && AutoMule.getInfo().hasOwnProperty("muleInfo") && AutoMule.getMuleItems().length > 0) {
			scriptBroadcast("mule");
			quit();
			}
		say("done checking for items");
		return true;
	
		},	
	
	
	pickItem: function (unit, status, keptLine) {
		function ItemStats(unit) {
			this.ilvl = unit.ilvl;
			this.type = unit.itemType;
			this.classid = unit.classid;
			this.name = unit.name;
			this.color = Pickit.itemColor(unit);
			this.gold = unit.getStat(14);
			this.useTk = me.classid === 1 && me.getSkill(43, 1) && (this.type === 4 || this.type === 22 || (this.type > 75 && this.type < 82)) &&
						getDistance(me, unit) > 5 && getDistance(me, unit) < 20 && !checkCollision(me, unit, 0x4);
			this.picked = false;
		}

		var i, item, tick, gid, stats,
			itemCount = me.itemcount;

		if (unit.gid) {
			gid = unit.gid;
			item = getUnit(4, -1, -1, gid);
		}

		if (!item) {
			return false;
		}

		stats = new ItemStats(item);

MainLoop:
		for (i = 0; i < 3; i += 1) {
			if (!getUnit(4, -1, -1, gid)) {
				break MainLoop;
			}

			if (me.dead) {
				return false;
			}

			while (!me.idle) {
				delay(40);
			}

			if (item.mode !== 3 && item.mode !== 5) {
				break MainLoop;
			}

			if (stats.useTk) {
				Skill.cast(43, 0, item);
			} else if (getDistance(me, item) < (Config.FastPick === 2 && i < 1 ? 6 : 4) || Pather.moveToUnit(item)) {
				if (Config.FastPick < 2) {
					Misc.click(0, 0, item);
				} else {
					sendPacket(1, 0x16, 4, 0x4, 4, item.gid, 4, 0);
				}
			}

			tick = getTickCount();

			while (getTickCount() - tick < 1000) {
				item = copyUnit(item);

				if (stats.classid === 523) {
					if (!item.getStat(14) || item.getStat(14) < stats.gold) {
						print("�c7Picked up " + stats.color + (item.getStat(14) ? (item.getStat(14) - stats.gold) : stats.gold) + " " + stats.name);

						return true;
					}
				}

				if (item.mode !== 3 && item.mode !== 5) {
					switch (stats.classid) {
					case 543: // Key
						print("�c7Picked up " + stats.color + stats.name + " �c7(" + Town.checkKeys() + "/12)");

						return true;
					case 529: // Scroll of Town Portal
					case 530: // Scroll of Identify
						print("�c7Picked up " + stats.color + stats.name + " �c7(" + Town.checkScrolls(stats.classid === 529 ? "tbk" : "ibk") + "/20)");

						return true;
					}

					break MainLoop;
				}

				delay(20);
			}

			//print("pick retry");
		}

		stats.picked = me.itemcount > itemCount || !!me.getItem(-1, -1, gid);

		if (stats.picked) {
			DataFile.updateStats("lastArea");

			switch (status) {
			case 1:
				print("�c7Picked up " + stats.color + stats.name + " (ilvl " + stats.ilvl + ")");

				if (this.ignoreLog.indexOf(stats.type) === -1) {
					Misc.itemLogger("Kept", item);

					if (["pk1", "pk2", "pk3"].indexOf(item.code) === -1 || TorchSystem.LogKeys) {
						Misc.logItem("Kept", item, keptLine);
					}
				}

				break;
			case 2:
				print("�c7Picked up " + stats.color + stats.name + " (ilvl " + stats.ilvl + ")" + " �c0(Cubing)");
				Misc.itemLogger("Kept", item, "Cubing " + me.findItems(item.classid).length);
				Cubing.update();

				break;
			case 3:
				print("�c7Picked up " + stats.color + stats.name + " (ilvl " + stats.ilvl + ")" + " �c0(Runewords)");
				Misc.itemLogger("Kept", item, "Runewords");
				Runewords.update(stats.classid, gid);

				break;
			default:
				print("�c7Picked up " + stats.color + stats.name + " (ilvl " + stats.ilvl + ")");

				break;
			}
		}

		return true;
	},
	
	itemQualityToName: function (quality) {
		var qualNames = ["", "lowquality", "normal", "superior", "magic", "set", "rare", "unique", "crafted"];

		return qualNames[quality];
	},

	itemColor: function (unit, type) {
		if (type === undefined) {
			type = true;
		}

		if (type) {
			switch (unit.itemType) {
			case 4: // gold
				return "�c4";
			case 74: // runes
				return "�c8";
			case 76: // healing potions
				return "�c1";
			case 77: // mana potions
				return "�c3";
			case 78: // juvs
				return "�c;";
			}
		}

		switch (unit.quality) {
		case 4: // magic
			return "�c3";
		case 5: // set
			return "�c2";
		case 6: // rare
			return "�c9";
		case 7: // unique
			return "�c4";
		case 8: // crafted
			return "�c8";
		}

		return "�c0";
	},

	sortItems: function (unitA, unitB) {
		return getDistance(me, unitA) - getDistance(me, unitB);
	},

	canPick: function (unit) {
		var tome, charm, i, potion, needPots, buffers, pottype, myKey, key;

		switch (unit.itemType) {
		case 4: // Gold
			if (me.getStat(14) === me.getStat(12) * 10000) { // Check current gold vs max capacity (cLvl*10000)
				return false; // Skip gold if full
			}

			break;
		case 22: // Scroll
			tome = me.getItem(unit.classid - 11, 0); // 518 - Tome of Town Portal or 519 - Tome of Identify, mode 0 - inventory/stash

			if (tome) {
				do {
					if (tome.location === 3 && tome.getStat(70) === 20) { // In inventory, contains 20 scrolls
						return false; // Skip a scroll if its tome is full
					}
				} while (tome.getNext());
			} else {
				return false; // Don't pick scrolls if there's no tome
			}

			break;
		case 41: // Key (new 26.1.2013)
			if (me.classid === 6) { // Assassins don't ever need keys
				return false;
			}

			myKey = me.getItem(543, 0);
			key = getUnit(4, -1, -1, unit.gid); // Passed argument isn't an actual unit, we need to get it

			if (myKey && key) {
				do {
					if (myKey.location === 3 && myKey.getStat(70) + key.getStat(70) > 12) {
						return false;
					}
				} while (myKey.getNext());
			}

			break;
		case 82: // Small Charm
		case 83: // Large Charm
		case 84: // Grand Charm
			if (unit.quality === 7) { // Unique
				charm = me.getItem(unit.classid, 0);

				if (charm) {
					do {
						if (charm.quality === 7) {
							return false; // Skip Gheed's Fortune, Hellfire Torch or Annihilus if we already have one
						}
					} while (charm.getNext());
				}
			}

			break;
		case 76: // Healing Potion
		case 77: // Mana Potion
		case 78: // Rejuvenation Potion
			needPots = 0;

			for (i = 0; i < 4; i += 1) {
				if (typeof unit.code === "string" && unit.code.indexOf(Config.BeltColumn[i]) > -1) {
					needPots += this.beltSize;
				}
			}

			potion = me.getItem(-1, 2);

			if (potion) {
				do {
					if (potion.itemType === unit.itemType) {
						needPots -= 1;
					}
				} while (potion.getNext());
			}

			if (needPots < 1 && this.checkBelt()) {
				buffers = ["HPBuffer", "MPBuffer", "RejuvBuffer"];

				for (i = 0; i < buffers.length; i += 1) {
					if (Config[buffers[i]]) {
						switch (buffers[i]) {
						case "HPBuffer":
							pottype = 76;

							break;
						case "MPBuffer":
							pottype = 77;

							break;
						case "RejuvBuffer":
							pottype = 78;

							break;
						}

						if (unit.itemType === pottype) {
							if (!Storage.Inventory.CanFit(unit)) {
								return false;
							}

							needPots = Config[buffers[i]];
							potion = me.getItem(-1, 0);

							if (potion) {
								do {
									if (potion.itemType === pottype && potion.location === 3) {
										needPots -= 1;
									}
								} while (potion.getNext());
							}
						}
					}
				}
			}
			
			if (needPots < 1) {
				potion = me.getItem(-1, 2);
				if (potion) {
					do {
						if (potion.itemType === unit.itemType) {
							if (potion.classid < unit.classid) {
								potion.interact();
								needPots += 1;
								break;
							}
						}
					} while (potion.getNext());
				}
			}
			
			if (needPots < 1) {
				potion = me.getItem(-1, 0);
				if (potion) {
					do {
						if (potion.itemType === unit.itemType) {
							if (potion.classid < unit.classid) {
								potion.interact();
								needPots += 1;
								break;
							}
						}
					} while (potion.getNext());
				}
			}
			

			if (needPots < 1) {
				return false;
			}

			break;
		case undefined: // Yes, it does happen
			print("undefined item (!?)");

			return false;
		}

		return true;
	},

	checkBelt: function () {
		var check = 0,
			item = me.getItem(-1, 2);

		if (item) {
			do {
				if (item.x < 4) {
					check += 1;
				}
			} while (item.getNext());
		}

		return check === 4;
	}
	/*
	fastPick: function () {
		var item, gid, status;

		while (this.gidList.length > 0) {
			gid = this.gidList.shift();
			item = getUnit(4, -1, -1, gid);

			if (item && (item.mode === 3 || item.mode === 5) && Town.ignoredItemTypes.indexOf(item.itemType) === -1 && getDistance(me, item) <= Config.PickRange) {
				status = this.checkItem(item);

				if (status.result && this.canPick(item) && (Storage.Inventory.CanFit(item) || [4, 22, 76, 77, 78].indexOf(item.itemType) > -1)) {
					this.pickItem(item, status.result, status.line);
				}
			}
		}

		return true;
	}
	*/
};