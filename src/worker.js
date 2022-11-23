/*
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

const idb = getIDB();
let db = null;
const DBOpenRequest = idb.open('ogameLive');
DBOpenRequest.onerror = (event) => { console.error('error loading database') };
DBOpenRequest.onsuccess = (event) => {
    db = DBOpenRequest.result;
};
DBOpenRequest.onupgradeneeded = (event) => {
    const db = event.target.result;

    db.onerror = (event) => {
        console.error('error loading database');
    };

    // Create an objectStore for this database
    const objectStore = db.createObjectStore("planets", { keyPath: "planetId" });

    // define what data items the objectStore will contain
    objectStore.createIndex("M", "M", { unique: false });
    objectStore.createIndex("C", "C", { unique: false });
    objectStore.createIndex("D", "D", { unique: false });
    objectStore.createIndex("F", "F", { unique: false });
    objectStore.createIndex("E", "E", { unique: false });



    objectStore.createIndex("notified", "notified", { unique: false });

    note.innerHTML += '<li>Object store created.</li>';
};

const user = {
    username: 'demo-user'
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('[WORKER] receive message :', message, sender);
    switch (message.type) {
        case 'update-production':
            updatePlanetProd(message.value.planetId, message.value.prod);
            break;
        case 'greeting':
        sendResponse('welcome ' + message.value);
    }
})

function updatePlanetProd(planetId, prod) {
    // todo
}*/
