
/*

  Shape Shifter
  =============
  A canvas experiment by Kenneth Cachia
  http://www.kennethcachia.com

  Updated code
  ------------
  https://github.com/kennethcachia/Shape-Shifter 

*/

(function () {

  function vOrF(x) {
    if (typeof x == "function") {
      return x();
    }
    return x;
  }

  let hasBeenInited = false;

  var ShapeShifter = {

    setOptions: function (newOptions) {

      let options = this.options;

      for (let key in newOptions) {

        options[key] = newOptions[key];

      }

      ShapeShifter.Dot.setOptions(options);

      ShapeShifter.Drawing.setOptions(options);

      ShapeShifter.Shape.setOptions(options);

      ShapeShifter.ShapeBuilder.setOptions(options);

    },

    init: function (options) {

      const defaults = {

        snowActive: true,

        outWidth: window.innerWidth,
        outHeight: window.innerHeight,

        fontSize: 500,
        fontFamily: "",

        pixelScanGap: 13,

        stochasticMovementDistance: () => (Math.random() * 2 - 1) * 25,
        fallingSpeed: 0.8,
        dotInitialSpeed: 0.07,
        initialNumberOfDots: 0,

        shapeDotRadius: 5,
        shapeToShapeDotBlowUpSize: () => (Math.random() + 0.5) * 20,
        noShapeToShapeDotBlowUpSize: () => (Math.random() + 1) * 5,
        shapeToNoShapeDotBlowUpSize: () => (Math.random() + 0.5) * 20,
        shapeToShapeDotHoldCount: 18,
        noShapeToShapeDotHoldCount: 30,
        shapeToNoShapeDotHoldCount: 20,
        noShapeDotRadius: () => Math.random() * 4,
        noShapeToShapeDotSpeed: 0.11,
        shapeToShapeDotSpeed: 0.14,
        fastToShapeDotHoldCount: 18,
        fastToShapeDotSpeed: 0.25,
        noShapeDotSpeed: () => (1 + Math.random()) * 0.02,
        shapeToShapeDotAlpha: () => Math.random(),
        shapeDotAlpha: 1,
        noShapeDotAlpha: 0.3,
        shapeToNoShapeAlpha: () => Math.random()

      }


      if (hasBeenInited) {
        return;
      }

      hasBeenInited = true;

      options = this.options = options || {};
      
      var action = window.location.href,
        i = action.indexOf('?a=');


      for (let key in defaults) {

        if (typeof options[key] == "undefined") {
          options[key] = defaults[key];
        }

      }

      this.setOptions(options);

      
      ShapeShifter.Dot.init(options);

      ShapeShifter.Drawing.init(options);

      ShapeShifter.Shape.init(options);

      ShapeShifter.ShapeBuilder.init(options);


      if (i !== -1) {
        ShapeShifter.UI.simulate(decodeURI(action).substring(i + 3));
      } else {
        //S.UI.simulate('Shape|Shifter|Type|to start|#rectangle|#countdown 3||');
        //ShapeShifter.UI.simulate('#rectangle 200x100||');
        //ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(''));  
      }

      ShapeShifter.Drawing.loop(function () {
        ShapeShifter.Shape.render();
        ShapeShifter.Drawing.copyToAllCanvases();
      });
    }
  };


  ShapeShifter.Drawing = (function () {
    let canvases,
      contextes,
      outWidth,
      outHeight,
      renderFn,
      requestFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };

    return {
      init: function () {
      },

      setOptions: function (options) {

        options = options || {};

        canvases = options.outCanvases;
        contextes = Array.from(canvases).map(canvas => canvas.getContext('2d'));

        outWidth = options.outWidth;
        outHeight = options.outHeight;

        this.adjustCanvas();

      },

      loop: function (fn) {
        renderFn = !renderFn ? fn : renderFn;
        this.clearFrame();
        renderFn();
        requestFrame.call(window, this.loop.bind(this));
      },

      adjustCanvas: function () {
        canvases.forEach(canvas => {
          canvas.width = outWidth;
          canvas.height = outHeight;
        })
      },

      clearFrame: function () {
        contextes.forEach(context => context.clearRect(0, 0, outWidth, outHeight));
      },

      getArea: function () {
        return { w: outWidth, h: outHeight };
      },

      drawCircle: function (p) {
        let rootContext = contextes[0];
        // rootContext.fillStyle = c.render();
        rootContext.fillStyle = 'rgba(' + p.r + ',' + + p.g + ',' + p.b + ',' + p.a + ')';
        rootContext.beginPath();
        rootContext.arc(p.x, p.y, p.z, 0, 2 * Math.PI, true);
        rootContext.closePath();
        rootContext.fill();
      },

      copyToAllCanvases: function () {

        let rootCanvas = canvases[0];
        for (let i = 1; i < contextes.length; i++) {
          contextes[i].drawImage(rootCanvas, 0, 0);
        }

      }
    }
  }());


  ShapeShifter.UI = (function () {
    var input = document.querySelector('.ui-input'),
      ui = document.querySelector('.ui'),
      help = document.querySelector('.help'),
      commands = document.querySelector('.commands'),
      overlay = document.querySelector('.overlay'),
      canvas = document.querySelector('.canvas'),
      interval,
      isTouch = false, //('ontouchstart' in window || navigator.msMaxTouchPoints),
      currentAction,
      resizeTimer,
      time,
      maxShapeSize = 30,
      firstAction = true,
      sequence = [],
      cmd = '#';

    function formatTime(date) {
      var h = date.getHours(),
        m = date.getMinutes(),
        m = m < 10 ? '0' + m : m;
      return h + ':' + m;
    }

    function getValue(value) {
      return value && value.split(' ')[1];
    }

    function getAction(value) {
      value = value && value.split(' ')[0];
      return value && value[0] === cmd && value.substring(1);
    }

    function timedAction(fn, delay, max, reverse) {
      clearInterval(interval);
      currentAction = reverse ? max : 1;
      fn(currentAction);

      if (!max || (!reverse && currentAction < max) || (reverse && currentAction > 0)) {
        interval = setInterval(function () {
          currentAction = reverse ? currentAction - 1 : currentAction + 1;
          fn(currentAction);

          if ((!reverse && max && currentAction === max) || (reverse && currentAction === 0)) {
            clearInterval(interval);
          }
        }, delay);
      }
    }

    function reset(destroy) {
      clearInterval(interval);
      sequence = [];
      time = null;
      destroy && ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(''));
    }

    function performAction(value) {
      var action,
        value,
        current;

      if (overlay) {
        overlay.classList.remove('overlay--visible');
      }

      sequence = typeof (value) === 'object' ? value : sequence.concat(value.split('|'));
      if (input) {
        input.value = '';
        checkInputWidth();
      }

      timedAction(function (index) {
        current = sequence.shift();
        action = getAction(current);
        value = getValue(current);

        switch (action) {
          case 'countdown':
            value = parseInt(value) || 10;
            value = value > 0 ? value : 10;

            timedAction(function (index) {
              if (index === 0) {
                if (sequence.length === 0) {
                  ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(''));
                } else {
                  performAction(sequence);
                }
              } else {
                ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(index), true);
              }
            }, 1000, value, true);
            break;

          case 'rectangle':
            value = value && value.split('x');
            value = (value && value.length === 2) ? value : [maxShapeSize, maxShapeSize / 2];

            ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.rectangle(Math.min(maxShapeSize, parseInt(value[0])), Math.min(maxShapeSize, parseInt(value[1]))));
            break;

          case 'circle':
            value = parseInt(value) || maxShapeSize;
            value = Math.min(value, maxShapeSize);
            ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.circle(value));
            break;

          case 'time':
            var t = formatTime(new Date());

            if (sequence.length > 0) {
              ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(t));
            } else {
              timedAction(function () {
                t = formatTime(new Date());
                if (t !== time) {
                  time = t;
                  ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(time));
                }
              }, 1000);
            }
            break;

          default:
            ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(current[0] === cmd ? 'What?' : current));
        }
      }, 2000, sequence.length);
    }

    function checkInputWidth(e) {
      if (input.value.length > 18) {
        ui.classList.add('ui--wide');
      } else {
        ui.classList.remove('ui--wide');
      }

      if (firstAction && input.value.length > 0) {
        ui.classList.add('ui--enter');
      } else {
        ui.classList.remove('ui--enter');
      }
    }

    function bindEvents() {
      if (input) {
        document.body.addEventListener('keydown', function (e) {
          input.focus();

          if (e.keyCode === 13) {
            firstAction = false;
            reset();
            performAction(input.value);
          }
        });

        input.addEventListener('input', checkInputWidth);
        input.addEventListener('change', checkInputWidth);
        input.addEventListener('focus', checkInputWidth);
      }

      if (help) {
        help.addEventListener('click', function (e) {
          overlay.classList.toggle('overlay--visible');
          overlay.classList.contains('overlay--visible') && reset(true);
        });
      }

      if (commands) {
        commands.addEventListener('click', function (e) {
          var el,
            info,
            demo,
            tab,
            active,
            url;

          if (e.target.classList.contains('commands-item')) {
            el = e.target;
          } else {
            el = e.target.parentNode.classList.contains('commands-item') ? e.target.parentNode : e.target.parentNode.parentNode;
          }

          info = el && el.querySelector('.commands-item-info');
          demo = el && info.getAttribute('data-demo');
          url = el && info.getAttribute('data-url');

          if (info) {
            overlay.classList.remove('overlay--visible');

            if (demo) {
              input.value = demo;

              if (isTouch) {
                reset();
                performAction(input.value);
              } else {
                input.focus();
              }
            } else if (url) {
              //window.location = url;
            }
          }
        });

      }

      if (canvas) {
        canvas.addEventListener('click', function (e) {
          overlay.classList.remove('overlay--visible');
        });
      }
    }

    function init() {
      bindEvents();
      if (input) {
        input.focus();
      }
      isTouch && document.body.classList.add('touch');
    }

    // Init
    init();

    return {
      simulate: function (action) {
        performAction(action);
      }
    }
  }());


  ShapeShifter.UI.Tabs = (function () {
    var tabs = document.querySelector('.tabs'),
      labels = document.querySelector('.tabs-labels'),
      triggers = document.querySelectorAll('.tabs-label'),
      panels = document.querySelectorAll('.tabs-panel');

    if (triggers && panels && labels) {
      function activate(i) {
        triggers[i].classList.add('tabs-label--active');
        panels[i].classList.add('tabs-panel--active');
      }

      function bindEvents() {
        labels.addEventListener('click', function (e) {
          var el = e.target,
            index;

          if (el.classList.contains('tabs-label')) {
            for (var t = 0; t < triggers.length; t++) {
              triggers[t].classList.remove('tabs-label--active');
              panels[t].classList.remove('tabs-panel--active');

              if (el === triggers[t]) {
                index = t;
              }
            }

            activate(index);
          }
        });
      }

      function init() {
        activate(0);
        bindEvents();
      }

      // Init
      init();

    }

  }());


  ShapeShifter.Point = function (args) {
    this.x = args.x;
    this.y = args.y;
    this.z = args.z;
    this.r = args.r;
    this.g = args.g;
    this.b = args.b;
    this.a = args.a;
    this.holdCounter = args.holdCounter;
  };

  ShapeShifter.Point.prototype.clone = function () {
    return new ShapeShifter.Point({
      x: this.x,
      y: this.y,
      z: this.z,
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
      holdCounter: this.holdCounter
    });
  };


  (function () {

    let stochasticMovementDistance;
    let targetFallingSpeed;
    let currentFallingSpeed = null;
    let dotInitialSpeed;

    ShapeShifter.Dot = function (startPoint) {
      this.currentPoint = startPoint;

      this.speed = dotInitialSpeed;
      this.targetPoint = this.currentPoint.clone();
      this.moveQueue = [];

    };

    ShapeShifter.Dot.init = function (options) {
    }

    ShapeShifter.Dot.setOptions = function (options) {
      options = options || {};

      stochasticMovementDistance = options.stochasticMovementDistance;
      targetFallingSpeed = options.fallingSpeed;
      dotInitialSpeed = options.dotInitialSpeed;

      if (currentFallingSpeed === null) {
        currentFallingSpeed = targetFallingSpeed;
      }
    }

    ShapeShifter.Dot._updateCommonVariables = function () {
      currentFallingSpeed -= (currentFallingSpeed - targetFallingSpeed) * 0.001;
    }

    ShapeShifter.Dot.prototype = {

      moveUpToAboveDrawingArea: function () {
        let currentPoint = this.currentPoint;
        let targetPoint = this.targetPoint;
        let drawingHeight = ShapeShifter.Drawing.getArea().h;

        if (drawingHeight < currentPoint.y) {
          currentPoint.y = targetPoint.y = (currentPoint.y % drawingHeight * 2) - 2 * drawingHeight;
        }

      },

      moveOutOfDrawingAreaToBelowDrawingArea: function () {
        let currentPoint = this.currentPoint;
        let targetPoint = this.targetPoint;
        let drawingHeight = ShapeShifter.Drawing.getArea().h;
        if (currentPoint.y < 0) {
          targetPoint.y = currentPoint.y += 2 * drawingHeight;
        }

      },

      _draw: function () {
        //this.c.a = this.currentPoint.a;
        // ShapeShifter.Drawing.drawCircle(this.currentPoint, this.c);
        ShapeShifter.Drawing.drawCircle(this.currentPoint);

      },

      // Returns true if successfully moved
      _moveTowards: function (n) {
        var details = this.distanceTo(n, true),
          dx = details[0],
          dy = details[1],
          d = details[2],
          dr = details[3],
          dg = details[4],
          db = details[5],
          da = details[6];

        let currentPoint = this.currentPoint;
        let speed = this.speed;

        // -1 = immediate jump
        if (currentPoint.holdCounter === -1) {
          currentPoint.x = n.x;
          currentPoint.y = n.y;
          currentPoint.r = n.r;
          currentPoint.g = n.g;
          currentPoint.b = n.b;
          return true;
        }

        if (0.25 < d) {
          currentPoint.x -= dx * speed;
          currentPoint.y -= dy * speed;
          currentPoint.r -= dr * speed;
          currentPoint.g -= dg * speed;
          currentPoint.b -= db * speed;
        } else {
          if (0 < currentPoint.holdCounter) {
            currentPoint.holdCounter--;
          } else {
            return true;
          }
        }

        return false;
      },

      _update: function () {

        let targetPoint = this.targetPoint;
        let currentPoint = this.currentPoint;

        // false == no active move
        if (this._moveTowards(targetPoint)) {

          // Unqueue next move
          let newPointToMoveTo = this.moveQueue.shift();

          if (newPointToMoveTo) {

            targetPoint.x = newPointToMoveTo.x || currentPoint.x;
            targetPoint.y = newPointToMoveTo.y || currentPoint.y;
            targetPoint.z = newPointToMoveTo.z || currentPoint.z;
            targetPoint.r = newPointToMoveTo.r || currentPoint.r;
            targetPoint.g = newPointToMoveTo.g || currentPoint.g;
            targetPoint.b = newPointToMoveTo.b || currentPoint.b;
            targetPoint.a = newPointToMoveTo.a || currentPoint.a;

            currentPoint.holdCounter = newPointToMoveTo.holdCounter || 0;

          } else {

            if (this.isPartOfShape) {

              // Jiggle points slightly
              // currentPoint.x -= Math.sin(Math.random() * Math.PI);
              // currentPoint.y -= Math.sin(Math.random() * Math.PI);

            } else {

              let angle = Math.random() * Math.PI * 2;
              let radius = Math.random() * vOrF(stochasticMovementDistance);

              // Move to new random point
              this.queueMove(new ShapeShifter.Point({
                x: currentPoint.x + radius * Math.sin(angle),
                y: currentPoint.y + radius * Math.cos(angle),
                r: 255,
                g: 255,
                b: 255,
                h: 0
              }));

            }

          }
        }

        if (!this.isPartOfShape) {

          let drawingHeight = ShapeShifter.Drawing.getArea().h;
          let fallingDistance = currentFallingSpeed * (1 + 0.6 * currentPoint.z);

          currentPoint.y += fallingDistance;
          targetPoint.y += fallingDistance;

          let jump = 0;

          if (drawingHeight < currentPoint.y) {
            jump += drawingHeight * Math.ceil(currentPoint.y / drawingHeight);
          }

          if (!ShapeShifter.Shape.snowActive && -100 < currentPoint.y && currentPoint.y < 0) {
            jump += 2 * drawingHeight;
          }

          currentPoint.y -= jump;
          targetPoint.y -= jump;

        }

        currentPoint.a = Math.max(0.1, currentPoint.a - ((currentPoint.a - targetPoint.a) * 0.05));
        currentPoint.z = Math.max(1, currentPoint.z - ((currentPoint.z - targetPoint.z) * 0.05));

      },

      distanceTo: function (n, details) {
        let currentPoint = this.currentPoint,
          dx = currentPoint.x - n.x,
          dy = currentPoint.y - n.y,
          dr = currentPoint.r - n.r,
          dg = currentPoint.g - n.g,
          db = currentPoint.b - n.b,
          da = currentPoint.a - n.a,
          d = Math.sqrt(dx * dx + dy * dy);

        return details ? [dx, dy, d, dr, dg, db, da] : d;
      },

      queueMove: function (p, avoidStatic) {
        if (!avoidStatic || (avoidStatic && this.distanceTo(p) > 1)) {
          this.moveQueue.push(p);
        }
      },

      render: function () {
        this._update();
        this._draw();
      }
    }

  }());

  ShapeShifter.ShapeBuilder = (function () {
    var pixelScanGap,
      shapeCanvas = document.createElement('canvas'),
      shapeContext = shapeCanvas.getContext('2d'),

      outWidth,
      outHeight,

      defaultFontSize,
      defaultFontFamily,

      currentFontSize,
      currentFontFamily;

    function processCanvas(options) {

      options = options || {};

      let thisPixelScanGap = options.pixelScanGap || pixelScanGap;

      var pixels = shapeContext.getImageData(0, 0, shapeCanvas.width, shapeCanvas.height).data;
      dots = [],
        pixels,
        x = 0,
        y = 0,
        fx = shapeCanvas.width,
        fy = shapeCanvas.height,
        w = 0,
        h = 0;

      for (var p = 0; p < pixels.length; p += (4 * thisPixelScanGap)) {
        if (128 < pixels[p + 3]) {
          dots.push(new ShapeShifter.Point({
            x: x,
            y: y,
            r: pixels[p],
            g: pixels[p + 1],
            b: pixels[p + 2],
            a: pixels[p + 3]
          }));

          w = x > w ? x : w;
          h = y > h ? y : h;
          fx = x < fx ? x : fx;
          fy = y < fy ? y : fy;
        }

        x += thisPixelScanGap;

        if (x >= shapeCanvas.width) {
          x = 0;
          y += thisPixelScanGap;
          p += thisPixelScanGap * 4 * shapeCanvas.width;
        }
      }


      return { dots: dots, w: w + fx, h: h + fy, shapeCanvas: shapeCanvas };
    }

    function setFontSize(s) {
      currentFontSize = s || defaultFontSize;
      refreshFontSettings();
    }

    function setFontFamily(family) {
      currentFontFamily = family || defaultFontFamily;
      refreshFontSettings();
    }

    function refreshFontSettings() {
      shapeContext.font = 'bold ' + currentFontSize + 'px ' + currentFontFamily;
    }


    function isNumber(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    return {
      init: function () {
      },

      setOptions: function (options) {

        options = options || {};

        pixelScanGap = options.pixelScanGap;

        defaultFontSize = options.fontSize;
        defaultFontFamily = options.fontFamily;

        outWidth = options.outWidth;
        outHeight = options.outHeight;

        shapeCanvas.width = Math.floor(outWidth / pixelScanGap) * pixelScanGap;
        shapeCanvas.height = Math.floor(outHeight / pixelScanGap) * pixelScanGap;

        shapeContext.fillStyle = '#FFF';
        shapeContext.textBaseline = 'middle';
        shapeContext.textAlign = 'center';

        setFontSize();
        setFontFamily();

      },

      imageFile: function (url, callback) {
        var image = new Image(),
          a = ShapeShifter.Drawing.getArea();

        image.onload = function () {
          let imageWidth = image.width;
          let imageHeight = image.height;

          let scale = Math.min(outWidth / imageWidth, outHeight / imageHeight) * 0.7;
          
          shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
          shapeContext.drawImage(this, 0, 0, Math.floor(imageWidth * scale), Math.floor(imageHeight * scale));
          callback(processCanvas());
        };

        image.onerror = function () {
          callback(ShapeShifter.ShapeBuilder.letter('What?'));
        }

        image.src = url;
      },

      circle: function (d) {
        var r = Math.max(0, d) / 2;
        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.beginPath();
        shapeContext.arc(r * pixelScanGap, r * pixelScanGap, r * pixelScanGap, 0, 2 * Math.PI, false);
        shapeContext.fill();
        shapeContext.closePath();

        return processCanvas();
      },

      letter: function (l, options) {

        options = options || {};

        let s = 0;

        s = Math.min(defaultFontSize,
          (shapeCanvas.width / shapeContext.measureText(l).width) * 0.8 * defaultFontSize,
          (shapeCanvas.height / defaultFontSize) * (isNumber(l) ? 1 : 0.45) * defaultFontSize);
        setFontSize(s);

        setFontFamily(options.fontFamily);

        shapeContext.textAlign = 'center';

        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);
        shapeContext.fillText(l, shapeCanvas.width / 2, shapeCanvas.height / 2);

        return processCanvas(options);
      },

      texts: function (texts) {

        shapeContext.clearRect(0, 0, shapeCanvas.width, shapeCanvas.height);

        texts.forEach(text => {

          setFontSize(defaultFontSize * (text.fontScale || 1));

          shapeContext.textAlign = text.textAlign || 'center';
          shapeContext.fillText(text.text, shapeCanvas.width * (text.xFraction || 0.5), shapeCanvas.height * (text.yFraction || 0.5));

        });


        return processCanvas();
      },


      rectangle: function (w, h) {
        var dots = [],
          width = pixelScanGap * w,
          height = pixelScanGap * h;

        for (var y = 0; y < height; y += pixelScanGap) {
          for (var x = 0; x < width; x += pixelScanGap) {
            dots.push(new ShapeShifter.Point({
              x: x,
              y: y,
            }));
          }
        }

        return { dots: dots, w: width, h: height };
      }
    };
  }());


  ShapeShifter.Shape = (function () {
    let dots = [],
      outWidth,
      outHeight,
      shapeDotRadius,
      shapeToShapeDotBlowUpSize,
      noShapeToShapeDotBlowUpSize,
      shapeToNoShapeDotBlowUpSize,
      shapeToShapeDotHoldCount,
      noShapeToShapeDotHoldCount,
      shapeToNoShapeDotHoldCount,
      noShapeDotRadius,
      noShapeToShapeDotSpeed,
      shapeToShapeDotSpeed,
      fastToShapeDotHoldCount,
      fastToShapeDotSpeed,
      noShapeDotSpeed,
      shapeToShapeDotAlpha,
      shapeDotAlpha,
      noShapeDotAlpha,
      shapeToNoShapeAlpha,
      width = 0,
      height = 0,
      cx = 0,
      cy = 0;

    function compensate() {
      var a = ShapeShifter.Drawing.getArea();
      cx = (a.w - width) / 2;
      cy = (a.h - height) / 2;
    }

    function generateDots(count, randomPositions) {

      let point;

      for (var d = 0; d < count; d++) {

        if (randomPositions) {

          point = new ShapeShifter.Point({
            x: Math.random() * outWidth,
            y: - Math.random() * 2 * outHeight,
            z: vOrF(noShapeDotRadius),
            r: 255,
            g: 255,
            b: 255,
            a: vOrF(noShapeDotAlpha),
            holdCounter: 0
          });

        } else {

          point = new ShapeShifter.Point({
            x: outWidth / 2,
            y: outHeight / 2,
            z: 5,
            r: 255,
            g: 255,
            b: 255,
            a: 1,
            holdCounter: 0
          });

        }

        dots.push(new ShapeShifter.Dot(point));
      }
    }

    return {

      init: function (options) {


        generateDots(options.initialNumberOfDots, true);

      },

      setOptions: function (options) {

        options = options || {};

        this.snowActive = options.snowActive;
        outWidth = options.outWidth;
        outHeight = options.outHeight;
        shapeDotRadius = options.shapeDotRadius;
        shapeToShapeDotBlowUpSize = options.shapeToShapeDotBlowUpSize;
        noShapeToShapeDotBlowUpSize = options.noShapeToShapeDotBlowUpSize;
        shapeToNoShapeDotBlowUpSize = options.shapeToNoShapeDotBlowUpSize;
        shapeToShapeDotHoldCount = options.shapeToShapeDotHoldCount;
        noShapeToShapeDotHoldCount = options.noShapeToShapeDotHoldCount;
        shapeToNoShapeDotHoldCount = options.shapeToNoShapeDotHoldCount;
        noShapeDotRadius = options.noShapeDotRadius;
        noShapeToShapeDotSpeed = options.noShapeToShapeDotSpeed;
        shapeToShapeDotSpeed = options.shapeToShapeDotSpeed;
        fastToShapeDotHoldCount = options.fastToShapeDotHoldCount;
        fastToShapeDotSpeed = options.fastToShapeDotSpeed;
        noShapeDotSpeed = options.noShapeDotSpeed;
        shapeToShapeDotAlpha = options.shapeToShapeDotAlpha;
        shapeDotAlpha = options.shapeDotAlpha;
        noShapeDotAlpha = options.noShapeDotAlpha;
        shapeToNoShapeAlpha = options.shapeToNoShapeAlpha;

      },

      switchShape: function (newShape, fast) {
        var drawingArea = ShapeShifter.Drawing.getArea(),
          drawingAreaWidth = drawingArea.w,
          drawingAreaHeight = drawingArea.h,
          newDots = newShape.dots;

        width = newShape.w;
        height = newShape.h;

        //compensate();

        // Fill up with enough dots
        if (dots.length < newDots.length) {
          generateDots(newDots.length - dots.length, false);
        }


        // Message dots
        let dotIndex = 0;
        let newDotIndex = 0;

        while (0 < newDots.length) {
          newDotIndex = Math.floor(Math.random() * newDots.length);

          let dot = dots[dotIndex];
          let newDot = newDots[newDotIndex];

          dot.speed = vOrF(fast ? fastToShapeDotSpeed : (dot.isPartOfShape ? shapeToShapeDotSpeed : noShapeToShapeDotSpeed));

          // Prepare for transition-effect
          if (dot.isPartOfShape) {
            dot.queueMove(new ShapeShifter.Point({
              z: vOrF(shapeToShapeDotBlowUpSize),
              a: vOrF(shapeToShapeDotAlpha),
              holdCounter: vOrF(shapeToShapeDotHoldCount)
            }));
          } else {
            dot.queueMove(new ShapeShifter.Point({
              z: vOrF(noShapeToShapeDotBlowUpSize),
              holdCounter: vOrF(fast ? fastToShapeDotHoldCount : noShapeToShapeDotHoldCount)
            }));
          }

          dot.isPartOfShape = true;
          dot.queueMove(new ShapeShifter.Point({
            x: newDot.x + cx,
            y: newDot.y + cy,
            r: newDot.r,
            g: newDot.g,
            b: newDot.b,
            a: vOrF(shapeDotAlpha),
            z: shapeDotRadius,
            holdCounter: 0
          }));

          newDots.splice(newDotIndex, 1);
          dotIndex++;

        }

        // Unused dots, move unused dots that used to be used
        for (newDotIndex = dotIndex; newDotIndex < dots.length; newDotIndex++) {

          let dot = dots[newDotIndex];

          if (dot.isPartOfShape) {
            dot.queueMove(new ShapeShifter.Point({
              z: vOrF(shapeToNoShapeDotBlowUpSize),
              a: vOrF(shapeToNoShapeAlpha),
              holdCounter: vOrF(shapeToNoShapeDotHoldCount)
            }));

            dot.isPartOfShape = false;
            dot.speed = vOrF(noShapeDotSpeed);
            dot.queueMove(new ShapeShifter.Point({
              x: Math.random() * drawingAreaWidth,
              y: (Math.random() * 2 - .5) * drawingAreaHeight,
              r: 255,
              g: 255,
              b: 255,
              a: vOrF(noShapeDotAlpha),
              z: vOrF(noShapeDotRadius),
              holdCounter: 0
            }));
          }
        }
      },

      setSnowActive: function (doActive, clearShape) {

        this.snowActive = doActive;

        if (!doActive && clearShape) {
          ShapeShifter.Shape.switchShape(ShapeShifter.ShapeBuilder.letter(''));
        }

        for (let d = 0; d < dots.length; d++) {
          if (this.snowActive) {
            dots[d].moveUpToAboveDrawingArea();
          } else {
            dots[d].moveOutOfDrawingAreaToBelowDrawingArea();
          }
        }

      },

      render: function () {

        ShapeShifter.Dot._updateCommonVariables();

        for (var d = 0; d < dots.length; d++) {
          dots[d].render();
        }
      }
    }
  }());

  window.ShapeShifter = ShapeShifter;

}());