/**
 * Created by loclamor on 12/2019.
 */

/*********************** Compatibilité Chrome ***************************/

function GM_getValue(key, defaultVal) {
	var retValue = localStorage.getItem(prefix_GMData + key);
	if (!retValue) {
		return defaultVal;
	}
	return retValue;
}

function GM_getIntValue(key, defaultVal) {
	var retValue = GM_getValue(key, defaultVal);
	return parseInt(retValue);
}

function GM_getJsonValue(key, defaultVal) {
	var retValue = GM_getValue(key, defaultVal);
	return typeof retValue === 'string' ? JSON.parse(retValue) : defaultVal;
}

function GM_setValue(key, value) {
	localStorage.setItem(prefix_GMData + key, value);
}

function GM_setJsonValue(key, value) {
	GM_setValue(key, JSON.stringify(value));
}

function GM_deleteValue(value) {
	localStorage.removeItem(value);
}

/**
	@param args...
	@param logLevel
**/
function log(p_args, p_logLevel) {
	var args = [];
	var logLevel = arguments[arguments.length-1] || LOG_LEVEL_INFO;
	if (logLevel < GM_getIntValue('debug.loglevel', LOG_LEVEL_ALL)) {
		return;
	}
	var d = $.now();
	args.push('[' + d + '] '+ nomScript + ' : ');
	for (var i = 0; i<arguments.length-1; i++) { // do not tack into acount logLevel
		args.push(arguments[i]);
	}
	switch (logLevel) {
		case LOG_LEVEL_FATAL :
		case LOG_LEVEL_ERROR :
			console.error.apply(this, args);
			break;
		case LOG_LEVEL_WARN :
			console.warn.apply(this, args);
			break;
		case LOG_LEVEL_INFO :
			console.info.apply(this, args);
			break;
		case LOG_LEVEL_DEBUG : 
			console.debug.apply(this, args);
			break;
		default :
			console.log.apply(this, args);
	}
}

Xpath = {
	//node est facultatif
	getNumberValue: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.NUMBER_TYPE, null).numberValue;
	},
	getStringValue: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.STRING_TYPE, null).stringValue;
	},
	getOrderedSnapshotNodes: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	},
	getUnorderedSnapshotNodes: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	},
	getSingleNode: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
};

function formatInt( val ) {
	return parseInt(val).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function formatTime( time ) {
	var sec_num =  Math.floor(time/1000);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num % 3600) / 60)
    var seconds = Math.floor(sec_num % 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
	var retStr = '';
	if (parseInt(hours) > 0) {
		retStr += hours+':'
	}
	retStr += minutes+':'+seconds;
    return retStr;
}

