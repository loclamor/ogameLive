class Router {

	regOverview = new RegExp(/component=(overview)/);
	regResources = new RegExp(/component=(supplies)/);
	regResourceSettings = new RegExp(/page=(resourceSettings)/);
	regInstallations = new RegExp(/component=(facilities)/);
	regResearch = new RegExp(/component=(research)/);
	regShipyard = new RegExp(/component=(shipyard)/);
	regDefenses = new RegExp(/component=(defenses)/);
	regFleet = new RegExp(/component=(fleetdispatch)/);

	app;

	constructor(app) {
		this.app = app;
	}

	handlePage(url) {
		if (this.regResourceSettings.test(url)) {
			new ResourceSettingsParser();
		} else if (this.regResearch.test(url)) {
			new ResearchParser();
			new TechDetailObserver();
		} else if (this.regResources.test(url)) {
			new ResourcesParser();
			new TechDetailObserver();
		} else if (this.regInstallations.test(url)) {
			new InstallationsParser();
			new TechDetailObserver();
		} else if (this.regShipyard.test(url) || this.regFleet.test(url)) {
			new FleetParser();
			if (this.regFleet.test(url)) {
				new BetterFleetDisplay();
			}
			else {
				new TechDetailObserver();
			}
		}
	}

	
}