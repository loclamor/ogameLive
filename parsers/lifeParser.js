class LifeParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var constants = OgameConstants.lifeform;
		// get lifeform levels
		var planetData = this.dataManager.getCurrentPlanetData();
		if (!planetData.lifeform) {
			planetData.lifeform = {};
		}
		if (!planetData.currentLifeBuild) {
			planetData.currentLifeBuild = {
				building: '',
				targetLevel: 0,
				start: 0,
				end: 0
			};
		}
		Object.keys(constants).forEach(function(k) {
			// get current build level
			planetData.lifeform[k] = 
				Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"level")]/@data-value');
			// get current build if present
			var buildTimerNode = Xpath.getSingleNode(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/time[contains(@id,"countdownbuildingDetails")]');
			if (buildTimerNode != null) {
				planetData.currentLifeBuild = {
					building: k,
					targetLevel: Xpath.getNumberValue(document,'//div[contains(@id,"technologies")]/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"targetlevel")]/@data-value'),
					start: buildTimerNode.dataset.start * 1000,
					end: buildTimerNode.dataset.end * 1000
				}
			}
		});
		this.dataManager.updateCurrentPlanetData(planetData);
	}
}
