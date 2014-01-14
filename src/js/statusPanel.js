/*
Copyright 2013 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

// Declare dependencies
/*global fluid_1_5:true, jQuery*/

// JSLint options
/*jslint white: true, funcinvoke: true, undef: true, newcap: true, nomen: true, regexp: true, bitwise: true, browser: true, forin: true, maxerr: 100, indent: 4 */

var fluid_1_5 = fluid_1_5 || {};


(function ($, fluid) {

    fluid.registerNamespace("fluid.metadata");

    /*******************************************************************************
     * The panel to show icons of all states of metadata for the selected media
     *******************************************************************************/

    fluid.defaults("fluid.metadata.statusPanel", {
        gradeNames: ["fluid.rendererComponent", "autoInit"],
        strings: {
            titleLabel: "a title"
        },
        selectors: {
            title: ".flc-status-title",
            detail: ".flc-status-detail"
        },
        typeSelector: "fl-%type-icon",
        repeatingSelectors: ["detail"],
        protoTree: {
            title: {messagekey: "titleLabel"},
            expander: {
                type: "fluid.renderer.repeat",
                repeatID: "detail",
                tree: {
                    decorators: {
                        func: "fluid.metadata.indicator",
                        type: "fluid",
                        options: {
                            model: {
                                value: "${{metadata}.state}"
                            },
                            styles: {
                                metadataCss: {
                                    expander: {
                                        funcName: "fluid.stringTemplate",
                                        args: ["{that}.options.typeSelector", {
                                            type: "${{metadata}.type}"
                                        }]
                                    }
                                }
                            }
                        }
                    }
                },
                pathAs: "metadataPath",
                valueAs: "metadata",
                controlledBy: "toShow"
            }
        },
        resources: {
            template: {
                url: "../html/status-template.html"
            }
        },
        events: {
            onReady: {
                events: {
                    onCreate: "onCreate",
                    afterRender: "afterRender"
                },
                args: "{that}"
            },
            onMetadataSelected: null
        },
        listeners: {
            "onCreate.init": "fluid.metadata.statusPanel.init",
            "onReady.bindClick": {
                listener: "fluid.metadata.statusPanel.bindClick",
                args: ["{that}.container", "{that}.options.selectors.detail", "{that}.options.typeSelector", "{that}.events.onMetadataSelected.fire"]
            }
        },
        modelListeners: {
            "*": {
                func: "{that}.refreshView"
            }
        }
    });

    fluid.metadata.statusPanel.init = function (that) {
        that.applier.guards.addListener("*", function (model, changeRequest) {
            var newModel = {};
            if (changeRequest.path === "") {
                newModel = changeRequest.value;
            } else {
                fluid.set(newModel, changeRequest.path, changeRequest.value);
            }
            changeRequest.path = "";
            changeRequest.value = fluid.metadata.statusPanel.transform(model, newModel);
        });

        fluid.fetchResources(that.options.resources, function (resourceSpec) {
            that.applier.requestChange("", that.model);
            that.refreshView();
        });
    };

    fluid.metadata.statusPanel.bindClick = function (container, indicatorSelector, typeSelector, fireSelectedEvent) {
        var indicators = container.find(indicatorSelector);
        var regexRule = fluid.stringTemplate(typeSelector, {type: "(.*)"});

        fluid.each(indicators, function (indicator) {
            indicator = $(indicator);
            var indicatorClass = indicator.attr("class");

            indicator.click(function () {
                fluid.each(indicatorClass.split(/\s/), function (oneSelector) {
                    var found = oneSelector.match(/fl-(.*)-icon/);
                    if (found && found[1]) {
                        fireSelectedEvent(found[1]);
                        return;
                    }
                })
            });
        });
    };

    /** To transform the input model structure from:
    {
        "audio": "available",
        "video": "unavailable"
    }
    to:
    toShow: [{
        type: "audio",
        state: "available",
    }, {
        type: "video",
        state: "unavailable"
    }]
    **/
    fluid.metadata.statusPanel.transform = function (existingModel, newModel) {
        if (!newModel) {
            return existingModel;
        }

        // Revert the previously converted model to the originally flatten structure
        var invertRules = {
            transform: {
                type: "fluid.transforms.arrayToObject",
                inputPath: "toShow",
                outputPath: "",
                key: "type",
                innerValue: [{
                    transform: {
                        type: "fluid.transforms.value",
                        inputPath: "state"
                    }
                }]
            }
        };

        var revertedModel = fluid.model.transform(existingModel, invertRules);
        var completeModle = $.extend(true, {}, revertedModel, newModel);

        // Convert the complete model
        var rules = {
            transform: {
                type: "fluid.transforms.objectToArray",
                outputPath: "toShow",
                key: "type",
                innerValue: [{
                    transform: [{
                        type: "fluid.transforms.value",
                        inputPath: "",
                        outputPath: "state"
                    }]
                }],
                inputPath: ""
            }
        };

        return fluid.model.transform(completeModle, rules);
    };

})(jQuery, fluid_1_5);
