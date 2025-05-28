using {team.calendar as my} from '../db/schema';


service HolidaysService @(
    path    : 'holidays'
) {
    @readonly
    entity GetHolidays as
        select from my.Holidays {
            *,
        };


}
