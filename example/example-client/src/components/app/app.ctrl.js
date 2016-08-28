/**
 * Controller
 * AppCtrl
 */

import { Truck } from '../../../../../lib'

const api = 'https://example-api.dev/api'

const ResumeSection = Truck({
    name: 'section',
    fields: ['name', 'type'],
    defaults: {
        type: 'list'
    },
    api: api
})

const Resume = Truck({
    name: 'resume',
    fields: ['name', 'email', 'options', 'is_sent'],
    hasMany: {
        sections: {
            model: ResumeSection
        }
    },
    dynamic: {
        firstName: function () {
            return this.name.split(' ')[0]
        }
    },
    methods: {
        foo: function () {
            console.log('foo')
        }
    },
    api: api
})

export default function AppCtrl () {

    const vm = this;

    //////////////////////////////

    (() => {
        // ------------------------------------------------------------
        // Create & save model
        // ------------------------------------------------------------
        const resume = new Resume({ name: 'Alexander Blunck', email: 'alex@blunck.xyz' })
        console.log(resume)

        // ------------------------------------------------------------
        // Retrieve single model
        // ------------------------------------------------------------
        // Resume.$find(1)
        //     .then(resume => {
        //         console.log(resume)
        //     })
    })();

}
