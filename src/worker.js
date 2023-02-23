
function getIDB() {
    /!* global indexedDB,webkitIndexedDB,mozIndexedDB,OIndexedDB,msIndexedDB *!/
    try {
        if (typeof indexedDB !== 'undefined') {
            return indexedDB;
        }
        if (typeof webkitIndexedDB !== 'undefined') {
            return webkitIndexedDB;
        }
        if (typeof mozIndexedDB !== 'undefined') {
            return mozIndexedDB;
        }
        if (typeof OIndexedDB !== 'undefined') {
            return OIndexedDB;
        }
        if (typeof msIndexedDB !== 'undefined') {
            return msIndexedDB;
        }
    } catch (e) {
        return;
    }
}

let myLocalVar = 0;
let tempStore = {
    production: {},
    data: {},
    params: {},
    flights: {},
    others: {}
};
let planetProductionIdToStoreKey = {};
let planetDataIdToStoreKey = {};
let interval;
let iterations = 0

const idb = getIDB();
let db = null;
const DB_STORE_NAME = 'ogameLiveStorage';
const DBOpenRequest = idb.open('ogameLiveDB');
DBOpenRequest.onerror = (event) => { console.error('error loading database') };
DBOpenRequest.onsuccess = (event) => {
    // console.info('Connected to db')
    db = DBOpenRequest.result;
    const store = getIDBStorage('readonly');
    let req = store.getAll();
    req.onsuccess = (event) => {
        let result = event.target.result;
        // console.log('getAll success ', event, result);
        // initialise local tempStore
        result.forEach( elt => {
            let parts = elt.key.split('.');
            if (parts.length > 4) {
                let univKey = parts[0] + '.' + parts[1];
                // On migration from older version localStorage only some universe keys are doubled
                elt.key = elt.key.replace(univKey + '.' + univKey, univKey);
            }

            // ensure that value is an valid json
            if (Object.prototype.toString.call(elt.value) === "[object String]") {
                elt.value = JSON.parse(elt.value);
            }
            switch (true) {
                case elt.key.includes('production') :
                    tempStore.production[elt.key] = elt;
                    break;
                case elt.key.includes('data') :
                    tempStore.data[elt.key] = elt;
                    break;
                case elt.key.includes('params') :
                    tempStore.params[elt.key] = elt;
                    break;
                case elt.key.includes('flights') :
                    tempStore.flights[elt.key] = elt;
                    break;
                default:
                    tempStore.others[elt.key] = elt;
            }

        });
        // start main loop
        setTimeout(mainLoop, 0);
        interval = setInterval(mainLoop, 1000);
    };
    req.onerror = function() {
        console.error("getAll error", this.error);
    };
};
DBOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.onerror = (event) => {
        console.error('error loading database');
    };
    // Create an objectStore for the database with the primary key
    const objectStore = db.createObjectStore(DB_STORE_NAME, { keyPath: "key" });
    // console.log('Object store created.');
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // console.log('[WORKER] receive message :', message, sender);
    switch (message.type) {
        case 'setvalue':
            setValue(message.value);
            return false; // no async response
            break;
        case 'readvalue':
            sendResponse(readValue(message.key));
            return true; // async response
            break;
        case 'readmultiplevalues':
            sendResponse(readMultipleValues(message.keys));
            return true; // async response
            break;
        case 'settest':
            myLocalVar = message.value;
            return false;
            break;
        case 'gettest':
            sendResponse(myLocalVar);
            return true;
            break;
    }

})

function setValue(elt) {
    switch (true) {
        case elt.key.includes('production') :
            let stored = tempStore.production[elt.key];
            if (elt.force === true) {
                elt.value.lastTime = elt.timestamp;
                tempStore.production[elt.key] = elt;
            } else {
                if (tempStore.production[elt.key].value.lastTime < elt.timestamp) {
                    elt.value.lastTime = elt.timestamp;
                    tempStore.production[elt.key] = elt;
                }
            }
            break;
        case elt.key.includes('data') :
            tempStore.data[elt.key] = elt;
            storeItem(elt);
            break;
        case elt.key.includes('params') :
            tempStore.params[elt.key] = elt;
            storeItem(elt);
            break;
        case elt.key.includes('flights') :
            tempStore.flights[elt.key] = elt;
            storeItem(elt);
            break;
        default:
            tempStore.others[elt.key] = elt;
            storeItem(elt);
    }
}

