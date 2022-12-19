
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
    others: {}
};
let interval;
let iterations = 0

const idb = getIDB();
let db = null;
const DB_STORE_NAME = 'ogameLiveStorage';
const DBOpenRequest = idb.open('ogameLiveDB');
DBOpenRequest.onerror = (event) => { console.error('error loading database') };
DBOpenRequest.onsuccess = (event) => {
    console.info('Connected to db')
    db = DBOpenRequest.result;
    const store = getIDBStorage('readonly');
    let req = store.getAll();
    req.onsuccess = (event) => {
        let result = event.target.result;
        console.log('getAll success ', event, result);
        // initialise local tempStore
        result.forEach( elt => {
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
                default:
                    tempStore.others[elt.key] = elt;
            }

        });
        // start main loop
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
    console.log('Object store created.');
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[WORKER] receive message :', message, sender);
    switch (message.type) {
        case 'setvalue':
            setValue(message.value);
            return false; // no async response
            break;
        case 'readvalue':
            sendResponse(readValue(message.key));
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
            break;
        case elt.key.includes('params') :
            tempStore.params[elt.key] = elt;
            break;
        default:
            tempStore.others[elt.key] = elt;
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
        default:
            res = tempStore.others[key];
    }
    return res;
}

function storeItem(item) {
    console.log("storing", item);
    const obj = {key: item.key, value: item.value}; // ensure that inserted item has key / value attributes only

    // const store = getIDBStorage('readwrite');
    const tx = db.transaction(DB_STORE_NAME, 'readwrite');
    tx.oncomplete = (event) => {
        console.log("TRANSACTION COMPLETE");
    }
    const store = tx.objectStore(DB_STORE_NAME);
    let req;
    try {
        req = store.put(obj);
    } catch (e) {
       console.error('store.put error : ' + e.name, e);
    }
    req.onsuccess = function (evt) {
        console.log("Insertion in DB successful", obj);
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
        console.log('retrieved ', key, result);
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
    iterations ++;
    // loop over productions
    for (let key in tempStore.production) {
        // clone current stored value
        let production = JSON.parse(JSON.stringify(tempStore.production[key].value));
        const latsUpdated = production.lastTime;
        if (Object.prototype.toString.call(production) === "[object String]") {
            production = JSON.parse(production);
        }
        console.log(key, production);
        // update production
        let nowTime = (new Date()).getTime();
        let elapsedSeconds = 0;
        if ( latsUpdated > 0) {
            elapsedSeconds = (nowTime - latsUpdated)/1000;
        }
        if (production.M && production.C && production.D) {
            production.M.dispo += production.M.prod / 60 / 60 * elapsedSeconds;
            if (production.M.dispo >= production.M.capa && production.M.prod > 0) {
                production.M.dispo = production.M.capa;
                production.M.prod = 0;
            }
            production.C.dispo += production.C.prod / 60 / 60 * elapsedSeconds;
            if (production.C.dispo >= production.C.capa && production.C.prod > 0) {
                production.C.dispo = production.C.capa;
                production.C.prod = 0;
            }
            production.D.dispo += production.D.prod / 60 / 60 * elapsedSeconds;
            if (production.D.dispo >= production.D.capa && production.D.prod > 0) {
                production.D.dispo = production.D.capa;
                production.D.prod = 0;
            }
            if (tempStore.params.lifeform) {
                production.F.dispo += production.F.surprod * elapsedSeconds;
                if (production.F.dispo >= production.F.capa && production.F.surprod > 0) {
                    production.F.dispo = production.F.capa;
                    production.F.surprod = 0;
                }
            }
            production.lastTime = nowTime;
            // finaly store cloned and updated production only if stored one did not been updated
            if (latsUpdated === tempStore.production[key].value.lastTime || !tempStore.production[key].value.lastTime) {
                tempStore.production[key].value = production;
            }
            // Save into ideb each 10 iterations (10s)
            if (iterations % 10 === 0) {
                storeItem({key: key, value: tempStore.production[key].value});
            }
        }
    }
}
