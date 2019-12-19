class DataManager {

	constructor() {
		this.currentPlanetId = false;
		this.planets = {};
		this.fleetData = false;
		this.planetsProduction = {};
		this.researchData = false;
		this.lastRenderTime = false;
	}

	getCurrentPlanetId() {
		if(!this.currentPlanetId) {
			this.currentPlanetId = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@class,"hightlightPlanet")]/@id');
		}
		return this.currentPlanetId;
	}

	getCurrentPlanetData() {
		return this.getPlanetData(this.getCurrentPlanetId());
	}

	getPlanetData(planetId) {
		if (!this.planets[planetId]) {
			this.planets[planetId] = this.getJsonValue('data.'+planetId, {});
		}
		return this.planets[planetId];
	}
	
	updatePlanetData(planetId, planet) {
		this.planets[planetId] = planet;
		this.setJsonValue('data.'+planetId, planet);
	}

	updateCurrentPlanetData(planet) {
		this.updatePlanetData(this.getCurrentPlanetId(), planet)
	}

	getFleetData() {
		if(!this.fleetData) {
			this.fleetData = this.getJsonValue('data.fleet', {});
		}
		return this.fleetData;
	}
	
	updateFleetData(fleetData) {
		this.fleetData = fleetData;
		this.setJsonValue('data.fleet', fleetData);
	}

	getPlanetProd(planetId) {
		if(!this.planetsProduction[planetId]) {
			this.planetsProduction[planetId] = this.getJsonValue('production.'+planetId, {
				M: {dispo: 0, capa: 0, prod: 0, cache: 0},
				C: {dispo: 0, capa: 0, prod: 0, cache: 0},
				D: {dispo: 0, capa: 0, prod: 0, cache: 0},
				E: {dispo: 0, prod: 0},
			});
		}
		return this.planetsProduction[planetId];
	}

	updatePlanetProd(planetId, prod) {
		this.planetsProduction[planetId] = prod;
		this.setJsonValue('production.'+planetId, prod);
	}

	getResearchData() {
		if (!this.researchData) {
			this.researchData = this.getJsonValue('data.research', {});
		}
		return this.researchData;
	}

	updateResearchData(researchData) {
		this.researchData = researchData;
		this.setJsonValue('data.research', researchData);
	}

	getLastRenderTime() {
		if(!this.lastRenderTime) {
			this.lastRenderTime = this.getIntValue('production.last_render_time', 0);
		}
		return this.lastRenderTime;
	}

	updateLastRenderTime(newTime) {
		this.lastRenderTime = newTime;
		this.setValue('production.last_render_time', newTime);
	}


	/**
	 * LocalStorage accesors
	 **/

	getValue(key, defaultVal) {
		return GM_getValue(key, defaultVal);
	}

	getIntValue(key, defaultVal) {
		return GM_getIntValue(key, defaultVal);
	}

	getJsonValue(key, defaultVal) {
		return GM_getJsonValue(key, defaultVal);
	}

	setValue(key, value) {
		GM_setValue(key, value);
	}

	setJsonValue(key, value) {
		GM_setJsonValue(key, value);
	}

	deleteValue(key) {
		GM_deleteValue(key);
	}

}