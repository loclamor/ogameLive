class DataManager {

	constructor() {
		this.loadedTimestamp = (new Date()).getTime();
		this.planetsIdToCoords = false;
		this.planetsCoordsToId = false;
		this.currentPlanetId = false;
		this.planets = {};
		this.fleetData = false;
		this.planetsProduction = {};
		this.researchData = false;
		this.lastRenderTime = false;
		this.currentTechDetail = false;
		this.flights = {};
	}

	getPlanetCoords(p_id) {
		if (!this.planetsIdToCoords) {
			this.planetsIdToCoords = {};
			this.planetsCoordsToId = {};
			var planetNodes = Xpath.getUnorderedSnapshotNodes(document,'//div[contains(@id,"planetList")]/div[contains(@class,"smallplanet")]');
			for (var i = 0; i < planetNodes.snapshotLength; i++) {
				var planetNode = planetNodes.snapshotItem(i);
				var planetId = planetNode.id;
				var planetCoords = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@id,"'+planetId+'")]/a/span[contains(@class,"planet-koords")]');
				this.planetsIdToCoords[planetId] = cleanCoords(planetCoords);
				this.planetsCoordsToId[cleanCoords(planetCoords)] = planetId;
			}
			storeValue('planetsIdToCoords', this.planetsIdToCoords);
			storeValue('planetsCoordsToId', this.planetsCoordsToId);
		}
		return this.planetsIdToCoords[p_id];
	}

	getPlanetId(p_coords) {
		// Clean coords if needed
		p_coords = cleanCoords(p_coords);
		if (!this.planetsCoordsToId) {
			this.getPlanetCoords();
		}
		return this.planetsCoordsToId[p_coords];
	}

	getCurrentPlanetId() {
		if(!this.currentPlanetId) {
			if (jQuery("#planetList .smallplanet").length === 1
			&& (!(jQuery("#planetList .smallplanet.hightlightPlanet").length === 1) ||
				!(jQuery("#planetList .smallplanet.hightlightMoon").length === 1))) {
				jQuery("#planetList .smallplanet").addClass("hightlightPlanet");
			}
			if (jQuery("#planetList .smallplanet.hightlightPlanet").length === 1) {
				this.currentPlanetId = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@class,"hightlightPlanet")]/@id');
			}
			else {
				this.currentPlanetId = Xpath.getStringValue(document,'//div[contains(@id,"planetList")]/div[contains(@class,"hightlightMoon")]/@id') + '-moon';
			}
		}
		return this.currentPlanetId;
	}

	getCurrentPlanetData() {
		return this.getPlanetData(this.getCurrentPlanetId());
	}

	loadCurrentPlanetData() {
		return this.loadPlanetData(this.getCurrentPlanetId());
	}

	getPlanetData(planetId) {
		if (!this.planets[planetId]) {
			this.planets[planetId] = this.getJsonValue('data.'+planetId, {});
		}
		return this.planets[planetId];
	}

	loadPlanetData(planetId) {
		return retrieveValue('data.'+planetId, {});
	}
	
	updatePlanetData(planetId, planet, force, timestamp) {
		this.planets[planetId] = planet;
		storeValue('data.'+planetId, planet, force, timestamp);
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

	computeNeededGT(amount) {
		if (this.getFleetData() && this.getFleetData().transporterLarge && this.getFleetData().transporterLarge.capacity) {
			return this.computeNeededShip(amount, parseInt(this.getFleetData().transporterLarge.capacity.value));
		}
		return 0;
	}

	computeNeededPT(amount) {
		if (this.getFleetData() && this.getFleetData().transporterSmall && this.getFleetData().transporterSmall.capacity) {
			return this.computeNeededShip(amount, parseInt(this.getFleetData().transporterSmall.capacity.value));
		}
		return 0;
	}

	computeNeededShip(amount, shipCapacity) {
		return Math.ceil(amount/shipCapacity);
	}

	getCurrentPlanetProd() {
		return this.getPlanetProd(this.getCurrentPlanetId());
	}

	getPlanetProd(planetId) {
		if(!this.planetsProduction[planetId]) {
			this.planetsProduction[planetId] = this.getJsonValue('production.'+planetId, {
				M: {dispo: 0, capa: 0, prod: 0, cache: 0},
				C: {dispo: 0, capa: 0, prod: 0, cache: 0},
				D: {dispo: 0, capa: 0, prod: 0, cache: 0},
				F: {dispo: 0, capa: 0, prod: 0, conso: 0, durability: null, surprod: 0},
				E: {dispo: 0, prod: 0},
			});
		}
		return this.planetsProduction[planetId];
	}

	loadCurrentPlanetProd() {
		return this.loadPlanetProd(this.getCurrentPlanetId());
	}
	loadPlanetProd(planetId) {
		return retrieveValue('production.' + planetId, {
			M: {dispo: 0, capa: 0, prod: 0, cache: 0},
			C: {dispo: 0, capa: 0, prod: 0, cache: 0},
			D: {dispo: 0, capa: 0, prod: 0, cache: 0},
			F: {dispo: 0, capa: 0, prod: 0, conso: 0, durability: null, surprod: 0},
			E: {dispo: 0, prod: 0},
		})
	}

	updatePlanetProd(planetId, prod, force, timestamp) {
		this.planetsProduction[planetId] = prod;
		storeValue('production.'+planetId, prod, force, timestamp);
		this.setJsonValue('production.'+planetId, prod);
	}

	getResearchData() {
		if (!this.researchData) {
			this.researchData = this.getJsonValue('data.research', {});
		}
		return this.researchData;
	}

	loadResearchData() {
		return retrieveValue('data.research', {});
	}

	updateResearchData(researchData) {
		this.researchData = researchData;
		storeValue('data.research', researchData);
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

	getCurrentTechDetail() {
		return this.currentTechDetail;
	}

	setCurrentTechDetail(currentTechDetail) {
		this.currentTechDetail = currentTechDetail;
	}

	getTechDetail(techid) {
		var techDetail = this.getJsonValue('techdetail', {});
		if (!techDetail[techid]) {
			techDetail[techid] = {};
		}
		return techDetail[techid];
	}

	setTechDetail(techid, detail) {
		var techDetail = this.getJsonValue('techdetail', {});
		techDetail[techid] = detail;
		this.setJsonValue('techdetail', techDetail);
	}

	getFlights() {
		return this.flights;
	}

	loadFlights() {
		return retrieveValue('flights', {});
	}

	setFlights(flights) {
		this.flights = flights;
		storeValue('flights', flights);
	}

	getParams() {
		if (!this.params) {
			this.params = this.getJsonValue('params', DEFAULT_PARAMS)
		}
		return this.params;
	}

	updateParams(params) {
		this.params = params;
		storeValue('params', params);
		this.setJsonValue('params', params);
	}

	async loadFullPlanet(planetId) {
		let defaults = {};
		defaults['data.' + planetId] = {}
		defaults['data.' + planetId + '-moon'] = {}
		defaults['production.' + planetId] = {
			M: {dispo: 0, capa: 0, prod: 0, cache: 0},
			C: {dispo: 0, capa: 0, prod: 0, cache: 0},
			D: {dispo: 0, capa: 0, prod: 0, cache: 0},
			F: {dispo: 0, capa: 0, prod: 0, conso: 0, durability: null, surprod: 0},
			E: {dispo: 0, prod: 0},
		}
		defaults['production.' + planetId + '-moon'] = {
			M: {dispo: 0, capa: 0, prod: 0, cache: 0},
			C: {dispo: 0, capa: 0, prod: 0, cache: 0},
			D: {dispo: 0, capa: 0, prod: 0, cache: 0},
			F: {dispo: 0, capa: 0, prod: 0, conso: 0, durability: null, surprod: 0},
			E: {dispo: 0, prod: 0},
		}
		const res = await retrieveMultipleValues([
				'data.' + planetId,
				'data.' + planetId + '-moon',
				'production.' + planetId,
				'production.' + planetId + '-moon',
			],
			defaults);
		return [
			res['data.' + planetId],
			res['data.' + planetId + '-moon'],
			res['production.' + planetId],
			res['production.' + planetId + '-moon'],
		]
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
