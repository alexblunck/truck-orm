/**
 * Truck
 * NetworkRequest
 */

import { defaults } from 'lodash'
import angular from 'angular'

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
        return angular.element(document).injector().get('$http')
    }

    /**
     * Make GET request.
     *
     * @param  {string} url
     * @param  {object} config
     *
     * @return {Promise}
     */
    static $get(url, config) {
        return this.$http.get(url, this.buildConfig(config))
            .then(res => {
                return res.data
            })
    }

    /**
     * Make POST request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {Promise}
     */
    static $post(url, data, config) {
        return this.$http.post(url, data, this.buildConfig(config))
            .then(res => {
                return res.data
            })
    }

    /**
     * Make PUT request.
     *
     * @param  {string} url
     * @param  {object} data
     * @param  {object} config
     *
     * @return {Promise}
     */
    static $put(url, data, config) {
        return this.$http.put(url, data, this.buildConfig(config))
            .then(res => {
                return res.data
            })
    }

    /**
     * Make PUT request.
     *
     * @param  {string} url
     * @param  {object} config
     *
     * @return {Promise}
     */
    static $delete(url, config) {
        return this.$http.delete(url, this.buildConfig(config))
            .then(res => {
                return res.data
            })
    }

    /**
     * Build $http config by combining passed in
     * object with default values.
     *
     * @param  {object} config
     *
     * @return {object}
     */
    static buildConfig(config) {
        return defaults(config, defaultConfig)
    }

}
