const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {
    const { PeopleWithAppointments, LegendItems, LegendAppointmentItems, Deputies } = this.entities;

    this.on('GetEmploeyAppointments', async (req) => {
        const leaderId = req.data.leader_ID;
        const year = parseInt(req.data.year, 10);
        const authHeader = req.headers.authorization;
        const userName = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':')[0];


        if (!leaderId || isNaN(year)) {
            return req.error(400, 'Invalid leader_ID or year provided.');
            
        }

        if (userName !== leaderId) {
            return req.error(400, 'Mismatching parameters sendt in.')
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
        const processedPeople = peopleUnderLeader.map(person => {
            const filteredAppointments = (person.appointments || [])
                .filter(app => {
                    if (!app.start) return false;
                    return new Date(app.start).getFullYear() === year;
                })
                .sort((a, b) => new Date(a.start) - new Date(b.start));

            return {
                ID: person.ID,
                name: person.name,
                role: person.role,
                appointments: filteredAppointments
            };
        });

        const legendItemsData = await SELECT.from(LegendItems);
        const legendAppointmentItemsData = await SELECT.from(LegendAppointmentItems);

        const result = {
            startDate: new Date().toISOString(),
            people: processedPeople,
            legendItems: legendItemsData,
            legendAppointmentItems: legendAppointmentItemsData
        };

        return result;
    });
});