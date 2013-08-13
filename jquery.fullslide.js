/*
 * jquery.fullslide.js 2.0
 *
 * Copyright 2013, Tommy Fisher http://tommyfisher.net
 *
 */

(function($) {

    $.fullslide = function(element, options) {

        // Default options
        var defaults = {
            displayQty : 1,
            moveQty : 1,
            moveDuration : 1000,
            moveEasing : "swing",
            slideMargin : 20,
            minWidth : "",
            maxWidth : "",
            onReady : function() {},
            onBeforeSlide : function() {},
            onAfterSlide : function() {}
        }

        // Use "slider" to reference the current instance of the object
        var slider = this;

        // This will hold the merged default, and user-provided options
        slider.settings = {}

        var $element = $(element), // Reference to the jQuery version of DOM element
             element = element;    // Reference to the actual DOM element


        slider.init = function() {
            /**
             *  The "constructor" method - set the slider up at runtime,
             *  including creating DOM elements and setting widths.
             */

            // Declare method's variables
            var fullslideLi,
                ulH,
                loaded,
                fontSize;

            // The plugin's final properties are the merged default and
            // user-provided options (if any)
            slider.settings = $.extend({}, defaults, options);

            // If display amount is 1 then set the slide margin to 0
            if( slider.settings.displayQty === 1 ) {
                slider.settings.slideMargin = 0;
            }

            // Create DOM elements
            $element.wrap('<div class="fullslide-wrap" style="opacity:0;" />');
            $element.closest(".fullslide-wrap").append("<div class='fullslide-controls'><a href='#' class='fullslide-left'>left</a> <a href='#' class='fullslide-right'>right</a></div>");

            // Count how many slides are orginally and update the variable
            fullslideLi = $element.children("li");
            origSlideQty = $(fullslideLi).length;

            // Check the font size of the LI to help us know when the contents
            // have been loaded
            fontSize = parseInt( $(fullslideLi).css("fontSize") );

            // Ensure we're not trying to display more slides than we have
            if( slider.settings.displayQty > origSlideQty ) {
                slider.settings.displayQty = origSlideQty;
            }

            // Ensure we cannot move more slides than we have
            if( slider.settings.moveQty > origSlideQty ) {
                slider.settings.moveQty = origSlideQty;
            }

            // Ensure we don't try to move more than we are displaying
            if( slider.settings.moveQty > slider.settings.displayQty ) {
                slider.settings.moveQty = slider.settings.displayQty;
            }

            // Triplicate the slides so there's always enough in view when sliding
            $(fullslideLi).clone().prependTo($element);
            $(fullslideLi).clone().appendTo($element);

            // Set the slides' width
            setWidths();

            // Wait for the content to be loaded before firing the callback
            loaded = 0;
            var waitForLoad = function() {
                // Contents should be loaded when the last LI is bigger than
                // the LIs default font size
                if( loaded !== 1 ) {
                    if( $(fullslideLi).last().outerHeight() > fontSize ) {
                        loaded = 1;
                        waitForLoad();
                    } else {
                        window.setTimeout( waitForLoad, 500 );
                    }
                } else {
                    // Wait a bit longer to ensure it was fully loaded
                    window.setTimeout( function() {
                        // Everything loaded
                        ulH = $(fullslideLi).first().height();

                        // Apply the height to the UL
                        $element.css({
                            height : ulH + "px"
                        });

                        // Show the slider if hidden
                        $element.css({
                            opacity : 1
                        });

                        $element.closest(".fullslide-wrap").css({
                            opacity : 1
                        });

                        // All done, if an 'onReady' function has been set, call it now
                        if( slider.settings.onReady && typeof(slider.settings.onReady) === "function" ) {
                            slider.settings.onReady();
                        }
                    }, 1000 );
                }
            }

            waitForLoad();
        }


        // ---------------------------------------------------------------------------------------------------------- //
        // ------------------------------------------- PUBLIC METHODS ----------------------------------------------- //
        // ---------------------------------------------------------------------------------------------------------- //

        slider.slide = function(dir, qty, duration, easing) {
            /**
             *  Invoke the sliding action, either left or right
             */

            // Declare functions
            var slideWpx,
                moveDistance,
                relativeMovement,
                fullslideLi;

            // If parameters haven't been sent with the function, set to defaults
            dir = (typeof dir === "undefined") ? "left" : dir;
            qty = (typeof qty === "undefined") ? slider.settings.moveQty : qty;
            duration = (typeof duration === "undefined") ? slider.settings.moveDuration : duration;
            easing = (typeof easing === "undefined") ? slider.settings.moveEasing : easing;

            // Do not do anything if the ul is currently animating
            if( !$element.filter(':animated').length ) {

                // Before sliding happens pass in the 'onBeforeSlide' function, if set
                if( slider.settings.onBeforeSlide && typeof(slider.settings.onBeforeSlide) === "function" ) {
                    slider.settings.onBeforeSlide();
                }

                // Get the current state of the slides as the variable fullslideLi
                fullslideLi = $element.children("li");

                // Get width in px of slide so we know how far to move it
                slideWpx = $(fullslideLi).first().outerWidth();

                // Calculate the move distance
                moveDistance = (slideWpx * qty) + (slider.settings.slideMargin * qty);

                // Set the relative movement as a variable
                if( dir === "left" ) {
                    relativeMovement = "-=" + moveDistance;
                } else {
                    relativeMovement = "+=" + moveDistance;
                }

                // Call the animation function - if moving left move the li's that have slid out of view to the end,
                // else if moving right move the li's that have slid out of view to the start
                $element.animate({
                    left : relativeMovement
                }, duration, easing, function() {
                    // Once animation is complete -
                    // Get the current state of the li elements
                    fullslideLi = $element.children("li");

                    if( dir === "left" ) {
                        // If moving left move the amount of slides moved by to the end
                        $(fullslideLi).slice(0, slider.settings.moveQty).appendTo($element);
                    } else {
                        // Else if moving right, move the amount of slides moved to the start
                        $(fullslideLi).slice(-slider.settings.moveQty).prependTo($element);
                    }

                    // Reset the position to take into account the removed slides
                    offsetFirstSlide();

                    // After sliding happens, if set pass in the 'onAfterSlide' function as a callback function
                    // to setUlHeight()
                    if( slider.settings.onAfterSlide && typeof(slider.settings.onAfterSlide) === "function" ) {
                        setUlHeight( slider.settings.onAfterSlide );
                    } else {
                        // Otherwise just call setUlHeight
                        setUlHeight();
                    }

                });
            }
        };


        // ---------------------------------------------------------------------------------------------------------- //
        // ------------------------------------------- PRIVATE METHODS ---------------------------------------------- //
        // ---------------------------------------------------------------------------------------------------------- //

        var offsetFirstSlide = function() {
            /**
             *  Cater for the fact that there are always slides to the left of the
             *  currenly viewed slides. This offsets the ul so that we don't see
             *  the slides to the left.
             */

            // Declare method's variables
            var fullslideLi,
                slideWpx,
                offset;

            // Get the current state of the slides as the variable fullslideLi
            fullslideLi = $element.children("li");

            // Get the width in pixels of the slide so we know how much to offset it by
            slideWpx = $(fullslideLi).first().outerWidth();

            // Calculate the offset - we have duplicated all the original slides infront of the viewable slide, so that's how much we offset by, plus margin
            offset = origSlideQty * (slideWpx + slider.settings.slideMargin);

            // Apply the offset
            $element.css("left", "-" + offset + "px");
        };


        var setUlHeight = function(callback) {
            /**
             *  Set the height of the ul to be called after every slide moves
             */

            // Declare method's variables
            var fullslideLi,
                ulH;

            // Assign fullslideLi var
            fullslideLi = $element.children("li");

            // Find the height of the LI so we can set the height of the UL to prevent wrapping
            ulH = $(fullslideLi).first().height();

            // Apply the height to the ul and animate it
            $element.animate({
                height : ulH + "px"
            }, 100, function() {
                // If a callback has been include call it now
                if( callback && typeof(callback) === "function" ) {
                    callback();
                }
            });
        };


        var setWidths = function() {
            /**
             *  Calculate and set the widths of the slides and the ul container.
             */

            // Declare method's variables
            var fullslideLi,
                slideQty,
                ulW,
                ulWpx,
                slideWpx,
                totalM,
                slideW;

            // Set slide widths
            // Assign fullslideLi var
            fullslideLi = $element.children("li");

            // Get the current number of slides to work out the width of ul
            slideQty = $(fullslideLi).length;

            // To get the ul width, calculate the percentage from the amount will be shown then
            ulW = (100 / slider.settings.displayQty) * slideQty;

            // Apply the width and the height to the ul
            $element.css("width", ulW + "%");

            // Set the cell width in %
            slideW = 100 / slideQty;

            // Calculate the width of the ul and slide in px
            ulWpx = $element.css("width");
            slideWpx = parseInt(ulWpx) / slideQty;

            // Include the margins in with the calculation, if any
            if( slider.settings.slideMargin > 0 ) {

                // Get the total margin for the whole slideshow
                totalM = slider.settings.slideMargin * (slider.settings.displayQty - 1);

                // Calculate width of the slides
                slideWpx = slideWpx - (totalM / slider.settings.displayQty);
            }

            // Calculate if the min width is exceeded
            if( slider.settings.minWidth ) {

                if( slideWpx < slider.settings.minWidth ) {

                    // Don't decrement if the current display quantity is 1
                    if( slider.settings.displayQty > 1 ) {
                        --slider.settings.displayQty;

                        // Recall this function with the new display quantity setting
                        setWidths();

                        // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                        return;
                    }
                // Slide width is bigger than min width
                // Calculate if another slide could fit in, without making all slides less than min width
                // AND that we don't display more than one of each
                } else if( (Math.ceil(slideWpx * slider.settings.displayQty / (slider.settings.displayQty + 1)) > slider.settings.minWidth) && (slider.settings.displayQty < origSlideQty) ) {
                    ++slider.settings.displayQty;

                    // Recall this function with the new display quantity setting
                    setWidths();

                    // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                    return;
                }

            // Calculate if the max width is exceeded
            } else if( slider.settings.maxWidth ) {

                if( slideWpx > slider.settings.maxWidth ) {

                    // Don't increment if the display quantity is the same amount as original slide quantity
                    if( slider.settings.displayQty < origSlideQty ) {
                        ++slider.settings.displayQty;

                        // Recall this function with the new display quantity setting
                        setWidths();

                        // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                        return;
                    }
                // Slide width is smaller than max width
                // Calculate if a slide could be removed, without making all slides greater than max width
                // AND that we don't display any less than one
                } else if( Math.floor(slideWpx * (slider.settings.displayQty) / (slider.settings.displayQty - 1) <= slider.settings.maxWidth) && (slider.settings.displayQty > 1) ) {
                    --slider.settings.displayQty;

                    // Recall this function with the new display quantity setting
                    setWidths();

                    // Prevent subsquent rendering of the CSS before the sizes have been recalculated
                    return;
                }
            }

            // Apply the slide margins, if any
            if( slider.settings.slideMargin > 0 ) {
                $(fullslideLi).css("marginRight", slider.settings.slideMargin + "px");
            }

            //Apply the width
            $(fullslideLi).css("width", slideWpx + "px");

            // Once all the sizes are set, we need to offset the ul to hide the slides to the left of the viewable slides
            offsetFirstSlide();
        };


        var waitOnEvent = (function() {
            /**
             *  Function to set a timeout for the window resize event
             */
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

        // Resize the slides when window size changes
        $(window).resize(function() {
            waitOnEvent(function() {
                setWidths();
            }, 500, "reset1");
        });

        // ---------------------------------------------------------------------------------------------------------- //
        // ------------------------------------------------ RUNTIME ------------------------------------------------- //
        // ---------------------------------------------------------------------------------------------------------- //

        // Call the "constructor" method
        slider.init();
    }


    // ---------------------------------------------------------------------------------------------------------- //
    // ------------------------------------------- PLUGIN DEFINITION -------------------------------------------- //
    // ---------------------------------------------------------------------------------------------------------- //

    // Add the plugin to the jQuery.fn object
    $.fn.fullslide = function(options) {

        // Iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {

            // If plugin has not already been attached to the element
            if( undefined == $(this).data('fullslide') ) {

                // Create a new instance of the plugin
                // Pass the DOM element and the user-provided options as arguments
                var slider = new $.fullslide(this, options);

                // Store a reference to the plugin object
                $(this).data('fullslide', slider);
            }
        });
    }


    // ---------------------------------------------------------------------------------------------------------- //
    // --------------------------------------------- EVENT BINDINGS --------------------------------------------- //
    // ---------------------------------------------------------------------------------------------------------- //

    // Slide right on press of the left control
    $('body').on('click', '.fullslide-left', function(event) {
        var selfEl = $(this).parent(".fullslide-controls").prev("ul");

        // Do not do anything if the ul is currently animating
        var pref = {};
            pref.moveQty = selfEl.data('fullslide').settings.moveQty,
            pref.moveDuration = selfEl.data('fullslide').settings.moveDuration,
            pref.easing = selfEl.data('fullslide').settings.easing;

        selfEl.data('fullslide').slide("right", pref.moveQty, pref.moveDuration, pref.easing);

        event.preventDefault();
    });

    // Slide left on press of the right control
    $('body').on('click', '.fullslide-right', function(event) {
        var selfEl = $(this).parent(".fullslide-controls").prev("ul");
        var pref = {};
            pref.moveQty = selfEl.data('fullslide').settings.moveQty,
            pref.moveDuration = selfEl.data('fullslide').settings.moveDuration,
            pref.easing = selfEl.data('fullslide').settings.easing;

        selfEl.data("fullslide").slide("left", pref.moveQty, pref.moveDuration, pref.easing);
        event.preventDefault();
    });

})(jQuery);