namespace team.calendar;


entity Users {
  key ID   : String;
      role : String;
}

entity People {
  key ID                : UUID;
      name              : String;
      leader_ID         : String;
      birthday          : Date;
      decorativeType_ID : UUID;
}

entity Travel {
  key ID                : UUID;
      start             : DateTime;
      end               : DateTime;
      title             : String;
      info              : String;
      type              : String;
      status_ID         : UUID;
      person_ID         : UUID;
      decorativeType_ID : UUID;
}


entity Absence {
  key ID                : UUID;
      start             : DateTime;
      end               : DateTime;
      abcenceType_ID    : UUID;
      info              : String;
      type              : String;
      status_ID         : UUID;
      person_ID         : UUID;
      decorativeType_ID : UUID;
}


entity Deputy {
      person_ID         : UUID;
      deputy_ID         : UUID;
  key start             : DateTime;
  key end               : DateTime;
      decorativeType_ID : UUID;
}


entity DecorativLookup {
  key ID        : UUID;
      icon      : String;
      color     : String;
      eventType : String;
}


entity Holidays {
  key ID   : UUID;
      date : String;
      text : String;
      type : String;
}

entity AbsencesType {
  key ID   : UUID;
      text : String;
}

entity StatusLookup {
  key ID   : UUID;
      text : String;
}
