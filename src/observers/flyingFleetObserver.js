class FlyingFleetObserver {
	constructor(dataManager) {
		this.dataManager = dataManager
		jQuery.get(urlUnivers + '/game/index.php?page=componentOnly&component=eventList&ajax=1', jQuery.proxy(function(dataHtml){
			var $html = jQuery(dataHtml);
			var flights = {};
			var eventNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr', $html[0]);
			for (var i = 0; i < eventNodes.snapshotLength; i++) {
				var event = eventNodes.snapshotItem(i);
				var eventId = parseInt(event.id.split('-')[1]);
				console.log(event.id, eventId, event.dataset)
				var missionType = parseInt(event.dataset.missionType);
				var destCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destCoords")]/a', $html[0]);
				var destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destFleet")]/figure', $html[0]);
				if (destCoordsTypeNode === null) {
					destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destFleet")]/span/figure', $html[0]);
				}
				if (destCoordsTypeNode === null && event.dataset.returnFlight != true) {
					// debugger;
				}
				if (event.dataset.returnFlight == "true") {
					var prevFlight = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId-1)+'")]', $html[0]);
					if (prevFlight.snapshotLength > 0) {
						continue; //ignore this returnFlight to not count twice
					}
					destCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"coordsOrigin")]/a', $html[0]);
					destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/figure', $html[0]);
					if (destCoordsTypeNode === null) {
						destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/span/figure', $html[0]);
					}
				}
				var tooltipSpanNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"icon_movement")]/span', $html[0]);
				var $tooltipHtml = jQuery(tooltipSpanNode.title);
				var tooltipContentNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@class,"fleetinfo")]/tbody/tr/td[contains(@class,"value")]', $tooltipHtml[0]);
				var nbTooltipContentNodes = tooltipContentNodes.snapshotLength;


				var typeDest = 'debrisField';
				if (destCoordsTypeNode != null) {
					switch (true) {
						case destCoordsTypeNode.classList.contains('planet') :
							typeDest = 'planet';
							break;
						case destCoordsTypeNode.classList.contains('moon') :
							typeDest = 'moon';
							break;
					}
				}
				else {
					// debugger;
				}
				try {
					flights[eventId] = {
						arrivalTime: parseInt(event.dataset.arrivalTime)*1000,
						destination: this.dataManager.getPlanetId(destCoords),
						destinationType: typeDest,
						resources: {}
					}
					if (PARAMS.lifeform) {
						if (missionType === OgameConstants.missionType.lifeformExpedition) {
							flights[eventId].resources = {M: 0, C: 0, D: 0, F: 0};
						} else {
							flights[eventId].resources = {
								M: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 4).textContent.split('.').join('')),
								C: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 3).textContent.split('.').join('')),
								D: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 2).textContent.split('.').join('')),
								F: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 1).textContent.split('.').join(''))
							};
						}
					} else {
						flights[eventId].resources = {
							M: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 3).textContent.split('.').join('')),
							C: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 2).textContent.split('.').join('')),
							D: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 1).textContent.split('.').join(''))
						};
					}
					if (flights[eventId].destination == null && missionType !== OgameConstants.missionType.expedition) {
						// debugger;
					}
				}
				catch(e) {
					console.error(e)
				}
			}
			this.dataManager.setFlights(flights);
			console.log('flights : ',flights);
		}, this))
	}
}

