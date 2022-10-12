window.addEventListener('ogameLive.fleetDispatcher.selectExpedition', function (event) {
	window.fleetDispatcher.targetPlanet.position = 16;
	window.fleetDispatcher.selectMission(window.fleetDispatcher.fleetHelper.MISSION_EXPEDITION);
	window.fleetDispatcher.refreshFleet2();
	window.fleetDispatcher.updateTarget(true);
	setTimeout(function() {
		window.fleetDispatcher.trySubmitFleet2();
	}, 1000)
 }, false);