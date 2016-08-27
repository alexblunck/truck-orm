/**
 * Truck
 * NetworkRequest
 */

import { defaults } from 'lodash'
import angular from 'angular'

const $http = angular.injector(['ng']).get('$http')

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
     * Make GET request.
     *
     * @param  {string} url
     * @param  {object} config
     *
     * @return {Promise}
     */
    static $get(url, config) {
        return $http.get(url, this.buildConfig(config))
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
        return $http.post(url, data, this.buildConfig(config))
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
        return $http.put(url, data, this.buildConfig(config))
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
        return $http.delete(url, this.buildConfig(config))
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
