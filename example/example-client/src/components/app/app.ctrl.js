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
    fields: ['name', 'email'],
    hasMany: {
        sections: {
            model: ResumeSection
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
        const section = new ResumeSection({ name: 'Languages' })
        // const section = new ResumeSection()
        // section.$save()
        console.log(section)

        // ------------------------------------------------------------
        // Retrieve single model
        // ------------------------------------------------------------
        // Resume.$find(1)
        //     .then(resume => {
        //         console.log(resume)
        //     })
    })();

}