function displayPlanetsProduction() {
	
	// compute elapsed time after last call (normally 1s, but in case of browser tab not visible setInterval call seems to be paused)
	var elapsedSeconds = 1;
	var nowTime = (new Date()).getTime();
	var lastTime = GM_getIntValue('production.last_render_time', 0);
	if (lastTime > 0) {
		elapsedSeconds = (nowTime - lastTime)/1000;
	}
	
	if (!document.planetList) {
		//create planetList form Xpath and localStorage
		// get planet list
		var myPlanetsRes = Xpath.getUnorderedSnapshotNodes(document,'//div[contains(@id,"planetList")]/div/@id');
		var nbPlanets = myPlanetsRes.snapshotLength;
		document.planetList = [];
		for (var i = 0; i < nbPlanets; i++) {
			var planetId = myPlanetsRes.snapshotItem(i).textContent;
			var planetdata = GM_getJsonValue('data.'+planetId, {});
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnE = '';
			log("planetId", planetId, LOG_LEVEL_INFO)
			var planet = {
				id: planetId,
				// metal
				m_dispo: GM_getIntValue('production.'+planetId+'.M.dispo', 0),
				m_prod: GM_getIntValue('production.'+planetId+'.M.prod', 0),
				m_capa: GM_getIntValue('production.'+planetId+'.M.capa', 0),
				// cristal
				c_dispo: GM_getIntValue('production.'+planetId+'.C.dispo', 0),
				c_prod: GM_getIntValue('production.'+planetId+'.C.prod', 0),
				c_capa: GM_getIntValue('production.'+planetId+'.C.capa', 0),
				// deut
				d_dispo: GM_getIntValue('production.'+planetId+'.D.dispo', 0),
				d_prod: GM_getIntValue('production.'+planetId+'.D.prod', 0),
				d_capa: GM_getIntValue('production.'+planetId+'.D.capa', 0),
				// energie
				e_dispo: GM_getIntValue('production.'+planetId+'.E.dispo', 0),
				e_prod: GM_getIntValue('production.'+planetId+'.E.prod', 0),
				//build
				currentBuild: false,
			};
			// current build
			var currentBuildNode = Xpath.getSingleNode(document,'//div[contains(@id,"planetList")]/div[contains(@id,"'+planetId+'")]/a[contains(@class,"constructionIcon")]');
			if (currentBuildNode != null) {
				planet.currentBuild = planetdata.currentBuild;
				//get data from localstorage
				if (planetdata.currentBuild) {
					currentBuildNode.title += '&nbsp;('+planet.currentBuild.targetLevel+')';
					jQuery('#'+planetId).append(
						'<span class="planet_construction">'+currentBuildNode.title+'<br/><span class="timer"></span></span>'
					);
					planet.$buildTimer = jQuery('#'+planetId + ' .planet_construction .timer');
				}
			}
			else {
				planetdata.currentBuild = null;
				GM_setJsonValue('data.'+planetId, planetdata);
			}
			
			// actualise planet (add a seconds of loadling gap)
			elapsedSeconds = 2;
			// energie
			if (planet.e_dispo <= 5/100 * planet.e_prod) {
				warnE = 'middlemark';
			}
			if (planet.e_dispo <= 0) {
				warnE = 'overmark';
			}
			var cefPercent = '';
			if (planetdata.prodPercents && planetdata.prodPercents.cef < 100
				&& planetdata.resources && planetdata.resources.fusionPlant > 0
			) {
				cefPercentClass = '';
				if (planetdata.prodPercents.cef < 70) {
					cefPercentClass = 'middlemark';
				}
				if (planetdata.prodPercents.cef < 40) {
					cefPercentClass = 'overmark';
				}
				
				cefPercent = '<span class="cef_percent '+cefPercentClass+'">&nbsp;(fusion&nbsp;'+planetdata.prodPercents.cef+'%)</span>';
			}
			
			// mount base html
			jQuery('#'+planetId).prepend(
				'<div class="prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.m_capa)+'</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.c_capa)+'</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.d_capa)+'</span>'
					+ '<br/><span id="s_dispo"></span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.e_dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.e_prod)+'</span>'
						+ cefPercent
				+ '</div>'
			);
			planet.$m_dispo = jQuery('#'+planetId + ' #m_dispo');
			planet.$c_dispo = jQuery('#'+planetId + ' #c_dispo');
			planet.$d_dispo = jQuery('#'+planetId + ' #d_dispo');
			planet.$s_dispo = jQuery('#'+planetId + ' #s_dispo');
			document.planetList.push(planet);
		}
		jQuery('#planetList').append('<div class="total_prod"></div>');
		
	}
	
	var totalM = 0;
	var totalC = 0;
	var totalD = 0;
	
	
	
	for (var i =0; i<document.planetList.length; i++) {
		var warnM = '';
		var warnC = '';
		var warnD = '';
		var planet = document.planetList[i];
		// currentBuild timer
		if (planet.currentBuild) {
			var planetdata = GM_getJsonValue('data.'+planet.id, {});
			var remainingTime = planetdata.currentBuild.end - nowTime;
			if (remainingTime > 0) {
				planet.$buildTimer.text(formatTime(remainingTime));
			}
			else {
				planet.$buildTimer.text('Terminé');
			}
		}
		// metal
		planet.m_dispo += planet.m_prod/60/60 * elapsedSeconds;
		totalM += planet.m_dispo;
		GM_setValue('production.'+planet.id+'.M.dispo', parseInt(planet.m_dispo))
		if (planet.m_dispo >= (planet.m_capa - 10/100 * planet.m_capa)) {
			warnM = 'middlemark';
		}
		if (planet.m_dispo >= planet.m_capa) {
			warnM = 'overmark';
			if (planet.m_prod > 0) {
				planet.m_dispo = planet.m_capa;
				planet.m_prod = 0;
			}
		}
		planet.$m_dispo.html('<span class="'+warnM+'">M:&nbsp;' + formatInt(planet.m_dispo) + '</span>');
		// cristal
		planet.c_dispo += planet.c_prod/60/60 * elapsedSeconds;
		totalC += planet.c_dispo;
		GM_setValue('production.'+planet.id+'.C.dispo', parseInt(planet.c_dispo))
		if (planet.c_dispo >= (planet.c_capa - 10/100 * planet.c_capa)) {
			warnC = 'middlemark';
		}
		if (planet.c_dispo >= planet.c_capa) {
			warnC = 'overmark';
			if (planet.c_prod > 0) {
				planet.c_dispo = planet.c_capa;
				planet.c_prod = 0;
			}
		}
		planet.$c_dispo.html('<span class="'+warnC+'">C:&nbsp;' + formatInt(planet.c_dispo) + '</span>');
		// deut
		planet.d_dispo += planet.d_prod/60/60 * elapsedSeconds;
		totalD += planet.d_dispo;
		GM_setValue('production.'+planet.id+'.D.dispo', parseInt(planet.d_dispo))
		if (planet.d_dispo >= (planet.d_capa - 10/100 * planet.d_capa)) {
			warnD = 'middlemark';
		}
		if (planet.d_dispo >= planet.d_capa) {
			warnD = 'overmark';
			if (planet.d_prod > 0) {
				planet.d_dispo = planet.d_capa;
				planet.d_prod = 0;
			}
		}
		planet.$d_dispo.html('<span class="'+warnD+'">D:&nbsp;' + formatInt(planet.d_dispo) + '</span>');
		//sum
		planet.$s_dispo.html('<span class="">&Sigma;:&nbsp;' + formatInt(planet.m_dispo + planet.c_dispo + planet.d_dispo) + '</span>');
	}
	jQuery('#planetList .total_prod').html(
			'Totaux :'
			+ '<br/>M:&nbsp;' + formatInt(totalM)
			+ '<br/>C:&nbsp;' + formatInt(totalC)
			+ '<br/>D:&nbsp;' + formatInt(totalD)
			+ '<br/>&Sigma;:&nbsp;' + formatInt(totalM + totalC + totalD)
		);
		
	// set Now as last render time
	GM_setValue('production.last_render_time', nowTime);
}

