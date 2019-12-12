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
//GM_setValue('debug.loglevel', LOG_LEVEL_INFO);
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
log("Universe Number: " + numUnivers, LOG_LEVEL_TRACE);
log("Universe language: " + langUnivers, LOG_LEVEL_TRACE);


/******************************* Main ***********************************/

jQuery("#resourcesbarcomponent, #planetList").ready(function() {
	var planetsWidth = jQuery('#planetList').width() + 5;
	// push css
	jQuery('head').append('<style>'
		+ '#planetbarcomponent #rechts #myPlanets .smallplanet {min-height: 62px !important; min-width: '+(planetsWidth*2)+'px;}'
		+ '.smallplanet>.prod {float: right; width: '+planetsWidth+'px; font-size: 9px; text-align: left; margin-top: 0px;}'
		+ '.smallplanet>.prod>.capa {font-size: 8px;}'
		+ '.smallplanet>a {}'
		+ '.smallplanet>span {text-align: center;}'
		+ '#advicebarcomponent div#banner_skyscraper {left: '+(1005+planetsWidth)+'px}'
		+ '#planetList .total_prod {margin-left: '+planetsWidth+'px; width: 150px; font-size: 11px; text-align: left; margin-top: 10px; position: absolute;}'
		//+ '.tpd-tooltip {margin-left: '+(planetsWidth/1.1)+'px; }'
	+ '</style>');
	parseResources();
	displayPlanetsProduction();
	setInterval(displayPlanetsProduction, 1000);
	// next, parse page data
	parse_current_page();
	
});

//exit !!
/***************************** Fin Main *********************************/
