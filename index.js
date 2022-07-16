

let intensityAverage = [];
let frequencyAverage = [];
var audioBooster = 1;
let volumeSlider = document.getElementById('volume');
let variationSlider = document.getElementById('variation');
let volumeEnhancer = 1;
var volumeEnhance = function() {
    volumeEnhancer = parseInt(volumeSlider.value);
}

let variation = 1;
var variationEnhancer = function() {
  variation = parseInt(variationSlider.value) / 100;
}
let hue = document.getElementById('hue');
function Demo(settings){
	var self = this;
	for (var name in settings) {
	    this[name] = settings[name];
	}
	
	this.ui = typeof this.ui === "undefined" ? {} : this.ui;

	this.shiftDown = false;

	//thanks to http://stackoverflow.com/questions/11101364/javascript-detect-shift-key-down-within-another-function
	this.setShiftDown = function(event){
		if(event.keyCode === 16 || event.charCode === 16){ //for future reference, alt key is 18
			self.shiftDown = true;
		}
	};

	this.setShiftUp = function(event){
		if(event.keyCode === 16 || event.charCode === 16){
			self.shiftDown = false;
		}
	};

	this.addUIElement = function(prop){
		var ui = this.ui;
		// console.log(this, ui);

		var propContainerSelector = '#'+prop+'-interface'; 

		if (ui[prop].className){
			className = ui[prop].className + " ";
		} else {
			className = '';
		}
		$('#ui-container').append("<div class='interface " +className+ "clearfix' id='"+prop+"-interface'></div>");

		//buttons don't need <label> tags because their "label" is determined like so: <button>Label</button>
		if (ui[prop].type != "button"){
			$(propContainerSelector).append("<label>"+ui[prop].title+"</label>");
		}

		if (ui[prop].type == "userInputNumerical"){
  			inputBoxHTML = "<input class='form-control user-input-numerical' value='"+ui[prop].value+"'>";
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface input').change(function(){
	    		ui[prop].value = parseFloat($('#'+prop+'-interface input').val());
  			    // self.update(prop);
			});
		} else if (ui[prop].type == "userInputString"){
			var inputBoxHTML = "";
  			if (ui[prop].prepend){
	  			inputBoxHTML = "<div class='input-group'>";
  				inputBoxHTML += "<span class='input-group-addon'>"+ui[prop].prepend+"</span>";
  			}
  			inputBoxHTML += "<input class='form-control user-input-string' value='"+ui[prop].value+"'>";
  			if (ui[prop].prepend){
	  			inputBoxHTML += "</div>";
	  		}
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface input').change(function(){
	    		ui[prop].value = $('#'+prop+'-interface input').val();
  			    // self.update(prop);
			});
		} else if (ui[prop].type == "userInputTextarea"){
  			inputBoxHTML = "<textarea class='form-control user-input-textarea'>"+ui[prop].value+"</textarea>";
	  		$(propContainerSelector).append(inputBoxHTML);
  		    $('#'+prop+'-interface textarea').change(function(){
	    		ui[prop].value = $('#'+prop+'-interface textarea').val();
  		        self.sendEvent(ui[prop].title, 'value changed', window.location.pathname);
  			    // self.update(prop);
			});
		} else if (isNumber(ui[prop].value) && (!$.isArray(ui[prop].values))){ 
	  		if (ui[prop].units){
	  			sliderInputBoxHTML = "<div class='input-group'><input class='form-control with-units' value='"+ui[prop].value+"'><span class='input-group-addon'>"+ui[prop].units+"</span></div>";
	  		} else if (ui[prop].input === 'readonly'){
	  			sliderInputBoxHTML = "<input value='"+ui[prop].value+"' readonly>";
	  		} else if (ui[prop].input === 'hidden') {
	  			sliderInputBoxHTML = "<input class='form-control' value='"+ui[prop].value+"' type='hidden'>";
	  		} else {
	  			sliderInputBoxHTML = "<input class='form-control' value='"+ui[prop].value+"'>";
	  		}

	  		$(propContainerSelector).append(sliderInputBoxHTML);

			$(propContainerSelector).noUiSlider({
				range: ui[prop].range,
				start: ui[prop].value,
				handles: 1,
				connect: "lower",
				step: (ui[prop].step) ? ui[prop].step : undefined,
				slide: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
					if ($('#'+prop+'-interface input').val() === "-0"){
						$('#'+prop+'-interface input').val("0");
					}
					// self.update(prop);
				},
				change: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
				},
				set: function(){
					ui[prop].value = parseFloat($(this).val());
					self.update(prop);
					self.sendEvent(ui[prop].title, 'slide', window.location.pathname);
				},
				serialization: {
					to: (ui[prop].input !== 'hidden' || ui[prop].input !== 'readonly') ? [$('#'+prop+'-interface input')] : [false, false],
					resolution: ui[prop].resolution
				}
			});


			//Keyboard increment
			$('#'+prop+'-interface input').keydown(function(e){

				var value = parseInt($(propContainerSelector).val());
				var increment = self.shiftDown ? 10 : 1;

				switch (e.which){
					case 38:
						$('#'+prop+'-interface input').val( value + increment );
						ui[prop].value = parseFloat($(this).val());
					    self.sendEvent(ui[prop].title, 'increment: +'+increment, window.location.pathname);
						break;
				    case 40:
					    $('#'+prop+'-interface input').val( value - increment );
					    ui[prop].value = parseFloat($(this).val());				    
					    self.sendEvent(ui[prop].title, 'decrement: -'+increment, window.location.pathname);
					    break;
				}

				self.update(prop);

			});

			//set color
			if (ui[prop].color){
				$('#'+prop+'-interface .noUi-connect').css("background-color", ui[prop].color);
			}

		} else if (ui[prop].value === true || ui[prop].value === false) {

		    $('#'+prop+'-interface label').attr("for", prop+'-checkbox');

		    initialCheckboxSetting = ui[prop].value === true ? "checked" : "";

		    $(propContainerSelector).append("<div class='checkbox'><input type='checkbox' value='None' id='"+prop+"-checkbox' name='check' "+initialCheckboxSetting+" /><label for='"+prop+"-checkbox'></label></div>");

		    $('#'+prop+'-interface input').change(function(){
		    	if ($(this).prop('checked')){
		    		ui[prop].value = true;
		    		eventLabel = 'checkbox: switch on'
			    } else {
			    	ui[prop].value = false;
			    	eventLabel = 'checkbox: switch on'
			    }
		        self.sendEvent(ui[prop].title, eventLabel, window.location.pathname);
			    self.update(prop);
			});
		} else if ($.isArray(ui[prop].values)){
			//Dropdown Menus
			$(propContainerSelector).append("<select class='form-control'></select");

			for (var i  = 0 ; i < ui[prop].values.length ; i++){
				$('#'+prop+'-interface select').append("<option value='"+ui[prop].values[i][1]+"'>"+ui[prop].values[i][0]+"</option>");
		    }

			$('#'+prop+'-interface select option[value="'+ui[prop].value+'"]').prop('selected', true);

		    $('#'+prop+'-interface select').change(function(){
		    	ui[prop].value = $(this).val();
		    	self.sendEvent(ui[prop].title, 'Dropdown change: ' + ui[prop].value, window.location.pathname);
		    	$('#'+prop+'-interface select option')
			    	.prop('selected', false)
			    	.filter('[value="'+ui[prop].value+'"]').prop('selected', true);
		    	self.update(prop);
		    })

		} else if (ui[prop].type == "button"){
			$(propContainerSelector).append("<button>"+ui[prop].title+"</button>").click(function(){
				self.update(prop);
			});
		} else {
			$(propContainerSelector).append("<input value='"+ui[prop].value+"' readonly>");
		}
	}

	for (var prop in this.ui){
		this.addUIElement(prop);
	}




	this.init();
}
var AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;
context = new AudioContext();


