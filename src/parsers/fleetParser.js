class FleetParser {
	constructor(dataManager) {
		this.dataManager = dataManager;
		// last fleetData parse more than 30 min ago ?
		var elapsedSeconds = 0;
		var nowTime = (new Date()).getTime();
		this.lastTime = dataManager.getIntValue('data.last_fleetdata_time', nowTime - 60 * 60 * 1000);
		if (this.lastTime > 0) {
			elapsedSeconds = (nowTime - this.lastTime) / 1000;
		}
		this.getFleetData = false;
		if (elapsedSeconds > 30 * 60) {
			dataManager.setValue('data.last_fleetdata_time', nowTime);
			this.getFleetData = true;
		}
	}
	async parse() {
		const constants = OgameConstants.fleet;
		// get installations levels
		let planetData = await this.dataManager.loadCurrentPlanetData();
		if (!planetData.fleet) {
			planetData.fleet = {};
		}
		planetData.vaissels = 0;
		Object.keys(constants).forEach(jQuery.proxy(function(k) {
			planetData.fleet[k] = 
				Xpath.getNumberValue(document, '//div[contains(@id,"technologies")]/div/ul/li[contains(@class,"'+k+'")]/span/span[contains(@class,"amount")]/@data-value');
			if (isNaN(planetData.fleet[k])) {
				planetData.fleet[k] = 0;
			}
			console.log(k, planetData.fleet[k]);
			if (k !== 'resbuggy' && k !== 'solarSatellite') {
				// Do not count resbuggy and solarSatellite
				planetData.vaissels += planetData.fleet[k];
			}
			if (this.getFleetData) {
				jQuery.get(urlUnivers + '/game/index.php?page=ajax&component=technologytree&ajax=1&technologyId=' + constants[k]+'&tab=2', jQuery.proxy(function(htmlStr) {
					log("get response for " + k, LOG_LEVEL_TRACE);
					var fleetData = this.dataManager.getFleetData();
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
					this.dataManager.updateFleetData(fleetData);
				}, this));
			}
		}, this));
		this.dataManager.updateCurrentPlanetData(planetData);
	}
}
