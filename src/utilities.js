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
	localStorage.setItem(prefix_GMData + key, value);
}

function GM_setJsonValue(key, value) {
	GM_setValue(key, JSON.stringify(value));
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
	return parseInt(val).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

function formatTime( time ) {
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

