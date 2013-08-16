# jquery.fullslide
A responsive, Retina-ready jQuery slider/carousel plugin. Its width will automatically stretch to fill its parent container. The slider will adapt to viewport resize.

The slider can advance automatically or manually. Callback functions are provided at key points in the plugin's instantiation and slide movement. Multiple slideshows can be placed on a page, and the API allows for slider control outside of the plugin.

Both hidpi (Retina) and normal dpi control arrows are supplied. Their display is automatically conrolled by the supplied stylesheet.

By setting `maxWidth` or `minWidth`, the user can ensure a slider with content that does not stretch or shrink past its intended widths.


### Usage
```html
<ul id="slideshow">
    <li><img src="http://link-to-img1"></li>
    <li><img src="http://link-to-img2"></li>
    <li><img src="http://link-to-img3"></li>
</ul>
```

```javascript
$('#slideshow').fullslide();
```

To hide the slider whilst it is loading, set `opacity:0` to the `ul` element.

The selector needs to be a `ul` element. Each `li` element will be a slide.

Include the CSS file in the `head` and make sure the link to the image sprite is for your file structure. If you are using SASS, simply include the `_jquery.fullslide.scss` file with your other library includes.

Include jQuery before *jquery.fullslide* plugin.


### Optional parameters
* displayQty (integer) - The number of slides shown at a time **default: 1**.
* moveQty (integer) - The number of slides to move by **default: 1**. If set to greater than `displayQty` then will default to `displayQty`.
* moveDuration (integer) - The number of ms it should take to slide `moveQty` number of slides **default: 1000** (1 second).
* moveEasing (string) - The easing method to use `linear` or `swing` **default: "swing"**.
* slideMargin (integer) - The number of pixels the margin should be between slides **default: "20"**.
* minWidth (integer) - The minimum width a slide can be, **default: none**. If this setting is set and the slider container is too narrow, then a slide will be removed from display.
* maxWidth (integer) - The maximum width a slide can be, **default: none**. If this setting is set and the slider container is too wide, then a slide will be added to the display.
* autoSlide (boolean) - Start slideshow automatically from page load, **default: true**.
* autoDirection (string) - Direction in which the slideshow should automatically advance, **default: left**.
* slideDelay (integer) - Number of ms to wait before advancing slideshow, **default: 3000** (3 seconds).
* pauseOnHover (boolean) - Pause the slideshow on mouse over, then continue on mouse out, **default: true**.

*Note: when `maxWidth` and `minWidth` are set, then `minWidth` will take preference and `maxWidth` will be ignored.


### Callback functions
Several callback functions are provided:
* onReady - Called when the slider is loaded and ready to slide.
* onBeforeSlide - Called before the slide animation starts.
* onAfterSlide - Called after the slide animation has completed.


### API
The *slide* function can be initiatated outside of the plugin and the settings set at plugin initiation can be overridden. The *slide* function can be called by using the following format:
`$([element]).data('fullslide').slide([direction], [quantity], [duration], [easing])`
The function paramaters are optional, for example: `$("#slideshow").data('fullslide').slide("right")`. The default slide direction is 'left'.

To stop the auto slideshow call:
`$([element]).data('fullslide').stopAuto([preventHoverStart])`
To prevent a hover event triggering the auto slide show after manually stopping, pass `true` into the function call.

To start the auto slideshow call:
`$([element]).data('fullslide').startAuto([allowHoverStop])`
If you have previously prevented hover events on the slideshow, and you want to allow them, pass `true` into the function call.
*Note: If you want to have a static slideshow on page load, then manually start it later, simply set `autoSlide` to `false`, then call the `startAuto()` function above when you want the auto slideshow to start.



### Example options and callback usage
```javascript
$('#slideshow').fullslide({
    displayQty : 4,
    moveQty : 2,
    moveDuration : 500,
    moveEasing : "linear",
    autoSlide : false,
    onBeforeSlide : function() {
        alert("ready to slide");
    }
});
```

### Contact
If you have any questions, get in touch with me on twitter - [@tommybfisher](https://twitter.com/tommybfisher/)


### License
See LICENCE.md


### Roadmap
* Currently, when the display quantity is greater than one, and the slides displayed are different heights, the containing element will resize to the height of furthest left slide, even if other slides are bigger. The container element should never shrink more than the height of the tallest element in view.
* Allow customisation of height resize duration.