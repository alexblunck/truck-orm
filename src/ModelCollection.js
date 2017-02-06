/**
 * Truck
 * ModelCollection
 */

const { findIndex, find, map } = require('lodash')
const Util = require('./Util')

module.exports = class ModelCollection {

    /**
     * Create new model collection instance.
     *
     * @param {object} object
     * @param {array}  object.data - Data to initialize the collection with
     * @param {Model}  object.modelClass - Model class collection is made of
     * @param {Model}  object.belongsTo - Model instance this collection belongs to
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
     * @return {array}
     */
    all() {
        return this.items
    }

    /**
     * Get item at specific index.
     *
     * @param  {integer} index
     *
     * @return {Model}
     */
    get(index) {
        return this.items[index]
    }

    /**
     * Lookup item by it's key.
     *
     * @param  {any} keyValue
     *
     * @return {Model}
     */
    find(keyValue) {
        return this.findWhere(this.modelClass.options.key, keyValue)
    }

    /**
     * Look up item by predicate.
     *
     * @param  {string} key
     * @param  {any} value
     *
     * @return {Model}
     */
    findWhere(key, value) {
        const predicate = {}
        predicate[key] = value

        return find(this.items, predicate)
    }

    /**
     * Look up item index by predicate.
     *
     * @param  {string} key
     * @param  {any} value
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
     * @param {object} [data] - Data to initialize model with
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
     * @param {Model} model
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
     * @param  {string} key - Key used to determine what to replace
     */
    replace(model, key) {
        key = key || this.modelClass._option('key')

        const predicate = {}
        predicate[key] = model[key]

        const index = findIndex(this.items, predicate)

        this.items[index] = model
    }

    /**
     * Return true if collection is empty.
     *
     * @return {boolean}
     */
    isEmpty() {
        return this.items.length === 0
    }

    /**
     * Add new model instance to collection.
     *
     * @param  {Model} model - Has to be same class as other items
     * @param  {boolean} includeRelations - Include relations with request data
     *
     * @return {Promise}
     */
    $add(model, { includeRelations = false } = {}) {
        if (!(model instanceof this.modelClass)) {
            Util.log('ModelCollection', '$add', 'You can only add models of same type to collection.')
            return
        }

        model._truck.relation = this.relation
        model._truck.collection = this
        model._truck.offline = this.belongsTo ? this.belongsTo._truck.offline : false

        return model.$save({ includeRelations })
            .then(() => {
                this.items.push(model)
                return this
            })
    }

    /**
     * Delete model instance from "items" array.
     *
     * @param  {Model} model
     */
    delete(model) {
        const index = this.items.indexOf(model)
        this.items.splice(index, 1)
    }

    /**
     * Proxy to items.map method.
     *
     * @return {array}
     */
    map() {
        return this.items.map(...arguments)
    }

    /**
     * Pluck values from a specific property
     * from each item in collection & return
     * them in an array.
     *
     * @param  {string} key
     *
     * @return {array}
     */
    pluck(key) {
        return map(this.items, key)
    }

    /**
     * Run filter over items.
     *
     * @param  {Function} fn
     *
     * @return {array}
     */
    filter(fn) {
        return this.items.filter(fn)
    }

    /**
     * Populate "items" property with model instances.
     *
     * @param {array} data
     */
    _setData(data = []) {
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
