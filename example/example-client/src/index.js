/**
 * Module
 * app
 */

import angular from 'angular'

import directives from './directives'
import services from './services'

import AppCtrl from './components/app/app.ctrl'

angular
    .module('app', [
        directives,
        services
    ])
    .controller('AppCtrl', AppCtrl)
