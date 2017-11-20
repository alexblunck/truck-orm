/**
 * Truck
 * NetworkRequest
 */

/**
 * Default $http config.
 *
 * @type {Object}
 */
const defaultConfig = {
    headers: {
        'Accept': 'application/json'
    }
}

module.exports = class NetworkRequest {

    /**
     * Get $http angular service from angular app
     * bootstrapped on <html> tag.
     *
     * @return {$http}
     */
    static get $http() {
        return window.angular.element(document).injector().get('$http')
    }

    /**
     * Get $q angular service from angular app
     * bootstrapped on <html> tag.
     *
     * @return {$http}
     */
    static get $q() {
        return window.angular.element(document).injector().get('$q')
    }

    /**
     * Make GET request.
     *
     * @param  {String} url
     *
     * @return {Promise}
     */
    static $get(url) {
        return this.$http.get(url, this.buildConfig())
            .then(res => {
                return res.data
            })
    }

    /**
     * Make POST request.
     *
     * @param  {String}  url
     * @param  {Object}  data
     * @param  {Boolean} [offline]
     *
     * @return {Promise}
     */
    static $post(url, data, offline = false) {
        if (offline) {
            return this.$q.resolve(data)
        }

        return this.$http.post(url, data, this.buildConfig())
            .then(res => {
                return res.data
            })
    }

    /**
     * Make PUT request.
     *
     * @param  {String}  url
     * @param  {Object}  data
     * @param  {Boolean} [offline]
     *
     * @return {Promise}
     */
    static $put(url, data, offline = false) {
        if (offline) {
            return this.$q.resolve(data)
        }

        return this.$http.put(url, data, this.buildConfig())
            .then(res => {
                return res.data
            })
    }

    /**
     * Make PUT request.
     *
     * @param  {String}  url
     * @param  {Boolean} [offline]
     *
     * @return {Promise}
     */
    static $delete(url, offline = false) {
        if (offline) {
            return this.$q.resolve()
        }

        return this.$http.delete(url, this.buildConfig())
            .then(res => {
                return res.data
            })
    }

    /**
     * Build $http config by combining passed in
     * object with default values.
     *
     * @param  {Object} [config]
     *
     * @return {Object}
     */
    static buildConfig(config = {}) {
        return Object.assign({}, defaultConfig, config)
    }

}
