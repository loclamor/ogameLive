class PlanetProductionParser {
	constructor() {
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
}