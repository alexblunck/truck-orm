/**
 * Truck
 * ModelFactory
 */

const { each } = require('lodash')
const TruckConfig = require('./TruckConfig')
const Model = require('./Model')

module.exports = function ModelFactory (options) {

    class ModelSubclass extends Model {

        /**
         * Return new Model subclass instance
         *
         * @param {object} data
         * @param {object} [meta] - Data to add to "_truck" property
         */
        constructor(data, meta) {
            super(options, meta, data)
            this._setDynamicProperties()
            this._setMethods()
        }

        /**
         * "option" getter
         *
         * @return {object}
         */
        static get options() {
            return options
        }

        /**
         * Get option for specific key.
         *
         * @param  {string} key
         *
         * @return {any}
         */
        static _option(key) {
            return this.options[key] || TruckConfig.get(key)
        }

        /**
         * Create dynamic properties in model instance using
         * options.dynamic object.
         */
        _setDynamicProperties() {
            each(options.dynamic, (value, key) => {
                Object.defineProperty(this, key, {
                    get: value
                })
            })
        }

        /**
         * Add methods to model instance using
         * options.methods object.
         */
        _setMethods() {
            each(options.methods, (value, key) => {
                this[key] = value
            })
        }

    }

    /**
     * Add static methods to model constructor using
     * options.staticMethods object.
     */
    each(options.staticMethods, (value, key) => {
        ModelSubclass[key] = value
    })

    return ModelSubclass

}
