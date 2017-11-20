/**
 * TruckConfig
 */

class TruckConfig {

    constructor() {
        this.options = {}
    }

    /**
     * Set option.
     *
     * @param {String} key
     * @param {Any}    value
     */
    set(key, value) {
        this.options[key] = value
    }

    /**
     * Get option for key.
     *
     * @param  {String} key
     *
     * @return {Any}
     */
    get(key) {
        return this.options[key]
    }
}

module.exports = new TruckConfig()
