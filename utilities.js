/**
 * Created by Anthony on 14/05/2016.
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
				e_prod: GM_getIntValue('production.'+planetId+'.E.prod', 0)
			};
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
	var resourceTypes = {
		metal_box : 'M',
		crystal_box : 'C',
		deuterium_box : 'D',
		energy_box : 'E',
		darkmatter_box : 'A'
	};
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
	} else if (regResources.test(url)) {
		parse_resources();
	} else if (regInstallations.test(url)) {
		parse_installations();
	} else if (regShipyard.test(url) || regFleet.test(url)) {
		parse_fleet();
	}
}

function parse_resource_settings() {
	var constants = {
		metal: 1,
		cristal: 2,
		deut: 3,
		ces: 4,
		cef: 12,
		sat: 212,
		foreuse: 217
	}
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
	var constants = {
		energy: 113,
		laser: 120,
		ion: 121,
		hyperspace: 114,
		plasma: 122,
		combustionDrive: 115,
		impulseDrive: 117,
		hyperspaceDrive: 118,
		espionage: 106,
		computer: 108,
		astrophysics: 124,
		researchNetwork: 123,
		graviton: 199,
		weapons: 109,
		shielding: 110,
		armor: 111
	}
	// get research levels
	var researchData = GM_getJsonValue('data.research', {});
	Object.keys(constants).forEach(function(k) {
		researchData[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'Technology")]/span/span[contains(@class,"level")]/@data-value');
	});
	GM_setJsonValue('data.research', researchData);
	
}

function parse_resources() {
	var constants = {
		metalMine: 1,
		crystalMine: 2,
		deuteriumSynthesizer: 3,
		solarPlant: 4,
		fusionPlant: 12,
		solarSatellite: 112,
		resbuggy: 217,
		metalStorage: 22,
		crystalStorage: 23,
		deuteriumStorage: 24
	}
	// get resources levels
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.resources) {
		planetData.resources = {};
	}
	Object.keys(constants).forEach(function(k) {
		planetData.resources[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"level")]/@data-value');
	});
	GM_setJsonValue('data.'+planetId, planetData);
}

function parse_installations() {
	var constants = {
		roboticsFactory: 14,
		shipyard: 21,
		researchLaboratory: 31,
		allianceDepot: 34,
		missileSilo: 44,
		naniteFactory: 15,
		terraformer: 33,
		repairDock: 36
	}
	// get installations levels
	var planetId = document.currentPlanetId;
	var planetData = GM_getJsonValue('data.'+planetId, {});
	if (!planetData.installations) {
		planetData.installations = {};
	}
	Object.keys(constants).forEach(function(k) {
		planetData.installations[k] = 
			Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"level")]/@data-value');
	});
	GM_setJsonValue('data.'+planetId, planetData);
}

function parse_fleet() {
	var constants = {
		fighterLight: 204,
		fighterHeavy: 205,
		cruiser: 206,
		battleship: 207,
		interceptor: 215,
		bomber: 211,
		destroyer: 213,
		deathstar: 214,
		reaper: 218,
		explorer: 219,
		transporterSmall: 202,
		transporterLarge: 203,
		colonyShip: 208,
		recycler: 209,
		espionageProbe: 210,
		solarSatellite: 212,
		resbuggy: 217
	}
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
				log("get response for " + k, htmlStr, LOG_LEVEL_TRACE);
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