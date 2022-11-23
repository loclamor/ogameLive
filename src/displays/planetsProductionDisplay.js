class PlanetsProductionDisplay {

	

	constructor(dataManager) {
		this.dataManager = dataManager;
		this.planetList = [];
		this.elapsedSeconds = 1;
		this.lastTime = 0;
		this.fleetData = {};
		this.fleetData = this.dataManager.getFleetData();
		// compute elapsed time after last call (normally 1s, but in case of browser tab not visible setInterval call seems to be paused)
		var nowTime = (new Date()).getTime();
		this.lastTime = this.dataManager.getLastRenderTime();
		if (this.lastTime > 0) {
			this.elapsedSeconds = (nowTime - this.lastTime)/1000;
		}
		//create planetList form Xpath and localStorage
		// get planet list
		var myPlanetsRes = Xpath.getUnorderedSnapshotNodes(document,'//div[contains(@id,"planetList")]/div/@id');
		var nbPlanets = myPlanetsRes.snapshotLength;

		var m_total_prod = 0;
		var c_total_prod = 0;
		var d_total_prod = 0;
		var f_total_prod = 0;

		for (var i = 0; i < nbPlanets; i++) {
			var planetId = myPlanetsRes.snapshotItem(i).textContent;
			var planetdata = this.dataManager.getPlanetData(planetId);
			var moondata = this.dataManager.getPlanetData(planetId + '-moon');
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnE = '';
			log("planetId", planetId, LOG_LEVEL_INFO)
			var planet = {
				id: planetId,
				// metal
				prod: this.dataManager.getPlanetProd(planetId),
				moonprod: this.dataManager.getPlanetProd(planetId + '-moon'),
				//build
				currentBuild: false,
				currentMoonBuild: false,
				data: planetdata,
				moondata: moondata
			};
			
			//prods totaux
			m_total_prod += planet.prod.M.prod;
			c_total_prod += planet.prod.C.prod;
			d_total_prod += planet.prod.D.prod;
			f_total_prod += planet.prod.F.surprod;

			// current build
			var currentBuildNodes = Xpath.getOrderedSnapshotNodes(document,'//div[contains(@id,"planetList")]/div[contains(@id,"'+planetId+'")]/a[contains(@class,"constructionIcon")]');
			if (currentBuildNodes.snapshotLength > 0) {
				for(var cons= 0; cons < currentBuildNodes.snapshotLength; cons++) {
					var currentBuildNode = currentBuildNodes.snapshotItem(cons);
					if (currentBuildNode.classList.contains('moon') && moondata) {
						// moon construction
						planet.currentMoonBuild = moondata.currentBuild;
						//get data from localstorage
						if (moondata.currentBuild) {
							currentBuildNode.title += '&nbsp;('+planet.currentMoonBuild.targetLevel+')';
							jQuery('#'+planetId).append(
								'<span class="planet_construction_moon">'+currentBuildNode.title+'<br/><span class="timer"></span></span>'
							);
							planet.$buildMoonTimer = jQuery('#'+planetId + ' .planet_construction_moon .timer');
						}
					}
					else {
						planet.currentBuild = planetdata.currentBuild;
						//get data from localstorage
						if (planetdata.currentBuild) {
							currentBuildNode.title += '&nbsp;('+planet.currentBuild.targetLevel+')';
							jQuery('#'+planetId).append(
								'<span class="planet_construction">'+currentBuildNode.title+'<br/><span class="timer"></span></span>'
							);
							planet.$buildTimer = jQuery('#'+planetId + ' .planet_construction .timer');
						}
					}
				}
				
			}
			else {
				planetdata.currentBuild = null;
				this.dataManager.updatePlanetData(planetId, planetdata);

				moondata.currentBuild = null;
				this.dataManager.updatePlanetData(planetId + '-moon', moondata);
			}
			
			// energie
			if (planet.prod.E.dispo <= 5/100 * planet.prod.E.prod) {
				warnE = 'middlemark';
			}
			if (planet.prod.E.dispo <= 0) {
				warnE = 'overmark';
			}
			var cefPercent = '';
			if (planetdata.prodPercents && planetdata.prodPercents.cef < 100
				&& planetdata.resources && planetdata.resources.fusionPlant > 0
			) {
				var cefPercentClass = '';
				if (planetdata.prodPercents.cef < 70) {
					cefPercentClass = 'middlemark';
				}
				if (planetdata.prodPercents.cef < 40) {
					cefPercentClass = 'overmark';
				}
				
				cefPercent = '<span class="cef_percent '+cefPercentClass+'">&nbsp;(fusion&nbsp;'+planetdata.prodPercents.cef+'%)</span>';
			}

			// production planet
			var m_prod_class = '';
			if (planetdata.prodPercents && planetdata.prodPercents.metal) {
				if (planetdata.prodPercents.metal < 70) {
					m_prod_class = 'middlemark';
				}
				if (planetdata.prodPercents.metal < 40) {
					m_prod_class = 'overmark';
				}
			}
			if (planet.prod.M.prod == 0)	{
				m_prod_class = 'overmark';
			}
			var c_prod_class = '';
			if (planetdata.prodPercents && planetdata.prodPercents.cristal) {
				if (planetdata.prodPercents.cristal < 70) {
					c_prod_class = 'middlemark';
				}
				if (planetdata.prodPercents.cristal < 40) {
					c_prod_class = 'overmark';
				}
			}
			if (planet.prod.C.prod == 0)	{
				c_prod_class = 'overmark';
			}
			var d_prod_class = '';
			if (planetdata.prodPercents && planetdata.prodPercents.deut) {
				if (planetdata.prodPercents.deut < 70) {
					d_prod_class = 'middlemark';
				}
				if (planetdata.prodPercents.deut < 40) {
					d_prod_class = 'overmark';
				}
			}
			if (planet.prod.D.prod == 0)	{
				d_prod_class = 'overmark';
			}

			if (!planet.prod.F) {
				planet.prod.F = {dispo: 0, capa: 0, surprod: 0, conso: 0, durability: null}
			}
			var f_prod_class = '';
			if (planetdata.prodPercents && planetdata.prodPercents.food) {
				if (planetdata.prodPercents.food < 70) {
					f_prod_class = 'middlemark';
				}
				if (planetdata.prodPercents.deut < 40) {
					f_prod_class = 'overmark';
				}
			}
			if (planet.prod.F.surprod == 0)	{
				f_prod_class = 'overmark';
			}

			// production moon
			var m_prod_class_moon = '';
			if (moondata.prodPercents && moondata.prodPercents.metal) {
				if (moondata.prodPercents.metal < 70) {
					m_prod_class_moon = 'middlemark';
				}
				if (moondata.prodPercents.metal < 40) {
					m_prod_class_moon = 'overmark';
				}
			}
			if (planet.moonprod.M.prod == 0)	{
				m_prod_class_moon = 'overmark';
			}
			var c_prod_class_moon = '';
			if (moondata.prodPercents && moondata.prodPercents.cristal) {
				if (moondata.prodPercents.cristal < 70) {
					c_prod_class_moon = 'middlemark';
				}
				if (moondata.prodPercents.cristal < 40) {
					c_prod_class_moon = 'overmark';
				}
			}
			if (planet.moonprod.C.prod == 0)	{
				c_prod_class_moon = 'overmark';
			}
			var d_prod_class_moon = '';
			if (moondata.prodPercents && moondata.prodPercents.deut) {
				if (moondata.prodPercents.deut < 70) {
					d_prod_class_moon = 'middlemark';
				}
				if (moondata.prodPercents.deut < 40) {
					d_prod_class_moon = 'overmark';
				}
			}
			if (planet.moonprod.D.prod == 0)	{
				d_prod_class_moon = 'overmark';
			}

			if (!planet.moonprod.F) {
				planet.moonprod.F = {dispo: 0, capa: 0, surprod: 0, conso: 0, durability: null}
			}
			var f_prod_class_moon = '';
			if (moondata.prodPercents && moondata.prodPercents.food) {
				if (moondata.prodPercents.food < 70) {
					f_prod_class_moon = 'middlemark';
				}
				if (moondata.prodPercents.deut < 40) {
					f_prod_class_moon = 'overmark';
				}
			}
			if (planet.moonprod.F.surprod == 0)	{
				f_prod_class_moon = 'overmark';
			}
			
			// mount base html
			jQuery('#'+planetId).prepend(
				'<div class="prod"><div class="planet_prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.M.capa)+'</span><span class="prod_per_hour '+m_prod_class+'">+'+formatInt(planet.prod.M.prod)+'/h</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.C.capa)+'</span><span class="prod_per_hour '+c_prod_class+'">+'+formatInt(planet.prod.C.prod)+'/h</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.D.capa)+'</span><span class="prod_per_hour '+d_prod_class+'">+'+formatInt(planet.prod.D.prod)+'/h</span>'
					+ '<br/><span id="f_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.F.capa)+'</span><span class="prod_per_hour '+f_prod_class+'">+'+formatInt(planet.prod.F.surprod * 60*60)+'/h</span>'
					+ '<br/><span id="s_dispo"></span></span><span class="needed_fleet"><span class="pt"></span>&nbsp;PT&nbsp;-&nbsp;<span class="gt"></span>&nbsp;GT</span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.prod.E.dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.E.prod)+'</span>'
						+ cefPercent
				+ '</div><div class="moon_prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.moonprod.M.capa)+'</span><span class="prod_per_hour '+m_prod_class_moon+'">+'+formatInt(planet.moonprod.M.prod)+'/h</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.moonprod.C.capa)+'</span><span class="prod_per_hour '+c_prod_class_moon+'">+'+formatInt(planet.moonprod.C.prod)+'/h</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.moonprod.D.capa)+'</span><span class="prod_per_hour '+d_prod_class_moon+'">+'+formatInt(planet.moonprod.D.prod)+'/h</span>'
					+ '<br/><span id="f_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.moonprod.F.capa)+'</span><span class="prod_per_hour '+f_prod_class_moon+'">+'+formatInt(planet.moonprod.F.surprod * 60*60)+'/h</span>'
					+ '<br/><span id="s_dispo"></span></span><span class="needed_fleet"><span class="pt"></span>&nbsp;PT&nbsp;-&nbsp;<span class="gt"></span>&nbsp;GT</span>'
					+ '<br/><span id="e_dispo"><span class="'+'">E:&nbsp;' + formatInt(planet.moonprod.E.dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.moonprod.E.prod)+'</span>'
				+ '</div></div>'
			);
			jQuery('#'+planetId).append('<span class="incomming_fleet"></span>');
			// planet
			planet.$m_dispo = jQuery('#'+planetId + ' .planet_prod #m_dispo');
			planet.$c_dispo = jQuery('#'+planetId + ' .planet_prod #c_dispo');
			planet.$d_dispo = jQuery('#'+planetId + ' .planet_prod #d_dispo');
			planet.$f_dispo = jQuery('#'+planetId + ' .planet_prod #f_dispo');
			planet.$s_dispo = jQuery('#'+planetId + ' .planet_prod #s_dispo');
			planet.$needed_fleet = jQuery('#'+planetId + ' .planet_prod .needed_fleet');
			// moon
			planet.$m_dispo_moon = jQuery('#'+planetId + ' .moon_prod #m_dispo');
			planet.$c_dispo_moon = jQuery('#'+planetId + ' .moon_prod #c_dispo');
			planet.$d_dispo_moon = jQuery('#'+planetId + ' .moon_prod #d_dispo');
			planet.$f_dispo_moon = jQuery('#'+planetId + ' .moon_prod #f_dispo');
			planet.$s_dispo_moon = jQuery('#'+planetId + ' .moon_prod #s_dispo');
			planet.$needed_fleet_moon = jQuery('#'+planetId + ' .moon_prod .needed_fleet');

			planet.$incomming_fleet = jQuery('#'+planetId + ' .incomming_fleet');
			this.planetList.push(planet);
		}

		jQuery('#planetList').append('<div class="total_prod">'
			+ 'En vol :<br/>'
			+ 'M:&nbsp;<span class="in_flight_metal"></span><br/>'
			+ 'C:&nbsp;<span class="in_flight_cristal"></span><br/>'
			+ 'D:&nbsp;<span class="in_flight_deut"></span><br/>'
			+ 'F:&nbsp;<span class="in_flight_food"></span><br/>'
			+ '&Sigma;:&nbsp;<span class="in_flight_total"></span><br/>'
			+ '<br/>'
			+ 'Totaux :<br/>'
			+ 'M:&nbsp;<span class="total_prod_metal"></span><span class="prod_per_hour">+'+formatInt(m_total_prod)+'/h</span><br/>'
			+ 'C:&nbsp;<span class="total_prod_cristal"></span><span class="prod_per_hour">+'+formatInt(c_total_prod)+'/h</span><br/>'
			+ 'D:&nbsp;<span class="total_prod_deut"></span><span class="prod_per_hour">+'+formatInt(d_total_prod)+'/h</span><br/>'
			+ 'F:&nbsp;<span class="total_prod_food"></span><span class="prod_per_hour">+'+formatInt(f_total_prod * 60*60)+'/h</span><br/>'
			+ '&Sigma;:&nbsp;<span class="total_prod_total"></span><span class="needed_fleet"><span class="pt"></span>&nbsp;PT&nbsp;-&nbsp;<span class="gt"></span>&nbsp;GT</span>'
		+ '</div>');

	}

	computeNeededShip(amount, shipCapacity) {
		return Math.ceil(amount/shipCapacity);
	}

	computeNeededGT(amount) {
		if (this.fleetData && this.fleetData.transporterLarge && this.fleetData.transporterLarge.capacity) {
			return this.computeNeededShip(amount, parseInt(this.fleetData.transporterLarge.capacity.value));
		}
		return 0;
	}

	computeNeededPT(amount) {
		if (this.fleetData && this.fleetData.transporterSmall && this.fleetData.transporterSmall.capacity) {
			return this.computeNeededShip(amount, parseInt(this.fleetData.transporterSmall.capacity.value));
		}
		return 0;
	}

	display() {
		var totalM = 0;
		var totalC = 0;
		var totalD = 0;
		var totalF = 0;

		var totalPT = 0;
		var totalGT = 0;
		
		var nowTime = (new Date()).getTime();
		if (this.lastTime > 0) {
			this.elapsedSeconds = (nowTime - this.lastTime)/1000;
		}

		var inFlight_M = 0;
		var inFlight_C = 0;
		var inFlight_D = 0;
		var inFlight_F = 0;
		// resolve terminated flights and sum flying resources
		var flights = this.dataManager.getFlights();
		var toDeleteFlightIds = [];
		var flightsByPlanet = {};
		Object.keys(flights).forEach(jQuery.proxy(function(flightId) {
			var flight = flights[flightId];
			if (flight.arrivalTime <= nowTime) {
				toDeleteFlightIds.push(flightId);
				if (flight.destination && flight.destinationType !== 'debrisField') {
					var destPlanetId = flight.destination;
					if (flight.destinationType === 'moon') {
						destPlanetId += '-moon';
					}
					var planetProd = this.dataManager.getPlanetProd(destPlanetId);
					planetProd.M.dispo += flight.resources.M;
					if (planetProd.M.dispo >= planetProd.M.capa) {
						planetProd.M.prod = 0;
					}
					planetProd.C.dispo += flight.resources.C;
					if (planetProd.C.dispo >= planetProd.C.capa) {
						planetProd.C.prod = 0;
					}
					planetProd.D.dispo += flight.resources.D;
					if (planetProd.D.dispo >= planetProd.D.capa) {
						planetProd.D.prod = 0;
					}
					planetProd.F.dispo += flight.resources.F;
					if (planetProd.F.dispo >= planetProd.F.capa) {
						planetProd.F.surprod = 0;
					}
				}
			}
			else {
				inFlight_M += flight.resources.M;
				inFlight_C += flight.resources.C;
				inFlight_D += flight.resources.D;
				inFlight_F += flight.resources.F;
				if (flight.destination) {
					if (!flightsByPlanet[flight.destination]) {
						flightsByPlanet[flight.destination] = [];
					}
					flightsByPlanet[flight.destination].push(flight);
				}
			}
		}, this));
		// delete terminated flights
		for (var i = 0; i < toDeleteFlightIds.length; i++) {
			delete flights[toDeleteFlightIds[i]];
		}
		this.dataManager.setFlights(flights);
		
		// display per planet
		for (var i =0; i<this.planetList.length; i++) {
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnF = '';
			var planet = this.planetList[i];
			planet.prod = this.dataManager.getPlanetProd(planet.id);
			var planetdata = this.dataManager.getPlanetData(planet.id);
			var moondata = this.dataManager.getPlanetData(planet.id + '-moon');
			var moonProd = this.dataManager.getPlanetProd(planet.id + '-moon');
			// currentBuild timer
			if (planet.currentBuild) {
				var remainingTime = planetdata.currentBuild.end - nowTime;
				if (remainingTime > 0) {
					planet.$buildTimer.text(formatTime(remainingTime));
				}
				else {
					planet.$buildTimer.text('Terminé');
				}
			}
			if (planet.currentMoonBuild) {
				var remainingTime = moondata.currentBuild.end - nowTime;
				if (remainingTime > 0) {
					planet.$buildMoonTimer.text(formatTime(remainingTime));
				}
				else {
					planet.$buildMoonTimer.text('Terminé');
				}
			}
			// planet production
			// metal
			planet.prod.M.dispo += planet.prod.M.prod/60/60 * this.elapsedSeconds;
			totalM += planet.prod.M.dispo;
			if (planet.prod.M.dispo >= (planet.prod.M.capa - 10/100 * planet.prod.M.capa)) {
				warnM = 'middlemark';
			}
			if (planet.prod.M.dispo >= planet.prod.M.capa) {
				warnM = 'overmark';
				if (planet.prod.M.prod > 0) {
					planet.prod.M.dispo = planet.prod.M.capa;
					planet.prod.M.prod = 0;
				}
			}
			planet.$m_dispo.html('<span class="'+warnM+'">M:&nbsp;' + formatInt(planet.prod.M.dispo) + '</span>');
			// cristal
			planet.prod.C.dispo += planet.prod.C.prod/60/60 * this.elapsedSeconds;
			totalC += planet.prod.C.dispo;
			if (planet.prod.C.dispo >= (planet.prod.C.capa - 10/100 * planet.prod.C.capa)) {
				warnC = 'middlemark';
			}
			if (planet.prod.C.dispo >= planet.prod.C.capa) {
				warnC = 'overmark';
				if (planet.prod.C.prod > 0) {
					planet.prod.C.dispo = planet.prod.C.capa;
					planet.prod.C.prod = 0;
				}
			}
			planet.$c_dispo.html('<span class="'+warnC+'">C:&nbsp;' + formatInt(planet.prod.C.dispo) + '</span>');
			// deut
			planet.prod.D.dispo += planet.prod.D.prod/60/60 * this.elapsedSeconds;
			totalD += planet.prod.D.dispo;
			if (planet.prod.D.dispo >= (planet.prod.D.capa - 10/100 * planet.prod.D.capa)) {
				warnD = 'middlemark';
			}
			if (planet.prod.D.dispo >= planet.prod.D.capa) {
				warnD = 'overmark';
				if (planet.prod.D.prod > 0) {
					planet.prod.D.dispo = planet.prod.D.capa;
					planet.prod.D.prod = 0;
				}
			}
			planet.$d_dispo.html('<span class="'+warnD+'">D:&nbsp;' + formatInt(planet.prod.D.dispo) + '</span>');
			// FOOD
			planet.prod.F.dispo += planet.prod.F.surprod * this.elapsedSeconds;
			totalF += planet.prod.F.dispo;
			if (planet.prod.F.dispo >= (planet.prod.F.capa - 10/100 * planet.prod.F.capa)) {
				warnF = 'middlemark';
			}
			if (planet.prod.F.dispo >= planet.prod.F.capa) {
				warnF = 'overmark';
				if (planet.prod.F.surprod > 0) {
					planet.prod.F.dispo = planet.prod.F.capa;
					planet.prod.F.surprod = 0;
				}
			}
			planet.$f_dispo.html('<span class="'+warnF+'">F:&nbsp;' + formatInt(planet.prod.F.dispo) + '</span>');



			// store new dispos
			this.dataManager.updatePlanetProd(planet.id, planet.prod);
			//sum
			var sum_dispo = planet.prod.M.dispo + planet.prod.C.dispo + planet.prod.D.dispo + planet.prod.F.dispo;
			planet.$s_dispo.html('<span class="">&Sigma;:&nbsp;' + formatInt(sum_dispo) + '</span>');
			// neededFleet
			var neededPT = this.computeNeededPT(sum_dispo);
			var planetPT = planetdata.fleet && planetdata.fleet.transporterSmall ? planetdata.fleet.transporterSmall : 0;
			totalPT += planetPT;
			var neededGT = this.computeNeededGT(sum_dispo);
			var planetGT = planetdata.fleet && planetdata.fleet.transporterLarge ? planetdata.fleet.transporterLarge : 0;
			totalGT += planetGT;
			planet.$needed_fleet.find('.pt').removeClass('overmark middlemark').text(formatInt(planetPT) + '/' + formatInt(neededPT));
			planet.$needed_fleet.find('.gt').removeClass('overmark middlemark').text(formatInt(planetGT) + '/' + formatInt(neededGT));
			if (planetPT < neededPT) {
				planet.$needed_fleet.find('.pt').addClass('overmark');
			} else if (planetPT < (neededPT - 10/100*neededPT)) {
				planet.$needed_fleet.find('.pt').addClass('middlemark');
			}

			if (planetGT < neededGT) {
				planet.$needed_fleet.find('.gt').addClass('overmark');
			} else if (planetGT < (neededGT - 10/100*neededGT)) {
				planet.$needed_fleet.find('.gt').addClass('middlemark');
			}

			// moon production
			if (planet.moonprod) {
				warnM = '';
				warnC = '';
				warnD = '';
				warnF = '';
				// metal
				planet.moonprod.M.dispo += planet.moonprod.M.prod/60/60 * this.elapsedSeconds;
				totalM += planet.moonprod.M.dispo;
				if (planet.moonprod.M.dispo >= (planet.moonprod.M.capa - 10/100 * planet.moonprod.M.capa)) {
					warnM = 'middlemark';
				}
				if (planet.moonprod.M.dispo >= planet.moonprod.M.capa) {
					warnM = 'overmark';
					if (planet.moonprod.M.prod > 0) {
						planet.moonprod.M.dispo = planet.moonprod.M.capa;
						planet.moonprod.M.prod = 0;
					}
				}
				planet.$m_dispo_moon.html('<span class="'+warnM+'">M:&nbsp;' + formatInt(planet.moonprod.M.dispo) + '</span>');
				// cristal
				planet.moonprod.C.dispo += planet.moonprod.C.prod/60/60 * this.elapsedSeconds;
				totalC += planet.moonprod.C.dispo;
				if (planet.moonprod.C.dispo >= (planet.moonprod.C.capa - 10/100 * planet.moonprod.C.capa)) {
					warnC = 'middlemark';
				}
				if (planet.moonprod.C.dispo >= planet.moonprod.C.capa) {
					warnC = 'overmark';
					if (planet.moonprod.C.prod > 0) {
						planet.moonprod.C.dispo = planet.moonprod.C.capa;
						planet.moonprod.C.prod = 0;
					}
				}
				planet.$c_dispo_moon.html('<span class="'+warnC+'">C:&nbsp;' + formatInt(planet.moonprod.C.dispo) + '</span>');
				// deut
				planet.moonprod.D.dispo += planet.moonprod.D.prod/60/60 * this.elapsedSeconds;
				totalD += planet.moonprod.D.dispo;
				if (planet.moonprod.D.dispo >= (planet.moonprod.D.capa - 10/100 * planet.moonprod.D.capa)) {
					warnD = 'middlemark';
				}
				if (planet.moonprod.D.dispo >= planet.moonprod.D.capa) {
					warnD = 'overmark';
					if (planet.moonprod.D.prod > 0) {
						planet.moonprod.D.dispo = planet.moonprod.D.capa;
						planet.moonprod.D.prod = 0;
					}
				}
				planet.$d_dispo_moon.html('<span class="'+warnD+'">D:&nbsp;' + formatInt(planet.moonprod.D.dispo) + '</span>');
				// FOOD
				planet.moonprod.F.dispo += planet.moonprod.F.surprod * this.elapsedSeconds;
				totalF += planet.moonprod.F.dispo;
				if (planet.moonprod.F.dispo >= (planet.moonprod.F.capa - 10/100 * planet.moonprod.F.capa)) {
					warnF = 'middlemark';
				}
				if (planet.moonprod.F.dispo >= planet.moonprod.F.capa) {
					warnF = 'overmark';
					if (planet.moonprod.F.surprod > 0) {
						planet.moonprod.F.dispo = planet.moonprod.F.capa;
						planet.moonprod.F.surprod = 0;
					}
				}
				planet.$f_dispo_moon.html('<span class="'+warnF+'">F:&nbsp;' + formatInt(planet.moonprod.F.dispo) + '</span>');

				// store new dispos
				this.dataManager.updatePlanetProd(planet.id + '-moon', planet.moonprod);
				//sum
				var sum_dispo = planet.moonprod.M.dispo + planet.moonprod.C.dispo + planet.moonprod.D.dispo + planet.moonprod.F.dispo;
				planet.$s_dispo_moon.html('<span class="">&Sigma;:&nbsp;' + formatInt(sum_dispo) + '</span>');
				// neededFleet
				var neededPT = this.computeNeededPT(sum_dispo);
				var planetPT = moondata.fleet && moondata.fleet.transporterSmall ? moondata.fleet.transporterSmall : 0;
				totalPT += planetPT;
				var neededGT = this.computeNeededGT(sum_dispo);
				var planetGT = moondata.fleet && moondata.fleet.transporterLarge ? moondata.fleet.transporterLarge : 0;
				totalGT += planetGT;
				planet.$needed_fleet_moon.find('.pt').removeClass('overmark middlemark').text(formatInt(planetPT) + '/' + formatInt(neededPT));
				planet.$needed_fleet_moon.find('.gt').removeClass('overmark middlemark').text(formatInt(planetGT) + '/' + formatInt(neededGT));
				if (planetPT < neededPT) {
					planet.$needed_fleet_moon.find('.pt').addClass('overmark');
				} else if (planetPT < (neededPT - 10/100*neededPT)) {
					planet.$needed_fleet_moon.find('.pt').addClass('middlemark');
				}

				if (planetGT < neededGT) {
					planet.$needed_fleet_moon.find('.gt').addClass('overmark');
				} else if (planetGT < (neededGT - 10/100*neededGT)) {
					planet.$needed_fleet_moon.find('.gt').addClass('middlemark');
				}
			}

			planet.$incomming_fleet.html('');
			if (flightsByPlanet[planet.id]) {
				planet.$incomming_fleet.html('<span class="icon_movement_reserve tooltip tooltipRight tooltipClose"></span>');
				var $elt = planet.$incomming_fleet.find('.icon_movement_reserve');
				var incomming_rows = '';
				for (var f = 0; f < flightsByPlanet[planet.id].length; f ++) {
					var flight = flightsByPlanet[planet.id][f];
					var typeIco = '';
					switch (flight.destinationType) {
						case 'moon' :
							typeIco = '<figure class="planetIcon moon"></figure>&nbsp;';
							break;
						case 'planet' :
							typeIco = '<figure class="planetIcon planet"></figure>&nbsp;';
							break;
						case 'debrisField' :
							typeIco = '<figure class="planetIcon debrisField"></figure>&nbsp;';
							break;
					}
					incomming_rows += '<tr><th colspan="2">'+typeIco+'Arrive dans '+formatTime(flight.arrivalTime-nowTime)+'</th></tr>'
					incomming_rows += '<tr><td>M</td><td class="value">'+formatInt(flight.resources.M)+'</td></tr>';
					incomming_rows += '<tr><td>C</td><td class="value">'+formatInt(flight.resources.C)+'</td></tr>';
					incomming_rows += '<tr><td>D</td><td class="value">'+formatInt(flight.resources.D)+'</td></tr>';
					incomming_rows += '<tr><td>F</td><td class="value">'+formatInt(flight.resources.F)+'</td></tr>';
				}
				$elt.attr('title',
					'<div class="htmlTooltip">'
						+ '<h1>Détails des flottes:</h1>'
						+ '<div class="splitLine"></div>'
						+ '<table cellpadding="0" cellspacing="0" class="fleetinfo">'
						+ incomming_rows
						+ '</table>'
					+ '</div>'
				);
			}

		}
		
		// in flight
		jQuery('#planetList .total_prod .in_flight_metal').html(formatInt(inFlight_M));
		jQuery('#planetList .total_prod .in_flight_cristal').html(formatInt(inFlight_C));
		jQuery('#planetList .total_prod .in_flight_deut').html(formatInt(inFlight_D));
		jQuery('#planetList .total_prod .in_flight_food').html(formatInt(inFlight_F));
		jQuery('#planetList .total_prod .in_flight_total').html(formatInt(inFlight_M + inFlight_C + inFlight_D + inFlight_F));
		totalM += inFlight_M;
		totalC += inFlight_C;
		totalD += inFlight_D;
		totalF += inFlight_F
		
		// total resources
		jQuery('#planetList .total_prod .total_prod_metal').html(formatInt(totalM));
		jQuery('#planetList .total_prod .total_prod_cristal').html(formatInt(totalC));
		jQuery('#planetList .total_prod .total_prod_deut').html(formatInt(totalD));
		jQuery('#planetList .total_prod .total_prod_food').html(formatInt(totalF));
		jQuery('#planetList .total_prod .total_prod_total').html(formatInt(totalM + totalC + totalD + totalF));
		// neededFleet
		jQuery('#planetList .total_prod .needed_fleet .pt').text(formatInt(totalPT) + '/' + formatInt(this.computeNeededPT(totalM + totalC + totalD + totalF)));
		jQuery('#planetList .total_prod .needed_fleet .gt').text(formatInt(totalGT) + '/' + formatInt(this.computeNeededGT(totalM + totalC + totalD + totalF)));
		
		var currentTechDetail = this.dataManager.getCurrentTechDetail();
		if (currentTechDetail) {
			var currentPlanetProd = this.dataManager.getCurrentPlanetProd();
			var totalMissing = 0;
			Object.keys(currentTechDetail.neededResources).forEach(jQuery.proxy(function(k) {
				var $elt = null;
				var missing = currentPlanetProd[k].dispo - currentTechDetail.neededResources[k];
				switch(k) {
					case 'M':
						$elt = currentTechDetail.$elts.find('.metal .ol-value');
					break;
					case 'C':
						$elt = currentTechDetail.$elts.find('.crystal .ol-value');
					break;
					case 'D':
						$elt = currentTechDetail.$elts.find('.deuterium .ol-value');
					break;
					case 'E':
						$elt = currentTechDetail.$elts.find('.energy .ol-value');
					break;
				}
				if (k !== 'E') {
					if (missing < 0) {
						totalMissing += missing;
					}
					$elt.html(formatInt(Math.abs(missing)) + '<br/>(' + formatInt(this.computeNeededPT(Math.abs(missing))) + '&nbsp;PT&nbsp;-&nbsp;' + formatInt(this.computeNeededGT(Math.abs(missing))) + '&nbsp;GT)');
				} else {
					$elt.text(formatInt(Math.abs(missing)));
				}

			}, this));
			// display total missing
			currentTechDetail.$elts.find('.total .ol-value').html(formatInt(Math.abs(totalMissing)) + '<br/>(' + formatInt(this.computeNeededPT(Math.abs(totalMissing))) + '&nbsp;PT&nbsp;-&nbsp;' + formatInt(this.computeNeededGT(Math.abs(totalMissing))) + '&nbsp;GT)');
		}
		
		
		// set Now as last render time
		this.dataManager.updateLastRenderTime(nowTime);
		this.lastTime = nowTime;
	}
}