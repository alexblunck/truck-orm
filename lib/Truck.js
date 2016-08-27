/**
 * Truck
 */

import ModelFactory from './ModelFactory'

/**
 * Default Options.
 *
 * @type {object}
 */
const defaultOptions = {
    key: 'id',
    dates: ['created_at', 'updated_at']
}

export default function Truck (options) {

    // Build options
    options = Object.assign({}, defaultOptions, options)

    // Return model factory instance which can be used to
    // create model instances
    return new ModelFactory(options)

}
