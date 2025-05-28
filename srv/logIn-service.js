const cds = require('@sap/cds');

module.exports = cds.service.impl(async function () {

    this.on('GetAuthenticated', async (req) => {
        // Extract parameters from req
        const leaderName = req.data.username;

        if (!leaderName) {
            return {
                ID: '0',
                name: '',
                IsLeader: false
            }; // Return empty array if parameters are missing
        }

        const people = await SELECT.from('team.calendar.Users')
            .where({ ID: leaderName, role: 'team leader' })
            .columns(p => {
                p.ID;
            });

        if (people.length == 0) {
            return {
                ID: '0',
                name: '',
                IsLeader: false
            }
        }
        // Transform the data to match desired format
        const result = people.map(person => ({
            ID: person.ID,
            IsLeader: true
        }));

        return result;
    });
});


