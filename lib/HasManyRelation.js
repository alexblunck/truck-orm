/**
 * Truck
 * HasManyRelation
 */

import ModelCollection from './ModelCollection'

export default class HasManyRelation {

    /**
     * Create new has many relation instance.
     *
     * @param {object} object
     * @param {array}  object.data       - Data to initialize the collection with
     * @param {Model}  object.modelClass - Model class collection is made of
     * @param {Model}  object.belongsTo  - Model instance this relation belongs to
     * @param {object} object.options    - Extra options
     */
    constructor({data, modelClass, belongsTo, options = {}}) {
        this.modelClass = modelClass
        this.belongsTo = belongsTo
        this.options = options
        this._setData(data)
    }

    /**
     * Proxies to ModelCollection methods
     */
    all() {
        return this.collection.all(...arguments)
    }

    get() {
        return this.collection.get(...arguments)
    }

    find() {
        return this.collection.find(...arguments)
    }

    findWhere() {
        return this.collection.findWhere(...arguments)
    }

    findIndex() {
        return this.collection.findIndex(...arguments)
    }

    new() {
        return this.collection.new(...arguments)
    }

    append() {
        return this.collection.append(...arguments)
    }

    replace() {
        return this.collection.replace(...arguments)
    }

    isEmpty() {
        return this.collection.isEmpty(...arguments)
    }

    $add() {
        return this.collection.$add(...arguments)
    }

    map() {
        return this.collection.map(...arguments)
    }

    pluck() {
        return this.collection.pluck(...arguments)
    }

    filter() {
        return this.collection.filter(...arguments)
    }

    /**
     * Populate "items" property with model instances.
     *
     * @param {array} data
     */
    _setData(data) {
        this.collection = new ModelCollection({
            data: data,
            modelClass: this.modelClass,
            belongsTo: this.belongsTo,
            relation: this
        })
    }

}
