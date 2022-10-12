
class OgameLive {

	constructor() {
		this.dataManager = new DataManager();
		this.router = new Router(this);
		this.url = location.href;
		if ((new Date()).getTime() < 1577833200000) {
			jQuery('#eventboxBlank').text('La WWW vous souhaite de bonnes Fêtes de fin d\'année !')
		} else if ((new Date()).getTime() < 1578351600000) {
			jQuery('#eventboxBlank').text('Bonne et heureuse année 2020 de la part de la WWW !')
		}
	}

	start() {
		new PlanetProductionParser(this.dataManager);
		var productionDisplay = new PlanetsProductionDisplay(this.dataManager);
		new FlyingFleetObserver(this.dataManager);
		setInterval(function() {
			productionDisplay.display();
		}, 1000);
		
		// next, parse page data
		this.router.handlePage(this.url);
	}

}
