class EmpireParser {
    constructor(dataManager) {
        this.dataManager = dataManager;

        const moonRegex = new RegExp(/planetType=1/)
        this.isOnMoon = moonRegex.test(location.href);

        console.log("isOnMoon", this.isOnMoon);
        if (this.isOnMoon) {
            retrieveMultipleValues([
                    'planetsIdToCoords',
                    'planetsCoordsToId'
                ]).then( (r) => {
                this.planetsIdToCoords = r.planetsIdToCoords;
                this.planetsCoordsToId = r.planetsCoordsToId;
                console.log('planetsIdToCoords', this.planetsIdToCoords, 'planetsCoordsToId', this.planetsCoordsToId);
            });
        }

        let empireSelector = document.querySelector('#mainWrapper');
        if (empireSelector != null) {
            let empireObserver = new MutationObserver(jQuery.proxy(async function (mutations) {
                if (this.isOnMoon) {
                    const res = await retrieveMultipleValues([
                        'planetsIdToCoords',
                        'planetsCoordsToId'
                    ])//.then( (r) => {
                    //     this.planetsIdToCoords = r.planetsIdToCoords;
                    //     this.planetsCoordsToId = r.planetsCoordsToId;
                    //     console.log('planetsIdToCoords', this.planetsIdToCoords, 'planetsCoordsToId', this.planetsCoordsToId);
                    // });
                    this.planetsIdToCoords = res.planetsIdToCoords;
                    this.planetsCoordsToId = res.planetsCoordsToId;
                    console.log('planetsIdToCoords', this.planetsIdToCoords, 'planetsCoordsToId', this.planetsCoordsToId);
                }
                let loadedTime = (new Date()).getTime();
                console.log("Inside empire Observer !");
                empireObserver.disconnect();
                let planetList = Xpath.getUnorderedSnapshotNodes(document,'//div[contains(@class,"planetWrapper")]/div/@id');
                let nbPlanets = planetList.snapshotLength;
                // reset max fleet in storage
                // this.dataManager.setValue('data.maxships', 0);
                for (var i = 0; i < nbPlanets; i++) {
                    let internalId;
                    let planetId = planetList.snapshotItem(i).textContent;
                    if (this.isOnMoon) {
                        let moonCoords = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"planetHead")]/div[contains(@class,"planetData")]/div[contains(@class, "planetDataTop")]/ul/li[contains(@class, "coords")]/a');
                        moonCoords = moonCoords.trim().replace(/\[|\]/g, '');
                        console.log('moon coords', moonCoords);
                        const p_id = this.planetsCoordsToId[moonCoords];
                        internalId = p_id + '-moon';
                    } else {
                        internalId = 'planet-' + planetId.split('planet')[1];
                    }
                    const [planetData, planetProd] = await Promise.all([
                        this.dataManager.loadPlanetData(internalId),
                        this.dataManager.loadPlanetProd(internalId)
                    ]);
                    console.log(planetId, internalId, planetData, planetProd);

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
                        if (metalQt >= metalStorage && planetProd.M.prod > 0) {
                            planetProd.M.lastprod = planetProd.M.prod;
                            planetProd.M.prod = 0;
                        } else if (metalQt < metalStorage && planetProd.M.prod == 0 & planetProd.M.lastprod > 0) {
                            planetProd.M.prod = planetProd.M.lastprod;
                        }

                        planetProd.C.dispo = cristalQt;
                        planetProd.C.capa = crystalStorage;
                        if (cristalQt >= crystalStorage && planetProd.C.prod > 0) {
                            planetProd.C.lastprod = planetProd.C.prod;
                            planetProd.C.prod = 0;
                        } else if (cristalQt < crystalStorage && planetProd.C.prod == 0 & planetProd.C.lastprod > 0) {
                            planetProd.C.prod = planetProd.C.lastprod;
                        }

                        planetProd.D.dispo = deuteriumQt;
                        planetProd.D.capa = deuteriumStorage;
                        if (deuteriumQt >= deuteriumStorage && planetProd.D.prod > 0) {
                            planetProd.D.lastprod = planetProd.D.prod;
                            planetProd.D.prod = 0;
                        } else if (deuteriumQt < deuteriumStorage && planetProd.D.prod == 0 & planetProd.D.lastprod > 0) {
                            planetProd.D.prod = planetProd.D.lastprod;
                        }

                        planetProd.F.dispo = foodQt;
                        planetProd.F.capa = foodStorage;
                        if (foodQt >= foodStorage && planetProd.F.surprod > 0) {
                            planetProd.F.lastprod = planetProd.F.surprod;
                            planetProd.F.surprod = 0;
                        } else if (foodQt < foodStorage && planetProd.F.surprod == 0 & planetProd.F.lastprod > 0) {
                            planetProd.F.surprod = planetProd.F.lastprod;
                        }

                        this.dataManager.updatePlanetProd(internalId, planetProd, true, loadedTime);

                        // Parse some other data

                        // Fleet
                        if (!planetData.fleet) {
                            planetData.fleet = {};
                        }
                        planetData.vaissels = 0;
                        Object.keys(OgameConstants.fleet).forEach(function(shipName) {
                            const shipId = OgameConstants.fleet[shipName];
                            let quantity = Xpath.getStringValue(document, '//div[contains(@id,"'+planetId+'")]/div[contains(@class,"ships")]/div[contains(@class,"' + shipId + '")]');
                            quantity = parseInt(quantity.split('.').join(''));
                            planetData.fleet[shipName] = quantity;
                            console.log(internalId, shipName, planetData.fleet[shipName])
                            if (shipName !== 'resbuggy' && shipName !== 'solarSatellite') {
                                // Do not count resbuggy and solarSatellite
                                planetData.vaissels += quantity;
                            }
                        });
                        this.dataManager.updatePlanetData(internalId, planetData, true,loadedTime);
                    }

                }
            }, this));
            let config = {attributes: true, childList: true, characterData: false};
            empireObserver.observe(empireSelector, config);
        }


    }
}
