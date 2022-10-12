class ResearchParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var constants = OgameConstants.research;
		// get research levels
		var researchData = this.dataManager.getResearchData();
		Object.keys(constants).forEach(function(k) {
			researchData[k] = Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'Technology")]/span/span[contains(@class,"level")]/@data-value');
		});
		this.dataManager.updateResearchData(researchData);
	}
}