function parseResources() {
	// get current planet
	var currentPlanetId = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@class,"hightlightPlanet")]/@id');
	log('currentPlanetId', currentPlanetId, LOG_LEVEL_INFO);
	document.currentPlanetId = currentPlanetId;
	// get current planet production
	var myResourcesRes = Xpath.getOrderedSnapshotNodes(document,'//ul[contains(@id,"resources")]/li');
	var resourceTypes = OgameConstants.resourceTypes;
	for (var i = 0; i < myResourcesRes.snapshotLength; i++) {
		var resType = resourceTypes[myResourcesRes.snapshotItem(i).id];
		var htmlStr = myResourcesRes.snapshotItem(i).title.split('|')[1];
		var $html = jQuery(htmlStr);
		var prodRes = Xpath.getOrderedSnapshotNodes(document,'//tr/td/span', $html[0]);
		switch (resType) {
			case 'M':
			case 'C':
			case 'D':
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'dispo', parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')));
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'capa', parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')));
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'prod', parseInt(prodRes.snapshotItem(2).textContent.split('.').join('')));
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'cache', parseInt(prodRes.snapshotItem(3).textContent.split('.').join('')));
				break;
			case 'E':
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'dispo', parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')));
				GM_setValue('production.'+currentPlanetId+'.'+resType+'.'+'prod', parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')));
				break;
			case 'A':
				// nop
		}
	}
	
}


