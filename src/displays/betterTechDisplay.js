class BetterTechDisplay {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.dataManager.loadCurrentPlanetProd().then(planetProd => {
            this.planetProd = planetProd;

            jQuery('#technologies li.technology').each(jQuery.proxy(async function(i, elt) {
                const $elt = jQuery(elt);
                const techid = parseInt($elt.data('technology'));
                const level = parseInt($elt.find('.level').data('value'));
                const techDetail = this.dataManager.getTechDetail(techid);

                console.log(techid, techDetail, level);
                let lvlResources = {M:0, C:0, D:0};
                if (techDetail[level + 1] && techDetail[level + 1].cost && techDetail[level + 1].cost.lastParsedTime > ( (new Date()).getTime() - 24 * 60 * 60 * 1000)) {
                    this.display( techDetail, level, $elt);
                }
                else {
                    // Fetch the necessary ressources if unknow level or lastParsedTime oldest than 1 day
                    jQuery.get(urlUnivers + '/game/index.php?page=ajax&component=technologydetails&ajax=1&ajax=1&action=getDetails&technology=' + techid,
                        jQuery.proxy(function(html) {
                            const $html = jQuery(html);
                            let parser = new TechDetailParser(this.dataManager, $html[0]);
                            this.display( parser.techDetail, level, $elt);
                        }, this));
                }


            }, this));
        });
    }

    display(techDetail, level, $elt) {
        let lvlResources = techDetail[level + 1].cost;
        let metalClass = this.planetProd.M.dispo < lvlResources.M ? 'overmark' : '';
        let cristalClass = this.planetProd.C.dispo < lvlResources.C ? 'overmark' : '';
        let deutClass = this.planetProd.D.dispo < lvlResources.D ? 'overmark' : '';

        $elt.find('.icon').append(
            '<span class="oglive nextlevelresources">' +
            (lvlResources.M > 0 ? '<span class="' + metalClass + '">M:' + readablize(lvlResources.M) + '</span><br/>' : '') +
            (lvlResources.C > 0 ? '<span class="' + cristalClass + '">C:' + readablize(lvlResources.C) + '</span><br/>' : '') +
            (lvlResources.D > 0 ? '<span class="' + deutClass + '">D:' + readablize(lvlResources.D) + '</span><br/>' : '') +
            '</span>'
        );
    }
}
