class FleetParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var constants = OgameConstants.fleet;
		// last fleetData parse more than 30 min ago ?
		var elapsedSeconds = 0;
		var nowTime = (new Date()).getTime();
		var lastTime = dataManager.getIntValue('data.last_fleetdata_time', nowTime - 60*60*1000); 
		if (lastTime > 0) {
			elapsedSeconds = (nowTime - lastTime)/1000;
		}
		var getFleetData = false;
		if (elapsedSeconds > 30*60) {
			dataManager.setValue('data.last_fleetdata_time',nowTime);
			getFleetData = true;
		}
		// get installations levels
		var planetData = dataManager.getCurrentPlanetData();
		if (!planetData.fleet) {
			planetData.fleet = {};
		}
		Object.keys(constants).forEach(function(k) {
			planetData.fleet[k] = 
				Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"amount")]/@data-value');
			if (getFleetData) {
				jQuery.get('https://s167-fr.ogame.gameforge.com/game/index.php?page=ajax&component=technologytree&ajax=1&technologyId='+constants[k]+'&tab=2', function(htmlStr) {
					log("get response for " + k, LOG_LEVEL_TRACE);
					var fleetData = dataManager.getFleetData();
					if (!fleetData[k]) {
						fleetData[k] = {speed: {}, structural: {}, shield: {}, attack: {}, capacity: {}, consumption: {}};
					}
					var $html = jQuery(htmlStr);
					fleetData[k].structural = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"structural_integrity")]/td/span', $html[0]).dataset;
					fleetData[k].shield = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"shield_strength")]/td/span', $html[0]).dataset;
					fleetData[k].attack = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"attack_strength")]/td/span', $html[0]).dataset;
					fleetData[k].speed = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"speed")]/td/span', $html[0]).dataset;
					fleetData[k].capacity = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"cargo_capacity")]/td/span', $html[0]).dataset;
					fleetData[k].consumption = Xpath.getSingleNode(document,'//table[contains(@class,"combat_unit_details")]/tbody/tr[contains(@class,"fuel_consumption")]/td/span', $html[0]).dataset;
					dataManager.updateFleetData(fleetData);
				});
			}
		});
		dataManager.updateCurrentPlanetData(planetData);
	}
}