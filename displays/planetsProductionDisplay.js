class PlanetsProductionDisplay {

	planetList = [];
	elapsedSeconds = 1;
	fleetData = {};

	constructor() {
		this.fleetData = GM_getJsonValue('data.fleet', {});
		// compute elapsed time after last call (normally 1s, but in case of browser tab not visible setInterval call seems to be paused)
		var nowTime = (new Date()).getTime();
		var lastTime = GM_getIntValue('production.last_render_time', 0);
		if (lastTime > 0) {
			this.elapsedSeconds = (nowTime - lastTime)/1000;
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
			var planetdata = GM_getJsonValue('data.'+planetId, {});
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var warnE = '';
			log("planetId", planetId, LOG_LEVEL_INFO)
			var planet = {
				id: planetId,
				// metal
				m_dispo: GM_getIntValue('production.'+planetId+'.M.dispo', 0),
				m_prod: GM_getIntValue('production.'+planetId+'.M.prod', 0),
				m_capa: GM_getIntValue('production.'+planetId+'.M.capa', 0),
				// cristal
				c_dispo: GM_getIntValue('production.'+planetId+'.C.dispo', 0),
				c_prod: GM_getIntValue('production.'+planetId+'.C.prod', 0),
				c_capa: GM_getIntValue('production.'+planetId+'.C.capa', 0),
				// deut
				d_dispo: GM_getIntValue('production.'+planetId+'.D.dispo', 0),
				d_prod: GM_getIntValue('production.'+planetId+'.D.prod', 0),
				d_capa: GM_getIntValue('production.'+planetId+'.D.capa', 0),
				// energie
				e_dispo: GM_getIntValue('production.'+planetId+'.E.dispo', 0),
				e_prod: GM_getIntValue('production.'+planetId+'.E.prod', 0),
				//build
				currentBuild: false,
				data: planetdata
			};
			
			//prods totaux
			m_total_prod += planet.m_prod;
			c_total_prod += planet.c_prod;
			d_total_prod += planet.d_prod;

			// current build
			var currentBuildNode = Xpath.getSingleNode(document,'//div[contains(@id,"planetList")]/div[contains(@id,"'+planetId+'")]/a[contains(@class,"constructionIcon")]');
			if (currentBuildNode != null) {
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
			else {
				planetdata.currentBuild = null;
				GM_setJsonValue('data.'+planetId, planetdata);
			}
			
			// actualise planet (add a seconds of loadling gap)
			this.elapsedSeconds = 2;
			// energie
			if (planet.e_dispo <= 5/100 * planet.e_prod) {
				warnE = 'middlemark';
			}
			if (planet.e_dispo <= 0) {
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
			if (planet.m_prod == 0)	{
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
			if (planet.c_prod == 0)	{
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
			if (planet.d_prod == 0)	{
				d_prod_class = 'overmark';
			}
			
			// mount base html
			jQuery('#'+planetId).prepend(
				'<div class="prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.m_capa)+'</span><span class="prod_per_hour '+m_prod_class+'">+'+formatInt(planet.m_prod)+'/h</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.c_capa)+'</span><span class="prod_per_hour '+c_prod_class+'">+'+formatInt(planet.c_prod)+'/h</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.d_capa)+'</span><span class="prod_per_hour '+d_prod_class+'">+'+formatInt(planet.d_prod)+'/h</span>'
					+ '<br/><span id="s_dispo"></span></span><span class="needed_fleet"><span class="pt"></span>&nbsp;PT&nbsp;-&nbsp;<span class="gt"></span>&nbsp;GT</span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.e_dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.e_prod)+'</span>'
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
		jQuery('#planetList').append('<div class="total_prod">Totaux :<br/>'
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
		
		
		for (var i =0; i<this.planetList.length; i++) {
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var planet = this.planetList[i];
			var planetdata = planet.data;
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
			planet.m_dispo += planet.m_prod/60/60 * this.elapsedSeconds;
			totalM += planet.m_dispo;
			GM_setValue('production.'+planet.id+'.M.dispo', parseInt(planet.m_dispo))
			if (planet.m_dispo >= (planet.m_capa - 10/100 * planet.m_capa)) {
				warnM = 'middlemark';
			}
			if (planet.m_dispo >= planet.m_capa) {
				warnM = 'overmark';
				if (planet.m_prod > 0) {
					planet.m_dispo = planet.m_capa;
					planet.m_prod = 0;
				}
			}
			planet.$m_dispo.html('<span class="'+warnM+'">M:&nbsp;' + formatInt(planet.m_dispo) + '</span>');
			// cristal
			planet.c_dispo += planet.c_prod/60/60 * this.elapsedSeconds;
			totalC += planet.c_dispo;
			GM_setValue('production.'+planet.id+'.C.dispo', parseInt(planet.c_dispo))
			if (planet.c_dispo >= (planet.c_capa - 10/100 * planet.c_capa)) {
				warnC = 'middlemark';
			}
			if (planet.c_dispo >= planet.c_capa) {
				warnC = 'overmark';
				if (planet.c_prod > 0) {
					planet.c_dispo = planet.c_capa;
					planet.c_prod = 0;
				}
			}
			planet.$c_dispo.html('<span class="'+warnC+'">C:&nbsp;' + formatInt(planet.c_dispo) + '</span>');
			// deut
			planet.d_dispo += planet.d_prod/60/60 * this.elapsedSeconds;
			totalD += planet.d_dispo;
			GM_setValue('production.'+planet.id+'.D.dispo', parseInt(planet.d_dispo))
			if (planet.d_dispo >= (planet.d_capa - 10/100 * planet.d_capa)) {
				warnD = 'middlemark';
			}
			if (planet.d_dispo >= planet.d_capa) {
				warnD = 'overmark';
				if (planet.d_prod > 0) {
					planet.d_dispo = planet.d_capa;
					planet.d_prod = 0;
				}
			}
			planet.$d_dispo.html('<span class="'+warnD+'">D:&nbsp;' + formatInt(planet.d_dispo) + '</span>');
			//sum
			planet.$s_dispo.html('<span class="">&Sigma;:&nbsp;' + formatInt(planet.m_dispo + planet.c_dispo + planet.d_dispo) + '</span>');
			// neededFleet
			var neededPT = this.computeNeededPT(planet.m_dispo + planet.c_dispo + planet.d_dispo);
			var planetPT = planetdata.fleet && planetdata.fleet.transporterSmall ? planetdata.fleet.transporterSmall : 0;
			totalPT += planetPT;
			var neededGT = this.computeNeededGT(planet.m_dispo + planet.c_dispo + planet.d_dispo);
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
		jQuery('#planetList .total_prod .total_prod_metal').html(formatInt(totalM));
		jQuery('#planetList .total_prod .total_prod_cristal').html(formatInt(totalC));
		jQuery('#planetList .total_prod .total_prod_deut').html(formatInt(totalD));
		jQuery('#planetList .total_prod .total_prod_total').html(formatInt(totalM + totalC + totalD));
		// neededFleet
		jQuery('#planetList .total_prod .needed_fleet .pt').text(formatInt(totalPT) + '/' + formatInt(this.computeNeededPT(totalM + totalC + totalD)));
		jQuery('#planetList .total_prod .needed_fleet .gt').text(formatInt(totalGT) + '/' + formatInt(this.computeNeededGT(totalM + totalC + totalD)));
		// set Now as last render time
		GM_setValue('production.last_render_time', nowTime);
	}
}