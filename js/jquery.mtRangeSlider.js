/* =======================================================================
 * jquery.mtRangeSlider.js
 * Version: 1.1
 * Date: 2016/08/25
 * By: Rich DeBourke
 * License: MIT
 * GitHub: https://github.com/RichDeBourke/mouse-touch-range-slider
 * ======================================================================= */

(function ($, document, window) {
    "use strict";

    var plugin_count = 0,
        MouseTouchRangeSlider;

    /**
     * Main plugin constructor
     *
     * @param input {Object} link to the input element
     * @param options {Object} slider config
     * @param plugin_count {Number}
     * @constructor
     */
    MouseTouchRangeSlider = function (input, options, plugin_count) {
        var config;

        this.VERSION = "1.0";
        this.source_input = input;
        this.tabindex = $(input).prop("tabindex");
        this.plugin_count = plugin_count;
        this.current_plugin = 0;
        this.is_dragging = false;
        this.is_active = false;

        // cache of jQuery objects for accessing DOM elements
        this.$cache = {
            win: $(window),
            body: $(document.body),
            source_input: $(input),
            rs_container: null,
            track: null,
            slider: null
        };

        // storage for measurement variables
        this.coords = {
            containerWidth: 0, // Width of the span with the unique plugin ID
            sliderWidth: 0, // Width of the handle
            containerLeftOffset: 0, // Distance from the left side of the window to the container (for mouse positioning)
            containerTravelPixels: 0, // # of pixels for traveling
            containerTravelPercentage: 0, // % of the container for traveling
            fullRange: 0, // How many steps
            oneStepPixels: 0, // How many pixels represent one step (usually a fraction of a pixel)
            oneStepPercentage: 0, // % of the container travel distance representing one step
            absolutePixelPointer: 0, // Pixel distance to the left side of slider for the current value
            fuzzyPixelPointer: 0 // Distance from left side to where the mouse was first clicked on the slider
        };

        // default config
        config = {
            min: 0,
            max: 100,
            step: 1,
            initialValue: 0,
            keyboard: true,
            onCreate: null,
            onStart: null,
            onChange: null,
            onFinish: null
        };

        // extends default config
        $.extend(config, options);

        // data config extends config
        this.options = config;

        // default result object, returned to callbacks
        this.result = {
            input: this.$cache.source_input,
            id: this.$cache.source_input.attr("id"),
            min: this.options.min,
            max: this.options.max,
            value: this.options.initialValue // value will be updated as the slider is moved
        };

        this.init();
    };

    MouseTouchRangeSlider.prototype = {
        /**
         * Start the plugin instance
         */
        init: function () {
            var container_html = '<span class="rs rs-' + this.plugin_count + '"></span>',
                rangeSlider_html = '<span class="rs-track" tabindex="-1"></span>' + // FYI - having the tabindex made the span focusable
                    '<span class="rs-slider single" tabindex="' + this.tabindex + '"></span>';

            this.$cache.source_input.prop("value", 0); // initialize the value so the startup is consistent
            this.$cache.source_input.before(container_html);
            this.$cache.rs_container = this.$cache.source_input.prev();
            this.$cache.rs_container.html(rangeSlider_html);
            this.$cache.track = this.$cache.rs_container.find(".rs-track");
            this.$cache.slider = this.$cache.rs_container.find(".rs-slider");

            this.$cache.source_input.prop("readonly", true);
            this.$cache.source_input.addClass("rs-hidden-input").attr('tabindex', '-1');

            this.setOrUpdateLayoutPercentages();

            // Note - .bind as used below is the JavaScript bind that creates a bound function (it's not the jQuery .bind)
            this.$cache.track.on("touchstart.rs_" + this.plugin_count + " mousedown.rs_" + this.plugin_count,                  this.pointerClick.bind(this));
            this.$cache.slider.on("touchstart.rs_" + this.plugin_count + " mousedown.rs_" + this.plugin_count, this.pointerDown.bind(this));
            this.$cache.slider.on("focus.rs_" + this.plugin_count, this.focused.bind(this));
            this.$cache.win.on("resize.rs_" + this.plugin_count, this.windowResize.bind(this));

            if (this.options.keyboard) {
                this.$cache.track.on("keydown.rs_" + this.plugin_count, this.keyBoard.bind(this));
                this.$cache.slider.on("keydown.rs_" + this.plugin_count, this.keyBoard.bind(this));
            }

            // Set the requested initial position
            this.$cache.source_input.prop("value", this.options.initialValue);
            this.$cache.slider[0].style.left = this.options.initialValue * this.coords.oneStepPercentage + "%";

            this.coords.absolutePixelPointer = this.options.initialValue * this.coords.oneStepPixels;
            this.result.value = this.options.initialValue;

            this.callOnCreate();
        },

        setOrUpdateLayoutPercentages: function () {
            this.coords.containerWidth = this.$cache.rs_container.outerWidth(false);
            this.coords.sliderWidth = this.$cache.slider.outerWidth(false);
            this.coords.containerLeftOffset = this.$cache.rs_container.offset().left;
            this.coords.containerTravelPixels = this.coords.containerWidth - this.coords.sliderWidth;
            this.coords.containerTravelPercentage = (this.coords.containerWidth - this.coords.sliderWidth) / this.coords.containerWidth * 100;
            this.coords.fullRange = this.options.max - this.options.min;
            this.coords.oneStepPixels = this.coords.containerTravelPixels / this.coords.fullRange;
            this.coords.oneStepPercentage = this.coords.containerTravelPercentage / this.coords.fullRange;
            this.coords.absolutePixelPointer = parseInt(this.$cache.source_input.prop("value"), 10) * this.coords.oneStepPixels;
        },

        /**
         * Mousemove or touchmove
         * @param e {Object} event object
         */
        pointerMove: function (e) {
            var x,
                currentDragDistance,
                currentPosition,
                currentValue,
                sliderPosition;

            if (!this.is_dragging) {
                window.alert("is_dragging - pointerMove");
                return;
            }

            x = e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX);
            if (x === undefined) {
                return;
            }
            currentDragDistance = x - this.coords.containerLeftOffset - this.coords.fuzzyPixelPointer;
            currentPosition = currentDragDistance + this.coords.absolutePixelPointer;
            currentValue = Math.round(currentPosition / this.coords.oneStepPixels);

            if (currentValue < this.options.min) {
                currentValue = this.options.min;
            } else if (currentValue > this.options.max) {
                currentValue = this.options.max;
            }

            sliderPosition = currentValue * this.coords.oneStepPercentage + "%";

            this.$cache.source_input.prop("value", currentValue);
            this.$cache.slider[0].style.left = sliderPosition;

            this.result.value = currentValue;

            this.callOnChange();
        },

        /**
         * Mouseup or touchend
         * @param e {Object} event object
         */
        pointerUp: function (e) {
            e.preventDefault();

            if (this.current_plugin !== this.plugin_count) {
                window.alert("wrong plugin error - pointerUp");
                return;
            }

            if (this.is_active) {
                this.is_active = false;
            } else {
                //window.alert("is_active error - pointerUp");
                return;
            }

            if (!this.is_dragging) {
                window.alert("is_dragging error - pointerUp");
                return;
            }

            this.coords.absolutePixelPointer = parseInt(this.$cache.source_input.prop("value")) * this.coords.oneStepPixels;
            this.result.value = parseInt(this.$cache.source_input.prop("value"));

            this.callOnChange();

            this.$cache.body.off("touchmove.rs_" + this.plugin_count + " mousemove.rs_" + this.plugin_count);

            this.$cache.body.off("touchend.rs_" + this.plugin_count + " mouseup.rs_" + this.plugin_count);

            this.$cache.body.removeClass("slider-dragging");

            this.is_dragging = false;
            this.$cache.slider.trigger("focus");

            // callbacks call
            this.callOnFinish();
        },

        /**
         * Mousedown or touchstart
         * @param e {Object} event object
         */
        pointerDown: function (e) {
            var x;

            if (e.button === 1 || e.button === 2) { // Only drag if the left button was clicked (on a right handed mouse)
                return;
            }
            e.preventDefault();

            this.$cache.body.on("touchmove.rs_" + this.plugin_count + " mousemove.rs_" + this.plugin_count, this.pointerMove.bind(this));

            this.$cache.body.on("touchend.rs_" + this.plugin_count + " mouseup.rs_" + this.plugin_count, this.pointerUp.bind(this));

            x = e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX);

            this.current_plugin = this.plugin_count;

            this.is_active = true;
            this.is_dragging = true;

            this.coords.fuzzyPixelPointer = x - this.coords.containerLeftOffset;

            this.$cache.body.addClass("slider-dragging");
            this.$cache.slider.trigger("focus");

            this.callOnStart();
        },

        /**
         * Mousedown or touchstart for track
         * @param e {Object} event object
         */
        pointerClick: function (e) {
            var x,
                clickPosition;

            if (e.button === 1 || e.button === 2) {
                return;
            }
            e.preventDefault();
            x = e.pageX || (e.originalEvent.touches && e.originalEvent.touches[0].pageX);

            // if the track is clicked, figure out if the click is towards the left or right
            // of the slider, and then move one position in that direction

            this.current_plugin = this.plugin_count;
            clickPosition = x - this.coords.containerLeftOffset;

            if (clickPosition < this.coords.absolutePixelPointer) { // shift left 1 step
                this.shiftOneStep(false);
            } else { // shift right 1 position
                this.shiftOneStep(true);
            }

            this.$cache.slider.trigger("focus");
        },

        /**
         * Keyboard controls for focused slider
         * @param e {Object} event object
         */
        keyBoard: function (e) {
            if (this.current_plugin !== this.plugin_count || e.altKey || e.ctrlKey || e.shiftKey || e.metaKey) {
                return;
            }
            switch (e.which) {
                case 40: // DOWN
                case 37: // LEFT
                    e.preventDefault();
                    this.shiftOneStep(false);
                    break;

                case 38: // UP
                case 39: // RIGHT
                    e.preventDefault();
                    this.shiftOneStep(true);
                    break;
            }
        },

        /**
         * Move the slider (and value) by one step from a click on the track or arrow key
         * @param direction {boolean} false for left / true for right
         */
        shiftOneStep: function (right) {
            var currentValue = parseInt(this.$cache.source_input.prop("value"), 10);
            if (right) {
                if (currentValue < this.options.max) {
                    currentValue += 1;
                }
            } else {
                if (currentValue > this.options.min) {
                    currentValue -= 1;
                }
            }
            this.$cache.source_input.prop("value", currentValue);
            this.$cache.slider[0].style.left = currentValue * this.coords.oneStepPercentage + "%";
            this.coords.absolutePixelPointer = currentValue * this.coords.oneStepPixels;
            this.result.value = currentValue;
            this.callOnChange();
        },

        focused: function () {
            this.current_plugin = this.plugin_count;
        },

        windowResize: function () {
            this.setOrUpdateLayoutPercentages();
        },


        // =============================================================================================================
        // Callbacks

        // The OnCreate event is called when a slider is created
        callOnCreate: function () {
            if (this.options.onCreate && typeof this.options.onCreate === "function") {
                this.options.onCreate(this.result);
            }
        },
        // The OnStar event is called when a
        callOnStart: function () {
            if (this.options.onStart && typeof this.options.onStart === "function") {
                this.options.onStart(this.result);
            }
        },
        // The OnChange event is called when there is a pointerMove, a pointerUp, or a shiftOneStep event
        // If the value or position is changed programatically, there is no OnChange event
        callOnChange: function () {
            if (this.options.onChange && typeof this.options.onChange === "function") {
                this.options.onChange(this.result);
            }
        },
        // pointerUp
        callOnFinish: function () {
            if (this.options.onFinish && typeof this.options.onFinish === "function") {
                this.options.onFinish(this.result);
            }
        },


        // =============================================================================================================
        // Public methods

        update: function (value) {
            if (!this.source_input) {
                return;
            }
            if (typeof value === "string") {
                value = parseInt(value, 10);
            }
            // Set the requested position
            this.$cache.source_input.prop("value", value);
            this.$cache.slider[0].style.left = value * this.coords.oneStepPercentage + "%";

            this.coords.absolutePixelPointer = value * this.coords.oneStepPixels;
        }
    };

    $.fn.mtRangeSlider = function (options) {
        return this.each(function () {
            if (!$.data(this, "mtRangeSlider")) {
                $.data(this, "mtRangeSlider", new MouseTouchRangeSlider(this, options, plugin_count++));
            }
        });
    };

} (jQuery, document, window));