var animationID;


	var demo = new Demo({
		ui: {
      logScale:{
        title: "Logarithmic Frequency Scale?",
        value: true
      },
      soundSamples:{
        title: "Sound Sample",
        value: "song-thrush-rspb",
        values: [
          ["Bird Song (Song Thrush)", "song-thrush-rspb"],
          ["Orca (Killer whale)","transient-orca"],
          ["Police Siren","police-siren"],
          ["Modem (Dial up)","modem"],
          ["Violin","violin"],
          ["Whistling","whistle"],
          ["Sad Trombone","sad-trombone"]
          //["Erskine Butterfield", "erskine-butterfield"]
        ] //the first value in each pair is the label, the second is the value
      }
		},

		canvas: document.getElementById("canvas"),
    canvasLog: document.getElementById("canvas-log"),
		labels: document.getElementById("labels"),

		controls: true,
		// Log mode.
		log: true,
		// Show axis labels, and how many ticks.
		showLabels: true,
		ticks: 5,
		speed: 5,
		// FFT bin size,
		fftsize: 2048,
		oscillator: false,
		color: true,

		init: function(){
      $("#demo").append($("#canvas"));
      $("#demo").append($("#canvas-log"));
      $("#demo").append($("#labels"));
			this.attachedCallback();
			this.onStream();
      $("#demo").height(Math.round($("#demo").width()*0.67));

		},

		update: function(e){
      
      if (e == "logScale"){
        if (this.ui.logScale.value === false){
          this.log = false;
        } else {
          this.log = true;
        }
        // this.ctx.fillRect(0,0,this.width, this.height, this.speed, this.speed);
        this.logChanged();
      }

      if (e == "soundSamples"){
        audio.pause();
        window.cancelAnimationFrame(animationID);
        this.ctx.fillRect(0,0,this.width, this.height);
        audio.src = '/demos/spectrum-analyzer/' + this.ui.soundSamples.value + ".mp3";
      }
		},




// Assumes context is an AudioContext defined outside of this class.


  attachedCallback: function() {
    this.tempCanvas = document.createElement('canvas'),
    // Get input from the microphone.
    // if (navigator.mozGetUserMedia) {
    //   navigator.mozGetUserMedia({audio: true},
    //                             this.onStream.bind(this),
    //                             this.onStreamError.bind(this));
    // } else if (navigator.webkitGetUserMedia) {
    //   navigator.webkitGetUserMedia({audio: true},
    //                             this.onStream.bind(this),
    //                             this.onStreamError.bind(this));
    // }
    // this.onStream();
    this.ctx = this.canvas.getContext('2d');
  },

  render: function() {
    //console.log('Render');
    this.width = window.innerWidth;
    this.width = $("#demo").width();
    this.height = window.innerHeight;
    this.height = Math.round(this.width*0.67);


    var didResize = false;
    // Ensure dimensions are accurate.
    if (this.canvas.width != this.width) {
      this.canvas.width = this.width;
      this.labels.width = this.width;
      didResize = true;
    }
    if (this.canvas.height != this.height) {
      this.canvas.height = this.height;
      this.labels.height = this.height;
      didResize = true;
    }

    //this.renderTimeDomain();
    this.renderFreqDomain();

    if (this.showLabels && didResize) {
      this.renderAxesLabels();
    }

    animationID = requestAnimationFrame(this.render.bind(this));

    var now = new Date();
    if (this.lastRenderTime_) {
      this.instantaneousFPS = now - this.lastRenderTime_;
    }
    this.lastRenderTime_ = now;
  },

  renderTimeDomain: function() {
    var times = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(times);

    for (var i = 0; i < times.length; i++) {
      var value = times[i];
      var percent = value / 256;
      var barHeight = this.height * percent;
      var offset = this.height - barHeight - 1;
      var barWidth = this.width/times.length;
      this.ctx.fillStyle = 'black';
      this.ctx.fillRect(i * barWidth, offset, 1, 1);
    }
  },

  renderFreqDomain: function() {
    volumeEnhance();
    var freq = (new Uint8Array(this.analyser.frequencyBinCount));
    this.analyser.getByteFrequencyData(freq);
    freq = freq.map(x => x + volumeEnhancer);
    var ctx = this.ctx;
    // Copy the current canvas onto the temp canvas.
    this.tempCanvas.width = this.width;
    this.tempCanvas.height = this.height;
    //console.log(this.canvas.height, this.tempCanvas.height);
    var tempCtx = this.tempCanvas.getContext('2d');
    tempCtx.drawImage(this.canvas, 0, 0, this.width, this.height);

    // Iterate over the frequencies.
    let median = [];
    for (var i = 0; i < freq.length; i++) {
      var value;
      // Draw each pixel with the specific color.
      if (this.log) {
        logIndex = this.logScale(i, freq.length);
        value = freq[logIndex];
        
        for (var j = 0; j < Math.round(value); j++){
            median.push(i);
        }
      } else {
        value = freq[i];
      }

      ctx.fillStyle = "black"

      var percent = i / freq.length;
      var y = Math.round(percent * this.height);

      // draw the line at the right side of the canvas
      ctx.fillRect(this.width - this.speed, this.height - y,
                   this.speed, this.speed);
    }
    // let frequency = freq[median[Math.floor(median.length / 2)]];
    // console.log(freq, frequency);
    let index = median[Math.floor(median.length / 2)];
    var percent = index/ freq.length;
    var y = Math.round(percent * this.height);
    var intensity = ((Math.pow(Math.max(...freq) /255 * audioBooster, 6))) * 255;
    intensityAverage.push(intensity);
    if (intensityAverage.length > 2){
      intensityAverage.splice(0, 1);
    }
    frequencyAverage.push(percent);
    if (frequencyAverage.length > 5){
      frequencyAverage.splice(0, 1);
    }
    if (intensity < 80){
      intensity = 0;
    }
    var newIntensity = Math.round(intensityAverage.reduce((a, b) => a + b, 0) / intensityAverage.length);
    var newPercentage = (frequencyAverage.reduce((a, b) => a + b, 0) / frequencyAverage.length);
    // console.log(newPercentage, newIntensity);
    // console.log(Math.abs(frequencyAverage[3] - frequencyAverage[5]) / Math.abs(frequencyAverage[3] + frequencyAverage[5]) * 2);
    var newY = Math.round(newPercentage * this.height);
    let hslColors = [
      newPercentage * 360 * 1.2 * variation + parseInt(hue.value),
        100,
        (Math.round(newIntensity / 255 * 100) / 1.25 * 0.5)
    ];
    document.body.style.backgroundColor = `hsl(${hslColors[0]}deg, ${hslColors[1]}%, ${hslColors[2]}%)`;
    // ctx.fillRect(0, 0, this.width, this.height);
    let rgbColors = hslToRgb(hslColors[0] % 360, hslColors[1] / 100, hslColors[2] / 100);
    window.webkit.messageHandlers.receiveColor.postMessage({colors: rgbColors})
    
    ctx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
    ctx.fillRect(this.width - this.speed, this.height - y,
                 this.speed, 1);

    ctx.fillStyle = `rgb(${newIntensity}, ${0}, ${0})`;
    ctx.fillRect(this.width - this.speed, this.height - newY,
                 this.speed, 3);

    // Translate the canvas.
    ctx.translate(-this.speed, 0);
    // Draw the copied image.
    // console.log(this.width, this.height);
    ctx.drawImage(this.tempCanvas, 0, 0, this.width, this.height,
                  0, 0, this.width, this.height);

    // Reset the transformation matrix.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  },

  /**
   * Given an index and the total number of entries, return the
   * log-scaled value.
   */
  logScale: function(index, total, opt_base) {
    var base = opt_base || 2;
    var logmax = this.logBase(total + 1, base);
    var exp = logmax * index / total;
    return Math.round(Math.pow(base, exp) - 1);
  },

  logBase: function(val, base) {
    return Math.log(val) / Math.log(base);
  },

  renderAxesLabels: function() {
    var canvas = this.labels;
    canvas.width = this.width;
    canvas.height = this.height;
    var ctx = canvas.getContext('2d');
    var startFreq = 440;
    var nyquist = context.sampleRate/2;
    var endFreq = nyquist - startFreq;
    var step = (endFreq - startFreq) / this.ticks;
    var yLabelOffset = 5;
    // Render the vertical frequency axis.
    for (var i = 0; i <= this.ticks; i++) {
      var freq = startFreq + (step * i);
      // Get the y coordinate from the current label.
      var index = this.freqToIndex(freq);
      var percent = index / this.getFFTBinCount();
      var y = (1-percent) * this.height;
      var x = this.width - 60;
      // Get the value for the current y coordinate.
      var label;
      if (this.log) {
        // Handle a logarithmic scale.
        var logIndex = this.logScale(index, this.getFFTBinCount());
        // Never show 0 Hz.
        freq = Math.max(1, this.indexToFreq(logIndex));
      }
      var label = this.formatFreq(freq);
      var units = this.formatUnits(freq);
      ctx.font = '16px "Open Sans"';
      ctx.fillStyle = 'white';
      // Draw the value.
      ctx.textAlign = 'right';
      ctx.fillText(label, x, y + yLabelOffset);
      // Draw the units.
      ctx.textAlign = 'left';
      ctx.fillText(units, x + 10, y + yLabelOffset);
      // Draw a tick mark.
      ctx.fillRect(x + 40, y, 30, 2);
    }
  },

  clearAxesLabels: function() {
    var canvas = this.labels;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);
  },

  formatFreq: function(freq) {
    return (freq >= 1000 ? (freq/1000).toFixed(1) : Math.round(freq));
  },

  formatUnits: function(freq) {
    return (freq >= 1000 ? 'KHz' : 'Hz');
  },

  indexToFreq: function(index) {
    var nyquist = context.sampleRate/2;
    return nyquist/this.getFFTBinCount() * index;
  },

  freqToIndex: function(frequency) {
    var nyquist = context.sampleRate/2;
    return Math.round(frequency/nyquist * this.getFFTBinCount());
  },

  getFFTBinCount: function() {
    return this.fftsize / 2;
  },

  onStream: function(stream) {
    navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then((stream) => {
        var input = context.createMediaStreamSource(stream);
        var analyser = context.createAnalyser();
        analyser.smoothingTimeConstant = 0;
        console.log(this.fftsize);
        analyser.fftSize = this.fftsize;
    
        // Connect graph.
        input.connect(analyser);
    
        this.analyser = analyser;
        // Setup a timer to visualize some stuff.
        context.resume()
        this.render();
    })
    .catch(function (err) {
      console.error(err);
    })
    // var input = context.createMediaStreamSource(stream);
  },

  onStreamError: function(e) {
    console.error(e);
  },

  getGrayColor: function(value) {
    return 'rgb(V, V, V)'.replace(/V/g, 255 - value);
  },

  getFullColor: function(value) {

    var colorPalette = {
      0: [0,0,0],
      10: [75, 0, 159],
      20: [104,0,251],
      30: [131,0,255],
      40: [155,18,157],
      50: [175, 37, 0],
      60: [191, 59, 0],
      70: [206, 88, 0],
      80: [223, 132, 0],
      90: [240, 188, 0],
      100: [255, 252, 0]
      
    }

    //floor to nearest 10:
    var decimalised = 100 * value / 255
    var percent = decimalised / 100;
    var floored = 10* Math.floor(decimalised / 10);
    var distFromFloor = decimalised - floored;
    var distFromFloorPercentage = distFromFloor/10;
    if (decimalised < 100){
      var rangeToNextColor = [
        colorPalette[floored + 10][0] - colorPalette[floored + 10][0],
        colorPalette[floored + 10][1] - colorPalette[floored + 10][1],
        colorPalette[floored + 10][2] - colorPalette[floored + 10][2]
      ]
    } else {
      var rangeToNextColor = [0,0,0];
    }

    var color = [
      colorPalette[floored][0] + distFromFloorPercentage * rangeToNextColor[0],
      colorPalette[floored][1] + distFromFloorPercentage * rangeToNextColor[1],
      colorPalette[floored][2] + distFromFloorPercentage * rangeToNextColor[2]
    ]


    return "rgb(" + color[0] +", "+color[1] +"," + color[2]+")";

    // var fromH = 62;
    // var toH = 0;
    // var percent = value / 255;
    // var delta = percent * (toH - fromH);
    // var hue = fromH + delta;
    // return 'hsl(H, 100%, 50%)'.replace(/H/g, hue);
  },
  
  logChanged: function() {
    if (this.showLabels) {
      this.renderAxesLabels();
    }
  },

  ticksChanged: function() {
    if (this.showLabels) {
      this.renderAxesLabels();
    }
  },

  labelsChanged: function() {
    if (this.showLabels) {
      this.renderAxesLabels();
    } else {
      this.clearAxesLabels();
    }
  }

 	});


 // })();





