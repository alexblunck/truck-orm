/**
 * Truck
 * ModelFactory
 */

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

    }

}
