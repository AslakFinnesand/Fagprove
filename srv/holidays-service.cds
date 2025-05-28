using {team.calendar as my} from '../db/schema';


service HolidaysService @(
    requires: 'admin',
    path    : 'holidays'
) {
    @readonly
    entity GetHolidays as
        select from my.Holidays {
            *,
        };


}
