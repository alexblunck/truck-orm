/**
 * Truck
 * Model
 */

const { cloneDeep, each, isEqual, isFunction, isUndefined, keys } = require('lodash')
const moment = require('moment')
const shortid = require('shortid')
const urljoin = require('url-join')
const Util = require('./Util')
const NetworkRequest = require('./NetworkRequest')
const ModelCollection = require('./ModelCollection')
const HasManyRelation = require('./HasManyRelation')
const HasOneRelation = require('./HasOneRelation')

module.exports = class Model {

    /**
     * Create Model instance
     *
     * @param {object} options
     * @param {object} [meta] - Data to add to "_truck" property
     * @param {object} data
     */
    constructor(options, meta = {}, data) {
        this._truck = Object.assign({
            localId: shortid.generate(),
            offline: false
        }, meta)

        this._setData(data)
    }

    /**
     * Retrieve model with a specific id.
     *
     * @param  {integer} [id]
     *
     * @return {Promise} Resolves to Model instance
     */
    static $find(id) {
        const url = urljoin(this._option('api'), this._option('name'), id)

        return NetworkRequest.$get(url)
            .then(data => {
                if (!data) {
                    Util.log('Model', '$find', `"${url}" returned no data.`)
                    return null
                }

                return new this(data)
            })
    }

    /**
     * Retrieve all models.
     *
     * @return {Promise} Resolves to ModelCollection instance
     */
    static $all() {
        const url = urljoin(this._option('api'), this._option('name'), 'all')

        return NetworkRequest.$get(url)
            .then(data => {
                return new ModelCollection({
                    data: data,
                    modelClass: this
                })
            })
    }

    /**
     * Save the model instance. If it has a key make
     * a put request, otherwise a post request.
     *
     * @param {boolean} includeRelations - Include relations with request data
     *
     * @return {Promise} Resolves to model instance
     */
    $save({ includeRelations = false } = {}) {
        const url = this._apiUrl()
        const method = this[this._option('key')] ? '$put' : '$post'
        const data = this.toObject({ includeRelations })

        return NetworkRequest[method](url, data, this.isOffline())
            .then(data => {
                this._setData(data)

                // If model belongs to collection, replace it on update
                if (method === '$put' && this._truck.collection) {
                    this._truck.collection.replace(this)
                }

                return this
            })
    }

    /**
     * Update a single field on the model instance.
     *
     * @param  {string}  key    - Key of property / field to update
     * @param  {any}    [value] - Updated value
     *
     * @return {Promise} Resolves to Model instance
     */
    $sync(key, value) {
        const url = urljoin(this._apiUrl(), 'sync')

        const data = {
            key,
            value: !isUndefined(value) ? value : this[key]
        }

        return NetworkRequest.$put(url, data, this.isOffline())
            .then(data => {
                if (!isUndefined(value)) {
                    this[key] = data[key]
                }

                return this
            })
    }

    /**
     * Delete the model instance.
     *
     * @param  {Boolean} options.optimistic - Delete from possible relation
     *                                        before making network request
     *
     * @return {Promise} Resolves to model instance
     */
    $delete({ optimistic = false } = {}) {
        const url = this._apiUrl()

        if (optimistic) {
            this._deleteFromRelation()
        }

        return NetworkRequest.$delete(url, this.isOffline())
            .then(data => {
                // Delete from possible relation
                if (!optimistic) {
                    this._deleteFromRelation()
                }

                this._callEventHandler('didDelete')

                return this
            })
    }

    /**
     * Get a clone of the model instance.
     *
     * @param {boolean} preserveRelations - Keep references to relation / collection
     * @param {boolean} preserveKey - Keep primary key value
     * @param {boolean} offline - Create an offline clone that doesn't make actual network requests
     *
     * @return {Model}
     */
    clone({ preserveRelations = true, preserveKey = true, offline = false } = {}) {
        const data = cloneDeep(this.toObject())
        let meta = {}

        if (preserveRelations) {
            meta = {
                relation: this._truck.relation,
                collection: this._truck.collection
            }
        }

        if (!preserveKey) {
            data[this._option('key')] = null
        }

        // Preserve "offline" meta data
        meta.offline = this.isOffline() ? true : offline

        return new this.constructor(data, meta)
    }

    /**
     * Get a clone of the model instances, that doesn't make any
     * actual network requests.
     *
     * @param  {boolean} preserveRelations - Keep references to relation / collection
     * @param  {boolean} preserveKey - Keep primary key value
     *
     * @return {Model}
     */
    cloneOffline({ preserveRelations = true, preserveKey = true } = {}) {
        return this.clone({
            preserveRelations,
            preserveKey,
            offline: true
        })
    }

    /**
     * Check for data equality between two model
     * instances.
     *
     * @param  {Model} model
     *
     * @return {boolean} True if data is equal
     */
    equals(model) {
        return isEqual(this.toObject(), model.toObject())
    }

    /**
     * Check for localId equality.
     *
     * @param  {Model}  model
     *
     * @return {boolean}
     */
    is(model) {
        return this._truck.localId === model._truck.localId
    }

    /**
     * Get model instance this model is related to.
     *
     * @return {Model}
     */
    parent() {
        if (this._truck.relation) {
            return this._truck.relation.belongsTo
        }
    }

    /**
     * Return true if model instance is offline.
     *
     * @return {boolean}
     */
    isOffline() {
        return this._truck.offline
    }

    /**
     * Get unique local id of this instance.
     *
     * @return {string}
     */
    localId() {
        return this._truck.localId
    }

    /**
     * Return model instance in pure object form.
     *
     * @return {object}
     */
    toObject({ includeRelations = true } = {}) {
        let obj = {}

        // Key
        obj[this._option('key')] = this[this._option('key')]

        // Fields
        each(this._option('fields'), field => {
            // Turn "undefined" value into a "null" value
            if (isUndefined(this[field])) {
                obj[field] = null
            } else {
                obj[field] = this[field]
            }
        })

        // Dates
        each(this._option('dates'), field => {
            obj[field] = this[field]
        })


        if (includeRelations) {
            // hasMany
            each(keys(this._option('hasMany')), field => {
                obj[field] = this[field].collection.all().map(item => {
                    return item.toObject()
                })
            })

            // hasOne
            each(keys(this._option('hasOne')), field => {
                const model = this[field].model
                obj[field] = model ? model.toObject() : null
            })
        }

        return obj
    }

    /**
     * Set data properties on instance root.
     *
     * @param {object} data
     */
    _setData(data = {}) {
        // Key
        this[this._option('key')] = data[this._option('key')] || null

        // Fields
        this._option('fields').forEach(field => {
            const fieldData = data[field]

            if (!this._key()) {
                this[field] = fieldData || this._defaultFieldValue(field)
            } else {
                if (fieldData || fieldData === false) {
                    this[field] = fieldData
                } else {
                    this[field] = null
                }
            }
        })

        // Dates
        this._option('dates').forEach(field => {
            const date = data[field] ? moment(data[field]).toDate() : null
            this[field] = date
        })

        // hasMany
        each(this._option('hasMany'), (value, key) => {
            this[key] = new HasManyRelation({
                data: data[key],
                modelClass: value.model,
                belongsTo: this,
                options: {
                    dropParentApiPath: value.dropParentApiPath
                }
            })
        })

        // hasOne
        each(this._option('hasOne'), (value, key) => {
            this[key] = new HasOneRelation({
                data: data[key],
                modelClass: value.model,
                belongsTo: this,
                options: {
                    dropParentApiPath: value.dropParentApiPath
                }
            })
        })
    }

    /**
     * Get the default value for a specific field. If
     * the value is a function it is called.
     *
     * @param  {string} field
     *
     * @return {any}
     */
    _defaultFieldValue(field) {
        const value = this._option('defaults')[field]

        if (isFunction(value)) {
            return value.call(this)
        } else if (value) {
            return cloneDeep(value)
        } else if (value === false) {
            return value
        }

        return null
    }

    /**
     * Get api path for model instance, takes into account
     * relations.
     *
     * @return {string}
     */
    _apiPath() {
        const o = this._option.bind(this)
        let path = ''

        // Relation
        if (this._truck.relation) {
            // Check for dropParentApiPath relation option
            if (!this._truck.relation.options.dropParentApiPath) {
                path = this._truck.relation.belongsTo._apiPath()
            }
        }

        const key = o('dropKey') ? null : this._key()

        path = urljoin(path, o('name'), key)

        return path
    }

    /**
     * Get complete api url for model instance including
     * host.
     *
     * @return {string}
     */
    _apiUrl() {
        return urljoin(this._option('api'), this._apiPath())
    }

    /**
     * Get model instance primary key value.
     *
     * @return {string}
     */
    _key() {
        return this[this._option('key')]
    }

    /**
     * Call a specific event handler if defined.
     *
     * @param  {string} event - Handler to call
     */
    _callEventHandler(event) {
        const handlers = this._option('events')

        if (isFunction(handlers[event])) {
            handlers[event].call(this)
        }
    }

    /**
     * If model is part of a relationship or collection, delete
     * it from it.
     */
    _deleteFromRelation() {
        const relation = this._truck.relation
        const collection = this._truck.collection

        if (!relation && !collection) {
            return
        }

        // hasMany / collection
        if (relation instanceof HasManyRelation || collection) {
            collection.delete(this)
        }
        // hasOne
        else if (relation instanceof HasOneRelation) {
            relation.model = null
        }
    }

    /**
     * Proxy to static "_option" method.
     */
    _option() {
        return this.constructor._option(...arguments)
    }

}
