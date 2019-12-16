class PlanetsProductionDisplay {

	planetList = [];
	elapsedSeconds = 1

	constructor() {
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
			};
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
			
			// mount base html
			jQuery('#'+planetId).prepend(
				'<div class="prod">'
					+ '<span id="m_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.m_capa)+'</span>'
					+ '<br/><span id="c_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.c_capa)+'</span>'
					+ '<br/><span id="d_dispo"></span><span class="capa">&nbsp;/&nbsp;'+formatInt(planet.d_capa)+'</span>'
					+ '<br/><span id="s_dispo"></span>'
					+ '<br/><span id="e_dispo"><span class="'+warnE+'">E:&nbsp;' + formatInt(planet.e_dispo)+'</span></span>'
						+ '<span class="capa">&nbsp;/&nbsp;'+formatInt(planet.e_prod)+'</span>'
						+ cefPercent
				+ '</div>'
			);
			planet.$m_dispo = jQuery('#'+planetId + ' #m_dispo');
			planet.$c_dispo = jQuery('#'+planetId + ' #c_dispo');
			planet.$d_dispo = jQuery('#'+planetId + ' #d_dispo');
			planet.$s_dispo = jQuery('#'+planetId + ' #s_dispo');
			this.planetList.push(planet);
		}
		jQuery('#planetList').append('<div class="total_prod"></div>');

	}

	display() {
		var totalM = 0;
		var totalC = 0;
		var totalD = 0;
		
		var nowTime = (new Date()).getTime();
		
		
		for (var i =0; i<this.planetList.length; i++) {
			var warnM = '';
			var warnC = '';
			var warnD = '';
			var planet = this.planetList[i];
			// currentBuild timer
			if (planet.currentBuild) {
				var planetdata = GM_getJsonValue('data.'+planet.id, {});
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
		}
		jQuery('#planetList .total_prod').html(
				'Totaux :'
				+ '<br/>M:&nbsp;' + formatInt(totalM)
				+ '<br/>C:&nbsp;' + formatInt(totalC)
				+ '<br/>D:&nbsp;' + formatInt(totalD)
				+ '<br/>&Sigma;:&nbsp;' + formatInt(totalM + totalC + totalD)
			);
			
		// set Now as last render time
		GM_setValue('production.last_render_time', nowTime);
	}
}