function readValue(key) {
    let res = null;
    switch (true) {
        case key.includes('production') :
            res = tempStore.production[key];
            break;
        case key.includes('data') :
            res = tempStore.data[key];
            break;
        case key.includes('params') :
            res = tempStore.params[key];
            break;
        case key.includes('flights') :
            res = tempStore.flights[key];
            break;
        default:
            res = tempStore.others[key];
    }
    return res;
}

function readMultipleValues(keys) {
    let res = {};
    keys.forEach(k => res[k] = readValue(k));
    return res;
}

function storeItem(item) {
    // console.log("storing", item);
    const obj = {key: item.key, value: item.value}; // ensure that inserted item has key / value attributes only

    // const store = getIDBStorage('readwrite');
    const tx = db.transaction(DB_STORE_NAME, 'readwrite');
    tx.oncomplete = (event) => {
        // console.log("TRANSACTION COMPLETE");
    }
    const store = tx.objectStore(DB_STORE_NAME);
    let req;
    try {
        req = store.put(obj);
    } catch (e) {
       console.error('store.put error : ' + e.name, e);
    }
    req.onsuccess = function (evt) {
        // console.log("Insertion in DB successful", obj);
        tx.commit();
    };
    req.onerror = function() {
        console.error("storeItem error", this.error, obj);
    };
}

function getItem(key, callback) {
    const store = getIDBStorage('readonly');
    let req = store.get(key);
    req.onsuccess = (event) => {
        let result = event.target.result;
        // console.log('retrieved ', key, result);
        callback(result);
    };
    req.onerror = function() {
        console.error("getItem error", this.error, key);
    };
}

/**
 * @param {string} store_name
 * @param {string} mode either "readonly" or "readwrite"
 */
function getIDBStorage(mode) {
    const tx = db.transaction(DB_STORE_NAME, mode);
    return tx.objectStore(DB_STORE_NAME);
}

