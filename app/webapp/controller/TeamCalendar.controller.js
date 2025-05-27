sap.ui.define([
   "./BaseController",
   "sap/m/library",
   "sap/m/ObjectAttribute",
   "sap/ui/core/mvc/Controller",
   'sap/m/MessageToast',
   "sap/m/MessageBox",
   'sap/ui/core/format/DateFormat',
   'sap/ui/core/date/UI5Date',
   "sap/ui/model/json/JSONModel",
   "sap/ui/core/Fragment",
   "sap/ui/unified/DateTypeRange",
   "sap/ui/model/odata/v4/ODataModel",
], function (BaseController, mobileLibrary, ObjectAttribute, Controller, MessageToast, MessageBox, DateFormat, UI5Date, JSONModel, Fragment, DateTypeRange, ODataModel,) {
   "use strict";

   return BaseController.extend("fagprove.controller.TeamCalendar", {

      onInit: function () {
         let router = this.getRouter();
         router.getRoute("teamcalendar").attachMatched(this.onRouteMatched, this);
      },



      onRouteMatched: async function () {
         await this.fetchLeaderEmpAppointments();
         await this.fetchHolidaysList();
         await this.initializeHolidays();
      },

      fetchHolidaysList: async function () {

         let holidays = [
            {
               "ID": "df59d6a4-f29c-4190-a710-fece5c3f259d",
               "date": "2025-01-01T00:00:00.000Z",
               "text": "Nyttårsdag",
               "type": "Type04"
            },
            {
               "ID": "9f23bf21-928e-4dd8-acb8-b722b89f8e3e",
               "date": "2025-03-28T00:00:00.000Z",
               "text": "Skjærtorsdag",
               "type": "Type04"
            },
            {
               "ID": "d1c57021-f152-4503-b531-dfdb22aed145",
               "date": "2025-03-01T00:00:00.000Z",
               "text": "Langfredag",
               "type": "Type04"
            },
            {
               "ID": "0d58d5ad-91a4-4748-89eb-9eb7433ad8d8",
               "date": "2025-04-02T00:00:00.000Z",
               "text": "Første påskedag",
               "type": "Type04"
            },
            {
               "ID": "7453f9fe-280f-44a1-acba-1ce74e66e071",
               "date": "2025-04-01T00:00:00.000Z",
               "text": "Andre påskedag",
               "type": "Type04"
            },
            {
               "ID": "8340ab88-e642-4c86-b1a0-4cfe2deaf3d6",
               "date": "2025-05-17T00:00:00.000Z",
               "text": "Arbeidernes dag",
               "type": "Type04"
            },
            {
               "ID": "e2cbafe1-c7af-44af-aa2f-6555508884c0",
               "date": "2025-05-09T00:00:00.000Z",
               "text": "Grunnlovsdag",
               "type": "Type04"
            },
            {
               "ID": "bbab8296-b8bd-46a2-9bb0-9634ef5193ec",
               "date": "2025-05-09T00:00:00.000Z",
               "text": "Kristi himmelfartsdag",
               "type": "Type04"
            },
            {
               "ID": "b3c1603c-84b6-4d4d-ac14-07c748cd1d28",
               "date": "2025-05-19T00:00:00.000Z",
               "text": "Første pinsedag",
               "type": "Type04"
            },
            {
               "ID": "e2738f8f-4cdf-4a3d-b52a-61a6c1231eca",
               "date": "2025-05-20T00:00:00.000Z",
               "text": "Andre pinsedag",
               "type": "Type04"
            },
            {
               "ID": "64d766c2-f295-4d7b-90b7-6f5287cc2504",
               "date": "2025-12-25T00:00:00.000Z",
               "text": "Første juledag",
               "type": "Type04"
            },
            {
               "ID": "712e973a-3bc5-44f1-ae56-a82822136003",
               "date": "2025-12-26T00:00:00.000Z",
               "text": "Andre juledag",
               "type": "Type04"
            }
         ];
         if (holidays) {
            holidays.forEach(holiday => {
               holiday.date = new Date(holiday.date);
            });
         }
         // Set the model
         const holidayDataModel = new JSONModel(holidays);
         this.getView().setModel(holidayDataModel, "holidays");

         MessageToast.show("Feriedager lastet inn", {
            duration: 2000,
            offset: "0 -80",
         });
      },


      initializeHolidays: async function () {
         let planningCalendar = this.byId("idPlanningCalendar");
         if (!planningCalendar) {
            console.error("Planning calendar not found!");
            return;
         }

         const norwegianHolidays = await this.getView().getModel("holidays").getData() || [];
         // Create special date ranges for holidays
         norwegianHolidays.forEach(holiday => {
            if (!holiday.date) {
               console.warn("Invalid holiday date found:", holiday);
               return;
            }

            const dateTypeRange = new DateTypeRange({
               startDate: holiday.date,
               endDate: holiday.date,
               type: holiday.type,//"NonWorking", // will show as non-working day
               tooltip: holiday.text
            });
            planningCalendar.addSpecialDate(dateTypeRange);
         });
      },


      // Appointments API call
      fetchLeaderEmpAppointments: async function () {

         const data = {
            "startDate": "2025-04-15T07:46:46.000Z",
            "people": [
               {
                  "ID": "9g8f7e6d-3456-7890-cdef-012345678901",
                  "name": "Magnus Andersen",
                  "role": "team member",
                  "appointments": [
                     {
                        "ID": "91fb8fb3-3a0d-4163-9f52-09337dcfb60d",
                        "start": "2025-03-15T07:30:00.000Z",
                        "end": "2025-03-18T08:30:00.000Z",
                        "title": "Kortvarig sykefravær",
                        "info": "Trenger noen dager for å bli frisk",
                        "type": "Type02",
                        "status": "Avslått",
                        "pic": "sap-icon://travel-itinerary",
                        "color": "#adebb3",
                        "eventType": "absence"
                     },
                     {
                        "ID": "91fb8fb3-3a0d-4163-9f52-09337dcfb60d",
                        "start": "2025-05-06T07:30:00.000Z",
                        "end": "2025-08-15T08:30:00.000Z",
                        "title": "Utforskningsreise til ny destinasjon",
                        "info": "Gjennomfører en langvarig utforskning og observasjon",
                        "type": "Type02",
                        "status": "Avventer godkjenning",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "91fb8fb3-3a0d-4163-9f52-09337dcfb60d",
                        "start": "2025-08-03T18:48:59.000Z",
                        "end": "2025-08-03T18:48:59.000Z",
                        "title": "Gratulerer Magnus Andersen",
                        "info": "Bursdag!!",
                        "type": "Type02",
                        "color": "#6395ee",
                        "pic": "sap-icon://Netweaver-business-client",
                        "eventType": "birthday"
                     },
                     {
                        "ID": "b4b00541-874b-4e0f-a75e-cb656b0a484e",
                        "start": "2025-08-15T09:00:00.000Z",
                        "end": "2025-12-20T11:00:00.000Z",
                        "title": "Opphold på forskningsstasjon",
                        "info": "Utvidet opphold for å løse uforutsette utfordringer",
                        "type": "Type01",
                        "status": "Ingen status tilgjengelig",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     }
                  ]
               },
               {
                  "ID": "ef5e67d6-3e08-42ab-a5ed-274d6b9afc81",
                  "name": "Ingrid Pettersen",
                  "role": "team member",
                  "appointments": [
                     {
                        "ID": "a9413716-1385-4732-9c5f-366a93db0f40",
                        "start": "2025-04-11T07:30:00.000Z",
                        "end": "2025-04-14T08:30:00.000Z",
                        "title": "Helsemessig fravær",
                        "info": "Føler meg dårlig og trenger tid til å komme meg",
                        "type": "Type02",
                        "status": "Ikke behandlet",
                        "pic": "sap-icon://travel-itinerary",
                        "color": "#adebb3",
                        "eventType": "absence"
                     },
                     {
                        "ID": "a9413716-1385-4732-9c5f-366a93db0f40",
                        "start": "2025-11-01T07:30:00.000Z",
                        "end": "2025-11-03T08:30:00.000Z",
                        "title": "Tjenestereise til USA",
                        "info": "Reiser for å delta i et offisielt oppdrag i utlandet",
                        "type": "Type02",
                        "status": "Venter på oppfølging",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "4ecf0363-41e6-4c36-aea3-60ad6fbb2990",
                        "start": "2025-11-08T09:00:00.000Z",
                        "end": "2025-11-11T11:00:00.000Z",
                        "title": "Hjemreise fra utenlandsoppdrag",
                        "info": "Avslutter en internasjonal reise og returnerer",
                        "type": "Type01",
                        "status": "Fullført",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "a9413716-1385-4732-9c5f-366a93db0f40",
                        "start": "2025-11-09T11:00:23.000Z",
                        "end": "2025-11-09T11:00:23.000Z",
                        "title": "Gratulerer Ingrid Pettersen",
                        "info": "Bursdag!!",
                        "type": "Type02",
                        "color": "#6395ee",
                        "pic": "sap-icon://Netweaver-business-client",
                        "eventType": "birthday"
                     }
                  ]
               },
               {
                  "ID": "0e8739aa-c7e2-4ff8-b301-f8319a3d98d3",
                  "name": "Per Hansen",
                  "role": "team member",
                  "appointments": [
                     {
                        "ID": "c811bb4e-5db7-45f2-8238-0961e25f0de8",
                        "start": "2025-01-04T15:09:45.000Z",
                        "end": "2025-01-04T15:09:45.000Z",
                        "title": "Arbeidsreise til Oslo",
                        "info": "Deltar på et viktig møte i hovedstaden",
                        "type": "Type02",
                        "status": "Ikke vurdert",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "e1ea6be1-780f-416e-97d0-c64a1a952eaf",
                        "start": "2025-01-06T15:09:45.000Z",
                        "end": "2025-01-06T15:09:45.000Z",
                        "title": "Retur fra møte i Oslo",
                        "info": "Avslutter et møte og reiser tilbake til utgangspunktet",
                        "type": "Type01",
                        "status": "Sendt til behandling",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "c811bb4e-5db7-45f2-8238-0961e25f0de8",
                        "start": "2025-10-06T16:11:23.000Z",
                        "end": "2025-10-06T16:11:23.000Z",
                        "title": "Gratulerer Per Hansen",
                        "info": "Bursdag!!",
                        "type": "Type02",
                        "color": "#6395ee",
                        "pic": "sap-icon://Netweaver-business-client",
                        "eventType": "birthday"
                     },
                     {
                        "ID": "c811bb4e-5db7-45f2-8238-0961e25f0de8",
                        "start": "2025-12-05T07:30:00.000Z",
                        "end": "2025-12-20T08:30:00.000Z",
                        "title": "Ekstraordinær situasjon",
                        "info": "Værforholdene gjør det umulig å møte på jobb",
                        "type": "Type02",
                        "status": "Returnert til søker",
                        "pic": "sap-icon://travel-itinerary",
                        "color": "#adebb3",
                        "eventType": "absence"
                     }
                  ]
               },
               {
                  "ID": "832ab8c7-e7aa-437a-bf24-811999ff3b28",
                  "name": "Kari Larsen",
                  "role": "team member",
                  "appointments": [
                     {
                        "ID": "a78179ea-ab2b-4e6a-a032-97cc32b10728",
                        "start": "2025-01-04T15:09:45.000Z",
                        "end": "2025-01-04T15:09:45.000Z",
                        "title": "Arbeidsreise til Oslo",
                        "info": "Deltar på et viktig møte i hovedstaden",
                        "type": "Type02",
                        "status": "Under vurdering",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "3a4a7280-c82c-445a-96b5-a13a904d1578",
                        "start": "2025-01-06T15:09:45.000Z",
                        "end": "2025-01-06T15:09:45.000Z",
                        "title": "Retur fra møte i Oslo",
                        "info": "Avslutter et møte og reiser tilbake til utgangspunktet",
                        "type": "Type01",
                        "status": "Under behandling",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "a78179ea-ab2b-4e6a-a032-97cc32b10728",
                        "start": "2025-07-01T07:30:00.000Z",
                        "end": "2025-07-16T08:30:00.000Z",
                        "title": "Skadefravær",
                        "info": "Har pådratt meg en skade som krever hvile og behandling",
                        "type": "Type02",
                        "status": "I prosess",
                        "pic": "sap-icon://travel-itinerary",
                        "color": "#adebb3",
                        "eventType": "absence"
                     },
                     {
                        "ID": "a78179ea-ab2b-4e6a-a032-97cc32b10728",
                        "start": "2025-12-09T10:48:47.000Z",
                        "end": "2025-12-09T10:48:47.000Z",
                        "title": "Gratulerer Kari Larsen",
                        "info": "Bursdag!!",
                        "type": "Type02",
                        "color": "#6395ee",
                        "pic": "sap-icon://Netweaver-business-client",
                        "eventType": "birthday"
                     }
                  ]
               },
               {
                  "ID": "a75943c2-fd4c-4929-b09a-17f0a76a81be",
                  "name": "Morten Kristiansen",
                  "role": "team member",
                  "appointments": [
                     {
                        "ID": "235f1270-c0d8-4b89-be31-a6ad8dd2b672",
                        "start": "2025-01-04T15:09:45.000Z",
                        "end": "2025-01-04T15:09:45.000Z",
                        "title": "Arbeidsreise til Oslo",
                        "info": "Deltar på et viktig møte i hovedstaden",
                        "type": "Type02",
                        "status": "Klar for godkjenning",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "2bad075c-245e-4ff0-8d1c-7053e6a9c338",
                        "start": "2025-01-06T15:09:45.000Z",
                        "end": "2025-01-06T15:09:45.000Z",
                        "title": "Retur fra møte i Oslo",
                        "info": "Avslutter et møte og reiser tilbake til utgangspunktet",
                        "type": "Type01",
                        "status": "Klar for godkjenning",
                        "color": "#FFB343",
                        "pic": "sap-icon://heatmap-chart",
                        "eventType": "travel"
                     },
                     {
                        "ID": "235f1270-c0d8-4b89-be31-a6ad8dd2b672",
                        "start": "2025-02-06T09:00:00.000Z",
                        "end": "2025-02-06T13:34:51.000Z",
                        "title": "Gratulerer Morten Kristiansen",
                        "info": "Bursdag!!",
                        "type": "Type02",
                        "color": "#6395ee",
                        "pic": "sap-icon://Netweaver-business-client",
                        "eventType": "birthday"
                     },
                     {
                        "ID": "235f1270-c0d8-4b89-be31-a6ad8dd2b672",
                        "start": "2025-08-17T07:30:00.000Z",
                        "end": "2025-08-20T08:30:00.000Z",
                        "title": "Fri for personlig utvikling",
                        "info": "Ønsker å bruke noen dager til å delta i en inspirerende aktivitet",
                        "type": "Type02",
                        "status": "Ikke sendt inn",
                        "pic": "sap-icon://travel-itinerary",
                        "color": "#adebb3",
                        "eventType": "absence"
                     }
                  ]
               }
            ]
         };

         // Format startDate
         if (data.startDate) {
            data.startDate = new Date(data.startDate);
         }

         // Format each person's appointment dates
         if (data.people) {
            data.people.forEach(person => {
               if (person.appointments) {
                  person.appointments.forEach(appointment => {
                     appointment.start = new Date(appointment.start);
                     appointment.end = new Date(appointment.end);
                  });
               }
            });
         }

         // Set the model
         const calendarDataModel = new JSONModel(data);
         this.getView().setModel(calendarDataModel, "calendarData");

         MessageToast.show("Avtaler lastet inn", { offset: "0 -5" });

      },


      // On the click of a appointment get the data of the of the appointment
      onPlanningCalendarAppointmentSelect: function (event) {
         let appointment = event.getParameter("appointment");
         if (appointment) {
            // const stateModel = this.getView().getModel("state");
            // stateModel.setProperty("/selectedAppointment", appointment);

            this.handleSingleAppointment(appointment);
         }
      },


      handleSingleAppointment: async function (appointment) {
         // Close detail popover if appointment is not selected
         if (!appointment.getSelected() && this.detailsPopover) {
            this.detailsPopover.close();
            // this.detailsPopover = null;
            return;
         }

         if (!appointment) {
            return;
         }

         try {
            // If there is no details popover loaded then load it
            if (!this.detailsPopover) {
               this.detailsPopover = await Fragment.load({
                  id: this.getView().getId(),
                  name: "fagprove.view.Details",
                  controller: this
               });

               this.getView().addDependent(this.detailsPopover);
            }

            // Set content and open popover
            this.setDetailsDialogContent(appointment, this.detailsPopover);
         } catch (error) {
            console.error("Feil ved lasting av detaljfragment:", error);
            MessageBox.error("Kunne ikke vise avtaledetaljer");
         }
      },





      // Add content and oppen popover
      setDetailsDialogContent: function (appointment, detailsPopover) {
         // Get the binding context of the appointment from the "calendarData" model
         let bindingContext = appointment.getBindingContext("calendarData");
         if (bindingContext) {
            // Bind the data to the popover and open it  
            detailsPopover.setBindingContext(bindingContext, "calendarData");
            detailsPopover.openBy(appointment);
         } else {
            console.warn("No valid binding context found for appointment  ");
            MessageToast.show("Kunne ikke vise avtaledetaljer");
         }
      },


      // Formater for date in the fragment when click on appointment
      formatDate: function (date) {
         if (!date) {
            return "";
         }
         try {
            let iHours = date.getHours(),
               iMinutes = date.getMinutes(),
               iSeconds = date.getSeconds();

            if (iHours !== 0 || iMinutes !== 0 || iSeconds !== 0) {
               return DateFormat.getDateTimeInstance({ style: "medium" }).format(date);
            } else {
               return DateFormat.getDateInstance({ style: "medium" }).format(date);
            }
         } catch (e) {
            console.error("Error formatting date:", e);
            return "";
         }
      },

      // Formatter for showing or not showing text in fragment
      fragmentVisiblelStatusFormatter: function (status) {
         if (status != null || status != undefined) {
            return true;
         } else if (status === null || status === undefined) {
            return false;
         } else {
            console.warn("Not a string or null or undefined what are you?   ", typeof status);
         }
      },

      // Formater uper case first letere in name
      userNameCalendar: async function (userName) {
         const capitalized = userName.charAt(0).toUpperCase() + userName.slice(1);
         let calendar = this.getView().getModel("i18n").getResourceBundle().getText("calendarText");
         return ` ${capitalized} ${await calendar}`;
      },

      onShowLegendButtonPress: function (event) {
         // Get the button that triggered the event
         let button = event.getSource();

         // Check if we already have a popover
         if (!this.legendPopover) {
            // Create popover
            Fragment.load({
               id: this.getView().getId(),
               name: "fagprove.view.LegendPopover",
               controller: this
            }).then((popover) => {
               this.getView().addDependent(popover);
               this.legendPopover = popover;
               this.legendPopover.openBy(button);
            }).catch((error) => {
               console.error("Feil ved lasting av legendefragment:", error);
               MessageBox.error("Kunne ikke vise legende");
            });
         } else {
            // If popover already exists toggle its visibility
            if (this.legendPopover.isOpen()) {
               this.legendPopover.close();
            } else {
               this.legendPopover.openBy(button);
            }
         }
      },












   });
});