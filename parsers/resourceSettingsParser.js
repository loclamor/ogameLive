class ResourceSettingsParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var constants = OgameConstants.resources;
		// get percent of productions
		var planetData = this.dataManager.getCurrentPlanetData();
		if (!planetData.prodPercents) {
			planetData.prodPercents = {};
		}
		Object.keys(constants).forEach(function(k) {
			planetData.prodPercents[k] = 
				parseInt(Xpath.getOrderedSnapshotNodes(document, '//table[contains(@class,"listOfResourceSettingsPerPlanet")]/tbody/tr[contains(@class,"'+constants[k]+'")]/td/select').snapshotItem(0).value);
		});
		this.dataManager.updateCurrentPlanetData(planetData);
	}
}