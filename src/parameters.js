
class Parameters {
    constructor(dataManager) {
        this.dataManager = dataManager;

        this.params = {
            game_style: {
                label: 'Game style',
                options: [
                    {value: 'raider', label: 'Raider'},
                    {value: 'miner', label: 'Miner'}
                ],
            },
            show_production: {
                label: 'Activate OGameLive production display',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            prod_display: {
                label: 'Production display',
                options: [
                    {value: 'hour', label: 'per hour'},
                    {value: 'day', label: 'per day'}
                ],
            },
            energie_display: {
                label: 'Display energie availables per planet',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            sum_display: {
                label: 'Sum resources per planet',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            prod_round: {
                label: 'Production round',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            show_needed_transporters: {
                label: 'Show needed transporters',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            show_fleet_speed: {
                label: 'Show fleet speed',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            main_refresh: {
                label: 'Refresh Interval',
                min: 0,
                max: 120,
            },
            random_system: {
                label: 'Random systems',
                min: 0,
                max: 99,
            },
            show_cost_overlay: {
                label: 'Show cost overlay',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            show_stationed_ships: {
                label: 'Show stationed ships',
                options: [
                    {value: 1, label: 'Yes'},
                    {value: 0, label: 'No'}
                ],
            },
            show_flights: {
                label: 'Show custom flight component',
                options: [
                    {value: 2, label: 'Right position'},
                    {value: 1, label: 'Left position'},
                    {value: 0, label: 'No'}
                ],
            }
        }

    }

    displayModale() {
        jQuery('body').append(
            '<div id="ogameliveparameters">' +
                '<div class="parameters-content">' +
                    '<span class="close" title="Exit and apply">&times;</span>' +
                    '<h1>OGameLive Parameters</h1>' +
                    '<h2>General options</h2>' +
                    this._getParamSelect('game_style') +
                    this._getParamInteger('main_refresh') +
                    '<h2>Technologies</h2>' +
                    this._getParamSelect('show_cost_overlay') +
                    '<h2>Live production</h2>' +
                    this._getParamSelect('show_production') +
                    this._getParamSelect('prod_display') +
                    this._getParamSelect('energie_display') +
                    this._getParamSelect('sum_display') +
                    this._getParamSelect('prod_round') +
                    this._getParamSelect('show_needed_transporters') +
                    this._getParamSelect('show_stationed_ships') +
                    '<h2>Fleet options</h2>' +
                    this._getParamSelect('show_fleet_speed') +
                    this._getParamInteger('random_system') +
                    this._getParamSelect('show_flights') +
                '</div>' +
            '</div>'
        );
        jQuery('#ogameliveparameters .close').click(() => {
            jQuery('#ogameliveparameters .parameters-content').html('<div class="ajax_loading" style="display: block"><div class="ajax_loading_overlay"><div class="ajax_loading_indicator"></div></div></div>');
            setTimeout(()=>location.reload(), 0);
        });
        jQuery('#ogameliveparameters .parameter .parameter-value').on('change', (e) => {
            console.log(e, arguments)
            const $target = jQuery(e.target);
            const param_key = $target.data('param');
            let value = $target.val();
            if ($target.attr('type') === 'number' || value == parseInt(value)) {
                value = parseInt(value);
            }
            console.log('Updating ' + param_key + ' to ', value);
            PARAMS[param_key] = value;
            GM_setJsonValue('params', PARAMS);
            storeValue('params', PARAMS);
        });
    }

    _getParamSelect(param_key) {
        let html = '<div class="parameter">' +
            '<label>' + this.params[param_key].label + '</label>' +
            '<select class="parameter-value" id="' + param_key + '" data-param="' + param_key + '">';
        this.params[param_key].options.forEach(option => {
            html += this._getOption(param_key, option.value, option.label);
        })
        html += '</select></div>';
        return html;
    }

    _getParamInteger(param_key) {
        return '<div class="parameter">' +
            '<label>' + this.params[param_key].label + '</label>' +
            '<input type="number" class="parameter-value" step="1" ' +
            'min="' + this.params[param_key].min + '" ' +
            'max="' + this.params[param_key].max + '" ' +
            'id="' + param_key + '" data-param="' + param_key + '" ' +
            'value="' + this.getParam(param_key) + '"/></div>';
    }

    _getOption(param_key, value, label) {
        const selected = this.getParam(param_key) == value ? 'selected' : '';
        return '<option value="' + value + '" ' + selected + '>'+ label + '</option>';
    }

    getParam( key ) {
        return PARAMS[key] ?? DEFAULT_PARAMS[key];
    }
}
