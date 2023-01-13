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
		console.log('Sending expedition ' + random + ' systems arround sys ' + initialSystem + ' at sys ' + window.fleetDispatcher.targetPlanet.system);
		window.fleetDispatcher.trySubmitFleet2();
	}, 1000)
 }, false);