function parse_current_page() {

	var regOverview = new RegExp(/component=(overview)/);
	var regResources = new RegExp(/component=(supplies)/);
	var regResourceSettings = new RegExp(/page=(resourceSettings)/);
	var regInstallations = new RegExp(/component=(facilities)/);
	var regResearch = new RegExp(/component=(research)/);
	var regShipyard = new RegExp(/component=(shipyard)/);
	var regDefenses = new RegExp(/component=(defenses)/);
	var regFleet = new RegExp(/component=(fleetdispatch)/);

	if (regResourceSettings.test(url)) {
		parse_resource_settings();
	} else if (regResearch.test(url)) {
		parse_research();
		addTechDetailObserver();
	} else if (regResources.test(url)) {
		parse_resources();
		addTechDetailObserver();
	} else if (regInstallations.test(url)) {
		parse_installations();
		addTechDetailObserver();
	} else if (regShipyard.test(url) || regFleet.test(url)) {
		parse_fleet();
		if (regFleet.test(url)) {
			better_fleet_display();
		}
		else {
			addTechDetailObserver();
		}
	}
}

function parse_resource_settings() {
	var constants = OgameConstants.resources;
	// get percent of productions
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.prodPercents) {
		planetData.prodPercents = {};
	}
	Object.keys(constants).forEach(function(k) {
		planetData.prodPercents[k] = 
			parseInt(Xpath.getOrderedSnapshotNodes(document, '//table[contains(@class,"listOfResourceSettingsPerPlanet")]/tbody/tr[contains(@class,"'+constants[k]+'")]/td/select').snapshotItem(0).value);
	});
	GM_setJsonValue('data.'+planetId, planetData);
}

function parse_research() {
	var constants = OgameConstants.research;
	// get research levels
	var researchData = GM_getJsonValue('data.research', {});
	Object.keys(constants).forEach(function(k) {
		researchData[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'Technology")]/span/span[contains(@class,"level")]/@data-value');
	});
	GM_setJsonValue('data.research', researchData);
}

function parse_resources() {
	var constants = OgameConstants.buildings.resources;
	// get resources levels
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.resources) {
		planetData.resources = {};
	}
	if (!planetData.installations) {
		planetData.currentBuild = {
			building: '',
			targetLevel: 0,
			start: 0,
			end: 0
		};
	}
	Object.keys(constants).forEach(function(k) {
		// get current build level
		planetData.resources[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"level")]/@data-value');
		// get current build if present
		var buildTimerNode = Xpath.getSingleNode(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/time[contains(@id,"countdownbuildingDetails")]');
		if (buildTimerNode != null) {
			planetData.currentBuild = {
				building: k,
				targetLevel: Xpath.getNumberValue(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"targetlevel")]/@data-value'),
				start: buildTimerNode.dataset.start * 1000,
				end: buildTimerNode.dataset.end * 1000
			}
		}
	});
	GM_setJsonValue('data.'+planetId, planetData);
}

function parse_installations() {
	var constants = OgameConstants.buildings.installations;
	// get installations levels
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.installations) {
		planetData.installations = {};
	}
	if (!planetData.installations) {
		planetData.currentBuild = {
			building: '',
			targetLevel: 0,
			start: 0,
			end: 0
		};
	}
	Object.keys(constants).forEach(function(k) {
		// get current build level
		planetData.installations[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"level")]/@data-value');
		// get current build if present
		var buildTimerNode = Xpath.getSingleNode(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/time[contains(@id,"countdownbuildingDetails")]');
		if (buildTimerNode != null) {
			planetData.currentBuild = {
				building: k,
				targetLevel: Xpath.getNumberValue(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"targetlevel")]/@data-value'),
				start: buildTimerNode.dataset.start * 1000,
				end: buildTimerNode.dataset.end * 1000
			}
		}
	});
	GM_setJsonValue('data.'+planetId, planetData);
}

