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
                    listeners: {
                        afterOpen: "{feedback}.events.afterTooltipOpen",
                        afterClose: "{feedback}.events.afterTooltipClose",
                        "afterClose.removeOpenIndicator": {
                            listener: "fluid.identity"
                        }
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
            isDialogOpen: false
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
            afterSave: null,
            afterTooltipOpen: null,
            afterTooltipClose: null
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
            },
            "afterTooltipOpen.determineIfOpenTooltip": {
                listener: "gpii.metadata.feedback.determineIfOpenTooltip",
                args: ["{that}", "{tooltip}", "{arguments}.1"]
            },
            "afterTooltipOpen.removeOpenIndicatorFromDialog": {
                listener: "gpii.metadata.feedback.removeOpenIndicatorFromDialog",
                args: ["{that}", "{arguments}.1"]
            },
            "afterTooltipClose.removeOpenIndicator": {
                listener: "gpii.metadata.feedback.removeOpenIndicatorForTooltip",
                args: ["{that}", "{arguments}.1", "{arguments}.3"]
            }
        },
        invokers: {
            save: {
                funcName: "gpii.metadata.feedback.save",
                args: ["{that}", "{dataSource}"]
            },
            isTooltipDialogShareSameTarget: {
                funcName: "gpii.metadata.feedback.isTooltipDialogShareSameTarget",
                args: ["{that}", "{arguments}.0"]
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
            feedback.save();
        } else if (!partner.model.isActive) {
            feedback.applier.change("inTransit.opinion.0", "none");
        }
    };

    gpii.metadata.feedback.isTooltipDialogShareSameTarget = function (that, tooltipTarget) {
        var dialogOpener = that.getDialogOpener();
        if (dialogOpener && $.contains(dialogOpener[0], tooltipTarget)) {
            return true;
        }
        return false;
    };

    gpii.metadata.feedback.determineIfOpenTooltip = function (that, tooltip, tooltipTarget) {
        // Prevent the tooltip from opening if the dialog for the source button already opens
        if (that.model.isDialogOpen && that.isTooltipDialogShareSameTarget(tooltipTarget)) {
            tooltip.close();
        }
    };

    gpii.metadata.feedback.removeOpenIndicatorFromDialog = function (that, tooltipTarget) {
        // Make sure only one open indicator is shown at a time. If hoving over a button opens
        // a tooltip meanwhile a dialog is already open, remove the open indicator for the dialog
        // so only show the indicator for the tooltip.
        if (that.model.isDialogOpen && !that.isTooltipDialogShareSameTarget(tooltipTarget)) {
            var dialogOpener = that.getDialogOpener();
            dialogOpener.removeClass(that.options.styles.openIndicator);
        }
    };

    gpii.metadata.feedback.removeOpenIndicatorForTooltip = function (that, tooltipTarget, event) {
        // don't remove the open indicator if the dialog for the same button is at open state
        if (!that.model.isDialogOpen || (that.model.isDialogOpen && !that.isTooltipDialogShareSameTarget(tooltipTarget))) {
            var selectorForIndicatorStyle = that.tooltip.findElmForIndicatorStyle(tooltipTarget.id, event);
            $(selectorForIndicatorStyle).removeClass(that.options.styles.openIndicator);
        }
        // Place back the open indicator for the opened dialog
        if (that.model.isDialogOpen) {
            var dialogOpener = that.getDialogOpener();
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
        },
        invokers: {
            setDialogOpener: "{feedback}.setDialogOpener"
        }
    });

})(jQuery, fluid);
