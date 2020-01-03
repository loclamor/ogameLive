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

		for (var i = 0; i < nbPlanets; i++) {
			var planetId = myPlanetsRes.snapshotItem(i).textContent;
			var planetdata = this.dataManager.getPlanetData(planetId);
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnE = '';
			log("planetId", planetId, LOG_LEVEL_INFO)
			var planet = {
				id: planetId,
				// metal
				prod: this.dataManager.getPlanetProd(planetId),
				//build
				currentBuild: false,
				data: planetdata
			};
			
			//prods totaux
			m_total_prod += planet.prod.M.prod;
			c_total_prod += planet.prod.C.prod;
			d_total_prod += planet.prod.D.prod;

			// current build
			var currentBuildNodes = Xpath.getOrderedSnapshotNodes(document,'//div[contains(@id,"planetList")]/div[contains(@id,"'+planetId+'")]/a[contains(@class,"constructionIcon")]');
			if (currentBuildNodes.snapshotLength > 0) {
				for(var cons= 0; cons < currentBuildNodes.snapshotLength; cons++) {
					var currentBuildNode = currentBuildNodes.snapshotItem(cons);
					if (currentBuildNode.classList.contains('moon')) {
						// moon construction
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
				this.dataManager.updatePlanetData(planetId, planetdata)
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
			
			// mount base html
			jQuery('#'+planetId).prepend(
				'<div class="prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.M.capa)+'</span><span class="prod_per_hour '+m_prod_class+'">+'+formatInt(planet.prod.M.prod)+'/h</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.C.capa)+'</span><span class="prod_per_hour '+c_prod_class+'">+'+formatInt(planet.prod.C.prod)+'/h</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.D.capa)+'</span><span class="prod_per_hour '+d_prod_class+'">+'+formatInt(planet.prod.D.prod)+'/h</span>'
					+ '<br/><span id="s_dispo"></span></span><span class="needed_fleet"><span class="pt"></span>&nbsp;PT&nbsp;-&nbsp;<span class="gt"></span>&nbsp;GT</span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.prod.E.dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.prod.E.prod)+'</span>'
						+ cefPercent
				+ '</div>'
			);
			planet.$m_dispo = jQuery('#'+planetId + ' #m_dispo');
			planet.$c_dispo = jQuery('#'+planetId + ' #c_dispo');
			planet.$d_dispo = jQuery('#'+planetId + ' #d_dispo');
			planet.$s_dispo = jQuery('#'+planetId + ' #s_dispo');
			planet.$needed_fleet = jQuery('#'+planetId + ' .needed_fleet');
			this.planetList.push(planet);
		}

		jQuery('#planetList').append('<div class="total_prod">'
			+ 'En vol :<br/>'
			+ 'M:&nbsp;<span class="in_flight_metal"></span><br/>'
			+ 'C:&nbsp;<span class="in_flight_cristal"></span><br/>'
			+ 'D:&nbsp;<span class="in_flight_deut"></span><br/>'
			+ '&Sigma;:&nbsp;<span class="in_flight_total"></span><br/>'
			+ '<br/>'
			+ 'Totaux :<br/>'
			+ 'M:&nbsp;<span class="total_prod_metal"></span><span class="prod_per_hour">+'+formatInt(m_total_prod)+'/h</span><br/>'
			+ 'C:&nbsp;<span class="total_prod_cristal"></span><span class="prod_per_hour">+'+formatInt(c_total_prod)+'/h</span><br/>'
			+ 'D:&nbsp;<span class="total_prod_deut"></span><span class="prod_per_hour">+'+formatInt(d_total_prod)+'/h</span><br/>'
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

		var totalPT = 0;
		var totalGT = 0;
		
		var nowTime = (new Date()).getTime();
		if (this.lastTime > 0) {
			this.elapsedSeconds = (nowTime - this.lastTime)/1000;
		}

		var inFlight_M = 0;
		var inFlight_C = 0;
		var inFlight_D = 0;
		// resolve terminated flights and sum flying resources
		var flights = this.dataManager.getFlights();
		var toDeleteFlightIds = [];
		Object.keys(flights).forEach(jQuery.proxy(function(flightId) {
			var flight = flights[flightId];
			if (flight.arrivalTime <= nowTime) {
				toDeleteFlightIds.push(flightId);
				if (flight.destination) {
					var planetProd = this.dataManager.getPlanetProd(flight.destination);
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
				}
			}
			else {
				inFlight_M += flight.resources.M;
				inFlight_C += flight.resources.C;
				inFlight_D += flight.resources.D;
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
			var planet = this.planetList[i];
			planet.prod = this.dataManager.getPlanetProd(planet.id);
			var planetdata = this.dataManager.getPlanetData(planet.id);
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
			// store new dispos
			this.dataManager.updatePlanetProd(planet.id, planet.prod);
			//sum
			var sum_dispo = planet.prod.M.dispo + planet.prod.C.dispo + planet.prod.D.dispo;
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

		}
		
		// in flight
		jQuery('#planetList .total_prod .in_flight_metal').html(formatInt(inFlight_M));
		jQuery('#planetList .total_prod .in_flight_cristal').html(formatInt(inFlight_C));
		jQuery('#planetList .total_prod .in_flight_deut').html(formatInt(inFlight_D));
		jQuery('#planetList .total_prod .in_flight_total').html(formatInt(inFlight_M + inFlight_C + inFlight_D));
		totalM += inFlight_M;
		totalC += inFlight_C;
		totalD += inFlight_D;
		
		// total resources
		jQuery('#planetList .total_prod .total_prod_metal').html(formatInt(totalM));
		jQuery('#planetList .total_prod .total_prod_cristal').html(formatInt(totalC));
		jQuery('#planetList .total_prod .total_prod_deut').html(formatInt(totalD));
		jQuery('#planetList .total_prod .total_prod_total').html(formatInt(totalM + totalC + totalD));
		// neededFleet
		jQuery('#planetList .total_prod .needed_fleet .pt').text(formatInt(totalPT) + '/' + formatInt(this.computeNeededPT(totalM + totalC + totalD)));
		jQuery('#planetList .total_prod .needed_fleet .gt').text(formatInt(totalGT) + '/' + formatInt(this.computeNeededGT(totalM + totalC + totalD)));
		
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