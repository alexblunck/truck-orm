/**
 * Truck
 * ModelCollection
 */

const { findIndex, find, get, isArray, isString, map } = require('lodash')
const Util = require('./Util')

module.exports = class ModelCollection {

    /**
     * Create new model collection instance.
     *
     * @param {Object}           object
     * @param {Array}            object.data       - Data to initialize the collection with
     * @param {Model}            object.modelClass - Model class collection is made of
     * @param {Model}            object.belongsTo  - Model instance this collection belongs to
     * @param {HasManyRelation}  object.relation
     */
    constructor({data, modelClass, belongsTo, relation}) {
        this.modelClass = modelClass
        this.belongsTo = belongsTo
        this.relation = relation
        this._setData(data)
    }

    /**
     * Get all collection items.
     *
     * @return {Array}
     */
    all() {
        return this.items
    }

    /**
     * Get item at specific index.
     *
     * @param  {Number} index
     *
     * @return {Model}
     */
    get(index) {
        return this.items[index]
    }

    /**
     * Lookup item by it's key.
     *
     * @param  {Any} keyValue
     *
     * @return {Model|null}
     */
    find(keyValue) {
        return this.findWhere(this.modelClass.options.key, keyValue)
    }

    /**
     * Look up item by predicate.
     *
     * @param  {String}     key
     * @param  {Any}        value
     * @param  {Boolean}    ignoreCase
     *
     * @return {Model|null}
     */
    findWhere(key, value, ignoreCase = false) {
        let predicate = {}
        predicate[key] = value

        if (ignoreCase) {
            predicate = item => {
                let cmp = get(item, key)
                cmp = isString(cmp) ? cmp.toLowerCase() : cmp
                value = isString(value) ? value.toLowerCase() : value
                return value === cmp
            }
        }

        return find(this.items, predicate)
    }

    /**
     * Like findWhere, but returns true if item
     * given a predicate exists.
     *
     * @return {Boolean}
     */
    existsWhere() {
        return this.findWhere(...arguments) !== undefined
    }

    /**
     * Look up item index by predicate.
     *
     * @param  {String} key
     * @param  {Any}    value
     *
     * @return {Model}
     */
    findIndex(key, value) {
        const predicate = {}
        predicate[key] = value

        return findIndex(this.items, predicate)
    }

    /**
     * Create a new model instance of the relation type &
     * add relation / collection meta data.
     *
     * @param  {Object} [data] - Data to initialize model with
     *
     * @return {Model}
     */
    new(data) {
        const model = new this.modelClass(data, {
            relation: this.relation,
            collection: this
        })

        return model
    }

    /**
     * Append model to collection manually.
     *
     * @param  {Model} model
     *
     * @return {Model}
     */
    append(model) {
        model._truck.relation = this.relation
        model._truck.collection = this
        this.items.push(model)
        return model
    }

    /**
     * Replace an existing model instance in the
     * collection with another one.
     *
     * @param  {Model}  model
     * @param  {String} [key]   - Key used to determine what to replace
     * @param  {String} [value] - Value that key is matched with
     */
    replace(model, key, value) {
        key = key || this.modelClass._option('key')
        value = value || model[key]

        const predicate = {}
        predicate[key] = value

        const index = findIndex(this.items, predicate)

        this.items[index] = model
    }

    /**
     * Return true if collection is empty.
     *
     * @return {Boolean}
     */
    isEmpty() {
        return this.count() === 0
    }

    /**
     * Return number of items in collection.
     *
     * @return {Number}
     */
    count() {
        return this.items.length
    }

    /**
     * Add a new model instance to collection.
     *
     * @param  {Model}   model                    - Has to be same class as other items
     * @param  {Boolean} options.includeRelations - Include relations with request body
     * @param  {Object}  options.append           - Additional data to append to request body
     *
     * @return {Promise}
     */
    $add(model, { includeRelations = false, append = {} } = {}) {
        if (!(model instanceof this.modelClass)) {
            Util.log('ModelCollection', '$add', 'You can only add models of same type to collection.')
            return
        }

        model._truck.relation = this.relation
        model._truck.collection = this
        model._truck.offline = this.belongsTo ? this.belongsTo._truck.offline : false

        return model.$save({ includeRelations, append })
            .then(() => {
                this.items.push(model)
                return model
            })
    }

    /**
     * Delete model instance from "items" array.
     *
     * @param {Model} model
     */
    delete(model) {
        // Look up item by its primary key
        const item = this.find(model._key())
        const index = this.items.indexOf(item)

        if (index === -1) {
            Util.log('ModelCollection', 'delete', 'Model couldn\'t be found in collection.')
            return
        }

        this.items.splice(index, 1)
    }

    /**
     * Proxy to items.map method.
     *
     * @return {Array}
     */
    map() {
        return this.items.map(...arguments)
    }

    /**
     * Pluck values from a specific property
     * from each item in collection & return
     * them in an array.
     *
     * @param  {String} key
     *
     * @return {Array}
     */
    pluck(key) {
        return map(this.items, key)
    }

    /**
     * Run filter over items.
     *
     * @param  {Function} fn
     *
     * @return {Array}
     */
    filter(fn) {
        return this.items.filter(fn)
    }

    /**
     * Populate "items" property with model instances.
     *
     * @param {Array} data
     */
    _setData(data = []) {
        if (!isArray(data)) {
            throw new Error('Truck.ModelCollection@_setData: Data needs to be an array!')
        }

        this.items = []

        data.forEach(modelData => {
            const model = new this.modelClass(modelData, {
                relation: this.relation,
                collection: this,
                offline: this.belongsTo ? this.belongsTo._truck.offline : false
            })

            this.items.push(model)
        })
    }

}
