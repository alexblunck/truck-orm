/**
 * Truck
 * Util
 */

export default class Util {

    /**
     * Log.
     *
     * @param  {object} module
     * @param  {string} method
     * @param  {string} msg
     */
    static log(module, method, msg) {
        msg = `Truck.${module.constructor.name}@${method}: ${msg}`
        console.warn(msg)
    }

}
