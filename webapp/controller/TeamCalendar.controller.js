sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox"
], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("fagprove.controller.TeamCalendar", {
		sayHello: function () {
			MessageBox.show("Hello World!");
		}
	});
});
