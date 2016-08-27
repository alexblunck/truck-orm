/**
 * Truck
 * Model
 */

import { cloneDeep, each, isFunction } from 'lodash'
import shortid from 'shortid'
import urljoin from 'url-join'
import NetworkRequest from './NetworkRequest'
import ModelCollection from './ModelCollection'
import HasManyRelation from './HasManyRelation'
import HasOneRelation from './HasOneRelation'

export default class Model {

    /**
     * Create Model instance
     *
     * @param  {object} options
     * @param  {object} data
     */
    constructor(options, data) {
        this._truck = {
            localId: shortid.generate()
        }

        this._setData(data)
    }

    /**
     * Retrieve model with a specific id.
     *
     * @param  {inetegr} id
     *
     * @return {Promise} Resolves to Model instance
     */
    static $find(id) {
        const url = urljoin(this._option('api'), this._option('name'), id)

        return NetworkRequest.$get(url)
            .then(data => {
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
     * @return {Promise} Resolves to model instance
     */
    $save() {
        const url = this._apiUrl()
        const method = this[this._option('key')] ? '$put' : '$post'
        const data = {}

        this._option('fields').forEach(field => {
            data[field] = this[field]
        })

        return NetworkRequest[method](url, data)
            .then(data => {
                this._setData(data)
                return this
            })
    }

    /**
     * Update a single field on the model instance.
     *
     * @param  {string} key  - Key of property / field to update
     * @param  {any} [value] - Updated value
     *
     * @return {Promise} Resolves to Model instance
     */
    $sync(key, value) {
        const url = urljoin(this._apiUrl(), 'sync')

        const data = {
            key,
            value: value || this[key]
        }

        return NetworkRequest.$put(url, data)
            .then(data => {
                return this
            })
    }

    /**
     * Delete the model instance.
     *
     * @return {Promise} Resolves to model instance
     */
    $delete() {
        const url = this._apiUrl()

        return NetworkRequest.$delete(url)
            .then(data => {
                // Delete from possible relation
                this._deleteFromRelation()

                return this
            })
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
            if (!this._key()) {
                this[field] = data[field] || this._defaultFieldValue(field)
            } else {
                this[field] = data[field] || null
            }
        })

        // Dates
        this._option('dates').forEach(field => {
            const date = data[field] ? new Date(data[field]) : null
            this[field] = date
        })

        // hasMany
        each(this._option('hasMany'), (value, key) => {
            this[key] = new HasManyRelation({
                data: data[key],
                modelClass: value.model,
                belongsTo: this
            })
        })

        // hasOne
        each(this._option('hasOne'), (value, key) => {
            this[key] = new HasOneRelation({
                data: data[key],
                modelClass: value.model,
                belongsTo: this
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
            return value()
        } else if (value) {
            return cloneDeep(value)
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
            path = this._truck.relation.belongsTo._apiPath()
        }

        path = urljoin(path, o('name'), this._key())

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
