class TechDetailObserver {
	constructor(dataManager) {
		this.dataManager = dataManager;
		var techDetailWrapper = document.querySelector('#technologydetails_wrapper #technologydetails_content');
		var techDetailWrapperObserver = new MutationObserver($.proxy(function(mutations) {
			//console.log('changed ! Hope that all technologydetails have same html struct', mutations);
			if (mutations[0].addedNodes.length > 1) {
				console.log('ok ! parse & display what we have to display.');
				var resourcesNodes = Xpath.getOrderedSnapshotNodes(document, '//div[contains(@id,"technologydetails")]/div[contains(@class,"content")]/div[contains(@class,"information")]/div[contains(@class,"costs")]/ul/li');
				var neededResources = {M: 0, C: 0, D: 0, E: 0};
				var total = 0;
				for (var i = 0; i < resourcesNodes.snapshotLength; i++) {
					var resourceNode = resourcesNodes.snapshotItem(i);
					var value = parseInt(resourceNode.dataset.value);
					switch(true) {
						case resourceNode.classList.contains('metal'):
								neededResources.M = value;
								total += value;
							break;
						case resourceNode.classList.contains('crystal'):
								neededResources.C = value;
								total += value;
							break;
						case resourceNode.classList.contains('deuterium'):
								neededResources.D = value;
								total += value;
							break;
						case resourceNode.classList.contains('energy'):
								neededResources.E = value;
							break;
					}
					
				}
				var planetProd = this.dataManager.getCurrentPlanetProd();
				jQuery('#technologydetails .content .information .costs ul').append('<li class="resource total icon">'+formatInt(total)+'</li>');
				jQuery('#technologydetails .content .information .costs ul li.resource').append('<span class="ol-value"></span>');
				this.dataManager.setCurrentTechDetail({
					$elts: jQuery('#technologydetails .content .information .costs ul'),
					neededResources: neededResources
				});
			}
		}, this));
		var config = { attributes: true, childList: true, characterData: true };
		techDetailWrapperObserver.observe(techDetailWrapper, config);
	}
}