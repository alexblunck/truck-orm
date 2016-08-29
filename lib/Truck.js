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
    name: null,
    api: null,
    key: 'id',
    fields: [],
    dates: ['created_at', 'updated_at'],
    defaults: {},
    dynamic: {},
    methods: {},
    staticMethods: {},
    hasMany: {},
    hasOne: {}
}

export default function Truck (options) {

    // Build options
    options = Object.assign({}, defaultOptions, options)

    // Return model factory instance which can be used to
    // create model instances
    return new ModelFactory(options)

}
