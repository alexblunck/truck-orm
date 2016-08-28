/**
 * Truck
 * ModelFactory
 */

import { each } from 'lodash'
import Model from './Model'

export default function ModelFactory (options) {

    return class ModelSubclass extends Model {

        /**
         * Return new Model subclass instance
         *
         * @param  {object} data
         */
        constructor(data) {
            super(options, data)
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
            return this.options[key]
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

}
