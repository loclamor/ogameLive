/**
 * Created by loclamor on 12/2019.
 */

/*********************** Compatibilité Chrome ***************************/

function GM_getValue(key, defaultVal) {
	var retValue = localStorage.getItem(prefix_GMData + key);
	if (!retValue) {
		return defaultVal;
	}
	return retValue;
}

function GM_getIntValue(key, defaultVal) {
	var retValue = GM_getValue(key, defaultVal);
	return parseInt(retValue);
}

function GM_getJsonValue(key, defaultVal) {
	var retValue = GM_getValue(key, defaultVal);
	return typeof retValue === 'string' ? JSON.parse(retValue) : defaultVal;
}

function GM_setValue(key, value) {
	// storeValue(prefix_GMData + key, value);
	localStorage.setItem(prefix_GMData + key, value);
}

function GM_setJsonValue(key, value) {
	GM_setValue(key, JSON.stringify(value));
}

/**
 * Stocke de la data sous la forme clé/valeur dans IndexedDB via le worker
 * @param key
 * @param value as object
 * @param force
 * @param timestamp en cas de force = true
 */
function storeValue(key, value, force, timestamp) {
	timestamp = timestamp || (new Date()).getTime();
	force = force || false;
	chrome.runtime.sendMessage({type: 'setvalue', value: {key: prefix_GMData + key, value: value, timestamp: timestamp, force: force}});
}

function retrieveValue(key, defaultValue, raw) {
	const realKey = prefix_GMData + key;
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({type: 'readvalue', key: realKey}, (response) => {
			// 3. Got an asynchronous response with the data from the service worker
			// console.log('received worker data for key ' + realKey, response);
			if (response && raw) {
				resolve(response);
			} else if (response && response.value) {
				resolve(response.value);
			} else {
				resolve(defaultValue);
			}
		});
	});
}

function retrieveMultipleValues(keys, defaultValues) {
	const realKeys = keys.map( key => prefix_GMData + key);
	return new Promise((resolve, reject) => {
		chrome.runtime.sendMessage({type: 'readmultiplevalues', keys: realKeys}, (response) => {
			let res = {};
			keys.forEach( k => {
				if (response[prefix_GMData + k]) {
					if (response[prefix_GMData + k].value) {
						res[k] = response[prefix_GMData + k].value;
					} else {
						res[k] = response[prefix_GMData + k];
					}
				} else if (defaultValues[k]) {
					res[k] = defaultValues[k];
				}
				else {
					res[k] = null;
				}
			});
			resolve(res);
		});
	});
}

function GM_deleteValue(key) {
	localStorage.removeItem(key);
}

/**
	@param args...
	@param logLevel
**/
function log(p_args, p_logLevel) {
	var args = [];
	var logLevel = arguments[arguments.length-1] || LOG_LEVEL_INFO;
	if (logLevel < GM_getIntValue('debug.loglevel', LOG_LEVEL_ALL)) {
		return;
	}
	var d = $.now();
	args.push('[' + d + '] '+ nomScript + ' : ');
	for (var i = 0; i<arguments.length-1; i++) { // do not tack into acount logLevel
		args.push(arguments[i]);
	}
	switch (logLevel) {
		case LOG_LEVEL_FATAL :
		case LOG_LEVEL_ERROR :
			console.error.apply(this, args);
			break;
		case LOG_LEVEL_WARN :
			console.warn.apply(this, args);
			break;
		case LOG_LEVEL_INFO :
			console.info.apply(this, args);
			break;
		case LOG_LEVEL_DEBUG : 
			console.debug.apply(this, args);
			break;
		default :
			console.log.apply(this, args);
	}
}

Xpath = {
	//node est facultatif
	getNumberValue: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.NUMBER_TYPE, null).numberValue;
	},
	getStringValue: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.STRING_TYPE, null).stringValue;
	},
	getOrderedSnapshotNodes: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	},
	getUnorderedSnapshotNodes: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
	},
	getSingleNode: function (doc, xpath, node) {
		node = node ? node : doc;
		return doc.evaluate(xpath, node, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
	}
};

function formatInt( val ) {
	if (PARAMS.prod_round == 1) {
		return readablize(val);
	}
	return parseInt(val).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function formatTime( time ) {
	if (time <= 0) {
		return 'Terminé';
	}
	var sec_num =  Math.floor(time/1000);
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num % 3600) / 60)
    var seconds = Math.floor(sec_num % 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
	var retStr = '';
	if (parseInt(hours) > 0) {
		retStr += hours+':'
	}
	retStr += minutes+':'+seconds;
    return retStr;
}

function readablize(num) {
	if (num === 0) {
		return 0;
	}
	var s = ['', 'k', 'M', 'Md', 'T', 'P'];
	var e = Math.floor(Math.log(num) / Math.log(1000));
	return Math.round((num / Math.pow(1000, e)) * 100) / 100 + s[e];
}