function parse_fleet() {
	var constants = OgameConstants.fleet;
	// last fleetData parse more than 30 min ago ?
	var elapsedSeconds = 0;
	var nowTime = (new Date()).getTime();
	var lastTime = GM_getIntValue('data.last_fleetdata_time', nowTime - 60*60*1000); 
	if (lastTime > 0) {
		elapsedSeconds = (nowTime - lastTime)/1000;
	}
	var getFleetData = false;
	if (elapsedSeconds > 30*60) {
		GM_setValue('data.last_fleetdata_time',nowTime);
		getFleetData = true;
	}
	// get installations levels
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.fleet) {
		planetData.fleet = {};
	}
	Object.keys(constants).forEach(function(k) {
		planetData.fleet[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"amount")]/@data-value');
		if (getFleetData) {
			jQuery.get('https://s167-fr.ogame.gameforge.com/game/index.php?page=ajax&component=technologytree&ajax=1&technologyId='+constants[k]+'&tab=2', function(htmlStr) {
				log("get response for " + k, LOG_LEVEL_TRACE);
				var fleetData = GM_getJsonValue('data.fleet', {});
				if (!fleetData[k]) {
					fleetData[k] = {speed: {}, structural: {}, shield: {}, attack: {}, capacity: {}, consumption: {}};
				}
				var $html = jQuery(htmlStr);
				fleetData[k].structural = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"structural_integrity")]/td/span', $html[0]).dataset;
				fleetData[k].shield = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"shield_strength")]/td/span', $html[0]).dataset;
				fleetData[k].attack = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"attack_strength")]/td/span', $html[0]).dataset;
				fleetData[k].speed = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"speed")]/td/span', $html[0]).dataset;
				fleetData[k].capacity = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"cargo_capacity")]/td/span', $html[0]).dataset;
				fleetData[k].consumption = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"fuel_consumption")]/td/span', $html[0]).dataset;
				GM_setJsonValue('data.fleet', fleetData);
			});
		}
	});
	GM_setJsonValue('data.'+planetId, planetData);
}


function addTechDetailObserver() {
	var techDetailWrapper = document.querySelector('#technologydetails_wrapper');
	var techDetailWrapperObserver = new MutationObserver(function(mutations) {
		console.log('changed ! Hope that all technologydetails have same html struct', mutations);
	});
	var config = { attributes: true, childList: true, characterData: true };
	techDetailWrapperObserver.observe(techDetailWrapper, config);
}

function better_fleet_display() {
	var constants = OgameConstants.fleet;
	var selections = {};
	var fleetData = GM_getJsonValue('data.fleet', {});
	
	// Add More Infos table structure of selected fleet
	$moreInfoTable = jQuery(
		'<table id="moreInfoTable">'
			+ '<tr><th>Capacity</th><td class="capacity">0</td></tr>'
			+ '<tr><th>Speed</th><td class="speed">0</td></tr>'
		+ '</table>'
	);
	jQuery('#allornone .show_fleet_apikey').after($moreInfoTable);
	
		
	function updateMoreInfoTable() {
	
		Object.keys(fleetData).forEach(function(ship) {
			selections[ship] = parseInt(jQuery('#technologies li.'+ship+' input').val() || 0);
		});
		console.log(selections);
		var fleetSpeed = 0;
		var fleetCapacity = 0;
		// compute minSpeed and sum capacities
		Object.keys(selections).forEach(function(s) {
			if (selections[s] > 0 && (fleetSpeed == 0 || parseInt(fleetData[s].speed.value) < fleetSpeed) ) {
				fleetSpeed = parseInt(fleetData[s].speed.value);
			}
			fleetCapacity += selections[s] * parseInt(fleetData[s].capacity.value);
		});
		// update display
		$moreInfoTable.find('.capacity').text(formatInt(fleetCapacity));
		$moreInfoTable.find('.speed').text(formatInt(fleetSpeed));
	}
	
	// Add fleetdata on every ship
	Object.keys(fleetData).forEach(function(k) {
		
		jQuery('#technologies li.'+k).attr('title',
			jQuery('#technologies li.'+k).attr('title')
			+ '<br/>Speed : ' + formatInt(fleetData[k].speed.value)
			+ '<br/>Capacity : ' + formatInt(fleetData[k].capacity.value)
			+ '<br/>Consumption : ' + formatInt(fleetData[k].consumption.value)
			+ '<br/>Struct : ' + formatInt(fleetData[k].structural.value)
			+ '<br/>Attack : ' + formatInt(fleetData[k].attack.value)
			+ '<br/>Shield : ' + formatInt(fleetData[k].shield.value)
		);
		
		jQuery('#technologies li.'+k+' .icon').prepend(
			'<span class="speed">'+formatInt(fleetData[k].speed.value)+'</span>'
		);
		
		//attach event listeners on inputs
		jQuery('#technologies li.'+k+' input').on('change keyup keydown', updateMoreInfoTable);
		jQuery('#technologies li.'+k+' .icon').click(function() {
			setTimeout(updateMoreInfoTable, 1);
		});
	});
}


	
