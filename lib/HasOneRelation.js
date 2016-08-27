/**
 * Truck
 * HasOneRelation
 */

export default class HasOneRelation {

    /**
     * Create new has one relation instance.
     *
     * @param {object} object
     * @param {array}  object.data       - Data to initialize model instance with
     * @param {Model}  object.modelClass - Model class of the relation
     * @param {Model}  object.belongsTo  - Model instance this relation belongs to
     */
    constructor({data, modelClass, belongsTo}) {
        this.modelClass = modelClass
        this.belongsTo = belongsTo
        this._setData(data)
    }

    /**
     * Proxies to Model methods
     */
    $save() {
        return this.model.$save(...arguments)
    }

    $delete() {
        return this.model.$delete(...arguments)
    }

    /**
     * Populate "model" property with model instance.
     *
     * @param {object} data
     */
    _setData(data) {
        this.model = data ? new this.modelClass(data) : null

        if (this.model) {
            this.model._truck.relation = this
        }
    }

}
