class PlanetProductionParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		// get current planet
		var currentPlanetId = this.dataManager.getCurrentPlanetId();
		log('currentPlanetId', currentPlanetId, LOG_LEVEL_INFO);
		// get current planet production
		var myResourcesRes = Xpath.getOrderedSnapshotNodes(document,'//ul[contains(@id,"resources")]/li');
		var resourceTypes = OgameConstants.resourceTypes;
		var planetProd = this.dataManager.getPlanetProd(currentPlanetId);
		for (var i = 0; i < myResourcesRes.snapshotLength; i++) {
			var resType = resourceTypes[myResourcesRes.snapshotItem(i).id];
			var htmlStr = myResourcesRes.snapshotItem(i).title.split('|')[1];
			var $html = jQuery(htmlStr);
			var prodRes = Xpath.getOrderedSnapshotNodes(document,'//tr/td/span', $html[0]);
			switch (resType) {
				case 'M':
				case 'C':
				case 'D':
					planetProd[resType] = {
						dispo: parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')),
						capa: parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')),
						prod: parseInt(prodRes.snapshotItem(2).textContent.split('.').join('')),
						cache: parseInt(prodRes.snapshotItem(3).textContent.split('.').join(''))
					};
					break;
				case 'E':
					planetProd[resType] = {
						dispo: parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')),
						prod: parseInt(prodRes.snapshotItem(1).textContent.split('.').join(''))
					}
					break;
				case 'A':
					// nop
			}
		}
		this.dataManager.updatePlanetProd(currentPlanetId, planetProd);
	}
}