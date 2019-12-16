class ResearchParser {
	constructor() {
		var constants = OgameConstants.research;
		// get research levels
		var researchData = GM_getJsonValue('data.research', {});
		Object.keys(constants).forEach(function(k) {
			researchData[k] = Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'Technology")]/span/span[contains(@class,"level")]/@data-value');
		});
		GM_setJsonValue('data.research', researchData);
	}
}