class Router {


	constructor(app) {
		this.app = app;
		this.regOverview = new RegExp(/component=(overview)/);
		this.regResources = new RegExp(/component=(supplies)/);
		this.regResourceSettingsPage = new RegExp(/page=(resourceSettings)/);
		this.regResourceSettingsComponent = new RegExp(/component=(resourcesettings)/);
		this.regInstallations = new RegExp(/component=(facilities)/);
		this.regResearch = new RegExp(/component=(research)/);
		this.regShipyard = new RegExp(/component=(shipyard)/);
		this.regDefenses = new RegExp(/component=(defenses)/);
		this.regFleet = new RegExp(/component=(fleetdispatch)/);
		this.regLife = new RegExp(/component=(lfbuildings)/);
		this.regLifeResearch = new RegExp(/component=(lfresearch)/);
		this.regEmpire = new RegExp(/component=(empire)/);
	}

	handlePage(url) {
		if (this.regResourceSettingsPage.test(url) || this.regResourceSettingsComponent.test(url)) {
			new ResourceSettingsParser(this.app.dataManager);
		} else if (this.regResearch.test(url)) {
			new ResearchParser(this.app.dataManager);
			new TechDetailObserver(this.app.dataManager);
			new BetterTechDisplay(this.app.dataManager);
		} else if (this.regResources.test(url)) {
			new ResourcesParser(this.app.dataManager);
			new TechDetailObserver(this.app.dataManager);
			new BetterTechDisplay(this.app.dataManager);
		} else if (this.regInstallations.test(url)) {
			new InstallationsParser(this.app.dataManager);
			new TechDetailObserver(this.app.dataManager);
			new BetterTechDisplay(this.app.dataManager);
		} else if (this.regLife.test(url) && PARAMS.lifeform) {
			new LifeParser(this.app.dataManager);
			new TechDetailObserver(this.app.dataManager);
			new BetterTechDisplay(this.app.dataManager);
		} else if (this.regLifeResearch.test(url) && PARAMS.lifeform) {
			new TechDetailObserver(this.app.dataManager);
			new BetterTechDisplay(this.app.dataManager);
		} else if (this.regShipyard.test(url) || this.regFleet.test(url)) {
			new FleetParser(this.app.dataManager);
			if (this.regFleet.test(url)) {
				new BetterFleetDisplay(this.app.dataManager);
			}
			else {
				new TechDetailObserver(this.app.dataManager);
				new BetterTechDisplay(this.app.dataManager);
			}
		} else if (this.regEmpire.test(url)) {
			new EmpireParser(this.app.dataManager);
			this.app.disabledTimer = true;
		}
	}

	
}
