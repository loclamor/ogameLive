class FlightsDisplay {
    constructor(dataManager) {
        this.dataManager = dataManager;

    }

    initialize() {
        this.$table = jQuery(
            '<table class="live-flights" id="OGameLiveEvents">' +
            '</table>'
        );
        jQuery('#flights').append(this.$table);
        console.log('FlightsDisplay initialized');
    }

    async display() {
        const nowTime = (new Date()).getTime();
        const flights = await this.dataManager.loadFlights();
        this.$table.html("");
        const f_array = Object.values(flights).sort( (a, b) => { return a.arrivalTime - b.arrivalTime; });
        f_array.forEach((f) => {
            /*{
                arrivalTime: parseInt(event.dataset.arrivalTime)*1000,
                destination: this.dataManager.getPlanetId(destCoords),
                destinationType: typeDest,
                coords: {
                    from: cleanCoords(fromCoords),
                    fromlink: fromlink
                    fromType: fromCoordsTypeNode,
                    dest: cleanCoords(destCoords),
                    destLink: destLink
                    destType: destCoordsTypeNode
                },
                missionType: missionType,
                missionClass: missionClass,
                tooltipContent: tooltipContent,
                detailFleet: detailFleet,
                returnFlight: event.dataset.returnFlight,
                resources: {}
            }*/
            this.$table.append('<tr class="eventFleet" id="OGameLiveEventRow-' + f.eventId + '" ' +
                'data-mission-type="' + f.missionType + '" ' +
                'data-return-flight="' + f.returnFlight + '">' +
                '<td class="countDown">' +
                '   <span id="counter-ogameliveeventlist-' + f.eventId + '" class="' + f.missionClass + '">' + formatTime(f.arrivalTime - nowTime) + '</span>' +
                '</td>' +
                '<td class="missionFleet"><img src="' + f.missionTypeIco + '"/></td>' +
                '<td class="coordsOrigin">' +
                (f.returnFlight === 'true' ?
                    '   <a href="' + f.coords.destlink + '" target="_top">[' + f.coords.dest + ']</a>' :
                    '   <a href="' + f.coords.fromlink + '" target="_top">[' + f.coords.from + ']</a>'
                ) +
                '</td>' +
                '<td class="detailsFleet"><span>' + f.detailsFleet + '</span></td>' +
                '<td class="icon_movement' + (f.returnFlight === 'true' ? '_reserve' : '') + '"><span class="tooltip tooltipRight tooltipClose" title="' + f.tooltipContent.replaceAll('"', '&quot;') + '">&nbsp;</span></td>' +
                '<td class="destCoords">' +
                (f.returnFlight === 'true' ?
                    '   <a href="' + f.coords.fromlink + '" target="_top">[' + f.coords.from + ']</a>' :
                    '   <a href="' + f.coords.destlink + '" target="_top">[' + f.coords.dest + ']</a>'
                ) +
                '</td>' +
            '</tr>')
        });
    }
}
