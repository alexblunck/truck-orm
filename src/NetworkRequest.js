/**
 * Truck
 * NetworkRequest
 */

const axios = require('axios')

/**
 * Request config.
 *
 * @type {Object}
 */
const config = {
    headers: {
        'Accept': 'application/json'
    }
}

module.exports = class NetworkRequest {

    /**
     * Make GET request.
     *
     * @param  {String} url
     *
     * @return {Promise}
     */
    static $get(url) {
        return axios.get(url, config)
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
            return Promise.resolve(data)
        }

        return axios.post(url, data, config)
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
            return Promise.resolve(data)
        }

        return axios.put(url, data, config)
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
            return Promise.resolve()
        }

        return axios.delete(url, config)
            .then(res => {
                return res.data
            })
    }

}
