
class OgameLive {

	router;
	url;

	constructor() {
		this.router = new Router(this);
		this.url = location.href;
	}

	start() {

		new PlanetProductionParser();
		var productionDisplay = new PlanetsProductionDisplay();
		setInterval(function() {
			productionDisplay.display();
		}, 1000);
		
		// next, parse page data
		this.router.handlePage(this.url);
	}

}
