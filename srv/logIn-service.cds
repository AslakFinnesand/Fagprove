using {team.calendar as my} from '../db/schema';


service logInService @(
    path    : 'logIn'
) {
    @readonly
    entity LogIn as
        projection on my.Users {
            *,
        };

    function GetAuthenticated(username : String) returns array of LogIn;

}
