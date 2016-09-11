/* =======================================================================
 * cjkWrap.js
 * Version: 2.0
 * Date: 2016/02/18
 * By: Rich DeBourke
 * License: MIT
 *
 * Simple JavaScript plugin for wrapping Korean text in span tags
 *
 * The original version used jQuery, but to avoid loading a separate 80K file,
 * I rewrote the plugin to use straight JavaScript.
 *
 * Collect all of the sections that are
 * designated as having Korean text (by using a common class). Each word
 * group is wrapped in a span tag. The span tags should be formatted to:
 * white-space: nowrap; will keep Korean words from splitting across lines.
 *
 * Note: I'm using the trim function to get rid of
 * leading and trailing spaces (which also deletes &nbsp; as
 * well). If your page uses spaces for text alignment, the
 * trim function will affect the text layout.
 * ======================================================================= */

(function (document, window) {
    "use strict";

    var cjkWrap = function (classname) {
        var i, j, element, elements, newElement, endPoint, subString;

        elements = document.getElementsByClassName(classname);

        for (i = 0; i < elements.length; i++) {
            j = 0;
            newElement = "";
            element = elements[i].innerHTML;
            element = element.trim();
            while (j < element.length) {
                if (element.charAt(j) === "<") {
                    endPoint = element.indexOf(">", j + 1) + 1;
                    newElement += element.substring(j, endPoint);
                    j = endPoint;
                } else if (element.charAt(j) === " ") {
                    newElement += " ";
                    j += 1;
                } else {
                    subString = element.substring(j);
                    endPoint = subString.search(/\s|</);
                    newElement += "<span class=\"cjk-wrap\">" + ((endPoint > -1) ? element.substring(j, j + endPoint) : element.substring(j)) + "</span>";
                    j = (endPoint > -1) ? j + endPoint : element.length;
                }
            }
            elements[i].innerHTML = newElement;
        }
    };

    // If the browser is IE8 or older, chkWrap will not create
    // the wrap function as older Internet Explorers do not
    // support the getElementsByClassName (and trim) functions
    // used in the plugin.
    if (typeof document.getElementsByClassName === "function") {
        window.cjkWrap = cjkWrap;
    }

}(document, window));
