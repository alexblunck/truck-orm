/**
 * Truck
 * Model
 */

const { cloneDeep, each, isArray, isDate, isEqual, isFunction, isPlainObject, isString, isUndefined, keys } = require('lodash')
const shortid = require('shortid')
const urljoin = require('url-join')
const { Http } = require('@blunck/http')

const Util = require('./Util')
const ModelCollection = require('./ModelCollection')
const HasManyRelation = require('./HasManyRelation')
const HasOneRelation = require('./HasOneRelation')

module.exports = class Model {

    /**
     * Create Model instance
     *
     * @param {Object} options
     * @param {Object} [meta]  - Data to add to "_truck" property
     * @param {Object} data
     */
    constructor(options, meta = {}, data) {
        this._truck = Object.assign({
            localId: shortid.generate(),
            offline: false
        }, meta)

        this._setData(data)

        // Call "didBoot" event handler
        this._callEventHandler('didBoot')
    }

    /**
     * Retrieve model with a specific id.
     *
     * @param  {Number} [id]
     *
     * @return {Promise} Resolves to Model instance
     */
    static $find(id) {
        const url = urljoin(this._option('api'), this._option('name'), id)

        return Http.get(url)
            .then(res => {
                if (!res.data) {
                    Util.log('Model', '$find', `"${url}" returned no data.`)
                    return null
                }

                return new this(res.data)
            })
    }

    /**
     * Retrieve all models.
     *
     * @return {Promise} Resolves to ModelCollection instance
     */
    static $index() {
        const url = urljoin(this._option('api'), this._option('name'))

        return Http.get(url)
            .then(res => {
                return new ModelCollection({
                    data: res.data,
                    modelClass: this
                })
            })
    }

    /**
     * Create a new collection with optional
     * data.
     *
     * @param  {Array} [data] - Data to initialize collection with
     *
     * @return {ModelCollection}
     */
    static collect(data = []) {
        return new ModelCollection({
            data: data,
            modelClass: this
        })
    }

    /**
     * Save the model instance. If it has a key make
     * a put request, otherwise a post request.
     *
     * @param  {Boolean} options.includeRelations - Include relations with request body
     * @param  {Object}  options.append           - Additional data to append to request body
     *
     * @return {Promise} Resolves to model instance
     */
    $save({ includeRelations = false, append = {} } = {}) {
        const url = this._apiUrl()
        const method = this[this._option('key')] ? 'put' : 'post'
        const modelObject = this.toObject({ includeRelations })
        const data = Object.assign(modelObject, append)

        return Http[method](url, data, null, { offline: this.isOffline() })
            .then(res => {
                this._setData(res.data)

                // If model belongs to collection, replace it on update
                if (method === 'put' && this._truck.collection) {
                    this._truck.collection.replace(this)
                }

                return this
            })
    }

    /**
     * Update multiple fields on the model instance.
     *
     * @param  {Object|Array} fields
     *
     * @return {Promise} Resolves to model instance
     */
    $update(fields) {
        const url = this._apiUrl()
        let data = {}

        if (isPlainObject(fields)) {
            data = fields
        } else if (isArray(fields)) {
            each(fields, field => {
                data[field] = this[field]
            })
        }

        return Http.put(url, data, null, { offline: this.isOffline() })
            .then(res => {
                this._setData(res.data)

                return this
            })
    }

    /**
     * Make post request and set data from response body.
     *
     * @param  {String}  ext         - Path to append to url
     * @param  {Object}  [data]      - Request body data
     * @param  {Boolean} [immutable] - Don't mutate model with response data
     *
     * @return {Promise} Resolves to model instance
     */
    $post(ext, data, immutable = false) {
        const url = urljoin(this._apiUrl(), ext)

        return Http.post(url, data, null, { offline: this.isOffline() })
            .then(res => {
                if (immutable) {
                    return res.data
                }

                this._setData(res.data)

                return this
            })
    }

    /**
     * Make put request and set data from response body.
     *
     * @param  {String}  ext         - Path to append to url
     * @param  {Object}  [data]      - Request body data
     * @param  {Boolean} [immutable] - Don't mutate model with response data
     *
     * @return {Promise} Resolves to model instance
     */
    $put(ext, data, immutable = false) {
        const url = urljoin(this._apiUrl(), ext)

        return Http.put(url, data, null, { offline: this.isOffline() })
            .then(res => {
                if (immutable) {
                    return res.data
                }

                this._setData(res.data)

                return this
            })
    }

    /**
     * Update a single field on the model instance.
     *
     * @param  {String} key      - Key of property / field to update
     * @param  {Any}    [value]  - Updated value
     * @param  {Object} [append] - Additional data to append to request body
     *
     * @return {Promise} Resolves to model instance
     */
    $sync(key, value, append = {}) {
        const url = urljoin(this._apiUrl(), 'sync')

        const data = Object.assign({
            key,
            value: !isUndefined(value) ? value : this[key]
        }, append)

        return Http.put(url, data, null, { offline: this.isOffline() })
            .then(res => {
                if (!isUndefined(value)) {
                    this[key] = res.data[key]
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
            this._callEventHandler('didDelete')
        }

        return Http.delete(url, null, { offline: this.isOffline() })
            .then(() => {
                // Delete from possible relation
                if (!optimistic) {
                    this._deleteFromRelation()
                    this._callEventHandler('didDelete')
                }

                return this
            })
    }

    /**
     * Update instance properties.
     *
     * @param {Object} data
     */
    fill(data) {
        this._setData(data)
    }

    /**
     * Get a clone of the model instance.
     *
     * @param  {Boolean} preserveRelations - Keep references to relation / collection
     * @param  {Boolean} preserveKey       - Keep primary key value
     * @param  {Boolean} offline           - Create an offline clone that doesn't make actual network requests
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
     * @param  {Boolean} preserveRelations - Keep references to relation / collection
     * @param  {Boolean} preserveKey       - Keep primary key value
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
     * @return {Boolean} True if data is equal
     */
    equals(model) {
        return isEqual(this.toObject(), model.toObject())
    }

    /**
     * Check for localId equality.
     *
     * @param  {Model}  model
     *
     * @return {Boolean}
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
     * @return {Boolean}
     */
    isOffline() {
        return this._truck.offline
    }

    /**
     * Get unique local id of this instance.
     *
     * @return {String}
     */
    localId() {
        return this._truck.localId
    }

    /**
     * Return model instance in pure object form.
     *
     * @return {Object}
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
     * @param {Object|Model} data
     */
    _setData(data = {}) {
        // If data is a model instance, convert to object first
        if (data instanceof Model) {
            data = data.toObject()
        }

        // Key
        this[this._option('key')] = data[this._option('key')] || null

        // Fields
        this._option('fields').forEach(field => {
            const fieldData = data[field]

            if (!this._key()) {
                if (fieldData === undefined || fieldData === null) {
                    this[field] = this._defaultFieldValue(field)
                } else {
                    this[field] = fieldData
                }
            } else {
                if (fieldData || fieldData === false || fieldData === 0) {
                    this[field] = fieldData
                } else {
                    this[field] = null
                }
            }
        })

        // Dates
        this._option('dates').forEach(field => {
            let value = data[field]
            let date = null

            // Don't manipulate existing date
            if (isDate(value)) {
                date = value
            }

            // Convert string to date
            if (isString(value)) {
                value = value.replace(/-/g, '/')
                date = new Date(value)

                // Assume date to be in UTC timezone
                date = new Date(
                    Date.UTC(
                        date.getFullYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        date.getSeconds()
                    )
                )
            }

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
     * @param  {String} field
     *
     * @return {Any}
     */
    _defaultFieldValue(field) {
        const value = this._option('defaults')[field]

        if (isString(value)) {
            return value
        } else if (isFunction(value)) {
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
     * @return {String}
     */
    _apiPath() {
        const o = this._option.bind(this)
        let path = ''

        // Check for dropParentApiPath option on this model
        if (!o('dropParentApiPath')) {
            // Relation
            if (this._truck.relation) {
                // Check for dropParentApiPath relation option
                if (!this._truck.relation.options.dropParentApiPath) {
                    path = this._truck.relation.belongsTo._apiPath()
                }
            }
        }

        path = urljoin(path, o('name'))

        const key = o('dropKey') ? null : this._key()

        if (key) {
            path = urljoin(path, key)
        }

        return path
    }

    /**
     * Get complete api url for model instance including
     * host.
     *
     * @return {String}
     */
    _apiUrl() {
        return urljoin(this._option('api'), this._apiPath())
    }

    /**
     * Get model instance primary key value.
     *
     * @return {String}
     */
    _key() {
        return this[this._option('key')]
    }

    /**
     * Call a specific event handler if defined.
     *
     * @param  {String} event - Handler to call
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
