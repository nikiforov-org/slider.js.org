(function() {
    // Default settings
    var
        settings = {
            pager           : true,
            arrows          : true,
            swipe           : true,
            sliderSpeed     : 1000,
            loop            : true,
            pauseOnHover    : true,
            sliderInterval  : 5000
        };

    // Each slider has attribute 'data-slider'
    var
        sliders = document.querySelectorAll('[data-slider]');

    // Find all sliders and set them id
    for (var i = sliders.length; i--;) {
        // Add id to each slider
        sliders[i].id = 'slider-' + i;
        // Init all sliders
        initSettings(sliders[i]);
    }

    /**
     * Init each slider with settings
     * @param {object} slider
     */
    function initSettings(slider) {
        // Add default settings
        slider.settings = settings;
        // Add custom settings
        if (slider.getAttribute('data-slider')) {
            var
                customSettings = JSON.parse((slider.getAttribute('data-slider').replace(/'/g,'"')));

            Object.keys(customSettings).forEach(function(key) {
                slider.settings[key] = customSettings[key]
            })
        }
        buildNodes(slider);

        /**
         * Apply settings
         */
        if (slider.settings.arrows) {
            buildArrows(slider)
        }

        if (slider.settings.pager) {
            buildPager(slider)
        }

        if (slider.settings.swipe) {
            swiping(slider)
        }

        if (slider.settings.loop) {
            startLooping(slider);
            if (slider.settings.pauseOnHover) {
                slider.addEventListener('mouseover', function() {
                    pauseLooping(slider)
                });
                slider.addEventListener('mouseout', function() {
                    startLooping(slider)
                });
            }
        }
    }

    /**
     * Build main slider nodes
     * @param {object} slider
     */
    function buildNodes(slider) {
        var
            slides = document.createElement('div');

        slider.slides = slider.children.length; // slider.slides — slides quantity in slider
        slides.className = 'slides';

        for (var s = slider.slides; s--;) {
            var
                slide = document.createElement('div');

            slide.className = 'slide';
            slide.id = slider.id.replace('r','') + '-' + s;

            slide.appendChild(slider.children[s]);
            slides.appendChild(slide);
        }

        slider.appendChild(slides);
    }

    /**
     * Build arrows
     * @param {object} slider
     */
    function buildArrows(slider) {
        var
            arrowsLayer = document.createElement('div'),
            next        = document.createElement('div'),
            prev        = document.createElement('div');

        arrowsLayer.className   = 'arrows';
        next.className          = 'next';
        prev.className          = 'prev';

        arrowsLayer.appendChild(next);
        arrowsLayer.appendChild(prev);
        slider.appendChild(arrowsLayer);

        next.addEventListener('click', function() {
            slideTo(slider, 'next')
        });

        prev.addEventListener('click', function() {
            slideTo(slider, 'prev')
        });
    }

    /**
     * Build pager
     * @param {object} slider
     */
    function buildPager(slider) {
        var
            pagerLayer = document.createElement('div');

        pagerLayer.className = 'pager';

        for (var p = slider.slides; p--;) {
            var
                page = document.createElement('div');

            page.className = 'page';

            if (p === 0) {
                page.classList.add('active');
            }

            (function(p) {
                page.addEventListener('click', function() {
                    slideTo(slider, p)
                });
            })(p);

            pagerLayer.prepend(page);
        }
        slider.appendChild(pagerLayer);
    }

    /**
     * Start looping
     * @param {object} slider
     */
    function startLooping(slider) {
        slider.looping = setInterval(function() {
            slideTo(slider, 'next')
        }, slider.settings.sliderInterval)
    }

    /**
     * Pause looping
     * @param {object} slider
     */
    function pauseLooping(slider) {
        slider.looping = clearInterval(slider.looping)
    }

    /**
     * Swiping
     * @param {object} slider
     */
    function swiping(slider) {
        var touchstartX = 0;
        var touchendX = 0;

        slider.addEventListener('touchstart', function(event) {
            pauseLooping(slider);
            touchstartX = event.changedTouches[0].screenX;
        }, false);

        pressEnd(slider, function(event) {
            if (event.changedTouches) {
                touchendX = event.changedTouches[0].screenX;
            } else {
                touchendX = event.screenX;
            }
            handleGesture();
            startLooping(slider);
        }, false);

        function handleGesture() {
            if (touchendX < touchstartX) {
                slideTo(slider, 'next')
            }

            if (touchendX > touchstartX) {
                slideTo(slider, 'prev')
            }
        }
    }

    /**
     * Calculate and make destination slide
     * @param {object} slider
     * @param {number|string} page
     */
    function slideTo(slider, page) {

        var
            slides            = slider.querySelector('.slides'),
            sliderNumber      = parseInt(slider.id.replace('slider-', '')),
            activeSlideNumber = parseInt(slides.lastChild.id.replace('slide-' + sliderNumber + '-',''));

        /**
         * Calculate destination slide
         */
        switch (page) {
            case 'next':
                if (activeSlideNumber === slider.slides - 1) {
                    activeSlideNumber = 0;
                } else {
                    activeSlideNumber++;
                }
                makeSlide(sliderNumber, activeSlideNumber, page);
                break;
            case 'prev':
                if (activeSlideNumber === 0) {
                    activeSlideNumber = slider.slides - 1;
                } else {
                    activeSlideNumber--;
                }
                makeSlide(sliderNumber, activeSlideNumber, page);
                break;
            default:
                if (page < activeSlideNumber) {
                    makeSlide(sliderNumber, page, 'prev');
                } else {
                    makeSlide(sliderNumber, page, 'next');
                }
                break;
        }

        /**
         * Make destination slide
         * @param {number} sliderNumber
         * @param {number} page
         * @param {string} direction
         */
        function makeSlide(sliderNumber, page, direction) {
            var
                activeSlide = document.getElementById('slide-' + sliderNumber + '-' + page);

            activeSlide.style.animationName     = direction;
            activeSlide.style.animationDuration = slider.settings.sliderSpeed/1000 + 's';

            slides.appendChild(activeSlide);
            if (slider.settings.pager) {
                var pagerLayer = slider.querySelector('.pager');
                for (var i = pagerLayer.children.length; i--;) {
                    pagerLayer.children[i].classList.remove('active');
                }
                pagerLayer.children[page].classList.add('active');
            }
        }
    }
}());
