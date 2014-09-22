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
     * The tooltip shared by all buttons on the feedback toolbar.
     *
     * Example structure for the option "selectorsMap":
     * selectorsMap: {
     *     "matchConfirmationIcon": {   // The "a" link for showing the content
     *         label: "matchConfirmationLabel",   // that.options.strings.matchConfirmationLabel contains the tooltip content
     *         selectorForIndicatorStyle: "matchConfirmationButton"  // that.options.selectors.matchConfirmationButton is the selector to apply "openIndicator" style
     *     },
     *     "mismatchDetailsIcon": {
     *         ...
     *     }
     * }
     */
    fluid.defaults("gpii.metadata.feedback.tooltip", {
        gradeNames: ["fluid.tooltip", "autoInit"],
        members: {
            // Tooltips are attached with <a> links, while due to the styling restriction, the arrow pointer css needs to be applied
            // (or removed) from outer button containers of <a> links. When a tooltip is closed or open, the corresponding button
            // contain is looked up via this map for adding, or removing, the arrow pointer.
            // idToOpener is the mapping between the <a> selectors and button selectors.
            idToOpener: null
        },
        styles: {
            tooltip: "gpii-feedback-tooltip",
            openIndicator: "gpii-icon-arrow"
        },
        position: {
            my: "center top",
            at: "center-10% bottom+90%"
        },
        delay: 0,
        duration: 0,
        selectorsMap: {}, // need to be supplied, an object containing relationships of icons, buttons and corresponding labels
        selectors: {},    // need to be supplied, contains selectors for icons and buttons
        strings: {},      // need to be supplied, contains strings for tooltip contents
        model: {
            idToContent: {},
            isTooltipOpen: false
        },
        modelListeners: {
            isTooltipOpen: [{
                listener: "gpii.metadata.feedback.setTooltipOpener",
                args: ["{that}", "{change}.value"],
                priority: "first"
            }, {
                listener: "{that}.handleOpenIndicator",
                args: ["{change}.value"],
                excludeSource: "init"
            }]
        },
        listeners: {
            "onCreate.buildIdToContent": {
                listener: "gpii.metadata.feedback.tooltip.initialBuilds",
                args: ["{that}"],
                priority: "first"
            },
            "afterOpen.setModel": {
                changePath: "isTooltipOpen",
                value: true
            },
            "afterClose.setModel": {
                changePath: "isTooltipOpen",
                value: false
            }
        },
        invokers: {
            getSelectorId: {
                funcName: "gpii.metadata.feedback.tooltip.getSelectorId",
                args: ["{that}", "{arguments}.0"]
            },
            findTooltipOpener: {
                funcName: "gpii.metadata.feedback.tooltip.findTooltipOpener",
                args: ["{that}"]
            },
            handleOpenIndicator: {
                funcName: "gpii.metadata.feedback.tooltip.handleOpenIndicator",
                args: ["{that}", "{arguments}.0"]
            }
        }
    });

    gpii.metadata.feedback.tooltip.getSelectorId = function (that, selector) {
        return fluid.allocateSimpleId(that.locate(selector));
    };

    gpii.metadata.feedback.tooltip.initialBuilds = function (that) {
        var idToContent = {};
        var idToOpener = {};

        fluid.each(that.options.selectorsMap, function (infoObject, selector) {
            var iconId = that.getSelectorId(selector);
            if (iconId) {
                fluid.set(idToContent, iconId, that.options.strings[infoObject.label]);
                fluid.set(idToOpener, iconId, that.options.selectors[infoObject.selectorForIndicatorStyle]);
            }
        });
        that.idToOpener = idToOpener;
        that.applier.change("idToContent", idToContent);
    };

    gpii.metadata.feedback.tooltip.findTooltipOpener = function (that) {
        var tooltipOpener;
        fluid.each(that.openIdMap, function (trueValue, id) {
            tooltipOpener = that.idToOpener[id];
        });
        return tooltipOpener;
    };

    gpii.metadata.feedback.setTooltipOpener = function (that, isTooltipOpen) {
        if (isTooltipOpen) {
            that.tooltipOpener = that.findTooltipOpener();
        }
    };

    gpii.metadata.feedback.tooltip.handleOpenIndicator = function (that, isTooltipOpen) {
        $(that.tooltipOpener)[isTooltipOpen ? "addClass" : "removeClass"](that.options.styles.openIndicator);
    };

})(jQuery, fluid);
