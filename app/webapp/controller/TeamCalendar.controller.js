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
         const router = this.getRouter();
         router.getRoute("teamcalendar").attachMatched(this.onRouteMatched, this);
         this.legendPopover = null; // Will store legend popover instance

         // Initialize models if they don't exist
         if (!this.getView().getModel("calendarData")) {
            this.getView().setModel(new JSONModel(), "calendarData");
         }

         if (!this.getView().getModel("holidays")) {
            this.getView().setModel(new JSONModel([]), "holidays");
         }

         // State model for handling UI states
         const stateModel = new JSONModel({
            isLoading: false,
            currentYear: new Date().getFullYear(),
            selectedAppointment: null
         });

         this.getView().setModel(stateModel, "state");
      },



      onRouteMatched: async function () {
         const date = new Date();
         const year = date.getFullYear();
         await this.fetchLeaderEmpAppointments(year);
         await this.fetchHolidaysList(year);
         await this.initializeHolidays();
      },

      fetchHolidaysList: async function (year) {
         return new Promise((resolve, reject) => {
            try {
               const model = this._createODataModel("/odata/v4/holidays/");

               // Create a context for the function import
               const context = model.bindContext(`/GetHolidays`);

               context.requestObject()
                  .then((result) => {
                     if (result && result.value) {
                        // Format each holiday date
                        result.value.forEach(date => {
                           date.date = UI5Date.getInstance(date.date);
                        });
                     } else {
                        throw new Error("Ingen feriedatoer returnert");
                     }

                     // Set the model
                     const holidayDataModel = new JSONModel(result.value);
                     this.getView().setModel(holidayDataModel, "holidays");

                     MessageToast.show("Feriedager lastet inn", {
                        duration: 2000,
                        offset: "0 -80",
                     });

                     resolve(result.value);
                  })
                  .catch((error) => {
                     console.error("Feil ved henting av feriedager:", error);
                     MessageToast.show("Feil ved lasting av feriedager");
                     reject(error);
                  });
            } catch (error) {
               reject(error);
            }
         });
      },


      initializeHolidays: async function () {
         const planningCalendar = this.byId("idPlanningCalendar");
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
      fetchLeaderEmpAppointments: async function (year) {

         return new Promise((resolve, reject) => {
            try {
               const rootModel = this.getView().getModel();
               const leaderID = rootModel.getProperty("/leaderId");

               if (!leaderID) {
                  reject(new Error("Leder-ID mangler"));
                  return;
               }

               const model = this._createODataModel("/odata/v4/calendar/");

               // Create context for the function call
               const context = model.bindContext(`/GetEmploeyAppointments(leader_ID='${leaderID}',year=${year})`);

               context.requestObject()
                  .then((result) => {
                     // Validate result
                     if (!result || !result.value || !result.value[0]) {
                        throw new Error("Ingen avtaler returnert");
                     }

                     // Format dates in the API response
                     const data = result.value[0];

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
                     resolve(data);
                  })
                  .catch((error) => {
                     console.error("Feil ved henting av avtaler:", error);
                     MessageToast.show("Feil ved lasting av avtaler");
                     reject(error);
                  });
            } catch (error) {
               reject(error);
            }
         });
      },


      // On the click of a appointment get the data of the of the appointment
      onPlanningCalendarAppointmentSelect: function (event) {
         const appointment = event.getParameter("appointment");
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
         const bindingContext = appointment.getBindingContext("calendarData");
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
            const iHours = date.getHours(),
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
         const calendar = this.getView().getModel("i18n").getResourceBundle().getText("calendarText");
         return ` ${capitalized} ${await calendar}`;
      },

      onShowLegendButtonPress: function (event) {
         // Get the button that triggered the event
         const button = event.getSource();

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


      // Helper method to create OData model with auth header
      _createODataModel: function (serviceUrl) {
         const rootModel = this.getView().getModel();
         const logInName = rootModel.getProperty("/userName");
         const pw = rootModel.getProperty("/password");
         const authHeader = "Basic " + btoa(`${logInName}:${pw}`);

         // Create the OData model
         const model = new ODataModel({ serviceUrl: serviceUrl });

         // Set the Authorization header
         model.changeHttpHeaders({ "Authorization": authHeader });

         return model;
      },















      






   });
});