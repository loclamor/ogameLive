class TechDetailObserver {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var techDetailWrapper = document.querySelector('#technologydetails_wrapper #technologydetails_content');
		var techDetailWrapperObserver = new MutationObserver($.proxy(function(mutations) {
			//console.log('changed ! Hope that all technologydetails have same html struct', mutations);
			if (mutations[0].addedNodes.length > 1) {
				// console.log('ok ! parse & display what we have to display.');
				let parser = new TechDetailParser(this.dataManager);
				jQuery('#technologydetails .content .information .costs ul').append('<li class="resource total icon">'+formatInt(parser.total)+'</li>');
				jQuery('#technologydetails .content .information .costs ul li.resource').append('<span class="ol-value"></span>');
				this.dataManager.setCurrentTechDetail({
					$elts: jQuery('#technologydetails .content .information .costs ul'),
					neededResources: parser.neededResources
				});
			}
		}, this));
		var config = { attributes: true, childList: true, characterData: true };
		techDetailWrapperObserver.observe(techDetailWrapper, config);
	}
}
