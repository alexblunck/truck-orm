/**
 * Truck
 */

const ModelFactory = require('./ModelFactory')

/**
 * Default Options.
 *
 * @type {object}
 */
const defaultOptions = {
    name: null,
    api: null,
    key: 'id',
    dropKey: false,
    fields: [],
    dates: ['created_at', 'updated_at'],
    defaults: {},
    dynamic: {},
    methods: {},
    staticMethods: {},
    hasMany: {},
    hasOne: {},
    events: {}
}

module.exports = function Truck (options) {

    // Build options
    options = Object.assign({}, defaultOptions, options)

    // Return model factory instance which can be used to
    // create model instances
    return new ModelFactory(options)

}
