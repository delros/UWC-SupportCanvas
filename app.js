var wgt;

wgt = (function (obj) {
  var defaults = {
    autoinit: false, 
    mode: 'client',
    name: 'Client001',
    pathApi: 'http://localhost:8001',
    toggler: '[data-support-action]',
    chatBox: '#supportChatBox',
    chatOutput: '.supportChatBox_output',
    chatControls: '.supportChatBox_control'
  };

  obj.pref = {};
  obj.socket = {};
  obj.translate = {
    confimSharingClient: 'Support acked for a screen dump. Accept?'
  };

  obj.setup = function (config) {
    $.extend(this.pref, defaults, config);

    this.loadJs(this.pref.pathApi + '/src/vendors/socket.io/socket.io.js');
    this.loadJs(this.pref.pathApi + '/src/vendors/html2canvas/html2canvas.js');
    this.loadCss(this.pref.pathApi + '/src/app.css');

    var that = this,
        $chatBox = $(this.pref.chatBox),
        $chatOutput = $(this.pref.chatOutput),
        $controlSend = $(this.pref.chatControls + ' button'),
        $controlMessage = $(this.pref.chatControls + ' textarea'),
        $toggler = $(this.pref.toggler),
        $outputMessageWrapper = $('<div><span></span></div>');

    this._chatBox = $chatBox;
    this._chatOutput = $chatOutput;
    this._controlSend = $controlSend;
    this._controlMessage = $controlMessage;
    this._outputMessageWrapper = $outputMessageWrapper;

    $toggler.on('click', function (e) {
      $chatBox.trigger('toggleChatBox');  
    });    

    $chatBox.on('toggleChatBox', function (e) {
      if ($chatBox.is(':visible')) {
        $chatBox.hide();
        that.socket.disconnect();
        $(document).trigger('supportSessionEnded');
      } else {
        that.startSession();
        $chatBox.show();
        $(document).trigger('supportSessionStarted');
      }
    });

    $controlSend.on('click', function (e) {
      that.sendMessage($controlMessage.val());
      $controlMessage.val('');
    });

    $controlMessage.on('keypress', function (e) { 
      if ((e.keyCode || e.which) == 13) {
        e.preventDefault();
        that.sendMessage($controlMessage.val());
        $controlMessage.val('');
      }
    });

    if (this.pref.autoinit) {
      setTimeout("$(wgt.pref.chatBox).trigger('toggleChatBox')", 1000);
    }
  }

  obj.startSession = function () {
    var that = this;

    this.socket = io.connect(this.pref.pathApi);
    
    this.socket.on('message', function (data) {
      that.printMessage(data);
    });

    this.socket.on('share', function (data) {
      switch (data.action) {
        case 'requestClinetScreen':
          if (that.pref.mode === 'client') {
            if (confirm(that.translate.confimSharingClient)) {
              that.createScreenDump();
            }
          }
          break;
        case 'viewportClick':
          if (that.pref.mode === 'client') {
            var shape = $('<div />').css({
              'position': 'absolute',
              'top': data.position.scale * data.position.y,
              'left': data.position.scale * data.position.x,
              'height': data.position.width, 
              'width': data.position.height,
              'opacity': '1',
              'border-radius': '10px',
              'background': 'red',
              'box-shadow': '0px 0px 10px red'
            }).appendTo('body');

            shape.animate({
              'opacity': '0'
            }, 500, 'linear', function() {
              $(this).hide(500);
              $(this).remove();
            });
          }
          break;
      }
    });    
  }

  obj.sendMessage = function (message) {
    var message = message || '',
        that = this;
    
    if (message === '') {
      alert("Message can't be empty");
      return;
    }  

    this.socket.emit('message', { 
      username: this.pref.name, 
      content: message,
      datetime: new Date() 
    });
  }

  obj.printMessage = function (data) {
    var chatOutput = this._chatOutput,
        messageControl = this._controlMessage,
        messageOutput = this._outputMessageWrapper.clone(), 
        messageDate = new Date(data.datetime);
    
    $('<i />', { 
      html: data.username + ' '
            + '<small>' 
            + messageDate.toLocaleFormat('%m/%d/%y - %H:%M:%S') 
            + '</small>'
    }).appendTo(messageOutput);

    $('<p />', { 
      text: data.content
    }).appendTo(messageOutput);
    
    chatOutput.append(messageOutput);
    chatOutput[0].scrollTop = chatOutput[0].scrollHeight;    
  }

  obj.printLogMessage = function (data) {
    var chatOutput = this._chatOutput,
        messageOutput = this._outputMessageWrapper.clone();
    
    messageOutput.html($('<em />').html(data.content));
    chatOutput.append(messageOutput);

    chatOutput[0].scrollTop = chatOutput[0].scrollHeight;    
  }

  obj.createScreenDump = function () {

    var that = this;

    setTimeout(function () {
      var html2obj = html2canvas($('body'), {
        useCORS: true,
        onrendered: function (canvas) {
          var $canvas = $(canvas),
              canvasData;

          try {
            canvasData = $canvas[0].toDataURL();
            that.sendScreenDump(canvasData, {
              width: $canvas[0].width,
              height: $canvas[0].height
            });
          } catch(e) {
            if ($canvas[0].nodeName.toLowerCase() === "canvas") {
              alert("Canvas is tainted, unable to read data");
            }
          }
        }
      });
    }, 100); 
  }

  obj.sendScreenDump = function (canvasData, realSize) {
    this.socket.emit('share', {
      action: 'clientScreenCanvas', 
      screenData: canvasData,
      realSize: realSize,
      datetime: new Date() 
    });
    this.printLogMessage({
      content: 'Screen dump has been sent'
    });
  }

  obj.loadCss = function (path) {
    if (!path) return false;

    var head = document.head || document.getElementsByTagName('head')[0],
        link = document.createElement('link');

    link.type = 'text/css';
    link.rel = 'stylesheet';
    link.href = path;
    head.appendChild(link);

    return true;
  }

  obj.loadJs = function (path) {
    if (!path) return false;
  
    var head = document.head || document.getElementsByTagName('head')[0],
        script = document.createElement('script');

    script.type = "text/javascript";
    script.src = path;
    head.appendChild(script);

    return true;
  }

  return obj; 
}(wgt || {}));


Date.prototype.toLocaleFormat = function(format) {
  var f = {
    y: this.getYear() + 1900,
    m: this.getMonth() + 1,
    d: this.getDate(),
    H: this.getHours(),
    M: this.getMinutes(),
    S: this.getSeconds()
  }

  for (var k in f) {
    format = format.replace('%' + k, f[k] < 10 ? "0" + f[k] : f[k]);
  }
  
  return format;
};