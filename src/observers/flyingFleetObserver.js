class FlyingFleetObserver {
	constructor(dataManager, callBack) {
		this.dataManager = dataManager;
		jQuery.get(urlUnivers + '/game/index.php?page=componentOnly&component=eventList&ajax=1', jQuery.proxy(function(dataHtml){
			var $html = jQuery(dataHtml);
			const timeRegex = /var timeDelta = (?<timestamp>[0-9]{13}) - \(new Date\(\)\)\.getTime\(\);/m;
			let timeRegexResult = dataHtml.match(timeRegex);
			const timeStamp = parseInt(timeRegexResult.groups.timestamp);
			const timeDelta = timeStamp - (new Date()).getTime();
			console.log('flying timeDelta = ', timeDelta);
			var flights = {};
			var isNext = [];
			var eventNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr', $html[0]);
			for (var i = 0; i < eventNodes.snapshotLength; i++) {
				try {
					var hasPrevious = false;
					var event = eventNodes.snapshotItem(i);
					var eventId = parseInt(event.id.split('-')[1]);
					console.log(event.id, eventId, event.dataset)
					var missionType = parseInt(event.dataset.missionType);
					var missionTypeIco = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"missionFleet")]/img/@src', $html[0]);

					var missionClass = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"countDown")]/span/@class', $html[0]);


					var arrivalTime = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"arrivalTime")]', $html[0]);

					var destCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destCoords")]/a', $html[0]);
					var destCoordsLink = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destCoords")]/a/@href', $html[0]);
					var destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destFleet")]/figure', $html[0]);
					if (destCoordsTypeNode === null) {
						destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destFleet")]/span/figure', $html[0]);
					}

					var fromCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"coordsOrigin")]/a', $html[0]);
					var fromCoordsLink = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"coordsOrigin")]/a/@href', $html[0]);
					var fromCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/figure', $html[0]);
					if (fromCoordsTypeNode === null) {
						fromCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/span/figure', $html[0]);
					}

					if (event.dataset.returnFlight == "true") {
						// Previous flight is the current flight id minus 1
						var prevFlight = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId-1)+'")]', $html[0]);
						if (prevFlight.snapshotLength > 0) {
							hasPrevious = true;
							if (flights[eventId-1]) {
								flights[eventId-1].hasNext = true;
							} else {
								isNext.push(eventId-1);
							}
							// continue; //ignore this returnFlight to not count twice
						}
						fromCoords = destCoords;
						fromCoordsLink = destCoordsLink;
						fromCoordsTypeNode = destCoordsTypeNode;

						destCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"coordsOrigin")]/a', $html[0]);
						destCoordsLink = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"coordsOrigin")]/a/@href', $html[0]);
						destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/figure', $html[0]);
						if (destCoordsTypeNode === null) {
							destCoordsTypeNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"originFleet")]/span/figure', $html[0]);
						}
					}
					var detailsFleet = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"detailsFleet")]/span', $html[0]);
					var tooltipSpanNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"icon_movement")]/span', $html[0]);
					var $tooltipHtml = jQuery(tooltipSpanNode.title);
					var tooltipContentValueNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@class,"fleetinfo")]/tbody/tr/td[contains(@class,"value")]', $tooltipHtml[0]);
					var tooltipContentNameNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@class,"fleetinfo")]/tbody/tr/td[contains(@colspan,"2")]', $tooltipHtml[0]);
					var nbTooltipContentNodes = tooltipContentValueNodes.snapshotLength;


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

					var typeFrom = 'debrisField';
					if (destCoordsTypeNode != null) {
						switch (true) {
							case fromCoordsTypeNode.classList.contains('planet') :
								typeFrom = 'planet';
								break;
							case fromCoordsTypeNode.classList.contains('moon') :
								typeFrom = 'moon';
								break;
						}
					}

					flights[eventId] = {
						eventId: eventId,
						arrivalTime: parseInt(event.dataset.arrivalTime)*1000 - timeDelta,
						arrivalTimeStr: arrivalTime,
						destination: this.dataManager.getPlanetId(destCoords),
						destinationType: typeDest,
						coords: {
							from: cleanCoords(fromCoords),
							fromlink: fromCoordsLink,
							fromType: typeFrom,
							dest: cleanCoords(destCoords),
							destlink: destCoordsLink,
							destType: typeDest
						},
						missionType: missionType,
						missionClass: missionClass,
						missionTypeIco: missionTypeIco,
						tooltipContent: tooltipSpanNode.title,
						detailsFleet: detailsFleet,
						returnFlight: event.dataset.returnFlight,
						hasPrevious: hasPrevious,
						hasNext: isNext.includes(eventId),
						resources: {},
						vaissels: {}
					}
					let resRows = 0;
					if (PARAMS.lifeform) {
						if (missionType === OgameConstants.missionType.lifeformExpedition) {
							flights[eventId].resources = {M: 0, C: 0, D: 0, F: 0};
						} else {
							flights[eventId].resources = {
								M: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 4).textContent.split('.').join('')),
								C: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 3).textContent.split('.').join('')),
								D: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 2).textContent.split('.').join('')),
								F: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 1).textContent.split('.').join(''))
							};
							resRows = 4;
						}
					} else {
						flights[eventId].resources = {
							M: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 3).textContent.split('.').join('')),
							C: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 2).textContent.split('.').join('')),
							D: parseInt(tooltipContentValueNodes.snapshotItem(nbTooltipContentNodes - 1).textContent.split('.').join(''))
						};
						resRows = 3;
					}
					if (flights[eventId].destination == null && missionType !== OgameConstants.missionType.expedition) {
						// debugger;
					}

					// Finally parse vaissels
					let row = 0
					while (row < nbTooltipContentNodes - resRows) {
						let shipName = tooltipContentNameNodes.snapshotItem(row).textContent.replace(':', '').trim();
						let nbShip = parseInt(tooltipContentValueNodes.snapshotItem(row).textContent.split('.').join(''));

						let shipId = LOCALIZATIONS.techs[shipName];
						let shipType = getKeyByValue(OgameConstants.fleet, parseInt(shipId));

						console.log(shipName, nbShip);
						flights[eventId].vaissels[shipType] = nbShip;
						row++;
					}

				}
				catch(e) {
					console.error(e)
				}
			}
			this.dataManager.setFlights(flights);
			console.log('flights : ',flights);

			if (callBack != null) {
				console.log('calling callback');
				callBack();
			}
		}, this))
	}

}

