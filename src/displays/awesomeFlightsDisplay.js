class FlightsDisplay {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.knowEvents = [];
        this.knowFlights = {
            /* {eventId => flight} */
        };
    }

    initialize() {
        this.knowEvents = [];
        this.knowFlights = {};
        this.redraw = false;
        this.$table = jQuery(
            '<table class="live-flights" id="OGameLiveEvents">' +
            '   <thead class="fleetStatus">' +
            '       <tr class="fleft">' +
            '           <td><a class="icon icon_reload"></a></td>' +
            '           <td colspan="3" id="OGameLiveEvents_slots" class="advice">' +
            '           </td>' +
            '           <td colspan="3" id="OGameLiveEvents_expeSlots" class="advice">' +
            '           </td>' +
            '       </tr>' +
            '   </thead>' +
            '   <tbody></tbody>' +
            '</table>'
        );
        jQuery('#flights').html(this.$table);
        this.$slots = this.$table.find('#OGameLiveEvents_slots');
        this.$expeSlots = this.$table.find('#OGameLiveEvents_expeSlots');

        this.$table.find('.icon_reload').click((e) => {
            console.log('reload click !')
            new FlyingFleetObserver(this.dataManager, () => {
                // re-initialize stuff
                console.log('reinitilizing awesomeFlightDisplay');
                this.redraw = true;
            });
        });

        console.log('FlightsDisplay initialized');
    }

    async display() {

        const nowTime = (new Date()).getTime();
        // const flights = await this.dataManager.loadFlights();
        const values = await retrieveMultipleValues([
            'flights',
            'globaldata'
        ]);
        const flights = values.flights;
        const flightsEventsIds = Object.keys(flights);
        const globalData = values.globaldata;
        const f_array = Object.values(flights).sort( (a, b) => { return a.arrivalTime - b.arrivalTime; });
        let lastEventId = null;

        let usedSlots = 0;
        let usedExpeSlots = 0;

        if (this.redraw === true) {
            this.initialize();
        }

        f_array.forEach((f) => {
            /*{
                eventId: eventId
                arrivalTime: parseInt(event.dataset.arrivalTime)*1000,
                arrivalTimeStr: arrivalTime,
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

            if ( (f.missionType == 15 || f.missionType == 18) && f.returnFlight == 'false') {
                return; // do not show expes initial flights
            }


            if (f.missionType == '15') {
                usedExpeSlots++;
            }

            if (!this.knowEvents.includes(f.eventId - 1)) {
                usedSlots++; // @TODO : do not count strangers flights
            }

            if (!this.knowEvents.includes(f.eventId)) {
                // if (f.arrivalTimeStr.trim() === '')
                {
                    const arrivalDate = new Date(f.arrivalTime);
                    f.arrivalTimeStr = arrivalDate.getHours().toString().padStart(2, '0') + ':' +
                        arrivalDate.getMinutes().toString().padStart(2, '0') + ':'+
                        arrivalDate.getSeconds().toString().padStart(2, '0');
                }
                let html = '<tr class="eventFleet" id="OGameLiveEventRow-' + f.eventId + '" ' +
                    'data-mission-type="' + f.missionType + '" ' +
                    'data-return-flight="' + f.returnFlight + '" ' +
                    'data-has-previous="' + (f.hasPrevious ? 'true' : 'false') + '" ' +
                    'data-has-next="' + (f.hasNext ? 'true' : 'false') + '" ' +
                    '>' +
                    '<td class="arrivalTimeStr">' +
                        f.arrivalTimeStr +
                    '</td>' +
                    '<td class="countDown">' +
                    '   <span id="counter-ogameliveeventlist-' + f.eventId + '" class="' + f.missionClass + ' ogamelivecountdown" data-countend="' + f.arrivalTime + '" >' + formatTime(f.arrivalTime - nowTime) + '</span>' +
                    '</td>' +
                    '<td class="missionFleet"><img src="' + f.missionTypeIco + '"/></td>' +
                    '<td class="coordsOrigin">' +
                    (f.returnFlight === 'true' ?
                            '   <figure class="planetIcon ' + f.coords.destType + '"></figure><a href="' + f.coords.destlink + '" target="_top">[' + f.coords.dest + ']</a>' :
                            '   <figure class="planetIcon ' + f.coords.fromType + '"></figure><a href="' + f.coords.fromlink + '" target="_top">[' + f.coords.from + ']</a>'
                    ) +
                    '</td>' +
                    '<td class="detailsFleet"><span>' + f.detailsFleet + '</span></td>' +
                    '<td class="icon_movement' + (f.returnFlight === 'true' ? '_reserve' : '') + '"><span class="tooltip tooltipRight tooltipClose" title="' + f.tooltipContent.replaceAll('"', '&quot;') + '">&nbsp;</span></td>' +
                    '<td class="destCoords">' +
                    (f.returnFlight === 'true' ?
                            '   <figure class="planetIcon ' + f.coords.fromType + '"></figure><a href="' + f.coords.fromlink + '" target="_top">[' + f.coords.from + ']</a>' :
                            '   <figure class="planetIcon ' + f.coords.destType + '"></figure><a href="' + f.coords.destlink + '" target="_top">[' + f.coords.dest + ']</a>'
                    ) +
                    '</td>' +
                    '</tr>'
                if (lastEventId === null) {
                    this.$table.find('tbody').prepend(html);
                } else {
                    this.$table.find('tbody').find('#OGameLiveEventRow-' + lastEventId).after(html);
                }
                this.knowEvents.push(f.eventId);
                this.knowFlights[f.eventId] = f;
            } else {
                // nop
            }
            lastEventId = f.eventId;
        });
        // Finaly loop the knowEvents that are not in the flights list flightsEventsIds to find terminated ones
        // let terminatedFlights = 0;
        // let terminatedExpes = 0;
        // this.knowEvents.forEach((eventId) => {
        //     if (!flightsEventsIds.includes(eventId.toString())) {
        //         const f = this.knowFlights[eventId];
        //         if (f.hasNext === false) {
        //             terminatedFlights++;
        //             if (f.missionType === 15 && f.returnFlight === 'true') {
        //                 terminatedExpes++;
        //             }
        //         }
        //     }
        // });
        // const usedSlots = parseInt(globalData.usedSlots) - terminatedFlights;
        // const usedExpeSlots = parseInt(globalData.usedExpeSlots) - terminatedExpes;

        this.$slots.html('<span>' + globalData.textSlots + '</span>' + usedSlots + '/' + globalData.slots);
        if (parseInt(globalData.slots) === usedSlots) {
            this.$slots.addClass('overmark');
        } else {
            this.$slots.removeClass('overmark');
        }

        this.$expeSlots.html('<span>' + globalData.textExpeditions + '</span>' + usedExpeSlots + '/' + globalData.expeSlots);
        if (parseInt(globalData.expeSlots) === usedExpeSlots) {
            this.$expeSlots.addClass('overmark');
        } else {
            this.$expeSlots.removeClass('overmark');
        }
    }
}
