class ResourceSettingsParser {
	constructor() {
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
}