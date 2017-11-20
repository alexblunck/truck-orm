/**
 * Truck
 * Util
 */

module.exports = class Util {

    /**
     * Log.
     *
     * @param {String} module
     * @param {String} method
     * @param {String} msg
     */
    static log(module, method, msg) {
        msg = `Truck.${module}@${method}: ${msg}`
        console.warn(msg)
    }

}
