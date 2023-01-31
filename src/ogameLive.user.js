const nomScript = 'ogameLive';

const LOG_LEVEL_OFF = 10,
	LOG_LEVEL_ALL = 1,
	LOG_LEVEL_TRACE = 2,
	LOG_LEVEL_DEBUG = 3,
	LOG_LEVEL_INFO = 4,
	LOG_LEVEL_WARN = 5,
	LOG_LEVEL_ERROR = 6,
	LOG_LEVEL_FATAL = 7;
GM_setValue('debug.loglevel', GM_getIntValue('debug.loglevel', LOG_LEVEL_INFO));
// Navigateurs
const isFirefox = (window.navigator.userAgent.indexOf('Firefox') > -1);
const isChrome = (window.navigator.userAgent.indexOf('Chrome') > -1);
const isOpera = (window.navigator.userAgent.indexOf('Opera') > -1);
// noinspection ES6ConvertVarToLetConst
var BROWSER;
if (isFirefox) {
	BROWSER = 'FF';
} else if (isChrome) {
	BROWSER = 'GC';
} else if (isOpera) {
	BROWSER = 'OP';
}

const manifestData = chrome.runtime.getManifest();

/*************************** Init ***************************************/
const url = location.href;
// Adresse en cours sur la barre d'outils
const urlUnivers = url.match(new RegExp('(.*)/game'))[1];
const numUnivers = urlUnivers.match(new RegExp('\/s(.*)-[a-z]{2}.ogame'))[1];
const langUnivers = urlUnivers.match(new RegExp('-(.*).ogame'))[1];
// noinspection ES6ConvertVarToLetConst
var prefix_GMData = 'ogameLive.' + langUnivers + numUnivers + '.';
let versionUnivers = null;
log("Universe url: " + urlUnivers, LOG_LEVEL_TRACE);
log("Universe Number: " + numUnivers, LOG_LEVEL_TRACE);
log("Universe language: " + langUnivers, LOG_LEVEL_TRACE);

const DEFAULT_PARAMS = {
	lifeform: null,
	lastServerData: null,
	prod_display: 'hour',
	game_style: 'miner',
	prod_round: 0,
	show_fleet_speed: 1,
	main_refresh: 1,
	random_system: 0,
	show_needed_transporters: 1,
	show_production: 1,
	energie_display: 1,
	sum_display: 1,
	show_flights: 1,
};

// noinspection ES6ConvertVarToLetConst
var PARAMS = DEFAULT_PARAMS;
let res = GM_getJsonValue('params', DEFAULT_PARAMS);
// ensure PARAMS is Object
if (Object.prototype.toString.call(res) === "[object String]") {
	res = JSON.parse(res);
}
// Apply loaded params on defaults ones to use default values on new params
PARAMS = { ...DEFAULT_PARAMS, ...res };
const curTime = (new Date()).getTime();
// once a day, retrieve serverData
if (PARAMS.lifeform == null || PARAMS.lastServerData == null || parseInt(PARAMS.lastServerData) < (curTime - 24 * 60 * 60 * 1000))
{
	// get Universe params if not defined, or Once a day
	jQuery.get(urlUnivers + "/api/serverData.xml", function (data) {
		let $data = jQuery(data);
		versionUnivers = $data.find('version')[0].textContent;
		PARAMS.lifeform = $data.find('lifeformSettings').length > 0;
		PARAMS.lastServerData = (new Date()).getTime();
		GM_setJsonValue('params', PARAMS);
		storeValue('params', PARAMS);
	});
}


// noinspection ES6ConvertVarToLetConst
/******************************* Main ***********************************/
var hasOGInfinity = false;
// noinspection ES6ConvertVarToLetConst
var hasOGLight = false;
// noinspection ES6ConvertVarToLetConst
var hasUniverseView = false;
// noinspection ES6ConvertVarToLetConst
var hasInfocompte = false;

