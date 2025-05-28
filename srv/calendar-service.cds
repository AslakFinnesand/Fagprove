using {team.calendar as my} from '../db/calendar'; 

service CalendarService @(

path: 'calendar') {


    @readonly
    entity PeopleWithAppointments as projection on my.PeopleWithAppointmentsView;

    @readonly
    entity LegendItems            as projection on my.LegendItems; 

    @readonly
    entity LegendAppointmentItems as projection on my.LegendAppointmentItems; 


    function GetEmploeyAppointments(leader_ID : String, year : Integer) returns PeopleWithAppointments;


}
