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
     * @param {string} key
     * @param {any} value
     */
    set(key, value) {
        this.options[key] = value
    }

    /**
     * Get option for key.
     *
     * @param  {string} key
     *
     * @return {any}
     */
    get(key) {
        return this.options[key]
    }
}

module.exports = new TruckConfig()
