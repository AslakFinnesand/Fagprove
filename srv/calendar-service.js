const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { PeopleWithAppointments, LegendItems, LegendAppointmentItems, Deputies } = this.entities;

    this.on('GetEmploeyAppointments', async (req) => {
        const leaderId = req.data.leader_ID;
        const year = parseInt(req.data.year, 10);
        const authHeader = req.headers.authorization;
        const userName = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[0];


        if (!leaderId || isNaN(year)) {
            req.error(400, 'Invalid leader_ID or year provided.');
            return;
        }

        if (userName !== leaderId) {
            return {
                ID: '',
                name: '',
                IsLeader: false
            }; // Return empty array if parameters are missing
        }

        let peopleUnderLeader = await SELECT.from(PeopleWithAppointments)
            .where({ leader_ID: leaderId })
            .columns(p => {
                p('*'),
                    p.appointments(app => {
                        app.ID,
                            app.start,
                            app.end,
                            app.title,
                            app.info,
                            app.type,
                            app.status,
                            app.color,
                            app.pic,
                            app.eventType;
                    });
            });


        const legendItemsData = await SELECT.from(LegendItems);
        const legendAppointmentItemsData = await SELECT.from(LegendAppointmentItems);

        const result = {
            startDate: new Date().toISOString(),
            people: peopleUnderLeader,
            legendItems: legendItemsData,
            legendAppointmentItems: legendAppointmentItemsData
        };

        return result;
    });
});