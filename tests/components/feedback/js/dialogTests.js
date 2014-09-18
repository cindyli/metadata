/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.dialog");

    gpii.tests.dialog.assertInit = function (that) {
        jqUnit.assertNotNull("The dialog container has been created", that.dialogContainer);
        jqUnit.assertNotNull("The dialog has been created", that.dialog);
        jqUnit.assertEquals("getDialogId() returns the id of the created dialog", that.dialog.attr("id"), that.getDialogId());
    };

    gpii.tests.dialog.controlDialog = function (dialogContainer, action) {
        dialogContainer.dialog(action);
    };

    gpii.tests.dialog.assertDialogState = function (that, target, event, expectedModelValue) {
        jqUnit.assertNotNull("The event is fired with proper arguments", that && target && event);
        jqUnit[expectedModelValue ? "assertTrue" : "assertFalse"]("The model value for isDialogOpen is expected", that.model.isDialogOpen);
        jqUnit[expectedModelValue ? "assertTrue" : "assertFalse"]("The manipulation of the open indicator is expected", that.getDialogOpener().hasClass(that.options.styles.openIndicator));
    };

    gpii.tests.dialog.assertDialogOpenState = function (isDialogOpen, expected) {
        jqUnit[expected ? "assertTrue" : "assertFalse"]("The open state of the dialog is " + expected, isDialogOpen);
    };

    fluid.defaults("gpii.tests.dialogTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            dialog: {
                type: "gpii.metadata.feedback.dialog",
                container: ".gpiic-dialog",
                createOnEvent: "{dialogTester}.events.onTestCaseStart"
            },
            dialogTester: {
                type: "gpii.tests.dialogTester"
            }
        }
    });

    fluid.defaults("gpii.tests.dialogTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Initialization",
            tests: [{
                name: "onCreate creates the dialog container and the dialog",
                expect: 3,
                sequence: [{
                    listener: "gpii.tests.dialog.assertInit",
                    args: ["{dialog}"],
                    priority: "last",
                    event: "{dialogTests dialog}.events.onDialogInited"
                }]
            }]
        }, {
            name: "Dialog State Changes",
            tests: [{
                name: "Dialog open",
                expect: 5,
                sequence: [{
                    func: "{dialog}.setDialogOpener",
                    args: ["{dialog}.container"]
                }, {
                    func: "gpii.tests.dialog.controlDialog",
                    args: ["{dialog}.dialogContainer", "open"]
                }, {
                    listener: "gpii.tests.dialog.assertDialogState",
                    args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", true],
                    priority: "last",
                    event: "{dialog}.events.afterDialogOpen"
                }, {
                    jQueryTrigger: "click",
                    element: "{dialog}.dialogContainer"
                }, {
                    func: "gpii.tests.dialog.assertDialogOpenState",
                    args: ["{dialog}.model.isDialogOpen", true]
                }, {
                    jQueryTrigger: "click",
                    element: "body"
                }, {
                    func: "gpii.tests.dialog.assertDialogOpenState",
                    args: ["{dialog}.model.isDialogOpen", false]
                }]
            }, {
                name: "Dialog close",
                expect: 3,
                sequence: [{
                    func: "{dialog}.setDialogOpener",
                    args: ["{dialog}.container"]
                }, {
                    func: "gpii.tests.dialog.controlDialog",
                    args: ["{dialog}.dialogContainer", "open"]
                }, {
                    func: "gpii.tests.dialog.controlDialog",
                    args: ["{dialog}.dialogContainer", "close"]
                }, {
                    listener: "gpii.tests.dialog.assertDialogState",
                    args: ["{arguments}.0", "{arguments}.1", "{arguments}.2", false],
                    priority: "last",
                    event: "{dialog}.events.afterDialogClose"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "gpii.tests.dialogTests"
        ]);
    });
})(jQuery);
