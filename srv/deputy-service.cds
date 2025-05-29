using {team.calendar as schema} from '../db/schema'; // Importer schema for Deputy


service DeputyService @(
    requires: 'admin',
    path    : 'deputy'
) {


    entity Deputies as
        select from schema.Deputy {
            *,
        };
}
