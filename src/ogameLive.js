
class OgameLive {

	constructor() {
		this.disabledTimer = false;
		this.dataManager = new DataManager();
		this.router = new Router(this);
		this.url = location.href;
		if ((new Date()).getTime() < 1672527600000) {
			jQuery('#eventboxBlank').text('Bonnes Fêtes de la team OGameLive !')
		} else if ((new Date()).getTime() < 1673128800000) {
			jQuery('#eventboxBlank').text('HAPPY NEW YEAR from OGameLive !')
		}
	}

	start() {
		// first initiate flights query
		new FlyingFleetObserver(this.dataManager);

		// get up-to-date Planet production
		new PlanetProductionParser(this.dataManager);

		// Init production display if activated
		var productionDisplay = false;
		if (PARAMS.show_production == 1) {
			productionDisplay = new PlanetsProductionDisplay(this.dataManager);
			productionDisplay.initialize();
		}
		// Init flights display if activated
		var flightsDisplay = false;
		if (PARAMS.show_flights == 1) {
			flightsDisplay = new FlightsDisplay(this.dataManager);
			setTimeout(() => { flightsDisplay.initialize() }, 0);
		}

		var app = this;
		// use setTimeout 0 to differ 1rst display at the end of the execution stack (after dom creation and router page-handling)
		setTimeout(() => {
			if (!app.disabledTimer) {
				// display activated displayers
				if (false !== productionDisplay) {
					productionDisplay.display();
				}
				if (false !== flightsDisplay) {
					flightsDisplay.display();
				}
			}
		}, 0);
		if (PARAMS.main_refresh > 0) {
			var interval = setInterval(function () {
				if (!app.disabledTimer) {
					// display activated displayers
					if (false !== productionDisplay) {
						productionDisplay.display();
					}
					if (false !== flightsDisplay) {
						flightsDisplay.display();
					}
				} else {
					// clear interval if timer have been disabled (empire view for exemple)
					console.log('Main interval deactivated');
					clearInterval(interval)
				}
			}, parseInt(PARAMS.main_refresh ?? 1) * 1000);
		}
		// Finally, parse page data
		this.router.handlePage(this.url);
	}

}
