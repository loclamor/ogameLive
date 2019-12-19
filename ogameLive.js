
class OgameLive {

	constructor() {
		this.dataManager = new DataManager();
		this.router = new Router(this);
		this.url = location.href;
	}

	start() {

		new PlanetProductionParser(this.dataManager);
		var productionDisplay = new PlanetsProductionDisplay(this.dataManager);
		setInterval(function() {
			productionDisplay.display();
		}, 1000);
		
		// next, parse page data
		this.router.handlePage(this.url);
	}

}
