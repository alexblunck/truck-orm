/**
 * Truck
 * Util
 */

export default class Util {

    /**
     * Log.
     *
     * @param  {string} module
     * @param  {string} method
     * @param  {string} msg
     */
    static log(module, method, msg) {
        msg = `Truck.${module}@${method}: ${msg}`
        console.warn(msg)
    }

}
