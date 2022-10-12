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

/*************************** Init ***************************************/
// Variables globales données ogame

var url = location.href;
// Adresse en cours sur la barre d'outils
var urlUnivers = url.match(new RegExp('(.*)/game'))[1];
var numUnivers = urlUnivers.match(new RegExp('\/s(.*)-[a-z]{2}.ogame'))[1];
var langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
var prefix_GMData = 'ogameLive.'+langUnivers + numUnivers + '.';
log("Universe url: " + urlUnivers, LOG_LEVEL_TRACE);
log("Universe Number: " + numUnivers, LOG_LEVEL_TRACE);
log("Universe language: " + langUnivers, LOG_LEVEL_TRACE);


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
		+ '#planetbarcomponent #rechts #myPlanets .smallplanet {min-height: 62px !important;}'
		//+ '#planetbarcomponent #rechts #planetList .smallplanet {min-width: '+(planetsWidth + prodWidth)+'px;}'
		+ '.smallplanet>.prod {width: '+(prodWidth)+'px; display: none;}'
		+ '.smallplanet>.prod>.planet_prod, .smallplanet>.prod>.moon_prod {width: '+(prodWidth)+'px;}'
		+ '.smallplanet>.prod>.moon_prod {left: '+(prodWidth)+'px;}'
		+ '#planetbarcomponent #rechts .displayMoonProd .smallplanet>.prod>.planet_prod {left: -'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher {position: absolute; left: '+(planetsWidth)+'px; top: 0px; width:'+(prodWidth)+'px; height: 28px; overflow: hidden;}'
		+ '#countColonies .productionSwitcher .planets_prod {position: absolute; left: 0px; top: 0px; width:'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher .planets_prod .showMoons {float: right}'
		+ '#countColonies .productionSwitcher .planets_prod:hover {left: -7px}'
		+ '#countColonies .productionSwitcher .moons_prod {position: absolute; left: '+(prodWidth)+'px; top: 0px; width:'+(prodWidth)+'px; text-align: right;}'
		+ '#countColonies .productionSwitcher .moons_prod .showPlanets {float: left}'
		//+ '#countColonies .productionSwitcher .moons_prod:hover {left:'+(prodWidth-7)+'px}'
		+ '#countColonies .productionSwitcher .planets_prod, #countColonies .productionSwitcher .moons_prod {transition: left 0.5s ease 0s; cursor: pointer;}'
		+ '#countColonies .productionSwitcher.displayMoonProd .planets_prod {left: -'+(prodWidth)+'px;}'
		+ '#countColonies .productionSwitcher.displayMoonProd .moons_prod {left: 0px;}'
		//+ '#countColonies .productionSwitcher.displayMoonProd .planets_prod:hover {left: -'+(prodWidth+7)+'px;}'
		+ '#countColonies .productionSwitcher.displayMoonProd .moons_prod:hover {left: +7px;}'
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
	
});

//exit !!
/***************************** Fin Main *********************************/
