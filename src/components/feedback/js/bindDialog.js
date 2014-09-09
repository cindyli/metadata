/*

Copyright 2014 OCAD University

Licensed under the Educational Community License (ECL), Version 2.0 or the New
BSD license. You may not use this file except in compliance with one these
Licenses.

You may obtain a copy of the ECL 2.0 License and BSD License at
https://github.com/fluid-project/infusion/raw/master/Infusion-LICENSE.txt
*/

var gpii = gpii || {};

(function ($, fluid) {

    /**
     * "gpii.metadata.feedback.bindDialog" is a view component that accepts a "button" container. The click on the container triggers following steps:
     *
     * 1. Close the dialog if the dialog is opened. Otherwise, fire onRenderDialogContent to render the dialog content into that.options.dialogContainer;
     *    The actual component for "renderDialogContent" MUST be provided by integrators thru these options "panelType" and "renderDialogContent"
     *    "panelType": The grade renderer component for the subcomponent "renderDialogContent" that creates the dialog content
     *    "renderDialogContent": Options to be pass into the subcomponent "renderDialogContent"
     * 2. When the dialog content is rendered, fire onDialogContentReady;
     * 3. Then, position the dialog and fire onDialogReady;
     * 4. At last, open the dialog.
     *
     * Note: every click on the bindDialog button container triggers re-rendering of the dialog content with onRenderDialogContent being fired.
     **/

    "use strict";

    fluid.registerNamespace("gpii.metadata.feedback");

    fluid.defaults("gpii.metadata.feedback.modelToClass", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        modelToClass: {},
        listeners: {
            "onCreate.setModelListeners": {
                listener: "gpii.metadata.feedback.modelToClass.bind",
                args: ["{that}"]
            }
        }
    });

    gpii.metadata.feedback.modelToClass.bind = function (that) {
        fluid.each(that.options.modelToClass, function (style, modelPath) {
            that.applier.modelChanged.addListener(modelPath, function (value) {
                that.container.toggleClass(fluid.get(that.options.styles, style), value);
            });
        });
    };

    fluid.defaults("gpii.metadata.feedback.trackFocus", {
        gradeNames: ["gpii.metadata.feedback.modelToClass", "autoInit"],
        model: {
            isFocused: {}
        },
        listeners: {
            "onCreate.trackFocus": {
                listener: "gpii.metadata.feedback.bindUIState",
                args: ["{that}", "isFocused", "focus", "blur"]
            }
        }
    });

    fluid.defaults("gpii.metadata.feedback.trackBlur", {
        gradeNames: ["gpii.metadata.feedback.modelToClass", "autoInit"],
        model: {
            isHovered: {}
        },
        listeners: {
            "onCreate.trackBlur": {
                listener: "gpii.metadata.feedback.bindUIState",
                args: ["{that}", "isHovered", "mouseover", "mouseleave"]
            }
        }
    });

    gpii.metadata.feedback.bindUIState = function (that, modelPath, onEvent, offEvent) {
        fluid.each(fluid.get(that.model, modelPath), function (state, selector) {
            var elm = selector === "container" ? that.container : that.locate(selector);
            elm.on(onEvent, function () {
                that.applier.change([modelPath, selector], true);
            });
            elm.on(offEvent, function () {
                that.applier.change([modelPath, selector], false);
            });
        });
    };

    fluid.defaults("gpii.metadata.feedback.bindDialog", {
        gradeNames: ["fluid.viewRelayComponent", "gpii.metadata.feedback.trackFocus", "gpii.metadata.feedback.trackBlur", "autoInit"],
        components: {
            renderDialogContent: {
                type: "fluid.rendererRelayComponent",
                createOnEvent: "onRenderDialogContent",
                container: "{bindDialog}.options.dialogContainer",
                options: {
                    gradeNames: ["{that}.options.panelType"]
                }
            }
        },
        members: {
            dialog: null,
            dialogContainer: null
        },
        selectors: {
            icon: ".gpiic-icon"   // need to be supplied for applying hover and focus stylings.
        },
        strings: {
            buttonLabel: null
        },
        styles: {
            active: "gpii-icon-active",
            openIndicator: "gpii-icon-arrow",
            focus: "gpii-feedback-buttonFocus",
            hover: "gpii-feedback-buttonHover"
        },
        dialogPosition: {
            my: "center top",
            at: "center-10% bottom+42%",
            of: "{that}.container"
        },
        events: {
            onRenderDialogContent: null,
            onDialogContentReady: null,
            onDialogReady: null,
            afterButtonClicked: null
        },
        listeners: {
            "onCreate.addAriaRole": {
                "this": "{that}.container",
                method: "attr",
                args: ["role", "button"]
            },
            "onCreate.addAriaLabel": {
                "this": "{that}.container",
                method: "attr",
                args: ["aria-label", "{that}.options.strings.buttonLabel"]
            },
            "onCreate.bindButtonClick": {
                "this": "{that}.container",
                method: "click",
                args: "{that}.bindButton"
            },
            "onCreate.bindKeyboard": {
                listener: "fluid.activatable",
                args: ["{that}.container", "{that}.bindButton"]
            },
            "onDialogContentReady.positionDialog": "{that}.positionDialog",
            "onDialogReady.openDialog": "{that}.openDialog"
        },
        model: {
            isActive: false,    // Keep track of the active state of the button
            isFocused: {
                icon: false
            },
            isHovered: {
                icon: false
            }
        },
        /*
         * Used by the gpii.metadata.feedback.modelToClass to add/remove the
         * style on the rhs based on the value of the model path from the lhs
         */
        modelToClass: {
            "isFocused.icon": "focus",
            "isHovered.icon": "hover"
        },
        modelListeners: {
            "isActive": [
                "gpii.metadata.feedback.handleActiveState({change}.value, {that}.container, {that}.options.styles.active)",
                "gpii.metadata.feedback.controlDialogState({change}.value, {that})"
            ]
        },
        invokers: {
            bindButton: {
                funcName: "gpii.metadata.feedback.bindButton",
                args: ["{that}", "{arguments}.0"]
            },
            positionDialog: {
                funcName: "gpii.metadata.feedback.positionDialog",
                args: ["{that}"]
            },
            openDialog: {
                funcName: "gpii.metadata.feedback.openDialog",
                args: ["{that}.options.dialogContainer", "{that}.container"]
            },
            renderDialog: {
                funcName: "gpii.metadata.feedback.renderDialog",
                args: ["{that}"]
            }
        },
        distributeOptions: [{
            source: "{that}.options.panelType",
            removeSource: true,
            target: "{that > renderDialogContent}.options.panelType"
        }, {
            source: "{that}.options.renderDialogContentOptions",
            removeSource: true,
            target: "{that > renderDialogContent}.options"
        }]
    });

    fluid.invokeLater = function (callback) {
        return setTimeout(callback, 1);
    };

    gpii.metadata.feedback.bindButton = function (that, event) {
        event.preventDefault();

        // fluid.invokeLater() is a work-around for the issue that clicking on the button opens up
        // the corresponding dialog that is closed immediately by fluid.globalDismissal(), see
        // dialog.js for gpii.metadata.feedback.handleDialogState(). This issue is because
        // globalDismissal() relies on a global document click handler. Given the "bubble up"
        // architecture of these events, it is the case that the global dismissal handler will always
        // be notified strictly after any click handler which is used to arm it. Using setTimeout()
        // is to ensure the previous dialog is closed by the globalDismissal() before binding the
        // click event handler for the next button.
        fluid.invokeLater(function () {
            that.applier.change("isActive", !that.model.isActive);
            that.events.afterButtonClicked.fire();
        });
    };

    gpii.metadata.feedback.controlDialogState = function (isActive, that) {
        if (isActive) {
            that.events.onRenderDialogContent.fire();
        }
    };

    gpii.metadata.feedback.positionDialog = function (that) {
        that.dialog = that.options.dialogContainer.dialog("option", "position", that.options.dialogPosition);
        that.events.onDialogReady.fire(that.dialog);
    };

    gpii.metadata.feedback.openDialog = function (dialog, openerContainer) {
        dialog.data("opener", openerContainer).dialog("open");
    };

    gpii.metadata.feedback.handleActiveState = function (isActive, buttonDom, activeCss) {
        buttonDom.toggleClass(activeCss, isActive);
        buttonDom.attr("aria-pressed", isActive);
    };

})(jQuery, fluid);
