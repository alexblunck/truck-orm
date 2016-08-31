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
     * Get model or model property value.
     *
     * @param {string} [key] - Key iof property to get
     *
     * @return {Model|any}
     */
    get(key) {
        return key ? this.model[key] : this.model
    }

    /**
     * Attach an existing model manually.
     *
     * @param  {Model} model
     */
    attach(model) {
        this.model = model
        this.model._truck.relation = this
        this.model._truck.offline = this.belongsTo._truck.offline
    }

    /**
     * Detach model manually.
     */
    detach() {
        this.model = null
    }

    /**
     * Return true if relation has an actual model.
     *
     * @return {boolean}
     */
    exists() {
        return !!this.model
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
        if (data) {
            this.model = new this.modelClass(data, {
                relation: this,
                offline: this.belongsTo._truck.offline
            })
        } else {
            this.model = null
        }
    }

}