function isNumber(n) {
	return !isNaN(parseFloat(n)) && isFinite(n);
}

function getCurvePoints(pts, tension, isClosed, numOfSegments) {

    // use input value if provided, or use a default value   
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [], 
        x, y,   
        t1x, t2x, t1y, t2y,
        c1, c2, c3, c4,     
        st, t, i;      

    _pts = pts.slice(0);
    if (isClosed) {
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.unshift(pts[pts.length - 1]);
        _pts.unshift(pts[pts.length - 2]);
        _pts.push(pts[0]);
        _pts.push(pts[1]);
    }
    else {
        _pts.unshift(pts[1]);
        _pts.unshift(pts[0]);
        _pts.push(pts[pts.length - 2]);
        _pts.push(pts[pts.length - 1]);
    }
    for (i=2; i < (_pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i+2] - _pts[i-2]) * tension;
            t2x = (_pts[i+4] - _pts[i]) * tension;

            t1y = (_pts[i+3] - _pts[i-1]) * tension;
            t2y = (_pts[i+5] - _pts[i+1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}
function getUserMedia(
    dictionary,
    callback
) {
    try {
        navigator.getUserMedia =
            navigator.getUserMedia ||
            (navigator).webkitGetUserMedia ||
            (navigator).mozGetUserMedia
        navigator.getUserMedia(dictionary, callback, (e) => {
            console.dir(e)
        })
    } catch (e) {
        alert('getUserMedia threw exception :' + e)
    }
}
function hslToRgb(h, s, l){
  var r, g, b;

  if(s == 0){
      r = g = b = l; // achromatic
  }else{
      var hue2rgb = function hue2rgb(p, q, t){
          if(t < 0) t += 1;
          if(t > 1) t -= 1;
          if(t < 1/6) return p + (q - p) * 6 * t;
          if(t < 1/2) return q;
          if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
      }

      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}