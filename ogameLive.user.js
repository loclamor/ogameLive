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
var VERSION = '2.8.0';
var TYPE = 'GM-';
var PLUGIN_REQUIRED = '2.7.3';
var nomScript = 'ogameLive';

//Variables globales pour les status - Type d'erreur
var XLOG_WARNING = 1,
    XLOG_ERROR = 2,
    XLOG_NORMAL = 3,
    XLOG_SUCCESS = 4,
    XLOG_COMMENT = 5,
    XLOG_SEND = 6;
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
log("Universe Number: " + numUnivers);
log("Universe language: " + langUnivers);


/******************************* Main ***********************************/

jQuery("#resourcesbarcomponent, #planetList").ready(function() {
	var planetsWidth = jQuery('#planetList').width() + 5;
	// push css
	jQuery('head').append('<style>'
		+ '#planetbarcomponent #rechts #myPlanets .smallplanet {min-height: 62px !important}'
		+ '.smallplanet>.prod {position: absolute; top: 5px; left: '+planetsWidth+'px; font-size: 9px; text-align: left; margin-top: 0px;}'
		+ '.smallplanet>.prod>.capa {font-size: 8px;}'
		+ '.smallplanet>a {}'
		+ '.smallplanet>span {text-align: center;}'
		+ '#advicebarcomponent div#banner_skyscraper {left: '+(1005+planetsWidth)+'px}'
		+ '#planetList .total_prod {margin-left: '+planetsWidth+'px; width: 150px; font-size: 11px; text-align: left; margin-top: 10px; position: absolute;}'
		+ '.tpd-tooltip {margin-left: '+(planetsWidth/1.1)+'px; }'
	+ '</style>');
	parseResources();
	displayPlanetsProduction();
	setInterval(displayPlanetsProduction, 1000);
	
});

//exit !!
/***************************** Fin Main *********************************/