function mainLoop() {

    for(let flightsKey in tempStore.flights) {
        let toDeleteFlightIds = [];
        let flights = tempStore.flights[flightsKey].value;
        // resolve flights
        for (let flightId in flights) {
            let flight = flights[flightId];
            let nowTime = (new Date()).getTime();
            if (flight.arrivalTime <= nowTime) {
                toDeleteFlightIds.push(flightId);
                if (flight.destination && flight.destinationType !== 'debrisField') {
                    var destPlanetId = flight.destination;
                    if (flight.destinationType === 'moon') {
                        destPlanetId += '-moon';
                    }
                    let productionKey = getProductionKeyFromPlanetId(destPlanetId);
                    let planetProd = JSON.parse(JSON.stringify(tempStore.production[productionKey].value));
                    if (Object.prototype.toString.call(planetProd) === "[object String]") {
                        planetProd = JSON.parse(planetProd);
                    }
                    planetProd.M.dispo += flight.resources.M;
                    if (planetProd.M.dispo >= planetProd.M.capa) {
                        planetProd.M.lastprod = planetProd.M.prod;
                        planetProd.M.prod = 0;
                    }
                    planetProd.C.dispo += flight.resources.C;
                    if (planetProd.C.dispo >= planetProd.C.capa) {
                        planetProd.C.lastprod = planetProd.C.prod;
                        planetProd.C.prod = 0;
                    }
                    planetProd.D.dispo += flight.resources.D;
                    if (planetProd.D.dispo >= planetProd.D.capa) {
                        planetProd.D.lastprod = planetProd.D.prod;
                        planetProd.D.prod = 0;
                    }
                    if (tempStore.params.lifeform) {
                        planetProd.F.dispo += flight.resources.F;
                        if (planetProd.F.dispo >= planetProd.F.capa) {
                            planetProd.F.lastprod = planetProd.F.surprod;
                            planetProd.F.surprod = 0;
                        }
                    }
                    planetProd.lastTime = nowTime;
                    tempStore.production[productionKey].value = planetProd;

                    let dataKey = getDataKeyFromPlanetId(destPlanetId);
                    let planetData = JSON.parse(JSON.stringify(tempStore.data[dataKey].value));
                    if (Object.prototype.toString.call(planetData) === "[object String]") {
                        planetData = JSON.parse(planetData);
                    }
                    if (!planetData.vaissels) {
                        planetData.vaissels = 0;
                    }
                    if (flight.missionType !== 18) {
                        planetData.vaissels += parseInt(flight.detailsFleet);
                    }
                    tempStore.data[dataKey].value = planetData;
                    storeItem({key: dataKey, value: tempStore.data[dataKey].value});

                }
            }
        }
        // delete terminated flights
        for (let i = 0; i < toDeleteFlightIds.length; i++) {
            delete tempStore.flights[flightsKey].value[toDeleteFlightIds[i]];
        }
        if (iterations % 10 === 0) {
            storeItem({key: flightsKey, value: tempStore.flights[flightsKey].value});
        }
    }


    iterations ++;
    // loop over productions
    for (let key in tempStore.production) {
        // clone current stored value
        let production = JSON.parse(JSON.stringify(tempStore.production[key].value));
        const latsUpdated = production.lastTime;
        if (Object.prototype.toString.call(production) === "[object String]") {
            production = JSON.parse(production);
        }
        // console.log(key, production);

        let nowTime = (new Date()).getTime();
        let elapsedSeconds = 0;
        if ( latsUpdated > 0) {
            elapsedSeconds = (nowTime - latsUpdated)/1000;
        }

        // update production
        if (production.M && production.C && production.D) {
            // Metal
            if (production.M.dispo < production.M.capa && production.M.prod == 0 && production.M.lastprod > 0) {
                production.M.prod = production.M.lastprod;
            }
            production.M.dispo += production.M.prod / 60 / 60 * elapsedSeconds;
            if (production.M.dispo >= production.M.capa && production.M.prod > 0) {
                production.M.dispo = production.M.capa;
                production.M.lastprod = production.M.prod;
                production.M.prod = 0;
            }
            // Cristal
            if (production.C.dispo < production.C.capa && production.C.prod == 0 && production.C.lastprod > 0) {
                production.C.prod = production.C.lastprod;
            }
            production.C.dispo += production.C.prod / 60 / 60 * elapsedSeconds;
            if (production.C.dispo >= production.C.capa && production.C.prod > 0) {
                production.C.dispo = production.C.capa;
                production.C.lastprod = production.C.prod;
                production.C.prod = 0;
            }
            // Deuterium
            if (production.D.dispo < production.D.capa && production.D.prod == 0 && production.D.lastprod > 0) {
                production.D.prod = production.D.lastprod;
            }
            production.D.dispo += production.D.prod / 60 / 60 * elapsedSeconds;
            if (production.D.dispo >= production.D.capa && production.D.prod > 0) {
                production.D.dispo = production.D.capa;
                production.D.lastprod = production.D.prod;
                production.D.prod = 0;
            }
            if (tempStore.params.lifeform) {
                // Food
                if (production.F.dispo < production.F.capa && production.F.surprod == 0 && production.F.lastprod > 0) {
                    production.F.surprod = production.F.lastprod;
                }
                production.F.dispo += production.F.surprod * elapsedSeconds;
                if (production.F.dispo >= production.F.capa && production.F.surprod > 0) {
                    production.F.dispo = production.F.capa;
                    production.F.lastprod = production.F.surprod;
                    production.F.surprod = 0;
                }
            }
            production.lastTime = nowTime;
            // finaly store cloned and updated production only if stored one did not been updated
            if (latsUpdated === tempStore.production[key].value.lastTime || !tempStore.production[key].value.lastTime) {
                tempStore.production[key].value = production;
            }
            // Save into idb each 10 iterations (10s)
            if (iterations % 10 === 0) {
                storeItem({key: key, value: tempStore.production[key].value});
            }
        }
    }
}

function updateFlights(flights_elt) {
    tempStore.flights[flights_elt.key] = flights_elt.value;
    storeItem({key: 'flights', value: tempStore.flights});
}

function getProductionKeyFromPlanetId(planetId) {

    if (!planetProductionIdToStoreKey[planetId]) { // Warn : could certainly be possible that same planet ID exists accros multiple universes
        // extract planets Ids from storeKies
        for (let key in tempStore.production) {
            let parts = key.split('.');
            let p_id = parts.pop();
            planetProductionIdToStoreKey[p_id] = key;
        }
    }
    return planetProductionIdToStoreKey[planetId];
}

function getDataKeyFromPlanetId(planetId) {

    if (!planetDataIdToStoreKey[planetId]) { // Warn : could certainly be possible that same planet ID exists accros multiple universes
        // extract planets Ids from storeKies
        for (let key in tempStore.data) {
            let parts = key.split('.');
            let p_id = parts.pop();
            planetDataIdToStoreKey[p_id] = key;
        }
    }
    return planetDataIdToStoreKey[planetId];
}
