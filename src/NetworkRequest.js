/**
 * Truck
 * NetworkRequest
 */

/**
 * Default $http config.
 *
 * @type {object}
 */
const defaultConfig = {
    headers: {
        'X-Requested-With': 'XMLHttpRequest'
    }
}

export default class NetworkRequest {

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
     * @param  {string} url
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
     * @param  {string} url
     * @param  {object} data
     * @param  {boolean} [offline]
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
     * @param  {string} url
     * @param  {object} data
     * @param  {boolean} [offline]
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
     * @param  {string} url
     * @param  {boolean} [offline]
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
     * @param  {object} [config]
     *
     * @return {object}
     */
    static buildConfig(config = {}) {
        return Object.assign({}, defaultConfig, config)
    }

}
