const cds = require('@sap/cds');
const { message } = require('@sap/cds/lib/log/cds-error');

module.exports = cds.service.impl(async function () {
    const {
        Deputies } = this.entities;


    this.before('CREATE', Deputies, async (req) => {


        const { person_ID, deputy_ID, start, end } = req.data;

        if (!person_ID || !deputy_ID || !start || !end) {
            req.error(400, "Missing required fields: person_ID, deputy_ID, start, or end.");
            return;
        }

        if (person_ID === deputy_ID) {
            req.error(400, "Person and Deputy cannot be the same.");
            return;
        }

        if (new Date(start) >= new Date(end)) {
            req.error(400, "Start date must be before end date.");
            return;
        }


        req.data.decorativeType_ID = '589e03cc-05e8-46eb-8e67-e0ea1379e351';

        const existingDeputyAssignments = await SELECT.from(Deputies)
            .where`person_ID = ${person_ID} and ((${start} between start and end) or (${end} between start and end) or (start between ${start} and ${end}))`;

        if (existingDeputyAssignments.length > 0) {
            const mesageText = `Person ${person_ID} already has a deputy assigned during this period.`;
            return req.error(412, mesageText);
        }

    });

    this.after('CREATE', Deputies, (createdDeputy, req) => {
        console.log(`Deputy assignment created: ${JSON.stringify(createdDeputy)} by user ${req.user.id}`);
    });
});