(function(w, d) {
  var raf = w.requestAnimationFrame || w.setImmediate || function(c) { return setTimeout(c, 0); };

  function initEl(el, mode) {
    if (el.hasOwnProperty('data-simple-scrollbar')) return;
    Object.defineProperty(el, 'data-simple-scrollbar', new SimpleScrollbar(el, mode));
  }

  // Mouse drag handler
  function dragVerticalDealer(el, context) {
    var lastPageY;

    el.addEventListener('mousedown', function(e) {
      lastPageY = e.pageY;
      el.classList.add('ss-grabbed');
      d.body.classList.add('ss-grabbed');

      d.addEventListener('mousemove', drag);
      d.addEventListener('mouseup', stop);

      return false;
    });

    function drag(e) {
      var delta = e.pageY - lastPageY;
      lastPageY = e.pageY;

      raf(function() {
        context.el.scrollTop += delta / context.scrollVerticalRatio;
      });
    }

    function stop() {
      el.classList.remove('ss-grabbed');
      d.body.classList.remove('ss-grabbed');
      d.removeEventListener('mousemove', drag);
      d.removeEventListener('mouseup', stop);
    }
  }

  function dragHorizontalDealer(el, context) {
    var lastPageX;

    el.addEventListener('mousedown', function(e) {
      lastPageX = e.pageX;
      el.classList.add('ss-grabbed');
      d.body.classList.add('ss-grabbed');

      d.addEventListener('mousemove', drag);
      d.addEventListener('mouseup', stop);

      return false;
    });

    function drag(e) {
      var delta = e.pageX - lastPageX;
      lastPageX = e.pageX;

      raf(function() {
        context.el.scrollLeft += delta / context.scrollHorizontalRatio;
      });
    }

    function stop() {
      el.classList.remove('ss-grabbed');
      d.body.classList.remove('ss-grabbed');
      d.removeEventListener('mousemove', drag);
      d.removeEventListener('mouseup', stop);
    }
  }

  // Constructor
  function ss(el, mode) {
    this.target = el;

    this.wrapper = d.createElement('div');
    this.wrapper.setAttribute('class', 'ss-wrapper '+(mode? mode : 'horizontal vertical'));

    this.el = el;
    this.el.classList.add('ss-content');

    var parent = this.target.parentElement;
    this.target.remove();
    parent.appendChild(this.wrapper);
    this.wrapper.appendChild(this.target);

    var cssSize = (SimpleScrollbar.width > 0)? 'calc(100% + '+SimpleScrollbar.width+'px)' : '100%';
    if (mode !== 'horizontal') {
      this.wrapper.insertAdjacentHTML('beforeend', '<div class="ss-scroll vertical">');
      this.vBar = this.wrapper.lastChild;
      dragVerticalDealer(this.vBar, this);
      this.moveVerticalBar();
      this.el.addEventListener('scroll', this.moveVerticalBar.bind(this));
      this.el.addEventListener('mouseenter', this.moveVerticalBar.bind(this));
      this.el.style.width = cssSize;
    }

    if (mode !== 'vertical') {
      this.wrapper.insertAdjacentHTML('beforeend', '<div class="ss-scroll horizontal">');
      this.hBar = this.wrapper.lastChild;
      dragHorizontalDealer(this.hBar, this);
      this.moveHorizontalBar();
      this.el.addEventListener('scroll', this.moveHorizontalBar.bind(this));
      this.el.addEventListener('mouseenter', this.moveHorizontalBar.bind(this));
      this.el.style.height = cssSize;
    }
    /*
    var css = window.getComputedStyle(el);
  	if (css['height'] === '0px' && css['max-height'] !== '0px') {
    	el.style.height = css['max-height'];
    }*/
  }

  ss.prototype = {
    moveVerticalBar: function(e) {
      var totalHeight = this.el.scrollHeight,
          ownHeight = this.el.clientHeight,
          _this = this;

      this.scrollVerticalRatio = ownHeight / totalHeight;

      raf(function() {
        // Hide scrollbar if no scrolling is possible
        if(_this.scrollVerticalRatio === 1) {
          _this.vBar.classList.add('ss-hidden');
        } else {
          _this.vBar.classList.remove('ss-hidden');
          _this.vBar.style.cssText = 'height:' + (_this.scrollVerticalRatio) * 100 + '%; top:' + (_this.el.scrollTop / totalHeight ) * 100 + '%;';
        }
      });
    },
    moveHorizontalBar: function(e) {
      var totalWidth = this.el.scrollWidth,
          ownWidth = this.el.clientWidth,
          _this = this;

      this.scrollHorizontalRatio = ownWidth / totalWidth;

      raf(function() {
        // Hide scrollbar if no scrolling is possible
        if(_this.scrollHorizontalRatio === 1) {
          _this.hBar.classList.add('ss-hidden');
        } else {
          _this.hBar.classList.remove('ss-hidden');
          _this.hBar.style.cssText = 'width:' + (_this.scrollHorizontalRatio) * 100 + '%; left:' + (_this.el.scrollLeft / totalWidth ) * 100 + '%;';
        }
      });
    }
  }

  function detectScrollbarSize() {
    // Create the measurement node
    var scrollDiv = document.createElement("div");
    scrollDiv.className = "scrollbar-measure";
    document.body.appendChild(scrollDiv);
    ss.width = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    document.body.removeChild(scrollDiv);
  }

  function initAll(mode) {
    var nodes = d.querySelectorAll('*[ss-container]');
    for (var i = 0; i < nodes.length; i++) {
      initEl(nodes[i], mode);
    }
  }

  d.onreadystatechange = function () {
    if (document.readyState === 'interactive') {
      detectScrollbarSize();
    }
  };
  ss.initEl = initEl;
  ss.initAll = initAll;

  w.SimpleScrollbar = ss;
})(window, document);
