class BetterFleetDisplay {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var constants = OgameConstants.fleet;
		var selections = {};
		var fleetData = this.dataManager.getFleetData();
		
		// Add More Infos table structure of selected fleet
		var $moreInfoTable = jQuery(
			'<table id="moreInfoTable">'
				+ '<tr><th>Capacity</th><td class="capacity">0</td></tr>'
				+ '<tr><th>Speed</th><td class="speed">0</td></tr>'
			+ '</table>'
		);
		jQuery('#allornone .show_fleet_apikey').after($moreInfoTable);
		
			
		function updateMoreInfoTable() {
		
			Object.keys(fleetData).forEach(function(ship) {
				selections[ship] = parseInt(jQuery('#technologies li.'+ship+' input').val() || 0);
			});
			console.log(selections);
			var fleetSpeed = 0;
			var fleetCapacity = 0;
			// compute minSpeed and sum capacities
			Object.keys(selections).forEach(function(s) {
				if (selections[s] > 0 && (fleetSpeed == 0 || parseInt(fleetData[s].speed.value) < fleetSpeed) ) {
					fleetSpeed = parseInt(fleetData[s].speed.value);
				}
				fleetCapacity += selections[s] * parseInt(fleetData[s].capacity.value);
			});
			// update display
			$moreInfoTable.find('.capacity').text(formatInt(fleetCapacity));
			$moreInfoTable.find('.speed').text(formatInt(fleetSpeed));
		}
		
		// Add fleetdata on every ship
		Object.keys(fleetData).forEach(function(k) {
			
			jQuery('#technologies li.'+k).attr('title',
				jQuery('#technologies li.'+k).attr('title')
				+ '<br/>Speed : ' + formatInt(fleetData[k].speed.value)
				+ '<br/>Capacity : ' + formatInt(fleetData[k].capacity.value)
				+ '<br/>Consumption : ' + formatInt(fleetData[k].consumption.value)
				+ '<br/>Struct : ' + formatInt(fleetData[k].structural.value)
				+ '<br/>Attack : ' + formatInt(fleetData[k].attack.value)
				+ '<br/>Shield : ' + formatInt(fleetData[k].shield.value)
			);

			if (PARAMS.show_fleet_speed == 1) {
				jQuery('#technologies li.' + k + ' .icon').prepend(
					'<span class="speed">' + formatInt(fleetData[k].speed.value) + '</span>'
				);
			}
			
			//attach event listeners on inputs
			jQuery('#technologies li.'+k+' input').on('change keyup keydown', updateMoreInfoTable);
			jQuery('#technologies li.'+k+' .icon').click(function() {
				setTimeout(updateMoreInfoTable, 1);
			});
		});

		var expeparams = window.localStorage.getItem('ogameLive.expeparams');
		if (expeparams != null) {
			expeparams = JSON.parse(expeparams);
			expeparams.expeditionTime =  expeparams.expeditionTime < 1 ? 1 :  expeparams.expeditionTime;
		} else {
			expeparams = {expeditionTime: 1, speedPercent: "10"};
		}

		var $customCoords = jQuery('<div class="custom-coords"></div>');

		var $exploBtn = jQuery('<a class="explo" href="#" id="ebutton">' +
				'<span class="textlabel">Exploration</span>' +
				'<span class="expeparams">' +
					expeparams.expeditionTime + "h<br/>" +
					(parseInt(expeparams.speedPercent) * 10) + "%" +
				'</span>' +
			'</a>');
		//jQuery("#fleet2 #target .target .clearfloat").before($exploBtn);
		// jQuery("#fleet2 #target .coords").append($exploBtn);
		$customCoords.append($exploBtn);
		const $randomSystem = jQuery('<div class="random-system">+/- <input type="number" step="1" min="0" max="99" value="' +
			PARAMS.random_system +
			'" class="system hideNumberSpin" id="random_system"> systems</div>');
		$customCoords.append($randomSystem);
		jQuery("#fleet2 #target .coords").append($customCoords);

		$randomSystem.find('input').on('change', e => {
			PARAMS.random_system = parseInt(jQuery(e.target).val());
			GM_setJsonValue('params', PARAMS);
			storeValue('params', PARAMS);
		});
		$exploBtn.click(function(e){
			window.dispatchEvent(new CustomEvent('ogameLive.fleetDispatcher.selectExpedition', {'detail': {'nb_systems' : PARAMS.nb_systems}}));
			e.preventDefault();
			e.stopPropagation();
		});
	}
}
