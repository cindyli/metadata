/*!
Copyright 2013 OCAD University

Licensed under the New BSD license. You may not use this file except in
compliance with this License.

You may obtain a copy of the License at
https://github.com/gpii/universal/LICENSE.txt
*/

// Declare dependencies
/*global fluid, jqUnit, expect, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

(function ($) {
    fluid.registerNamespace("fluid.tests");

    jqUnit.test("Test fluid.metadata.statusPanel.transform()", function () {
        jqUnit.expect(3);

        var existingModel, expectedOutput, newModel, result;
        jqUnit.assertUndefined("Undefined model is not transformed", fluid.metadata.statusPanel.transform(existingModel));

        newModel = {
            audio: "available",
            video: "unavailable"
        };
        existingModel = {
            toShow: [{
                type: "audio",
                state: "available"
            }, {
                type: "video",
                state: "unavailable"
            }]
        };
        result = fluid.metadata.statusPanel.transform({}, newModel);

        jqUnit.assertDeepEq("The original model has been correctly transformed", existingModel, result);

        newModel = {
            video: "available"
        };

        expectedOutput = {
            toShow: [{
                type: "audio",
                state: "available"
            }, {
                type: "video",
                state: "available"
            }]
        };

        result = fluid.metadata.statusPanel.transform(existingModel, newModel);

        jqUnit.assertDeepEq("The original model has been correctly transformed", expectedOutput, result);

    });

    jqUnit.asyncTest("The clicks on indicator icons trigger the metadataSelected event", function () {
        var statusPanel = fluid.metadata.statusPanel(".flc-status-testClick", {
            model: {
                audio: "unavailable",
                video: "unavailable"
            },
            resources: {
                template: {
                    url: "../../src/html/status-template.html"
                }
            },
            listeners: {
                onReady: function (that) {
                    that.container.find(".fl-audio-icon").click();
                },
                onMetadataSelected: function (indicatorType) {
                    jqUnit.assertEquals("The onMetadataSelected is fired with a proper indicator type", "audio", indicatorType);
                    jqUnit.start();
                }
            }
        });
    });

    fluid.defaults("fluid.tests.statusPanelTests", {
        gradeNames: ["fluid.test.testEnvironment", "autoInit"],
        components: {
            statusPanel: {
                type: "fluid.metadata.statusPanel",
                container: ".flc-status",
                createOnEvent: "{statusPanelTester}.events.onTestCaseStart",
                options: {
                    model: {
                        audio: "unavailable",
                        video: "unavailable"
                    },
                    resources: {
                        template: {
                            url: "../../src/html/status-template.html"
                        }
                    }
                }
            },
            statusPanelTester: {
                type: "fluid.tests.statusPanelTester"
            }
        }
    });

    fluid.tests.getInidicatorSelector = function (indicatorType) {
        return ".fl-" + indicatorType + "-icon";
    };

    fluid.tests.checkInit = function (that) {
        jqUnit.assertEquals("No indicator has been created", 2, that.container.find("button").length);

        fluid.each(that.model.toShow, function (indicator) {
            var indicatorType = indicator.type;
            var selector = fluid.tests.getInidicatorSelector(indicatorType);
            jqUnit.assertEquals("The indicator for " + indicatorType + " has been created", 1, that.container.find(selector).length);
        });
    };

    fluid.tests.checkIndicators = function (that, model) {
        return function () {
            jqUnit.assertEquals("Expected number of indicators have been created", fluid.keys(model).length, that.container.find("button").length);
            fluid.each(model, function (state, type) {
                var iconCss = "fl-" + type + "-icon";
                jqUnit.assertEquals("The icon css for " + type + " has been applied", 1, that.container.find("button." + iconCss).length);
                var stateCss = "fl-" + state;
                jqUnit.assertTrue("The state css for " + type + " has been applied", that.container.find("button." + iconCss).hasClass(stateCss));
            });
        };
    };

    fluid.defaults("fluid.tests.statusPanelTester", {
        gradeNames: ["fluid.test.testCaseHolder", "autoInit"],
        testOptions: {
            newModel: {
                audio: "unavailable",
                video: "available"
            }
        },
        modules: [{
            name: "Test status panel",
            tests: [{
                expect: 3,
                name: "Init",
                sequence: [{
                    listener: "fluid.tests.checkInit",
                    event: "{statusPanelTests statusPanel}.events.onReady"
                }]
            }, {
                expect: 5,
                name: "Change indicator status",
                sequence: [{
                    func: "{statusPanel}.applier.requestChange",
                    args: ["video", "available"]
                }, {
                    listenerMaker: "fluid.tests.checkIndicators",
                    makerArgs: ["{statusPanel}", "{that}.options.testOptions.newModel"],
                    spec: {path: "*", priority: "last"},
                    changeEvent: "{statusPanel}.applier.modelChanged"
                }]
            }]
        }]
    });

    $(document).ready(function () {
        fluid.test.runTests([
            "fluid.tests.statusPanelTests"
        ]);
    });

})(jQuery);
