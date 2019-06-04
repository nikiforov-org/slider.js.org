(function() {
    var
        sliders = document.querySelectorAll('[data-slider]');

    for (var i = 0; i < sliders.length; i++) {

        /**
         * Default settings
         */
        var
            slider          = sliders[i],
            loop            = true,
            sliderInterval  = 5000,
            sliderSpeed     = 1000,
            pager           = true,
            swipe           = true,
            arrows          = true,
            pauseOnHover    = true;

        slider.id = 'slider-' + i;

        /**
         * Get settings if exists
         */

        if (slider.getAttribute('data-slider')) {

            var settings = JSON.parse((slider.getAttribute('data-slider').replace(/'/g,'"')));

            if (settings.sliderInterval) {
                sliderInterval = settings.sliderInterval;
            }

            if (settings.sliderSpeed) {
                sliderSpeed = settings.sliderSpeed;
            }

            if (settings.pager === false) {
                pager = false;
            }

            if (settings.arrows === false) {
                arrows = false;
            }

            if (settings.loop === false) {
                loop = false;
                pauseOnHover = false;
            }

            if (settings.pauseOnHover === false) {
                pauseOnHover = false;
            }

            if (settings.swipe === false) {
                swipe = false;
            }

        }



        /**
         * Wrap slides
         */
        var
            slides = document.createElement('div');

        slides.className = 'slides';

        slider.appendChild(slides);

        for (var s = 0; slider.children.length > 1; s++) {
            var
                slide = document.createElement('div');

            slide.className = 'slide';
            slide.id = 'slide-' + i + '-' + s;

            slide.appendChild(slider.children[0]);
            slides.appendChild(slide);
        }

        slides.appendChild(slides.firstChild); // Make the first slide active

        /**
         * Add pager
         */
        if (pager) {
            var
                pagerLayer = document.createElement('div');

            pagerLayer.className = 'pager';

            for (var p = 0; p < slides.children.length; p++) {

                var
                    page = document.createElement('div');

                page.className = 'page';

                if (p === 0) {
                    page.classList.add('active');
                }

                (function(slider, p, pager) {
                    page.addEventListener('click', function() {
                        slideTo(slider, p, pager);
                    }, false);
                })(slider, p, pager);

                pagerLayer.appendChild(page);
            }
            slider.appendChild(pagerLayer);
        }

        /**
         * Add arrows
         */
        if (arrows) {
            var
                arrowsLayer = document.createElement('div'),
                next        = document.createElement('div'),
                prev        = document.createElement('div');

            arrowsLayer.className = 'arrows';
            next.className = 'next';
            prev.className = 'prev';

            arrowsLayer.appendChild(next);
            arrowsLayer.appendChild(prev);
            slider.appendChild(arrowsLayer);

            (function(slider) {
                next.addEventListener('click', function() { slideTo(slider, 'next', pager) });
                prev.addEventListener('click', function() { slideTo(slider, 'prev', pager) });
            })(slider);
        }

        /**
         * Loop slider
         */
        if (loop) {
            (function(slider) {

                /**
                 * Make looping
                 */
                var loopSlider = setInterval(function() {
                    slideTo(slider, 'next', pager);
                }, sliderInterval);

                /**
                 * Pause loop on hover
                 */
                if (pauseOnHover) {
                    slider.addEventListener('mouseover', function() { clearInterval(loopSlider) });
                    slider.addEventListener('mouseout', function() { loopSlider = setInterval(function() {
                        slideTo(slider, 'next', pager);
                    }, sliderInterval) });
                }
            })(slider);
        }

        /**
         * Loop slider
         */
        if (swipe) {
            (function(slider) {
                var 
                    touchStartCoords =  {'x':-1, 'y':-1}, // X and Y coordinates on mousedown or touchstart events.
                    touchEndCoords = {'x':-1, 'y':-1},// X and Y coordinates on mouseup or touchend events.
                    direction = 'undefined',// Swipe direction
                    minDistanceXAxis = 30,// Min distance on mousemove or touchmove on the X axis
                    maxDistanceYAxis = 30,// Max distance on mousemove or touchmove on the Y axis
                    maxAllowedTime = 1000,// Max allowed time between swipeStart and swipeEnd
                    startTime = 0,// Time on swipeStart
                    elapsedTime = 0;// Elapsed time between swipeStart and swipeEnd

                function swipeStart(e) {
                    e = e ? e : window.event;
                    e = ('changedTouches' in e)?e.changedTouches[0] : e;
                    touchStartCoords = {'x':e.pageX, 'y':e.pageY};
                    startTime = new Date().getTime();
                }    

                function swipeMove(e){
                    e = e ? e : window.event;
                    e.preventDefault();
                }

                function swipeEnd(e) {
                    e = e ? e : window.event;
                    e = ('changedTouches' in e)?e.changedTouches[0] : e;
                    touchEndCoords = {'x':e.pageX - touchStartCoords.x, 'y':e.pageY - touchStartCoords.y};
                    elapsedTime = new Date().getTime() - startTime;
                    if (elapsedTime <= maxAllowedTime){
                        if (Math.abs(touchEndCoords.x) >= minDistanceXAxis && Math.abs(touchEndCoords.y) <= maxDistanceYAxis){
                        direction = (touchEndCoords.x < 0)? 'left' : 'right';
                        switch(direction) {
                            case 'left':
                                slideTo(slider, 'next', pager);;
                                break;
                            case 'right':
                                slideTo(slider, 'prev', pager);
                                break;
                            }
                        }
                    }
                }

                function addMultipleListeners(el, s, fn) {
                    var evts = s.split(' ');
                    for (var i = 0, iLen= evts.length; i < iLen; i++) {
                        el.addEventListener(evts[i], fn, false);
                    }
                }

                addMultipleListeners(slider, 'mousedown touchstart', swipeStart);
                addMultipleListeners(slider, 'mousemove touchmove', swipeMove);
                addMultipleListeners(slider, 'mouseup touchend', swipeEnd);

            })(slider);
        }
    }

    /**
     * Calculate and make destination slide
     * @param {object} slider
     * @param {number|string} page
     * @param {bool} pager
     */
    function slideTo(slider, page, pager) {

        var
            slides            = slider.querySelector('.slides'),
            sliderNumber      = parseInt(slider.id.replace('slider-', '')),
            activeSlideNumber = parseInt(slides.lastChild.id.replace('slide-' + sliderNumber + '-',''));

        /**
         * Calculate destination slide
         */
        switch (page) {
            case 'next':
                if (activeSlideNumber === slides.children.length - 1) {
                    activeSlideNumber = 0;
                } else {
                    activeSlideNumber++;
                }
                makeSlide(sliderNumber, activeSlideNumber, page);
                break;
            case 'prev':
                if (activeSlideNumber === 0) {
                    activeSlideNumber = slides.children.length - 1;
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
        }

        /**
         * Make destination slide
         * @param {number} sliderNumber
         * @param {number} page
         */
        function makeSlide(sliderNumber, page, direction) {
            var
                activeSlide = document.getElementById('slide-' + sliderNumber + '-' + page);

            activeSlide.style.animationName     = direction;
            activeSlide.style.animationDuration = sliderSpeed/1000 + 's';

            slides.appendChild(activeSlide);
            if (pager) {
                var pagerLayer = slider.querySelector('.pager');
                for (var i = 0; i < pagerLayer.children.length; i++) {
                    pagerLayer.children[i].classList.remove('active');
                }
                pagerLayer.children[page].classList.add('active');
            }
        }
    }

}());
