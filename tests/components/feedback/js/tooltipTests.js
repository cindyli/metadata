/*!
Copyright 2014 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

(function ($) {
    "use strict";

    fluid.registerNamespace("gpii.tests.tooltip");

    gpii.tests.tooltip.assertInit = function (that) {
        var expectedIdToContent = {
            "gpiic-icon1": that.options.strings.button1Label,
            "gpiic-icon2": that.options.strings.button2Label
        };
        jqUnit.assertDeepEq("The dialog container has been created", expectedIdToContent, that.model.idToContent);
    };

    gpii.tests.tooltip.assertOpenIndicator = function (button1, expectedButton1State, button2, expectedButton2State, openIndicator) {
        jqUnit[expectedButton1State ? "assertTrue" : "assertFalse"]("The open indicator styling has been applied/removed as expected", $(button1).hasClass(openIndicator));
        jqUnit[expectedButton2State ? "assertTrue" : "assertFalse"]("The open indicator styling has been applied/removed as expected", $(button2).hasClass(openIndicator));
    };

    fluid.defaults("gpii.tests.tooltipTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        markupFixture: "#tooltip-fixture",
        components: {
            tooltip: {
                type: "gpii.metadata.feedback.tooltip",
                container: ".gpiic-tooltip",
                createOnEvent: "{tooltipTester}.events.onTestCaseStart",
                options: {
                    strings: {
                        button1Label: "Label for button 1",
                        button2Label: "Label for button 2"
                    },
                    selectors: {
                        button1: ".gpiic-button1",
                        icon1: "#gpiic-icon1",
                        button2: ".gpiic-button2",
                        icon2: "#gpiic-icon2"
                    },
                    selectorsMap: {
                        icon1: {
                            label: "button1Label",
                            selectorForIndicatorStyle: "button1"
                        },
                        icon2: {
                            label: "button2Label",
                            selectorForIndicatorStyle: "button2"
                        }
                    }
                }
            },
            tooltipTester: {
                type: "gpii.tests.tooltipTester"
            }
        }
    });

    fluid.defaults("gpii.tests.tooltipTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        modules: [{
            name: "Initialization",
            tests: [{
                name: "The idToContent option is expanded",
                expect: 1,
                sequence: [{
                    listener: "gpii.tests.tooltip.assertInit",
                    args: ["{tooltip}"],
                    priority: "last",
                    event: "{tooltipTests tooltip}.events.onCreate"
                }]
            }]
        }, {
            name: "Add/remove open indicator styling",
            tests: [{
                name: "Add open indicator styling",
                expect: 2,
                sequence: [{
                    element: "{tooltip}.dom.icon1",
                    jQueryTrigger: "focus"
                }, {
                    listener: "gpii.tests.tooltip.assertOpenIndicator",
                    args: ["{tooltip}.options.selectors.button1", true, "{tooltip}.options.selectors.button2", false, "{tooltip}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{tooltip}.events.afterOpen"
                }]
            }, {
                name: "Remove open indicator styling",
                expect: 2,
                sequence: [{
                    element: "{tooltip}.dom.icon2",
                    jQueryTrigger: "focus"
                }, {
                    listener: "gpii.tests.tooltip.assertOpenIndicator",
                    args: ["{tooltip}.options.selectors.button1", false, "{tooltip}.options.selectors.button2", false, "{tooltip}.options.styles.openIndicator"],
                    priority: "last",
                    event: "{tooltip}.events.afterClose"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "gpii.tests.tooltipTests"
        ]);
    });

})(jQuery);
