// ==UserScript==
// @name	    ogameLive
// @version     1.0.0
// @author      loclamor
// @namespace	loclamor.info
// @include     https://*.ogame.*/game/index.php*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_xmlhttpRequest
// @description Cette extension permet d'afficher les stocks de ressources en live
// ==/UserScript==
// Variables ogameLive
var TYPE = 'GM-';
var nomScript = 'ogameLive';

var LOG_LEVEL_OFF = 10,
	LOG_LEVEL_ALL = 1,
	LOG_LEVEL_TRACE = 2,
	LOG_LEVEL_DEBUG = 3,
	LOG_LEVEL_INFO = 4,
	LOG_LEVEL_WARN = 5,
	LOG_LEVEL_ERROR = 6,
	LOG_LEVEL_FATAL = 7;
GM_setValue('debug.loglevel', GM_getIntValue('debug.loglevel', LOG_LEVEL_INFO));
// Navigateurs
var isFirefox = (window.navigator.userAgent.indexOf('Firefox') > -1);
var isChrome = (window.navigator.userAgent.indexOf('Chrome') > -1);
var isOpera = (window.navigator.userAgent.indexOf('Opera') > -1);
if (isFirefox) {
    TYPE += 'FF';
} else if (isChrome) {
    TYPE += 'GC';
} else if (isOpera) {
    TYPE += 'OP';
}

var manifestData = chrome.runtime.getManifest();

/*************************** Init ***************************************/
// Variables globales données ogame

var url = location.href;
// Adresse en cours sur la barre d'outils
var urlUnivers = url.match(new RegExp('(.*)/game'))[1];
var numUnivers = urlUnivers.match(new RegExp('\/s(.*)-[a-z]{2}.ogame'))[1];
var langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
var prefix_GMData = 'ogameLive.'+langUnivers + numUnivers + '.';
var versionUnivers = null;
log("Universe url: " + urlUnivers, LOG_LEVEL_TRACE);
log("Universe Number: " + numUnivers, LOG_LEVEL_TRACE);
log("Universe language: " + langUnivers, LOG_LEVEL_TRACE);

var DEFAULT_PARAMS = {
	lifeform: null,
	lastServerData: null,
	prod_display: 'hour',

}

var PARAMS = GM_getJsonValue('params', DEFAULT_PARAMS);
var curTime = (new Date()).getTime();
if (PARAMS.lifeform == null || PARAMS.lastServerData == null || parseInt(PARAMS.lastServerData) < (curTime - 24 * 60 *60 * 1000)) {
	// get Universe params if not defined, or Once a day
	jQuery.get(urlUnivers + "/api/serverData.xml", function (data) {
		$data = jQuery(data);
		versionUnivers = $data.find('version')[0].textContent;
		PARAMS.lifeform = $data.find('lifeformSettings').length > 0;
		PARAMS.lastServerData = (new Date()).getTime();
		GM_setJsonValue('params', PARAMS);
	});
}

/*chrome.runtime.sendMessage({type: 'greetings', value: 'loclamor'}, (response) => {
	// 3. Got an asynchronous response with the data from the service worker
	console.log('received user data', response);
});*/


/******************************* Main ***********************************/
jQuery("head").ready(function() {
	// push css
	var link = document.createElement("link");
	link.href = chrome.runtime.getURL("src/ogameLive.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.head.appendChild(link);
	// push js
	var script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', chrome.runtime.getURL("src/window.js"));
	document.head.appendChild(script);
});
jQuery("#resourcesbarcomponent, #planetList").ready(function() {

	var hasOGLight = jQuery('.ogl-harvestOptions').length >= 1 ;

	var planetsWidth = jQuery('#planetList').width() + 10;
	var prodWidth = planetsWidth * 1.3;
	// dynamics css
	jQuery('head').append('<style>'
		+ '.smallplanet>.prod {width: '+(prodWidth)+'px; display: none;}' //  display none for better rendering while css file is loading
		+ '.smallplanet>.prod>.planet_prod, .smallplanet>.prod>.moon_prod {width: '+(prodWidth)+'px;}'
		+ '.smallplanet>.prod>.moon_prod {left: '+(prodWidth)+'px;}'
		+ '#planetbarcomponent #rechts .displayMoonProd .smallplanet>.prod>.planet_prod {left: -'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher {width:'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher .planets_prod {width:'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher .moons_prod {left: '+(prodWidth)+'px; width:'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher.displayMoonProd .planets_prod {left: -'+(prodWidth)+'px;}'
		+ 'div#banner_skyscraper {left: '+(1020+prodWidth)+'px !important}'
		+ '#planetList .total_prod {margin-left: '+planetsWidth+'px; width: '+(prodWidth)+'px;}'
		+ (hasOGLight ? '#planetbarcomponent #rechts #myPlanets .smallplanet a.moonlink {left: 116px !important}' : '')
	+ '</style>');

	$switcher = jQuery('<div class="productionSwitcher">'
			+ '<div class="planets_prod">Planets productions <span class="showMoons">moons ▶</span></div>'
			+ '<div class="moons_prod"><span class="showPlanets">◀ planets</span> Moons productions</div>'
		+ '</div>');
	jQuery('#countColonies').append($switcher);

	$switcher.click(function() {
		jQuery('#planetbarcomponent #rechts #planetList').toggleClass('displayMoonProd');
		$switcher.toggleClass('displayMoonProd');
	});

	var ogameLive = new OgameLive();
	ogameLive.start();

	if (ogameLive.dataManager.getCurrentPlanetId().endsWith('moon')) {
		$switcher.click();
	}

	var icoUrl = chrome.runtime.getURL("src/ogameLive-128.png");
	jQuery('#menuTable').append('<li id="ogamelive-menu-button">' +
			'<span class="menu_icon">' +
				'<a href="https://github.com/loclamor/ogameLive/issues" target="_blank">' +
					'<img src="' + icoUrl + '" alt="OgameLive logo" width="24.3px" style="border-radius: 6px">' +
				'</a>' +
			'</span>' +
			'<a class="menubutton" href="https://board.fr.ogame.gameforge.com/index.php?thread/726885-ogamelive/" target="_blank">' +
				'<span class="textlabel">OgameLive ' + manifestData.version + '</span>' +
			'</a>' +
		'</li>');
});

//exit !!
/***************************** Fin Main *********************************/
