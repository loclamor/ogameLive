class PlanetProductionParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		// get current planet
		var currentPlanetId = this.dataManager.getCurrentPlanetId();
		log('currentPlanetId', currentPlanetId, LOG_LEVEL_INFO);
		// get current planet production
		var myResourcesRes = Xpath.getOrderedSnapshotNodes(document,'//div[contains(@id,"resources")]/div[contains(@class,"resource_tile")]/div');
		var resourceTypes = OgameConstants.resourceTypes;
		var planetProd = this.dataManager.getPlanetProd(currentPlanetId);
		for (var i = 0; i < myResourcesRes.snapshotLength; i++) {
			var resType = resourceTypes[myResourcesRes.snapshotItem(i).id];
			var htmlStr = myResourcesRes.snapshotItem(i).title.split('|')[1];
			var $html = jQuery(htmlStr);
			var prodRes = Xpath.getOrderedSnapshotNodes(document,'//tr/td/span', $html[0]);
			var nbNodes = prodRes.snapshotLength;
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
				case 'P':
					if (nbNodes > 6) {
						planetProd[resType] = {
							dispo: parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')),
							N2: parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')),
							N3: parseInt(prodRes.snapshotItem(2).textContent.split('.').join('')),
							housing: parseInt(prodRes.snapshotItem(3).textContent.split('.').join('')),
							satiated: parseInt(prodRes.snapshotItem(4).textContent.split('.').join('')),
							hungry: parseInt(prodRes.snapshotItem(5).textContent.split('.').join('')),
							increase: parseInt(prodRes.snapshotItem(6).textContent.split('.').join('')),
							bunker: parseInt(prodRes.snapshotItem(7).textContent.split('.').join('')),
						};
					} else {
						planetProd[resType] = {
							dispo: parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')),
							N2: 0,
							N3: 0,
							housing: parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')),
							satiated: parseInt(prodRes.snapshotItem(2).textContent.split('.').join('')),
							hungry: parseInt(prodRes.snapshotItem(3).textContent.split('.').join('')),
							increase: parseInt(prodRes.snapshotItem(4).textContent.split('.').join('')),
							bunker: parseInt(prodRes.snapshotItem(5).textContent.split('.').join('')),
						}
					}
				  break;
				case 'F':
				  planetProd[resType] = {
						dispo: parseInt(prodRes.snapshotItem(0).textContent.split('.').join('')),
						capa: parseInt(prodRes.snapshotItem(1).textContent.split('.').join('')),
						surprod: parseFloat(prodRes.snapshotItem(2).textContent.split('.').join('').replace(',', '.')),
						conso: parseInt(prodRes.snapshotItem(3).textContent.split('.').join('')),
						durability: parseInt(prodRes.snapshotItem(4).textContent.split('.').join(''))
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
