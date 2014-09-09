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

    fluid.defaults("gpii.metadata.feedback.dialog", {
        gradeNames: ["fluid.viewRelayComponent", "autoInit"],
        members: {
            dialogContainer: null,
            dialog: null
        },
        markup: {
            dialog: "<section>&nbsp;</section>"
        },
        styles: {
            openIndicator: "gpii-icon-arrow"
        },
        commonDialogOptions: {
            closeOnEscape: true,
            autoOpen: false,
            minHeight: 0,
            resizable: false,
            width: 450,
            dialogClass: "gpii-feedback-noClose gpii-feedback-dialog"
        },
        model: {
            isDialogOpen: false
        },
        modelListeners: {
            // passing in invokers directly to ensure they are resolved at the correct time.
            "isDialogOpen": {
                listener: "gpii.metadata.feedback.handleDialogState",
                args: ["{that}", "{change}.value", "{that}.closeDialog", "{that}.bindIframeClick", "{that}.unbindIframeClick"]
            }
        },
        events: {
            onDialogInited: null,
            afterDialogOpen: null,   // arguments: that, event.target, event
            afterDialogClose: null   // arguments: that, event.target, event
        },
        listeners: {
            "onCreate.createDialog": {
                listener: "gpii.metadata.feedback.createDialog",
                args: ["{that}"]
            },
            "afterDialogOpen.addOpenIndicator": {
                listener: "gpii.metadata.feedback.dialog.addOpenIndicator",
                args: ["{that}"]
            },
            "afterDialogClose.removeOpenIndicator": {
                listener: "gpii.metadata.feedback.dialog.removeOpenIndicator",
                args: ["{that}"]
            }
        },
        invokers: {
            closeDialog: {
                "this": "{that}.dialog",
                method: "dialog",
                args: ["close"]
            },
            bindIframeClick: {
                funcName: "gpii.metadata.feedback.bindIframeClick",
                args: ["{that}.closeDialog"]
            },
            unbindIframeClick: "gpii.metadata.feedback.unbindIframeClick",
            getDialogOpener: {
                funcName: "gpii.metadata.feedback.getDialogOpener",
                args: ["{that}.dialogContainer"]
            }
        }
    });

    gpii.metadata.feedback.createDialog = function (that) {
        that.dialogContainer = $(that.options.markup.dialog).hide();
        that.container.append(that.dialogContainer);

        var moreOptions = {
            open: function (event) {
                that.applier.change("isDialogOpen", true);
                that.events.afterDialogOpen.fire(that, fluid.resolveEventTarget(event), event);
            },
            close: function (event) {
                that.applier.change("isDialogOpen", false);
                that.events.afterDialogClose.fire(that, fluid.resolveEventTarget(event), event);
            }
        };

        var fullOptions = $.extend(true, moreOptions, that.options.commonDialogOptions);

        that.dialog = that.dialogContainer.dialog(fullOptions);
        that.events.onDialogInited.fire(that.dialogContainer);
    };

    gpii.metadata.feedback.handleDialogState = function (that, isDialogOpen, closeDialogFn, bindIframeClickFn, unbindIframeClickFn) {
        var dialog = that.dialog;

        if (isDialogOpen) {
            bindIframeClickFn();
            fluid.globalDismissal({
                dialog: dialog
            }, closeDialogFn);
        } else {
            // manually unbind fluid.globalDismissal; particularly for cases where the dialog is closed without a click outside the component.
            if (dialog) {
                fluid.globalDismissal({
                    dialog: dialog
                }, null);
            }
            unbindIframeClickFn();
        }
    };

    gpii.metadata.feedback.getIframes = function () {
        return $("body").find("iframe").contents().find("body");
    };

    gpii.metadata.feedback.bindIframeClick = function (closeDialogFunc) {
        var iframes = gpii.metadata.feedback.getIframes();
        iframes.on("click.closeDialog", function () {
            closeDialogFunc();
        });
    };

    gpii.metadata.feedback.unbindIframeClick = function () {
        var iframes = gpii.metadata.feedback.getIframes();
        iframes.off("click.closeDialog");
    };

    gpii.metadata.feedback.getDialogOpener = function (dialogContainer) {
        return dialogContainer.data("opener");
    };

    gpii.metadata.feedback.dialog.addOpenIndicator = function (that) {
        that.getDialogOpener().addClass(that.options.styles.openIndicator);
    };

    gpii.metadata.feedback.dialog.removeOpenIndicator = function (that) {
        that.getDialogOpener().removeClass(that.options.styles.openIndicator);
    };

})(jQuery, fluid);