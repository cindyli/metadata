/*
Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

(function ($, fluid) {
    "use strict";

    fluid.registerNamespace("gpii.metadata");

    /*
     * feedback: The actual implementation of the feedback tool
     */

    fluid.defaults("gpii.metadata.feedback", {
        gradeNames: ["fluid.viewRelayComponent", "gpii.metadata.feedback.dialog", "autoInit"],
        members: {
            databaseName: {
                expander: {
                    funcName: "gpii.metadata.feedback.getDbName",
                    args: "{that}.options.databaseName"
                }
            },
            userID: {
                expander: {
                    funcName: "fluid.allocateGuid"
                }
            }
        },
        components: {
            bindMatchConfirmation: {
                type: "gpii.metadata.feedback.bindMatchConfirmation",
                container: "{feedback}.dom.matchConfirmationButton",
                createOnEvent: "onPrepReady",
                options: {
                    gradeNames: ["gpii.metadata.feedback.buttonConfig"],
                    strings: {
                        buttonLabel: "{feedback}.options.strings.matchConfirmationLabel"
                    },
                    selectors: {
                        icon: "{feedback}.options.selectors.matchConfirmationIcon"
                    },
                    modelListeners: {
                        "isActive": {
                            listener: "gpii.metadata.feedback.updateFeedbackModel",
                            args: ["{change}.value", "like", "{bindMismatchDetails}", "{feedback}"],
                            excludeSource: "init"
                        }
                    },
                    listeners: {
                        "afterButtonClicked.escalateToParent": {
                            listener: "{feedback}.events.afterMatchConfirmationButtonClicked.fire",
                            priority: "last"
                        }
                    }
                }
            },
            bindMismatchDetails: {
                type: "gpii.metadata.feedback.bindMismatchDetails",
                container: "{feedback}.dom.mismatchDetailsButton",
                createOnEvent: "onPrepReady",
                options: {
                    gradeNames: ["gpii.metadata.feedback.buttonConfig"],
                    strings: {
                        buttonLabel: "{feedback}.options.strings.mismatchDetailsLabel"
                    },
                    selectors: {
                        icon: "{feedback}.options.selectors.mismatchDetailsIcon"
                    },
                    modelListeners: {
                        "isActive": {
                            listener: "gpii.metadata.feedback.updateFeedbackModel",
                            args: ["{change}.value", "dislike", "{bindMatchConfirmation}", "{feedback}"],
                            excludeSource: "init"
                        }
                    },
                    listeners: {
                        "afterButtonClicked.escalateToParent": {
                            listener: "{feedback}.events.afterMismatchDetailsButtonClicked.fire",
                            priority: "last"
                        }
                    },
                    invokers: {
                        closeDialog: "{feedback}.closeDialog"
                    },
                    renderDialogContentOptions: {
                        model: {
                            notInteresting: "{feedback}.model.userData.notInteresting",
                            other: "{feedback}.model.userData.other",
                            otherFeedback: "{feedback}.model.userData.otherFeedback",
                            text: "{feedback}.model.userData.requests.text",
                            transcripts: "{feedback}.model.userData.requests.transcripts",
                            audio: "{feedback}.model.userData.requests.audio",
                            audioDesc: "{feedback}.model.userData.requests.audioDesc"
                        },
                        listeners: {
                            "onSkip.escalateToParent": {
                                listener: "{feedback}.events.onSkipAtMismatchDetails.fire",
                                priority: "last"
                            },
                            "onSubmit.escalateToParent": {
                                listener: "{feedback}.events.onSubmitAtMismatchDetails.fire",
                                priority: "last"
                            },
                            "onSubmit.save": "{feedback}.save"
                        }
                    }
                }
            },
            tooltip: {
                type: "gpii.metadata.feedback.tooltip",
                container: "{feedback}.container",
                createOnEvent: "onPrepReady",
                options: {
                    styles: {
                        openIndicator: "{feedback}.options.styles.openIndicator"
                    },
                    selectorsMap: {
                        "matchConfirmationIcon": {
                            label: "matchConfirmationLabel",
                            selectorForIndicatorStyle: "matchConfirmationButton"
                        },
                        "mismatchDetailsIcon": {
                            label: "mismatchDetailsLabel",
                            selectorForIndicatorStyle: "mismatchDetailsButton"
                        }
                    },
                    modelListeners: {
                        isTooltipOpen: [{
                            // TO-DO: to be replaced by model relay once fluid.tooltip becomes a relay component
                            listener: "{feedback}.applier.change",
                            args: ["isTooltipOpen", "{change}.value"]
                        }, {
                            listener: "fluid.identity",
                            namespace: "handleOpenIndicator"
                        }]
                    },
                    selectors: "{feedback}.options.selectors",
                    strings: "{feedback}.options.strings"
                }
            },
            dataSource: {
                type: "gpii.pouchdb.dataSource",
                options: {
                    databaseName: "{feedback}.databaseName"
                }
            }
        },
        databaseName: "feedback",
        strings: {
            matchConfirmationLabel: "I like this article, match me with similar content.",
            mismatchDetailsLabel: "I don't like this article, request improvements.",
            requestLabel: "Request improvements to the content."
        },
        styles: {
            container: "gpii-feedback",
            active: "gpii-icon-active",
            openIndicator: "gpii-icon-arrow"
        },
        selectors: {
            matchConfirmationButton: ".gpiic-matchConfirmation-button",
            matchConfirmationIcon: "#gpiic-matchConfirmation-icon",
            mismatchDetailsButton: ".gpiic-mismatchDetails-button",
            mismatchDetailsIcon: "#gpiic-mismatchDetails-icon"
        },
        model: {
            userData: {},
            inTransit: {
                opinion: ["none"]   // Possible values: like, dislike, none
            },
            isDialogOpen: false,
            isTooltipOpen: false
        },
        modelListeners: {
            isTooltipOpen: {
                listener: "gpii.metadata.feedback.tooltipDialogInteraction",
                args: ["{that}", "{change}.value"],
                excludeSource: "init"
            }
        },
        modelRelay: [{
            source: "{that}.model.inTransit.opinion",
            target: "{that}.model",
            forward: "liveOnly",
            singleTransform: {
                type: "fluid.transforms.arrayToSetMembership",
                options: {
                    "like": "userData.match",
                    "dislike": "userData.mismatch",
                    "none": "inTransit.none"
                }
            }
        }],
        events: {
            onDialogInited: null,
            onFeedbackMarkupReady: null,
            onPrepReady: {
                events: {
                    onDialogInited: "onDialogInited",
                    onFeedbackMarkupReady: "onFeedbackMarkupReady"
                }
            },
            afterMatchConfirmationButtonClicked: null,
            afterMismatchDetailsButtonClicked: null,
            onSkipAtMismatchDetails: null,
            onSubmitAtMismatchDetails: null,
            onSave: null,
            afterSave: null
        },
        listeners: {
            "onCreate.addContainerClass": {
                "this": "{that}.container",
                "method": "addClass",
                "args": "{that}.options.styles.container"
            },
            "onCreate.appendMarkup": {
                "this": "{that}.container",
                "method": "append",
                "args": "{that}.options.resources.template.resourceText",
                "priority": "first"
            },
            "onCreate.onFeedbackMarkupReady": {
                "func": "{that}.events.onFeedbackMarkupReady",
                "args": "{that}",
                "priority": "last"
            },
            "afterDialogOpen.closeTooltip": {
                "this": "{tooltip}",
                method: "close"
            }
        },
        invokers: {
            save: {
                funcName: "gpii.metadata.feedback.save",
                args: ["{that}", "{dataSource}"]
            },
            isShareTarget: {
                funcName: "gpii.metadata.feedback.isShareTarget",
                args: ["{that}"]
            }
        }
    });

    gpii.metadata.feedback.getDbName = function (databaseName) {
        return databaseName ? databaseName : "feedback";
    };

    gpii.metadata.feedback.updateFeedbackModel = function (isActive, mappedToActiveValue, partner, feedback) {
        if (isActive) {
            feedback.applier.change("inTransit.opinion.0", mappedToActiveValue);
            if (partner.model.isActive) {
                partner.applier.change("isActive", false);
            }
        } else if (!partner.model.isActive) {
            feedback.applier.change("inTransit.opinion.0", "none");
        }
        feedback.save();
    };

    gpii.metadata.feedback.isShareTarget = function (that) {
        var dialogOpener = that.getDialogOpener();
        if (dialogOpener && dialogOpener[0] === $(that.tooltip.tooltipOpener)[0]) {
            return true;
        }
        return false;
    };

    gpii.metadata.feedback.tooltipDialogInteraction = function (that, isTooltipOpen) {
        $(that.tooltip.tooltipOpener)[isTooltipOpen ? "addClass" : "removeClass"](that.options.styles.openIndicator);

        var dialogOpener = that.getDialogOpener();
        var isShareTarget = that.isShareTarget();

        if (isTooltipOpen && that.model.isDialogOpen && isShareTarget) {
            // If both dialog and tooltip are open for the same button, close the tooltip
            that.tooltip.close();
        } else if (isTooltipOpen && that.model.isDialogOpen && !isShareTarget) {
            // If both dialog and tooltip are open for different buttons, only show the arrow pointer for the tooltip
            dialogOpener.removeClass(that.options.styles.openIndicator);
        } else if (!isTooltipOpen && that.model.isDialogOpen) {
            // When the tooltip is closed but the dialog for another button is still shown, add the arrow pointer back to the dialog
            dialogOpener.addClass(that.options.styles.openIndicator);
        }
    };

    gpii.metadata.feedback.save = function (that, dataSource) {
        var dataToSave = {
            id: that.userID,
            model: that.model.userData
        };

        that.events.onSave.fire(dataToSave);

        dataSource.set(dataToSave, function () {
            that.events.afterSave.fire(dataToSave);
        });
    };

    /*
     * Defines common configs shared by all feedback buttons for linking up with the parent feedback component
     */

    fluid.defaults("gpii.metadata.feedback.buttonConfig", {
        gradeNames: ["fluid.standardRelayComponent", "autoInit"],
        dialogContainer: "{feedback}.dialogContainer",
        styles: {
            active: "{feedback}.options.styles.active"
        },
        listeners: {
            "onCreate.addAriaControls": {
                "this": "{that}.container",
                method: "attr",
                args: ["aria-controls", "{feedback}.getDialogId"]
            }
        }
    });

})(jQuery, fluid);
