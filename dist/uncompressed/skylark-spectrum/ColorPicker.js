define([
   "skylark-langx/skylark",
    "skylark-langx/langx",
    "skylark-domx-browser",
    "skylark-domx-noder",
    "skylark-domx-finder",
    "skylark-domx-query",
    "skylark-domx-eventer",
    "skylark-domx-styler",
    "skylark-domx-fx",
    "skylark-domx-plugins",
    "skylark-domx-popups",
    "skylark-graphics-color",
    "./spectrum",
    "./Indicator"
],function(skylark, langx, browser, noder, finder, $,eventer, styler,fx,plugins,popups,Color,spectrum,Indicator) {
    "use strict";

    var noop = langx.noop;

    var pickers = [],
    replaceInput = [
        "<div class='sp-replacer'>",
            "<div class='sp-preview'><div class='sp-preview-inner'></div></div>",
            "<div class='sp-dd'>&#9660;</div>",
        "</div>"
    ].join(''),
    
    markup = (function () {

        // IE7-10 does not support gradients with multiple stops, so we need to simulate
        //  that for the rainbow slider with 8 divs that each have a single gradient
        var gradientFix = "";
        if (browser.isIE) {
            for (var i = 1; i <= 6; i++) {
                gradientFix += "<div class='sp-" + i + "'></div>";
            }
        }

        return [
            "<div class='sp-container sp-hidden'>",
                "<div class='sp-palette-container'>",
                    "<div class='sp-palette sp-thumb sp-cf'></div>",
                    "<div class='sp-palette-button-container sp-cf'>",
                        "<button type='button' class='sp-palette-toggle'></button>",
                    "</div>",
                "</div>",
                "<div class='sp-picker-container'>",
                    "<div class='sp-top sp-cf'>",
                        "<div class='sp-fill'></div>",
                        "<div class='sp-top-inner'>",
                            "<div class='sp-color'>",
                                "<div class='sp-sat'>",
                                    "<div class='sp-val'>",
                                        "<div class='sp-dragger'></div>",
                                    "</div>",
                                "</div>",
                            "</div>",
                            "<div class='sp-clear sp-clear-display'>",
                            "</div>",
                            "<div class='sp-hue'>",
                                "<div class='sp-slider'></div>",
                                gradientFix,
                            "</div>",
                        "</div>",
                        "<div class='sp-alpha'><div class='sp-alpha-inner'><div class='sp-alpha-handle'></div></div></div>",
                    "</div>",
                    "<div class='sp-input-container sp-cf'>",
                        "<input class='sp-input' type='text' spellcheck='false'  />",
                    "</div>",
                    "<div class='sp-initial sp-thumb sp-cf'></div>",
                    "<div class='sp-button-container sp-cf'>",
                        "<a class='sp-cancel' href='#'></a>",
                        "<button type='button' class='sp-choose'></button>",
                    "</div>",
                "</div>",
            "</div>"
        ].join("");
    })();

    function paletteTemplate (p, color, className, opts) {
        var html = [];
        for (var i = 0; i < p.length; i++) {
            var current = p[i];
            if(current) {
                var tiny = Color.parse(current);
                var c = tiny.toHsl().l < 0.5 ? "sp-thumb-el sp-thumb-dark" : "sp-thumb-el sp-thumb-light";
                c += (Color.equals(color, current)) ? " sp-thumb-active" : "";
                var formattedString = tiny.toString(opts.preferredFormat || "rgb");
                var swatchStyle = "background-color:" + tiny.toRgbString();
                html.push('<span title="' + formattedString + '" data-color="' + tiny.toRgbString() + '" class="' + c + '"><span class="sp-thumb-inner" style="' + swatchStyle + ';" /></span>');
            } else {
                var cls = 'sp-clear-display';
                html.push($('<div />')
                    .append($('<span data-color="" style="background-color:transparent;" class="' + cls + '"></span>')
                        .attr('title', opts.noColorSelectedText)
                    )
                    .html()
                );
            }
        }
        return "<div class='sp-cf " + className + "'>" + html.join('') + "</div>";
    }

    function hideAll() {
        for (var i = 0; i < pickers.length; i++) {
            if (pickers[i]) {
                pickers[i].hide();
            }
        }
    }


    var ColorPicker = plugins.Plugin.inherit({
        klassName : "ColorPicker",

        pluginName : "spectrum.colorPicker",

        options : {

            // Callbacks
            beforeShow: noop,
            move: noop,
            change: noop,
            show: noop,
            hide: noop,

            // Options
            color: false,
            flat: false,
            showInput: false,
            allowEmpty: false,
            showButtons: true,
            clickoutFiresChange: true,
            showInitial: false,
            showPalette: false,
            showPaletteOnly: false,
            hideAfterPaletteSelect: false,
            togglePaletteOnly: false,
            showSelectionPalette: true,
            localStorageKey: false,
            appendTo: "body",
            maxSelectionSize: 7,
            cancelText: "cancel",
            chooseText: "choose",
            togglePaletteMoreText: "more",
            togglePaletteLessText: "less",
            clearText: "Clear Color Selection",
            noColorSelectedText: "No Color Selected",
            preferredFormat: false,
            className: "", // Deprecated - use containerClassName and replacerClassName instead.
            containerClassName: "",
            replacerClassName: "",
            showAlpha: false,
            theme: "sp-light",
            palette: [
                ["#ffffff", "#000000", "#ff0000", "#ff8000", "#ffff00", "#008000", "#0000ff", "#4b0082", "#9400d3"]
            ],
            selectionPalette: [],
            disabled: false,
            offset: null

        },

         _construct: function(elm, options) {
            this.overrided(elm,options);



            var opts = this.options,
                element = this._elm,
                flat = opts.flat,
                showSelectionPalette = opts.showSelectionPalette,
                theme = opts.theme,
                resize = langx.debounce(reflow, 10),
                visible = false,
                isDragging = false,
                dragWidth = 0,
                dragHeight = 0,
                dragHelperHeight = 0,
                slideHeight = 0,
                slideWidth = 0,
                alphaWidth = 0,
                alphaSlideHelperWidth = 0,
                slideHelperHeight = 0,
                currentHue = 0,
                currentSaturation = 0,
                currentValue = 0,
                currentAlpha = 1,
                palette = [],
                paletteArray = [],
                paletteLookup = {},
                selectionPalette = opts.selectionPalette.slice(0),
                maxSelectionSize = opts.maxSelectionSize,
                draggingClass = "sp-dragging",
                shiftMovementDirection = null;


            var callbacks = opts.callbacks = {
                'move': bind(opts.move, elm),
                'change': bind(opts.change, elm),
                'show': bind(opts.show, elm),
                'hide': bind(opts.hide, elm),
                'beforeShow': bind(opts.beforeShow, elm)
            };

            var doc = element.ownerDocument,
                body = doc.body,
                boundElement = $(element),
                disabled = false,
                container = $(markup, doc).addClass(theme),
                pickerContainer = container.find(".sp-picker-container"),
                dragger = container.find(".sp-color"),
                dragHelper = container.find(".sp-dragger"),
                slider = container.find(".sp-hue"),
                slideHelper = container.find(".sp-slider"),
                alphaSliderInner = container.find(".sp-alpha-inner"),
                alphaSlider = container.find(".sp-alpha"),
                alphaSlideHelper = container.find(".sp-alpha-handle"),
                textInput = container.find(".sp-input"),
                paletteContainer = container.find(".sp-palette"),
                initialColorContainer = container.find(".sp-initial"),
                cancelButton = container.find(".sp-cancel"),
                clearButton = container.find(".sp-clear"),
                chooseButton = container.find(".sp-choose"),
                toggleButton = container.find(".sp-palette-toggle"),
                isInput = boundElement.is("input"),
                isInputTypeColor = isInput && boundElement.attr("type") === "color" && inputTypeColorSupport(),
                shouldReplace = isInput && !flat,
                replacer = (shouldReplace) ? $(replaceInput).addClass(theme).addClass(opts.className).addClass(opts.replacerClassName) : $([]),
                offsetElement = (shouldReplace) ? replacer : boundElement,
                previewElement = replacer.find(".sp-preview-inner"),
                initialColor = opts.color || (isInput && boundElement.val()),
                colorOnShow = false,
                currentPreferredFormat = opts.preferredFormat,
                clickoutFiresChange = !opts.showButtons || opts.clickoutFiresChange,
                isEmpty = !initialColor,
                allowEmpty = opts.allowEmpty && !isInputTypeColor;

            function applyOptions() {

                if (opts.showPaletteOnly) {
                    opts.showPalette = true;
                }

                toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);

                if (opts.palette) {
                    palette = opts.palette.slice(0);
                    paletteArray = langx.isArray(palette[0]) ? palette : [palette];
                    paletteLookup = {};
                    for (var i = 0; i < paletteArray.length; i++) {
                        for (var j = 0; j < paletteArray[i].length; j++) {
                            var rgb = Color.parse(paletteArray[i][j]).toRgbString();
                            paletteLookup[rgb] = true;
                        }
                    }
                }

                container.toggleClass("sp-flat", flat);
                container.toggleClass("sp-input-disabled", !opts.showInput);
                container.toggleClass("sp-alpha-enabled", opts.showAlpha);
                container.toggleClass("sp-clear-enabled", allowEmpty);
                container.toggleClass("sp-buttons-disabled", !opts.showButtons);
                container.toggleClass("sp-palette-buttons-disabled", !opts.togglePaletteOnly);
                container.toggleClass("sp-palette-disabled", !opts.showPalette);
                container.toggleClass("sp-palette-only", opts.showPaletteOnly);
                container.toggleClass("sp-initial-disabled", !opts.showInitial);
                container.addClass(opts.className).addClass(opts.containerClassName);

                reflow();
            }

            function initialize() {

                if (browser.isIE) {
                    container.find("*:not(input)").attr("unselectable", "on");
                }

                applyOptions();

                if (shouldReplace) {
                    boundElement.after(replacer).hide();
                }

                if (!allowEmpty) {
                    clearButton.hide();
                }

                if (flat) {
                    boundElement.after(container).hide();
                }
                else {

                    var appendTo = opts.appendTo === "parent" ? boundElement.parent() : $(opts.appendTo);
                    if (appendTo.length !== 1) {
                        appendTo = $("body");
                    }

                    appendTo.append(container);
                }

                offsetElement.on("click.ColorPicker touchstart.ColorPicker", function (e) {
                    if (!disabled) {
                        toggle();
                    }

                    e.stopPropagation();

                    if (!$(e.target).is("input")) {
                        e.preventDefault();
                    }
                });

                if(boundElement.is(":disabled") || (opts.disabled === true)) {
                    disable();
                }

                // Prevent clicks from bubbling up to document.  This would cause it to be hidden.
                container.click(stopPropagation);

                // Handle user typed input
                textInput.change(setFromTextInput);
                textInput.on("paste", function () {
                    setTimeout(setFromTextInput, 1);
                });
                textInput.keydown(function (e) { if (e.keyCode == 13) { setFromTextInput(); } });

                cancelButton.text(opts.cancelText);
                cancelButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    revert();
                    hide();
                });

                clearButton.attr("title", opts.clearText);
                clearButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    isEmpty = true;
                    move();

                    if(flat) {
                        //for the flat style, this is a change event
                        updateOriginalInput(true);
                    }
                });

                chooseButton.text(opts.chooseText);
                chooseButton.on("click.ColorPicker", function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    if (browser.isIE && textInput.is(":focus")) {
                        textInput.trigger('change');
                    }

                    if (isValid()) {
                        updateOriginalInput(true);
                        hide();
                    }
                });

                toggleButton.text(opts.showPaletteOnly ? opts.togglePaletteMoreText : opts.togglePaletteLessText);
                toggleButton.on("click.spectrum", function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    opts.showPaletteOnly = !opts.showPaletteOnly;

                    // To make sure the Picker area is drawn on the right, next to the
                    // Palette area (and not below the palette), first move the Palette
                    // to the left to make space for the picker, plus 5px extra.
                    // The 'applyOptions' function puts the whole container back into place
                    // and takes care of the button-text and the sp-palette-only CSS class.
                    if (!opts.showPaletteOnly && !flat) {
                        container.css('left', '-=' + (pickerContainer.outerWidth(true) + 5));
                    }
                    applyOptions();
                });

                alphaSlider.plugin("domx.indicator", {
                    "onmove" :   function (dragX, dragY, e) {
                        currentAlpha = (dragX / alphaWidth);
                        isEmpty = false;
                        if (e.shiftKey) {
                            currentAlpha = Math.round(currentAlpha * 10) / 10;
                        }

                        move();
                    }, 
                    "onstart" : dragStart, 
                    "onstop" :dragStop
                });

                slider.plugin("domx.indicator", {
                    "onmove" :   function (dragX, dragY, e) {
                        currentHue = parseFloat(dragY / slideHeight);
                        isEmpty = false;
                        if (!opts.showAlpha) {
                            currentAlpha = 1;
                        }
                        move();
                    }, 
                    "onstart" : dragStart, 
                    "onstop" :dragStop
                });

                dragger.plugin("domx.indicator", {
                    "onmove" :   function (dragX, dragY, e) {

                        // shift+drag should snap the movement to either the x or y axis.
                        if (!e.shiftKey) {
                            shiftMovementDirection = null;
                        }
                        else if (!shiftMovementDirection) {
                            var oldDragX = currentSaturation * dragWidth;
                            var oldDragY = dragHeight - (currentValue * dragHeight);
                            var furtherFromX = Math.abs(dragX - oldDragX) > Math.abs(dragY - oldDragY);

                            shiftMovementDirection = furtherFromX ? "x" : "y";
                        }

                        var setSaturation = !shiftMovementDirection || shiftMovementDirection === "x";
                        var setValue = !shiftMovementDirection || shiftMovementDirection === "y";

                        if (setSaturation) {
                            currentSaturation = parseFloat(dragX / dragWidth);
                        }
                        if (setValue) {
                            currentValue = parseFloat((dragHeight - dragY) / dragHeight);
                        }

                        isEmpty = false;
                        if (!opts.showAlpha) {
                            currentAlpha = 1;
                        }

                        move();
                    }, 
                    "onstart" : dragStart, 
                    "onstop" :dragStop
                });

                if (!!initialColor) {
                    set(initialColor);

                    // In case color was black - update the preview UI and set the format
                    // since the set function will not run (default color is black).
                    updateUI();
                    currentPreferredFormat = opts.preferredFormat || Color.parse(initialColor).format;

                    addColorToSelectionPalette(initialColor);
                }
                else {
                    updateUI();
                }

                if (flat) {
                    show();
                }

                function paletteElementClick(e) {
                    if (e.data && e.data.ignore) {
                        set($(e.target).closest(".sp-thumb-el").data("color"));
                        move();
                    }
                    else {
                        set($(e.target).closest(".sp-thumb-el").data("color"));
                        move();

                        // If the picker is going to close immediately, a palette selection
                        // is a change.  Otherwise, it's a move only.
                        if (opts.hideAfterPaletteSelect) {
                            updateOriginalInput(true);
                            hide();
                        } else {
                            updateOriginalInput();
                        }
                    }

                    return false;
                }

                var paletteEvent = browser.isIE ? "mousedown.ColorPicker" : "click.ColorPicker touchstart.ColorPicker";
                paletteContainer.on(paletteEvent, ".sp-thumb-el", paletteElementClick);
                initialColorContainer.on(paletteEvent, ".sp-thumb-el:nth-child(1)", { ignore: true }, paletteElementClick);
            }


            function addColorToSelectionPalette(color) {
                if (showSelectionPalette) {
                    var rgb = Color.parse(color).toRgbString();
                    if (!paletteLookup[rgb] && langx.inArray(rgb, selectionPalette) === -1) {
                        selectionPalette.push(rgb);
                        while(selectionPalette.length > maxSelectionSize) {
                            selectionPalette.shift();
                        }
                    }
                }
            }

            function getUniqueSelectionPalette() {
                var unique = [];
                if (opts.showPalette) {
                    for (var i = 0; i < selectionPalette.length; i++) {
                        var rgb = Color.parse(selectionPalette[i]).toRgbString();

                        if (!paletteLookup[rgb]) {
                            unique.push(selectionPalette[i]);
                        }
                    }
                }

                return unique.reverse().slice(0, opts.maxSelectionSize);
            }

            function drawPalette() {

                var currentColor = get();

                var html = langx.map(paletteArray, function (palette, i) {
                    return paletteTemplate(palette, currentColor, "sp-palette-row sp-palette-row-" + i, opts);
                });

                if (selectionPalette) {
                    html.push(paletteTemplate(getUniqueSelectionPalette(), currentColor, "sp-palette-row sp-palette-row-selection", opts));
                }

                paletteContainer.html(html.join(""));
            }

            function drawInitial() {
                if (opts.showInitial) {
                    var initial = colorOnShow;
                    var current = get();
                    initialColorContainer.html(paletteTemplate([initial, current], current, "sp-palette-row-initial", opts));
                }
            }

            function dragStart() {
                if (dragHeight <= 0 || dragWidth <= 0 || slideHeight <= 0) {
                    reflow();
                }
                isDragging = true;
                container.addClass(draggingClass);
                shiftMovementDirection = null;
                boundElement.trigger('dragstart.ColorPicker', [ get() ]);
            }

            function dragStop() {
                isDragging = false;
                container.removeClass(draggingClass);
                boundElement.trigger('dragstop.ColorPicker', [ get() ]);
            }

            function setFromTextInput() {

                var value = textInput.val();

                if ((value === null || value === "") && allowEmpty) {
                    set(null);
                    move();
                    updateOriginalInput();
                }
                else {
                    var tiny = Color.parse(value);
                    if (tiny.isValid()) {
                        set(tiny);
                        move();
                        updateOriginalInput();
                    }
                    else {
                        textInput.addClass("sp-validation-error");
                    }
                }
            }


            function onkeydown(e) {
                // Close on ESC
                if (e.keyCode === 27) {
                    hide();
                }
            }

            function clickout(e) {
                // Return on right click.
                if (e.button == 2) { return; }

                // If a drag event was happening during the mouseup, don't hide
                // on click.
                if (isDragging) { return; }

                if (clickoutFiresChange) {
                    updateOriginalInput(true);
                }
                else {
                    revert();
                }
                hide();
            }

            function toggle() {
                if (visible) {
                    hide();
                }
                else {
                    show();
                }
            }

            function show() {
                var event = eventer.create('beforeShow.ColorPicker');

                if (visible) {
                    reflow();
                    return;
                }

                boundElement.trigger(event, [ get() ]);

                if (callbacks.beforeShow(get()) === false || event.isDefaultPrevented()) {
                    return;
                }

                hideAll();
                visible = true;

                $(doc).on("keydown.ColorPicker", onkeydown);
                $(doc).on("click.ColorPicker", clickout);
                $(window).on("resize.ColorPicker", resize);
                replacer.addClass("sp-active");
                container.removeClass("sp-hidden");

                reflow();
                updateUI();

                colorOnShow = get();

                drawInitial();
                callbacks.show(colorOnShow);
                boundElement.trigger('show.ColorPicker', [ colorOnShow ]);
            }
            function hide() {
                // Return if hiding is unnecessary
                if (!visible || flat) { return; }
                visible = false;

                $(doc).off("keydown.ColorPicker", onkeydown);
                $(doc).off("click.ColorPicker", clickout);
                $(window).off("resize.ColorPicker", resize);

                replacer.removeClass("sp-active");
                container.addClass("sp-hidden");

                callbacks.hide(get());
                boundElement.trigger('hide.ColorPicker', [ get() ]);
            }

            function revert() {
                set(colorOnShow, true);
                updateOriginalInput(true);
            }

            function set(color, ignoreFormatChange) {
                if (Color.equals(color, get())) {
                    // Update UI just in case a validation error needs
                    // to be cleared.
                    updateUI();
                    return;
                }

                var newColor, newHsv;
                if (!color && allowEmpty) {
                    isEmpty = true;
                } else {
                    isEmpty = false;
                    newColor = Color.parse(color);
                    newHsv = newColor.toHsv();

                    currentHue = (newHsv.h % 360) / 360;
                    currentSaturation = newHsv.s;
                    currentValue = newHsv.v;
                    currentAlpha = newHsv.a;
                }
                updateUI();

                if (newColor && newColor.isValid() && !ignoreFormatChange) {
                    currentPreferredFormat = opts.preferredFormat || newColor.getFormat();
                }
            }

            function get(opts) {
                opts = opts || { };

                if (allowEmpty && isEmpty) {
                    return null;
                }


                /*
                return fromRatio({
                    h: currentHue,
                    s: currentSaturation,
                    v: currentValue,
                    a: Math.round(currentAlpha * 1000) / 1000
                }, { format: opts.format || currentPreferredFormat });
                */
                return Color.parse({
                    h: currentHue * 360,
                    s: currentSaturation,
                    v: currentValue,
                    a: Math.round(currentAlpha * 1000) / 1000
                });
            }

            function isValid() {
                return !textInput.hasClass("sp-validation-error");
            }

            function move() {
                updateUI();

                callbacks.move(get());
                boundElement.trigger('move.ColorPicker', [ get() ]);
            }

            function updateUI() {

                textInput.removeClass("sp-validation-error");

                updateHelperLocations();

                // Update dragger background color (gradients take care of saturation and value).
                //var flatColor = Color.fromRatio({ h: currentHue, s: 1, v: 1 });
                var flatColor = Color.parse({ 
                    h: currentHue * 360, 
                    s: 1, 
                    v: 1 
                });
                dragger.css("background-color", flatColor.toHexString());

                // Get a format that alpha will be included in (hex and names ignore alpha)
                var format = currentPreferredFormat;
                if (currentAlpha < 1 && !(currentAlpha === 0 && format === "name")) {
                    if (format === "hex" || format === "hex3" || format === "hex6" || format === "name") {
                        format = "rgb";
                    }
                }

                var realColor = get({ format: format }),
                    displayColor = '';

                 //reset background info for preview element
                previewElement.removeClass("sp-clear-display");
                previewElement.css('background-color', 'transparent');

                if (!realColor && allowEmpty) {
                    // Update the replaced elements background with icon indicating no color selection
                    previewElement.addClass("sp-clear-display");
                }
                else {
                    var realHex = realColor.toHexString(),
                        realRgb = realColor.toRgbString();

                    // Update the replaced elements background color (with actual selected color)
                    previewElement.css("background-color", realRgb);

                    if (opts.showAlpha) {
                        var rgb = realColor.toRgb();
                        rgb.a = 0;
                        var realAlpha = Color.parse(rgb).toRgbString();
                        var gradient = "linear-gradient(left, " + realAlpha + ", " + realHex + ")";

                        if (browser.isIE) {
                            alphaSliderInner.css("filter", Color.parse(realAlpha).toFilter({ gradientType: 1 }, realHex));
                        }
                        else {
                            alphaSliderInner.css("background", "-webkit-" + gradient);
                            alphaSliderInner.css("background", "-moz-" + gradient);
                            alphaSliderInner.css("background", "-ms-" + gradient);
                            // Use current syntax gradient on unprefixed property.
                            alphaSliderInner.css("background",
                                "linear-gradient(to right, " + realAlpha + ", " + realHex + ")");
                        }
                    }

                    displayColor = realColor.toString(format);
                }

                // Update the text entry input as it changes happen
                if (opts.showInput) {
                    textInput.val(displayColor);
                }

                if (opts.showPalette) {
                    drawPalette();
                }

                drawInitial();
            }

            function updateHelperLocations() {
                var s = currentSaturation;
                var v = currentValue;

                if(allowEmpty && isEmpty) {
                    //if selected color is empty, hide the helpers
                    alphaSlideHelper.hide();
                    slideHelper.hide();
                    dragHelper.hide();
                }
                else {
                    //make sure helpers are visible
                    alphaSlideHelper.show();
                    slideHelper.show();
                    dragHelper.show();

                    // Where to show the little circle in that displays your current selected color
                    var dragX = s * dragWidth;
                    var dragY = dragHeight - (v * dragHeight);
                    dragX = Math.max(
                        -dragHelperHeight,
                        Math.min(dragWidth - dragHelperHeight, dragX - dragHelperHeight)
                    );
                    dragY = Math.max(
                        -dragHelperHeight,
                        Math.min(dragHeight - dragHelperHeight, dragY - dragHelperHeight)
                    );
                    dragHelper.css({
                        "top": dragY + "px",
                        "left": dragX + "px"
                    });

                    var alphaX = currentAlpha * alphaWidth;
                    alphaSlideHelper.css({
                        "left": (alphaX - (alphaSlideHelperWidth / 2)) + "px"
                    });

                    // Where to show the bar that displays your current selected hue
                    var slideY = (currentHue) * slideHeight;
                    slideHelper.css({
                        "top": (slideY - slideHelperHeight) + "px"
                    });
                }
            }

            function updateOriginalInput(fireCallback) {
                var color = get(),
                    displayColor = '',
                    hasChanged = !Color.equals(color, colorOnShow);

                if (color) {
                    displayColor = color.toString(currentPreferredFormat);
                    // Update the selection palette with the current color
                    addColorToSelectionPalette(color);
                }

                if (isInput) {
                    boundElement.val(displayColor);
                }

                if (fireCallback && hasChanged) {
                    callbacks.change(color);
                    boundElement.trigger('change', [ color ]);
                }
            }

            function reflow() {
                if (!visible) {
                    return; // Calculations would be useless and wouldn't be reliable anyways
                }
                dragWidth = dragger.width();
                dragHeight = dragger.height();
                dragHelperHeight = dragHelper.height();
                slideWidth = slider.width();
                slideHeight = slider.height();
                slideHelperHeight = slideHelper.height();
                alphaWidth = alphaSlider.width();
                alphaSlideHelperWidth = alphaSlideHelper.width();

                if (!flat) {
                    container.css("position", "absolute");
                    if (opts.offset) {
                        container.offset(opts.offset);
                    } else {
                        container.offset(popups.calcOffset(container[0], offsetElement[0]));
                    }
                }

                updateHelperLocations();

                if (opts.showPalette) {
                    drawPalette();
                }

                boundElement.trigger('reflow.ColorPicker');
            }

            function destroy() {
                boundElement.show();
                offsetElement.off("click.ColorPicker touchstart.ColorPicker");
                container.remove();
                replacer.remove();
                pickers[spect.id] = null;
            }

            function option(optionName, optionValue) {
                if (optionName === undefined) {
                    return langx.mixin({}, opts);
                }
                if (optionValue === undefined) {
                    return opts[optionName];
                }

                opts[optionName] = optionValue;

                if (optionName === "preferredFormat") {
                    currentPreferredFormat = opts.preferredFormat;
                }
                applyOptions();
            }

            function enable() {
                disabled = false;
                boundElement.attr("disabled", false);
                offsetElement.removeClass("sp-disabled");
            }

            function disable() {
                hide();
                disabled = true;
                boundElement.attr("disabled", true);
                offsetElement.addClass("sp-disabled");
            }

            function setOffset(coord) {
                opts.offset = coord;
                reflow();
            }

            initialize();

            langx.mixin(this, {
                show: show,
                hide: hide,
                toggle: toggle,
                reflow: reflow,
                option: option,
                enable: enable,
                disable: disable,
                offset: setOffset,
                set: function (c) {
                    set(c);
                    updateOriginalInput();
                },
                get: get,
                destroy: destroy,
                container: container
            });
        }
    });


    plugins.register(ColorPicker,"colorPicker");

    /**
    * stopPropagation - makes the code only doing this a little easier to read in line
    */
    function stopPropagation(e) {
        e.stopPropagation();
    }

    /**
    * Create a function bound to a given object
    * Thanks to underscore.js
    */
    function bind(func, obj) {
        var slice = Array.prototype.slice;
        var args = slice.call(arguments, 2);
        return function () {
            return func.apply(obj, args.concat(slice.call(arguments)));
        };
    }

    ColorPicker.localization = { };
    ColorPicker.palettes = { };


    return spectrum.ColorPicker = ColorPicker;

});
