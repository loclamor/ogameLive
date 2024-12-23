/***
 *
 * This file is inserted as a javascript script in ogame page head, so top level ogame varaibles and functions are accessibles
 * like window, window.fleetDispatcher, and so on
 *
 * Warn : main OGameLive variables and functions are NOT in this scope.
 *
 * Communication between this file (ogame scope) and OGameLive can be done by CustomEvents
 *
 ***/

let ping = window.performance.timing.domLoading - window.performance.timing.fetchStart;
let colorClass = "friendly";
if (ping > 400 && ping < 800)
	colorClass = "neutral";
if (ping > 800)
	colorClass = "hostile";
$(".ogk-ping").html(`<span class='${colorClass}'>${(ping / 1e3).toFixed(1)}s</span> ping`);

var sendButtonSelector = document.querySelector('#sendFleet');
if (sendButtonSelector != null) {
	sendButtonSelector.addEventListener('click', function () {
		if (window.fleetDispatcher && window.fleetDispatcher.targetPlanet.position == 16 ) {
			// store actual expedition duration and speed
			window.localStorage.setItem('ogameLive.expeparams', JSON.stringify({
				expeditionTime: window.fleetDispatcher.expeditionTime,
				speedPercent: window.fleetDispatcher.speedPercent
			}));
			console.log("Expe params saved !");
		} else {
			console.log('targetPlanet.position is not 16')
		}
	});
	sendButtonSelector.classList.add('clickEventAdded');
	console.log("Event listener added !");
} else {
	console.log('sendButtonSelector IS null !');
}


/**
 * Event listner on the selectExpedition OgameLive button, to select expedition mission on target 16 of current system
 * update ogame fleetDispatcher object and send the fleet with stored params (duration and speed)
 **/
window.addEventListener('ogameLive.fleetDispatcher.selectExpedition', sendRandomExpe , false);
function sendRandomExpe(event) {
	console.log('ogameLive.fleetDispatcher.selectExpedition', event);

	// define Ajax loader observer
	let ajaxLoaders = document.querySelector('.ajax_loading');
	const mo = new MutationObserver((mutations) => {
		console.log('Ajax loader mutation ', mutations, 'display:', mutations[0].target.style.display);
		if (mutations[0].target.style.display === 'none') {
			mo.disconnect(); // avoid multiple catch
			// assume that ajax loader is hidden and updateTarget has success, set durationand percent, then trySubmit !
			var expeparams = window.localStorage.getItem('ogameLive.expeparams');
			if (expeparams != null) {
				expeparams = JSON.parse(expeparams);
				expeparams.expeditionTime =  expeparams.expeditionTime < 1 ? 1 :  expeparams.expeditionTime;
				window.fleetDispatcher.expeditionTime = expeparams.expeditionTime;
				window.fleetDispatcher.speedPercent = expeparams.speedPercent;
				console.log("Expe params restored !");
			}
			window.fleetDispatcher.trySubmitFleet2();
			console.log('trySubmitFleet2 !');
		}
	});
	mo.observe(ajaxLoaders,  { attributes: true, childList: false, characterData: false });

	var nb_systems = event.detail.nb_systems;
	window.fleetDispatcher.targetPlanet.position = 16;
	const initialSystem = window.fleetDispatcher.targetPlanet.system;
	const nbSys = parseInt(document.getElementById('random_system').value);
	const random = Math.floor(Math.random() * (2 * nbSys + 1) - nbSys);
	window.fleetDispatcher.targetPlanet.system += random;
	if (nb_systems !== null) {
		window.fleetDispatcher.targetPlanet.system = window.fleetDispatcher.targetPlanet.system % nb_systems
		if (window.fleetDispatcher.targetPlanet.system < 0) {
			window.fleetDispatcher.targetPlanet.system = nb_systems + window.fleetDispatcher.targetPlanet.system;
		}
	}
	console.log('Sending expedition ' + random + ' systems arround sys ' + initialSystem + ' at sys ' + window.fleetDispatcher.targetPlanet.system);
	window.fleetDispatcher.selectMission(window.fleetDispatcher.fleetHelper.MISSION_EXPEDITION);
	window.fleetDispatcher.refreshFleet2();
	console.log('refreshFleet2...');
	window.fleetDispatcher.updateTarget(true); // will show ajax loader
	console.log('updateTarget...');
}




