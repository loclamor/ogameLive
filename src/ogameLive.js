
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


		new PlanetProductionParser(this.dataManager);
		var productionDisplay = new PlanetsProductionDisplay(this.dataManager);
		productionDisplay.initialize();
		new FlyingFleetObserver(this.dataManager);
		var app = this;
		setTimeout(() => {
			if (!app.disabledTimer) {
				productionDisplay.display();
			}
		}, 0);
		if (PARAMS.main_refresh > 0) {
			var interval = setInterval(function () {
				if (!app.disabledTimer) {
					productionDisplay.display();
				} else {
					console.log('Main interval deactivated');
					clearInterval(interval)
				}
			}, parseInt(PARAMS.main_refresh ?? 1) * 1000);
		}
		// next, parse page data
		this.router.handlePage(this.url);
	}

}
