class FlyingFleetParser {
	constructor() {
		//Attach a mutation observer onto the eventbox 
		// @Todo !
		
		// open eventBox...
		jQuery('#js_eventDetailsClosed').click();
		// ...and close it imediatly !
		jQuery('#js_eventDetailsClosed').click();
		// event box is now loading and will be detected by mutationObserver :)
	}
}