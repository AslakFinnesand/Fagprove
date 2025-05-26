sap.ui.define([
	"./BaseController",
	"sap/m/MessageBox"
], function (BaseController, MessageBox) {
	"use strict";

	return BaseController.extend("fagprove.controller.Logginn", {
		sayHello: function () {
			MessageBox.show("Hello World!");
		}
	});
});
