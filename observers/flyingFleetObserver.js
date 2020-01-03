class FlyingFleetObserver {
	constructor(dataManager) {
		this.dataManager = dataManager
		jQuery.get('index.php?page=componentOnly&component=eventList&ajax=1', jQuery.proxy(function(dataHtml){
			var $html = jQuery(dataHtml);
			var flights = {};
			var eventNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr', $html[0]);
			for (var i = 0; i < eventNodes.snapshotLength; i++) {
				var event = eventNodes.snapshotItem(i);
				var eventId = parseInt(event.id.split('-')[1]);
				console.log(event.id, eventId, event.dataset)
				if (event.dataset.returnFlight == "true") {
					var prevFlight = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId-1)+'")]', $html[0]);
					if (prevFlight.snapshotLength > 0) {
						continue; //ignore this returnFlight to not count twice
					}
				}
				var tooltipSpanNode = Xpath.getSingleNode(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"icon_movement")]/span', $html[0]);
				var $tooltipHtml = jQuery(tooltipSpanNode.title);
				var tooltipContentNodes = Xpath.getOrderedSnapshotNodes(document,'//table[contains(@class,"fleetinfo")]/tbody/tr/td[contains(@class,"value")]', $tooltipHtml[0]);
				var nbTooltipContentNodes = tooltipContentNodes.snapshotLength;
				var destCoords = Xpath.getStringValue(document,'//table[contains(@id,"eventContent")]/tbody/tr[contains(@id,"eventRow-'+(eventId)+'")]/td[contains(@class,"destCoords")]/a', $html[0]);
				flights[eventId] = {
					arrivalTime: parseInt(event.dataset.arrivalTime)*1000,
					destination: this.dataManager.getPlanetId(destCoords),
					resources: {
						M: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 3).textContent.split('.').join('')),
						C: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 2).textContent.split('.').join('')),
						D: parseInt(tooltipContentNodes.snapshotItem(nbTooltipContentNodes - 1).textContent.split('.').join(''))
					}
				}
			}
			this.dataManager.setFlights(flights);
			console.log(flights);
		}, this))
	}
}

