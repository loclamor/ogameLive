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

function GM_setValue(key, value) {
    localStorage.setItem(prefix_GMData + key, value);
}

function GM_deleteValue(value) {
    localStorage.removeItem(value);
}

function log(message) {
    if (GM_getValue('debug.mode', 'false').toString() !== 'true') {
        return;
    }

    //d = new Date();
    var d = $.now();
    console.log('[' + d + '] '+ nomScript + ' : ' + message);
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
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnE = '';
			console.log("planetId", planetId)
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
			
			// mount base html
			jQuery('#'+planetId).append(
				'<div class="prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.m_capa)+'</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.c_capa)+'</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.d_capa)+'</span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.e_dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.e_prod)+'</span>'
				+ '</div>'
			);
			planet.$m_dispo = jQuery('#'+planetId + ' #m_dispo');
			planet.$c_dispo = jQuery('#'+planetId + ' #c_dispo');
			planet.$d_dispo = jQuery('#'+planetId + ' #d_dispo');
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
	}
	jQuery('#myWorlds #planetList .total_prod').html(
			'Totaux :'
			+ '<br/>M:&nbsp;' + formatInt(totalM)
			+ '<br/>C:&nbsp;' + formatInt(totalC)
			+ '<br/>D:&nbsp;' + formatInt(totalD)
		);
		
	// set Now as last render time
	GM_setValue('production.last_render_time', nowTime);
}

function parseResources() {
	// get current planet
	var currentPlanetId = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@class,"hightlightPlanet")]/@id');
	console.log('currentPlanetId', currentPlanetId);
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
		
	/*	console.log('dispo', resType, prodRes.snapshotItem(0).textContent);
		console.log('capa', resType, prodRes.snapshotItem(1).textContent);
		console.log('prod', resType, prodRes.snapshotItem(2).textContent);
		console.log('cache', resType, prodRes.snapshotItem(3).textContent);
	*/	
		
		
	}
	
}