// jQuery("head").ready(function() {
window.addEventListener('DOMContentLoaded', (event) => {

	// let the magic happen
	const ogameLive = new OgameLive();
	ogameLive.start();
	console.info('OGameLive started');

	// dynamic css
	const planetsIcoUrl = chrome.runtime.getURL("src/planet-targets.png");
	jQuery('head').append('<style>'
		+ 'li>a.menubutton>span.empire_planet:before, li>a.menubutton>a.empire_moon:before {background-image: url(' + planetsIcoUrl + ');}'
	+ '</style>');
	console.info('OGameLive dynamic CSS inserted');

	// Add base HTML
	if (PARAMS.show_production == 1) {
		if (PARAMS.game_style === 'miner') {
			// On miner game-style add production switcher planets/moons
			let $switcher = jQuery('<div class="productionSwitcher">'
				+ '<div class="planets_prod">Planets productions <span class="showMoons">moons ▶</span></div>'
				+ '<div class="moons_prod"><span class="showPlanets">◀ planets</span> Moons productions</div>'
				+ '</div>');
			jQuery('#countColonies').append($switcher);

			$switcher.click(function () {
				jQuery('#planetbarcomponent #rechts #planetList').toggleClass('displayMoonProd');
				$switcher.toggleClass('displayMoonProd');
			});

			// Set switcher to current planet type
			if (ogameLive.dataManager.getCurrentPlanetId().endsWith('moon')) {
				$switcher.click();
			}
		} else {
			// For raiders, no switcher but just labels
			jQuery('#countColonies').append('<div class="productionSwitcher"><span class="planets_label">Planets</span><span class="moons_label">Moons</span></div>')
		}
		// Add classes to let css know activated params
		jQuery(".smallplanet").append('<div class="prod ' + PARAMS.game_style + '"></div>');
		jQuery('#planetbarcomponent').addClass((PARAMS.energie_display == 1 ? ' energie' : ' noenergie') + (PARAMS.sum_display == 1 ? ' sum' : ' nosum'))
	} else {
		// Add class to let css know there is no prod to display
		jQuery('#planetbarcomponent').addClass('noprod');
	}

	if (PARAMS.show_flights == 1) {
		jQuery("#left, #leftMenu").append('<div id="flights" class="' + PARAMS.game_style + '"></div>');
	}


	// push css (In production, insert CSS via manifest to have it loaded first)
	/*
	const link = document.createElement("link");
	link.href = chrome.runtime.getURL("src/ogameLive.css");
	link.type = "text/css";
	link.rel = "stylesheet";
	document.head.appendChild(link);
	*/

	// Push JS wich will have OGame context
	const script = document.createElement('script');
	script.setAttribute('type', 'text/javascript');
	script.setAttribute('src', chrome.runtime.getURL("src/window.js"));
	document.head.appendChild(script);
	console.info("OGameLive scripts included");

	// Add OGameLive menu entry
	const icoUrl = chrome.runtime.getURL("src/ogameLive-128.png");
	jQuery('#menuTable').append('<li id="ogamelive-menu-button">' +
			'<span class="menu_icon">' +
				'<a href="https://github.com/loclamor/ogameLive/issues" target="_blank">' +
					'<img src="' + icoUrl + '" alt="OgameLive logo" width="24.3px" style="border-radius: 6px">' +
				'</a>' +
			'</span>' +
			'<a class="menubutton" href="https://board.fr.ogame.gameforge.com/index.php?thread/726885-ogamelive/" target="_blank">' +
				'<span class="textlabel">' +
					'OgameLive ' + manifestData.version +
					'<span id="ogameliveparamsbutton">⚙</span>' +
				'</span>' +
			'</a>' +
		'</li>');

	// Customize empire button with planet/moon icon-links
	const $empireLink = jQuery('li>span.menu_icon>span.empire').parent().parent().find('a.menubutton');
	$empireLink.append(
		'<span class="empire_planet"></span>' +
		'<a class="empire_moon" href="' + $empireLink.attr('href') + '&planetType=1" target="_blank"></a>'
	)

	// manage OGameLive parameters Modal
	jQuery('#ogameliveparamsbutton').click((e) => {
		const p = new Parameters(ogameLive.dataManager);
		p.displayModale();
		e.preventDefault();
		e.stopPropagation();
		return false;
	});

	// with OGameLive Infinity-based planets and moon display, change default tooltip side
	jQuery('.smallplanet > a').toggleClass('tooltipRight tooltipLeft');

	// Finaly detect other plugins and add them into body class (this is not really helpfully if that plugins load after OGameLive)
	hasOGInfinity = jQuery('.ogl-harvestOptions').length >= 1;
	hasOGLight = jQuery('#menuTable .ogl_leftMenuIcon').length >= 1;
	hasUniverseView = jQuery('body.universeview').length >= 1;
	hasInfocompte = jQuery('#ic-menu-button').length >= 1;

	console.info("Activated plugins : " +
		(hasOGInfinity ? "OGameInfinity, ": "") +
		(hasOGLight ? "OGLight, ": "") +
		(hasUniverseView ? "Universeview, ": "") +
		(hasInfocompte ? "InfoCompte, ": "") +
		"");
	jQuery('body').addClass(
		(hasOGInfinity ? "ogameinfinity ": "") +
		(hasOGLight ? "oglight ": "") +
		(hasUniverseView ? "universeview ": "") +
		(hasInfocompte ? "infocompte ": "") +
		"ogamelive"
	);

	console.info('OGameLive fully loaded')
});

//exit !!
/***************************** Fin Main *********************************/
