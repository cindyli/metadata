/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("gpii.tests");

    var matchConfirmationTemplate = "<h2 class='gpiic-matchConfirmation-header'></h2><p class='gpiic-matchConfirmation-content'></p>";
    var mismatchDetailsTemplate = "<h2 class=\"gpiic-mismatchDetails-header\"></h2><div>    <input type=\"checkbox\" class=\"gpiic-notInteresting\" />    <label for=\"notInteresting\" class=\"gpiic-notInteresting-label\"></label></div><div class=\"gpiic-mismatchDetails-prefs-title\"></div><ul class=\"gpii-list-unstyled\">    <li>        <input type=\"checkbox\" id=\"text\" class=\"gpiic-text\" />        <label for=\"text\" class=\"gpiic-text-label\"></label>    </li>    <li>        <input type=\"checkbox\" id=\"transcripts\" class=\"gpiic-transcripts\" />        <label for=\"transcripts\" class=\"gpiic-transcripts-label\"></label>    </li>    <li>        <input type=\"checkbox\" id=\"audio\" class=\"gpiic-audio\" />        <label for=\"audio\" class=\"gpiic-audio-label\"></label>    </li>    <li>        <input type=\"checkbox\" id=\"audioDesc\" class=\"gpiic-audioDesc\" />        <label for=\"audioDesc\" class=\"gpiic-audioDesc-label\"></label>    </li>    <li>        <input type=\"checkbox\" id=\"other\" class=\"gpiic-other\" />        <label for=\"other\" class=\"gpiic-other-label\"></label>    </li>    <li>        <textarea class=\"gpiic-other-feedback gpii-other-feedback\" row=\"5\" cols=\"50\"></textarea>    </li></ul><div class=\"gpii-mismatchDetails-buttons\">    <a href=\"#\" class=\"gpiic-mismatchDetails-skip\"></a>    <button name=\"submit\" class=\"gpiic-mismatchDetails-submit gpii-mismatchDetails-submit\"></button></div>";

    fluid.defaults("gpii.tests.feedbackTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: "#feedback-fixture",
        components: {
            feedback: {
                type: "gpii.metadata.feedback",
                container: ".gpiic-feedback",
                createOnEvent: "{feedbackTester}.events.onTestCaseStart",
                options: {
                    gradeNames: ["gpii.metadata.feedbackConfig"],
                    components: {
                        bindMatchConfirmation: {
                            options: {
                                renderDialogContentOptions: {
                                    resources: {
                                        template: {
                                            resourceText: matchConfirmationTemplate
                                        }
                                    }
                                }
                            }
                        },
                        bindMismatchDetails: {
                            options: {
                                renderDialogContentOptions: {
                                    resources: {
                                        template: {
                                            resourceText: mismatchDetailsTemplate
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            feedbackTester: {
                type: "gpii.tests.feedbackTester"
            }
        }
    });

    gpii.tests.verifyInit = function (that) {
        jqUnit.assertNotNull("The subcomponent dataSource has been created", that.dataSource);
        jqUnit.assertNotNull("The subcomponent tooltip has been created", that.tooltip);
        jqUnit.assertNotNull("The subcomponent matchConfirmation has been created", that.matchConfirmation);
        jqUnit.assertNotNull("The subcomponent mismatchDetails has been created", that.mismatchDetails);
        jqUnit.assertNotNull("The dialog container has been created", that.dialogContainer);
        jqUnit.assertNotNull("The dialog has been created", that.dialog);

        jqUnit.assertEquals("The aria role is set for match confirmation button", "button", that.locate("matchConfirmationButton").attr("role"));
        jqUnit.assertEquals("The aria label is set", that.options.strings.matchConfirmationLabel, that.locate("matchConfirmationButton").attr("aria-label"));
        jqUnit.assertNotNull("The user id has been generated", that.userID);
    };

    gpii.tests.checkSavedModel = function (savedModel, expectedModelValues) {
        fluid.each(expectedModelValues, function (expectedValue, key) {
            jqUnit.assertEquals("The value " + expectedValue + " on the path " + key + " is correct", expectedValue, fluid.get(savedModel.model, key));
        });
    };

    gpii.tests.verifyDialog = function (feedback, dialogComponentName, expectedIsDialogOpen, expectedIsActive) {
        var dialogComponent = feedback[dialogComponentName];

        jqUnit.assertEquals("The dialog is open", expectedIsDialogOpen, feedback.model.isDialogOpen);
        jqUnit.assertEquals("The state of " + dialogComponentName + " is active", expectedIsActive, dialogComponent.model.isActive);
        jqUnit.assertEquals("The aria-controls has been set properly", feedback.getDialogId(), dialogComponent.container.attr("aria-controls"));
    };

    gpii.tests.clickMismatchDetailsLinks = function (feedback, linkSelector) {
        var mismatchDetailsComponent = feedback.bindMismatchDetails.renderDialogContent;
        mismatchDetailsComponent.locate(linkSelector).click();
    };

    gpii.tests.verifyDialogOnSkip = function (feedback) {
        var bindMismatchDetails = feedback.bindMismatchDetails;
        jqUnit.assertFalse("The dialog is closed", bindMismatchDetails.model.isDialogOpen);
    };

    gpii.tests.setMismatchDetailsFields = function (feedback, newText) {
        var mismatchDetailsComponent = feedback.bindMismatchDetails.renderDialogContent;

        mismatchDetailsComponent.locate("notInteresting").click();
        mismatchDetailsComponent.locate("text").click();
        mismatchDetailsComponent.locate("transcripts").click();
        mismatchDetailsComponent.locate("audio").click();
        mismatchDetailsComponent.locate("audioDesc").click();
        mismatchDetailsComponent.locate("other").click();
        mismatchDetailsComponent.locate("otherFeedback").text(newText).change();
    };

    gpii.tests.verifyDialogOnSubmit = function (feedback) {
        var bindMismatchDetails = feedback.bindMismatchDetails;
        jqUnit.assertFalse("The dialog is closed", bindMismatchDetails.model.isDialogOpen);
    };

    gpii.tests.assertOpenIndicator = function (buttonSelector, openIndicator) {
        jqUnit.assertTrue("Opening the tooltip adds the open indicator to the corresponding button", $(buttonSelector).hasClass(openIndicator));
    };

    gpii.tests.assertTooltipClose = function () {
        jqUnit.assertTrue("Tooltip is closed with firing afterTooltipClose event", true);
    };

    gpii.tests.assertBoth = function (trueButton, falseButton, openIndicator) {
        jqUnit.assertTrue("The open indicator has been applied", $(trueButton).hasClass(openIndicator));
        jqUnit.assertFalse("The open indicator has been removed", $(falseButton).hasClass(openIndicator));
    };

    fluid.defaults("gpii.tests.feedbackTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newText: "some text"
        },
        modules: [{
            name: "Initialization",
            tests: [{
                name: "Init",
                expect: 9,
                sequence: [{
                    listener: "gpii.tests.verifyInit",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedbackTests feedback}.events.onFeedbackMarkupReady"
                }]
            }]
        }, {
            name: "Dialogs",
            tests: [{
                name: "Match confirmation dialog",
                expect: 5,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindMatchConfirmation", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMatchConfirmationButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }]
            }, {
                name: "Mismatch details dialog",
                expect: 24,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindMismatchDetails", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    func: "gpii.tests.clickMismatchDetailsLinks",
                    args: ["{feedback}", "skip"]
                }, {
                    listener: "gpii.tests.verifyDialogOnSkip",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedback}.events.onSkipAtMismatchDetails"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindMismatchDetails", false, false],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.verifyDialog",
                    args: ["{feedback}", "bindMismatchDetails", true, true],
                    priority: "last",
                    event: "{feedback}.events.afterMismatchDetailsButtonClicked"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    func: "gpii.tests.setMismatchDetailsFields",
                    args: ["{feedback}", "{that}.options.testOptions.newText"]
                }, {
                    func: "gpii.tests.clickMismatchDetailsLinks",
                    args: ["{feedback}", "submit"]
                }, {
                    listener: "gpii.tests.verifyDialogOnSubmit",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedback}.events.onSubmitAtMismatchDetails"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true,
                        notInteresting: true,
                        other: true,
                        otherFeedback: "{that}.options.testOptions.newText",
                        "requests.text": true,
                        "requests.transcripts": true,
                        "requests.audio": true,
                        "requests.audioDesc": true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }]
            }, {
                name: "Interaction between Match confirmation and mismatch details icons",
                expect: 6,
                sequence: [{
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.mismatchDetailsButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: false,
                        mismatch: true
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.checkSavedModel",
                    args: ["{arguments}.0", {
                        match: true,
                        mismatch: false
                    }],
                    priority: "last",
                    event: "{feedback}.events.afterSave"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }]
            }]
        }, {
            name: "Dialog & tooltiop interaction",
            tests: [{
                name: "Interaction between the dialog and the tooltip",
                expect: 7,
                sequence: [{
                    element: "{feedback}.dom.matchConfirmationIcon",
                    jQueryTrigger: "focus"
                }, {
                    listener: "gpii.tests.assertOpenIndicator",
                    args: ["{feedback}.options.selectors.matchConfirmationButton", "{feedback}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{feedback}.events.afterTooltipOpen"
                }, {
                    jQueryTrigger: "click",
                    element: "{feedback}.dom.matchConfirmationButton"
                }, {
                    listener: "gpii.tests.assertTooltipClose",
                    args: ["{feedback}"],
                    priority: "last",
                    event: "{feedback}.events.afterTooltipClose"
                }, {
                    listener: "gpii.tests.assertOpenIndicator",
                    args: ["{feedback}.options.selectors.matchConfirmationButton", "{feedback}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{feedback}.events.afterDialogOpen"
                }, {
                    element: "{feedback}.dom.mismatchDetailsIcon",
                    jQueryTrigger: "focus"
                }, {
                    listener: "gpii.tests.assertBoth",
                    args: ["{feedback}.options.selectors.mismatchDetailsButton", "{feedback}.options.selectors.matchConfirmationButton", "{feedback}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{feedback}.events.afterTooltipOpen"
                }, {
                    func: "{feedback}.tooltip.close"
                }, {
                    listener: "gpii.tests.assertBoth",
                    args: ["{feedback}.options.selectors.matchConfirmationButton", "{feedback}.options.selectors.mismatchDetailsButton", "{feedback}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{feedback}.events.afterTooltipClose"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "gpii.tests.feedbackTests"
        ]);
    });
})(jQuery, fluid);
