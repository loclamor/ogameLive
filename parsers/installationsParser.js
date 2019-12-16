class InstallationsParser {
	constructor() {
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
}