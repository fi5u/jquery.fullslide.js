/*
 * jquery.fullslide.js 1.0
 *
 * Copyright 2013, Tommy Fisher http://www.tommyfisher.net
 *
 */

(function($) {
    "use strict";

    $.fn.fullslide = function(options) {


        return this.each(function(i, el) {

            // Declare variables to be used in all functions
            var origSlideQty,

                // Settings
                settings = {
                    moveQty : 1,
                    moveDuration : 1000,
                    moveEasing : "swing",
                    displayQty : 1,
                    slideMargin : 20,
                    minWidth : "",
                    maxWidth : ""
                };

            // Copy user options over
            if( options ) {
                $.extend(settings, options);
            }

            /**
             *  Function to set a timeout for the window resize event
             */
            var waitOnEvent = (function () {
                var timers = {};
                return function (callback, ms, uniqueId) {
                    if (!uniqueId) {
                        uniqueId = "1";
                    }
                    if (timers[uniqueId]) {
                        clearTimeout (timers[uniqueId]);
                    }
                    timers[uniqueId] = setTimeout(callback, ms);
                };
            })();


            /**
             *  Cater for the fact that there are always slides to the left of the
             *  currenly viewed slides. This offsets the ul so that we don't see
             *  the slides to the left.
             */
            var offsetFirstSlide = function() {

                // Declare variables
                var fullslideLi,
                    slideWpx,
                    offset;

                // Get the current state of the slides as the variable fullslideLi
                fullslideLi = $(el).children("li");

                // Get the width in pixels of the slide so we know how much to offset it by
                slideWpx = $(fullslideLi).first().outerWidth();

                // Calculate the offset - we have duplicated all the original slides infront of the viewable slide, so that's how much we offset by, plus margin
                offset = origSlideQty * (slideWpx + settings.slideMargin);

                // Apply the offset
                $(el).css("left", "-" + offset + "px");

            };


            /**
             *  Calculate and set the widths of the slides and the ul container.
             */

            var setWidths = function() {

                // Declare function's variables
                var fullslideLi,
                    slideQty,
                    ulW,
                    ulH,
                    ulWpx,
                    slideWpx,
                    totalM,
                    slideW;

                // Set slide widths
                // reassign fullslideLi var as contents have changed
                fullslideLi = $(el).children("li");

                // Get the current number of slides to work out the width of ul
                slideQty = $(fullslideLi).length;

                // To get the ul width, calculate the percentage from the amount will be shown then
                ulW = (100 / settings.displayQty) * slideQty;

                // Find the height of the li so we can set the height of the ul to prevent wrapping
                ulH = $(fullslideLi).first().outerHeight();

                // Apply the width and the height to the ul
                $(el).css({
                    width : ulW + "%",
                    height : ulH + "px"
                });

                // Set the cell width in %
                slideW = 100 / slideQty;

                // Calculate the width of the ul and slide in px
                ulWpx = $(el).css("width");
                slideWpx = parseInt(ulWpx) / slideQty;

                // Include the margins in with the calculation, if any
                if( settings.slideMargin > 0 ) {

                    // Get the total margin for the whole slideshow
                    totalM = settings.slideMargin * (settings.displayQty - 1);

                    // Calculate width of the slides
                    slideWpx = slideWpx - (totalM / settings.displayQty);

                }

                // Calculate if the min width is exceeded
                if( settings.minWidth ) {

                    if( slideWpx < settings.minWidth ) {

                        // Don't decrement if the current display quantity is 1
                        if( settings.displayQty > 1 ) {
                            --settings.displayQty;

                            // Recall this function with the new display quantity setting
                            setWidths();

                            // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                            return;
                        }
                    // Slide width is bigger than min width
                    // Calculate if another slide could fit in, without making all slides less than min width
                    // AND that we don't display more than one of each
                    } else if( (Math.ceil(slideWpx * settings.displayQty / (settings.displayQty + 1)) > settings.minWidth) && (settings.displayQty < origSlideQty) ) {
                        ++settings.displayQty;

                        // Recall this function with the new display quantity setting
                        setWidths();

                        // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                        return;

                    }

                // Calculate if the max width is exceeded
                } else if( settings.maxWidth ) {

                    if( slideWpx > settings.maxWidth ) {

                        // Don't increment if the display quantity is the same amount as original slide quantity
                        if( settings.displayQty < origSlideQty ) {
                            ++settings.displayQty;

                            // Recall this function with the new display quantity setting
                            setWidths();

                            // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                            return;
                        }
                    // Slide width is smaller than max width
                    // Calculate if a slide could be removed, without making all slides greater than max width
                    // AND that we don't display any less than one
                    } else if( Math.floor(slideWpx * (settings.displayQty) / (settings.displayQty - 1) <= settings.maxWidth) && (settings.displayQty > 1) ) {
                        --settings.displayQty;

                        // Recall this function with the new display quantity setting
                        setWidths();

                        // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                        return;

                    }
                }

                // Apply the slide margins, if any
                if( settings.slideMargin > 0 ) {
                    $(fullslideLi).css("marginRight", settings.slideMargin + "px");
                }

                //Apply the width
                $(fullslideLi).css("width", slideWpx + "px");

                // Once all the sizes are set, we need to offset the ul to hide the slides to the left of the viewable slides
                offsetFirstSlide();

            };


            /**
             *  Set the slider up at runtime, including creating DOM elements
             *  and setting widths.
             */
            var init = function() {

                // Declare function's variables
                var fullslideLi;

                // If display amount is 1 then set the slide margin to 0
                if( settings.displayQty === 1 ) {
                    settings.slideMargin = 0;
                }

                // Create DOM elements
                $(el).wrap('<div class="fullslide-wrap" />');
                $(el).closest(".fullslide-wrap").append("<div class='fullslide-controls'><a href='#' class='fullslide-left'>left</a> <a href='#' class='fullslide-right'>right</a></div>");

                // Count how many slides are orginally and update the variable
                fullslideLi = $(el).children("li");
                origSlideQty = $(fullslideLi).length;

                // Ensure we're not trying to display more slides than we have
                if( settings.displayQty > origSlideQty ) {
                    settings.displayQty = origSlideQty;
                }

                // Ensure we cannot move more slides than we have
                if( settings.moveQty > origSlideQty ) {
                    settings.moveQty = origSlideQty;
                }

                // Ensure we don't try to move more than we are displaying
                if( settings.moveQty > settings.displayQty ) {
                    settings.moveQty = settings.displayQty;
                }

                // Triplicate the slides so there's always enough in view when sliding
                $(fullslideLi).clone().prependTo(el);
                $(fullslideLi).clone().appendTo(el);

                // Set the slides' width
                setWidths();

                // Unhide the ul if hidden
                $(el).css("opacity","1");
            };


            /**
             *  Invoke the sliding action, either left or right
             */
            var slide = function(dir, qty, duration, easing, callback) {

                // Declare functions
                var slideWpx,
                    moveDistance,
                    relativeMovement,
                    fullslideLi;

                // If parameters haven't been sent with the function, set to defaults
                dir = (typeof dir === "undefined") ? "left" : dir;
                qty = (typeof qty === "undefined") ? settings.moveQty : qty;
                duration = (typeof duration === "undefined") ? settings.moveDuration : duration;
                easing = (typeof easing === "undefined") ? settings.moveEasing : easing;

                // Do not do anything if the ul is currently animating
                if( $(el).not(":animated") ) {

                    // Get the current state of the slides as the variable fullslideLi
                    fullslideLi = $(el).children("li");

                    // Get width in px of slide so we know how far to move it
                    slideWpx = $(fullslideLi).first().outerWidth();

                    // Calculate the move distance
                    moveDistance = (slideWpx * qty) + (settings.slideMargin * qty);

                    // Set the relative movement as a variable
                    if( dir === "left" ) {
                        relativeMovement = "-=" + moveDistance;
                    } else {
                        relativeMovement = "+=" + moveDistance;
                    }

                    // Call the animation function - if moving left move the li's that have slid out of view to the end,
                    // else if moving right move the li's that have slid out of view to the start
                    $(el).animate({
                        left : relativeMovement
                    }, duration, easing, function() {
                        // Once animation is complete -
                        // Get the current state of the li elements
                        fullslideLi = $(el).children("li");

                        if( dir === "left" ) {
                            // If moving left move the amount of slides moved by to the end
                            $(fullslideLi).slice(0, settings.moveQty).appendTo(el);
                        } else {
                            // Else if moving right, move the amount of slides moved to the start
                            $(fullslideLi).slice(-settings.moveQty).prependTo(el);
                        }

                        // Reset the position to take into account the removed slides
                        offsetFirstSlide();

                        // If a callback has been include call it now
                        if( callback && typeof(callback) === "function" ) {
                            callback();
                        }
                    });
                }

            };

            // ---------------------------------------------------------------------------------------------------------- //
            // ------------------------------------------------ RUNTIME ------------------------------------------------- //
            // ---------------------------------------------------------------------------------------------------------- //

            init();


            // ---------------------------------------------------------------------------------------------------------- //
            // --------------------------------------------- EVENT BINDINGS --------------------------------------------- //
            // ---------------------------------------------------------------------------------------------------------- //


            // Slide right on press of the left control
            $(el).next('.fullslide-controls').on('click', '.fullslide-left', function(event) {
                slide("right");
                event.preventDefault();
            });

            // Slide left on press of the right control
            $(el).next('.fullslide-controls').on('click', '.fullslide-right', function(event) {
                slide("left");
                event.preventDefault();
            });

            // Resize the slides when window size changes
            $(window).resize(function() {
                waitOnEvent(function() {
                    setWidths();
                }, 500, "reset1");
            });

        });
    };

}(jQuery));