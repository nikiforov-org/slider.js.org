var EugenSlider = {

  defaultSettings: {
    pager: true,
    arrows: true,
    swipe: true,
    sliderSpeed: 1000,
    loop: true,
    pauseOnHover: true,
    sliderInterval: 5000
  },

  settings: {},
  selector: '[data-slider]',

  init: function (selector, options) {

    if (selector) {
      this.selector = selector
    }

    if (typeof options === 'object' && options.length > 0) {
      this.settings = Object.assign(settings, options)
    } else {
      this.settings = this.defaultSettings
    }

  },

  initSettings: function () {

    var sliders = document.querySelectorAll(this.selector)

    // Find all sliders and set them id
    for (var i = sliders.length; i--;) {
      // Add id to each slider
      sliders[i].id = 'slider-' + i
      // Init all sliders
      this.initSettings(sliders[i])
    }

  },

  /**
   * Init each slider with settings
   * @param {object} slider
   */
  initSettings: function (slider) {
    // Add default settings
    slider.settings = this.defaultSettings
    // Add custom settings
    if (slider.getAttribute('data-slider')) {
      try {
        var customSettings = JSON.parse((slider.getAttribute(this.selector).replace(/'/g, '"')))
      } catch () {
        console.log('Invalid parameters')
        return false
      }

      Object.keys(customSettings).forEach(function (key) {
        slider.settings[key] = customSettings[key]
      })

      return true;
    }
    this.buildNodes(slider)

    /**
     * Apply settings
     */
    if (slider.settings.arrows) {
      this.buildArrows(slider)
    }

    if (slider.settings.pager) {
      this.buildPager(slider)
    }

    if (slider.settings.swipe) {
      this.swiping(slider)
    }

    if (slider.settings.loop) {
      this.startLooping(slider)
      var self = this;
      if (slider.settings.pauseOnHover) {
        slider.addEventListener('mouseover', function () {
          self.pauseLooping(slider)
        })
        slider.addEventListener('mouseout', function () {
          self.startLooping(slider)
        })
      }
    }
  }
  ,

  /**
   * Build main slider nodes
   * @param {object} slider
   */
  buildNodes: function (slider) {
    var
      slides = document.createElement('div')

    slider.slides = slider.children.length // slider.slides — slides quantity in slider
    slides.className = 'slides'

    for (var s = slider.slides; s--;) {
      var slide = document.createElement('div')

      slide.className = 'slide'
      slide.id = slider.id.replace('r', '') + '-' + s

      slide.appendChild(slider.children[s])
      slides.appendChild(slide)
    }

    slider.appendChild(slides)
  },

  /**
   * Build arrows
   * @param {object} slider
   */
  buildArrows: function (slider) {
    var
      arrowsLayer = document.createElement('div'),
      next = document.createElement('div'),
      prev = document.createElement('div')

    arrowsLayer.className = 'arrows'
    next.className = 'next'
    prev.className = 'prev'

    arrowsLayer.appendChild(next)
    arrowsLayer.appendChild(prev)
    slider.appendChild(arrowsLayer)

    var self = this;
    next.addEventListener('click', function () {
      self.slideTo(slider, 'next')
    })

    prev.addEventListener('click', function () {
      self.slideTo(slider, 'prev')
    })
  }
  ,

  /**
   * Build pager
   * @param {object} slider
   */
  buildPager: function (slider) {
    var
      pagerLayer = document.createElement('div')

    pagerLayer.className = 'pager'

    for (var p = slider.slides; p--;) {
      var
        page = document.createElement('div')

      page.className = 'page'

      if (p === 0) {
        page.classList.add('active')
      }

      var self = this;
      (function (p) {
        page.addEventListener('click', function () {
          self.slideTo(slider, p)
        })
      })(p)

      pagerLayer.prepend(page)
    }
    slider.appendChild(pagerLayer)
  },

  /**
   * Start looping
   * @param {object} slider
   */
  startLooping: function (slider) {

    var self = this;
    slider.looping = setInterval(function () {
      self.slideTo(slider, 'next')
    }, slider.settings.sliderInterval)
  }

  /**
   * Pause looping
   * @param {object} slider
   */
  pauseLooping: function (slider) {
    slider.looping = clearInterval(slider.looping)
  }
  ,

  /**
   * Swiping
   * @param {object} slider
   */
  swiping: function (slider) {
    var touchstartX = 0
    var touchendX = 0

    var self = this;

    slider.addEventListener('touchstart', function (event) {
      self.pauseLooping(slider)
      touchstartX = event.changedTouches[0].screenX
    }, false)

    slider.addEventListener('touchend', function (event) {
      touchendX = event.changedTouches[0].screenX
      self.handleGesture()
      self.startLooping(slider)
    }, false)

  }
  ,

  handleGesture: function () {
    if (touchendX < touchstartX) {
      this.slideTo(slider, 'next')
    }

    if (touchendX > touchstartX) {
      this.slideTo(slider, 'prev')
    }
  }
  ,

  /**
   * Calculate and make destination slide
   * @param {object} slider
   * @param {number|string} page
   */
  slideTo: function (slider, page) {

    var
      slides = slider.querySelector('.slides'),
      sliderNumber = parseInt(slider.id.replace('slider-', '')),
      activeSlideNumber = parseInt(slides.lastChild.id.replace('slide-' + sliderNumber + '-', ''))

    /**
     * Calculate destination slide
     */
    switch (page) {
      case 'next':
        if (activeSlideNumber === slider.slides - 1) {
          activeSlideNumber = 0
        } else {
          activeSlideNumber++
        }
        this.makeSlide(sliderNumber, activeSlideNumber, page)
        break
      case 'prev':
        if (activeSlideNumber === 0) {
          activeSlideNumber = slider.slides - 1
        } else {
          activeSlideNumber--
        }
        this.makeSlide(sliderNumber, activeSlideNumber, page)
        break
      default:
        if (page < activeSlideNumber) {
          this.makeSlide(sliderNumber, page, 'prev')
        } else {
          this.makeSlide(sliderNumber, page, 'next')
        }
        break
    }
  }
  ,

  /**
   * Make destination slide
   * @param {number} sliderNumber
   * @param {number} page
   * @param {string} direction
   */
  makeSlide: function (sliderNumber, page, direction) {
    var
      activeSlide = document.getElementById('slide-' + sliderNumber + '-' + page)

    activeSlide.style.animationName = direction
    activeSlide.style.animationDuration = slider.settings.sliderSpeed / 1000 + 's'

    slides.appendChild(activeSlide)
    if (slider.settings.pager) {
      var pagerLayer = slider.querySelector('.pager')
      for (var i = pagerLayer.children.length; i--;) {
        pagerLayer.children[i].classList.remove('active')
      }
      pagerLayer.children[page].classList.add('active')
    }
  }

}


document.addEventListener('DOMContentLoaded', function (event) {
  EugenSlider.init ();

}})
