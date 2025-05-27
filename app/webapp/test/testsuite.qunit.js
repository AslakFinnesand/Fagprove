sap.ui.define(function () {
	"use strict";

	return {
		name: "QUnit test suite for the UI5 Application: fagprove",
		defaults: {
			page: "ui5://test-resources/fagprove/Test.qunit.html?testsuite={suite}&test={name}",
			qunit: {
				version: 2
			},
			sinon: {
				version: 1
			},
			ui5: {
				language: "EN",
				theme: "sap_horizon"
			},
			coverage: {
				only: "fagprove/",
				never: "test-resources/fagprove/"
			},
			loader: {
				paths: {
					"fagprove": "../"
				}
			}
		},
		tests: {
			"unit/unitTests": {
				title: "Unit tests for fagprove"
			},
			"integration/opaTests": {
				title: "Integration tests for fagprove"
			}
		}
	};
});
