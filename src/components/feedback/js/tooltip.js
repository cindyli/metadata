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
            idToContent: {
                expander: {
                    funcName: "gpii.metadata.feedback.tooltip.buildToopTipIdToContent",
                    args: ["{that}.options.selectors", "{that}.options.strings", "{that}.options.selectorsMap"]
                }
            }
        },
        listeners: {
            "afterOpen.addOpenIndicator": "gpii.metadata.feedback.tooltip.addOpenIndicator({that}, {arguments}.1, {arguments}.3)",
            "afterClose.removeOpenIndicator": "gpii.metadata.feedback.tooltip.removeOpenIndicator({that}, {arguments}.1, {arguments}.3)"
        },
        invokers: {
            matchElementInMap: {
                funcName: "gpii.metadata.feedback.tooltip.matchElementInMap",
                args: ["{arguments}.0", "{that}.options.selectorsMap", "{that}.options.selectors"]
            },
            findElmForIndicatorStyle: {
                funcName: "gpii.metadata.feedback.tooltip.findElmForIndicatorStyle",
                args: ["{that}", "{arguments}.0", "{arguments}.1"]
            }
        }
    });

    gpii.metadata.feedback.tooltip.getSelectorName = function (selector) {
        return selector.substring(1, selector.length);
    };

    gpii.metadata.feedback.tooltip.buildToopTipIdToContent = function (selectors, strings, selectorsMap) {
        var idToContent = {};
        fluid.each(selectorsMap, function (infoObject, selector) {
            var selectorValue = selectors[selector];
            var iconName = gpii.metadata.feedback.tooltip.getSelectorName(selectorValue);
            if (iconName) {
                fluid.set(idToContent, iconName, strings[infoObject.label]);
            }
        });
        return idToContent;
    };

    gpii.metadata.feedback.tooltip.matchElementInMap = function (iconName, selectorsMap, selectors) {
        return fluid.find(selectorsMap, function (infoObject, selector) {
            var thisSelectorName = gpii.metadata.feedback.tooltip.getSelectorName(selectors[selector]);
            if (thisSelectorName === iconName) {
                return selectors[infoObject.selectorForIndicatorStyle];
            }
        }, undefined);
    };

    gpii.metadata.feedback.tooltip.findElmForIndicatorStyle = function (that, targetId, event) {
        var elmForTargetId = that.matchElementInMap(targetId);
        return elmForTargetId ? elmForTargetId : that.matchElementInMap(event.currentTarget.id);
    };

    gpii.metadata.feedback.tooltip.addOpenIndicator = function (that, target, event) {
        var selectorForIndicatorStyle = that.findElmForIndicatorStyle(target.id, event);
        $(selectorForIndicatorStyle).addClass(that.options.styles.openIndicator);
    };

    gpii.metadata.feedback.tooltip.removeOpenIndicator = function (that, target, event) {
        var selectorForIndicatorStyle = that.findElmForIndicatorStyle(target.id, event);
        $(selectorForIndicatorStyle).removeClass(that.options.styles.openIndicator);
    };

})(jQuery, fluid);
