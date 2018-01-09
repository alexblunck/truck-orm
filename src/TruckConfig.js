/**
 * TruckConfig
 */

const { HttpConfig } = require('@blunck/http')

class TruckConfig {

    constructor() {
        this.options = {}
    }

    /**
     * Set JWT token getter function.
     *
     * @param {Function} fn - Expected jwt token as string
     */
    setJwtTokenGetter(fn) {
        HttpConfig.setJwtTokenGetter(fn)
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
