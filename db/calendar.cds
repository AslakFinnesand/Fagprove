using {team.calendar as schema} from '../db/schema';

namespace team.calendar;


entity Employees                  as
    select from schema.People as p
    left join schema.DecorativLookup as deco
        on p.decorativeType_ID = deco.ID
    {
        p.ID   as Person_ID,
        p.name as Person_Name,
        p.birthday,
        p.leader_ID,
        deco.icon,
        deco.color,
        deco.eventType
    }


entity Deputys                    as
    select from schema.Employees as e
    left join schema.Deputy as d
        on e.Person_ID = d.person_ID
    left join schema.Employees as e2
        on d.deputy_ID = e2.Person_ID
    left join schema.DecorativLookup as deco
        on d.decorativeType_ID = deco.ID
    {
        e.Person_ID    as Person_ID,
        e.Person_Name  as Person_Name,
        e2.Person_ID   as Deputy_ID,
        e2.Person_Name as Deputy_Name,
        d.start        as Deputy_Start,
        d.end          as Deputy_End,
        deco.icon,
        deco.color,
        deco.eventType
    }


entity Absences                   as
    select from schema.Employees as e
    left join schema.Absence as a
        on e.Person_ID = a.person_ID
    left join schema.AbsencesType as at
        on a.abcenceType_ID = at.ID
    left join schema.StatusLookup as st
        on a.status_ID = st.ID
    left join schema.DecorativLookup as deco
        on a.decorativeType_ID = deco.ID
    {
        a.ID    as Absence_ID,
        a.person_ID,
        a.start as Absence_Start,
        a.end   as Absence_End,
        at.text as Absence_Type,
        a.info,
        a.type,
        case
            when a.abcenceType_ID in ('a1b2t3d4-5678-90ab-cdef-1234567890sd','91fb9fb3-3a0d-4163-9f52-09337dcfb60d')
            then '****'
            else st.text
        end as Absence_Status, // remove the free text feald when it is a case that can contain sensetive personal information
        deco.icon,
        deco.color,
        deco.eventType
    }



entity Travels                    as
    select from schema.Employees as e
    left join schema.Travel as t
        on e.Person_ID = t.person_ID
    left join schema.StatusLookup as st
        on t.status_ID = st.ID
    left join schema.DecorativLookup as deco
        on t.decorativeType_ID = deco.ID
    {
        t.ID    as Travel_ID,
        t.person_ID,
        t.title,
        t.info,
        t.type,
        t.start as Travel_Start,
        t.end   as Travel_End,
        st.text as Travel_Status,
        deco.icon,
        deco.color,
        deco.eventType
    }



@cds.api.ignore
entity _AllAppointmentsView       as
        select from schema.Travels as T {
            T.Travel_ID     as ID,
            T.person_ID     as person_ID, // Nøkkelen til den assosierte personen
            T.Travel_Start  as start,
            T.Travel_End    as end,
            T.title         as title,
            T.info          as info,
            T.type          as type,
            T.Travel_Status as status,
            T.color         as color,
            T.icon          as pic,
            T.eventType     as eventType
        }
    union all
        select from schema.Employees as B {
            B.Person_ID                                    as ID,
            B.Person_ID                                    as person_ID,
            CAST('2025-01-15T07:30:00.000Z' AS DateTime)   AS start,
            CAST('2025-01-15T07:30:00.000Z' AS DateTime)   AS end,
            cast ('Bursdag' as String )                    as title, // BirthDay har ikke title
            concat('Gratulerer med dagen ', B.Person_Name) as info,
            cast(null as String)                           as type, // BirthDay har ikke type
            cast(null as String)                           as status, // BirthDay har ikke status
            B.color                                        as color,
            B.icon                                         as pic,
            B.eventType                                    as eventType
        }
    union all
        select from schema.Absences as A {
            A.Absence_ID     as ID,
            A.person_ID      as person_ID,
            A.Absence_Start  as start,
            A.Absence_End    as end,
            A.Absence_Type   as title,
            A.info           as info,
            A.type           as type,
            A.Absence_Status as status,
            A.color          as color,
            A.icon           as pic,
            A.eventType      as eventType
        }
    union all
        select from schema.Deputys as D {
            D.Person_ID     as ID,
            D.Person_ID      as person_ID,
            D.Deputy_Start  as start,
            D.Deputy_End    as end,
            concat( D.Deputy_Name, ' er stedfortreder for ', D.Person_Name)   as title,
            concat( D.Person_Name, ' har ', D.Deputy_Name, ' som en stedfortreder dene perioden' )           as info,
            cast(null as String)                           as type,
            concat('Satt av leder') as status,
            D.color          as color,
            D.icon           as pic,
            D.eventType      as eventType
        }    where
        D.Deputy_ID is not null;


entity PeopleWithAppointmentsView as
    select from schema.People as P {
        key P.ID,
            P.name,
            P.leader_ID, 
            appointments : Association to many _AllAppointmentsView
                               on appointments.person_ID = $self.ID
        };


@readonly
entity LegendItems {
    key text  : String;
        color : String;
}

@readonly
entity LegendAppointmentItems {
    key text  : String;
        color : String;
}
