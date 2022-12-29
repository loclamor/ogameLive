class TechDetailParser {
    constructor(dataManager, node) {
        this.dataManager = dataManager;
        this.total = 0;
        this.neededResources = {M: 0, C: 0, D: 0, E: 0};

        var resourcesNodes = Xpath.getOrderedSnapshotNodes(document, '//div[contains(@id,"technologydetails")]/div[contains(@class,"content")]/div[contains(@class,"information")]/div[contains(@class,"costs")]/ul/li', node);

        var level = Xpath.getNumberValue(document, '//div[contains(@id,"technologydetails")]/div[contains(@class,"content")]/div[contains(@class,"information")]/span[contains(@class,"level")]/@data-value', node);
        var techid = Xpath.getNumberValue(document, '//div[contains(@id,"technologydetails")]/@data-technology-id', node);

        this.techDetail = this.dataManager.getTechDetail(techid);
        if (!this.techDetail[level]) {
            this.techDetail[level] = {
                "cost" : {"M" :  0, "C" :  0, "D" :  0, "lastParsedTime": 0},
                "boost" : {}
            };
        }


        for (var i = 0; i < resourcesNodes.snapshotLength; i++) {
            var resourceNode = resourcesNodes.snapshotItem(i);
            var value = parseInt(resourceNode.dataset.value);
            switch(true) {
                case resourceNode.classList.contains('metal'):
                    this.techDetail[level].cost.M = value;
                    this.neededResources.M = value;
                    this.total += value;
                    break;
                case resourceNode.classList.contains('crystal'):
                    this.techDetail[level].cost.C = value;
                    this.neededResources.C = value;
                    this.total += value;
                    break;
                case resourceNode.classList.contains('deuterium'):
                    this.techDetail[level].cost.D = value;
                    this.neededResources.D = value;
                    this.total += value;
                    break;
                case resourceNode.classList.contains('energy'):
                    this.neededResources.E = value;
                    break;
            }

        }
        this.techDetail[level].cost.lastParsedTime = (new Date()).getTime();
        this.dataManager.setTechDetail(techid, this.techDetail);
    }
}
