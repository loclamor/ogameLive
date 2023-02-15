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

/**
 * Mutation observer to add event listener only once on the send button in order to save expeditions params (duration & speed)
 */
var sendButtonSelector = document.querySelector('#sendFleet');
if (sendButtonSelector != null) {
	var sendButtonObserver = new MutationObserver(function (mutations) {
		console.log("Inside sndButton Observer !");
		var sendBtn = document.getElementById('sendFleet');
		if (sendBtn != null && window.fleetDispatcher && window.fleetDispatcher.targetPlanet.position == 16 && !sendBtn.classList.contains('clickEventAdded')) {
			sendButtonObserver.disconnect();
			sendBtn.addEventListener('click', function () {
				// store actual expedition duration and speed
				window.localStorage.setItem('ogameLive.expeparams', JSON.stringify({
					expeditionTime: window.fleetDispatcher.expeditionTime,
					speedPercent: window.fleetDispatcher.speedPercent
				}));
				console.log("Expe params saved !");
			});
			sendBtn.classList.add('clickEventAdded');
			console.log("Event listener added !");
		}
	});
	var config = {attributes: true, childList: false, characterData: false};
	sendButtonObserver.observe(sendButtonSelector, config);
}


/**
 * Event listner on the selectExpedition OgameLive button, to select expedition mission on target 16 of current system
 * update ogame fleetDispatcher object and send the fleet with stored params (duration and speed)
 **/
window.addEventListener('ogameLive.fleetDispatcher.selectExpedition', function (event) {
	console.log(event);
	var nb_systems = event.detail.nb_systems;
	window.fleetDispatcher.targetPlanet.position = 16;
	window.fleetDispatcher.selectMission(window.fleetDispatcher.fleetHelper.MISSION_EXPEDITION);
	window.fleetDispatcher.refreshFleet2();
	window.fleetDispatcher.updateTarget(true);
	setTimeout(function() {
		var expeparams = window.localStorage.getItem('ogameLive.expeparams');
		if (expeparams != null) {
			expeparams = JSON.parse(expeparams);
			expeparams.expeditionTime =  expeparams.expeditionTime < 1 ? 1 :  expeparams.expeditionTime;
			window.fleetDispatcher.expeditionTime = expeparams.expeditionTime;
			window.fleetDispatcher.speedPercent = expeparams.speedPercent;
			console.log("Expe params restored !");
		}
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
		window.fleetDispatcher.trySubmitFleet2();
	}, 1000)
 }, false);
