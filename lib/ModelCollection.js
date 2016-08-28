/**
 * Truck
 * ModelCollection
 */

import Util from './Util'

export default class ModelCollection {

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
     * Add new model instance to collection.
     *
     * @param {Model} model - Has to be same class as other items
     */
    $add(model) {
        if (!(model instanceof this.modelClass)) {
            Util.log('ModelCollection', '$add', 'You can only add models of same type to collection.')
            return
        }

        model._truck.relation = this.relation
        model._truck.collection = this

        return model.$save()
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
     * Populate "items" property with model instances.
     *
     * @param {array} data
     */
    _setData(data = []) {
        this.items = []

        data.forEach(modelData => {
            const model = new this.modelClass(modelData)
            model._truck.relation = this.relation
            model._truck.collection = this

            this.items.push(model)
        })
    }

}
