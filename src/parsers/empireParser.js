class EmpireParser {
    constructor(dataManager) {
        this.dataManager = dataManager;

        let empireSelector = document.querySelector('#mainWrapper');
        if (empireSelector != null) {
            let empireObserver = new MutationObserver(jQuery.proxy(async function (mutations) {
                let loadedTime = (new Date()).getTime();
                console.log("Inside empire Observer !");
                empireObserver.disconnect();
                let planetList = Xpath.getUnorderedSnapshotNodes(document,'//div[contains(@class,"planetWrapper")]/div/@id');
                let nbPlanets = planetList.snapshotLength;
                for (var i = 0; i < nbPlanets; i++) {
                    let planetId = planetList.snapshotItem(i).textContent;
                    let internalId = 'planet-' + planetId.split('planet')[1];
                    const [planetData, planetProd] = await Promise.all([
                        this.dataManager.loadPlanetData(internalId),
                        this.dataManager.loadPlanetProd(internalId)
                    ]);
                    console.log(planetId, planetData, planetProd);

                    // Now we have our planet from dataManager, parse planet data from the empire view
                    if (!jQuery.isEmptyObject(planetData)) {
                        // Metal
                        let metalQt = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"resources")]/div[contains(@class,"metal")]/span');
                        metalQt = parseInt(metalQt.split('.').join(''));
                        let metalStorage = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"storage")]/div[contains(@class,"metalStorage")]');
                        metalStorage = parseInt(metalStorage.split('.').join(''));

                        // Cristal
                        let cristalQt = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"resources")]/div[contains(@class,"crystal")]/span');
                        cristalQt = parseInt(cristalQt.split('.').join(''));
                        let crystalStorage = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"storage")]/div[contains(@class,"crystalStorage")]');
                        crystalStorage = parseInt(crystalStorage.split('.').join(''));

                        // Deut
                        let deuteriumQt = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"resources")]/div[contains(@class,"deuterium")]/span');
                        deuteriumQt = parseInt(deuteriumQt.split('.').join(''));
                        let deuteriumStorage = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"storage")]/div[contains(@class,"deuteriumStorage")]');
                        deuteriumStorage = parseInt(deuteriumStorage.split('.').join(''));

                        // Food
                        let foodQt = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"resources")]/div[contains(@class,"food")]/span');
                        foodQt = parseInt(foodQt.split('.').join(''));
                        let foodStorage = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"storage")]/div[contains(@class,"foodStorage")]');
                        foodStorage = parseInt(foodStorage.split('.').join(''));

                        console.log(planetId, 'metalQt', metalQt, 'cristalQt', cristalQt, 'deuteriumQt', deuteriumQt, 'foodQt', foodQt );

                        planetProd.M.dispo = metalQt;
                        planetProd.M.capa = metalStorage;
                        planetProd.C.dispo = cristalQt;
                        planetProd.C.capa = crystalStorage;
                        planetProd.D.dispo = deuteriumQt;
                        planetProd.D.capa = deuteriumStorage;
                        planetProd.F.dispo = foodQt;
                        planetProd.F.capa = foodStorage;

                        this.dataManager.updatePlanetProd(internalId, planetProd, true, loadedTime);
                    }

                }
            }, this));
            let config = {attributes: true, childList: true, characterData: false};
            empireObserver.observe(empireSelector, config);
        }


    }
}
