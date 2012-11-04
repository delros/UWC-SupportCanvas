wgtSupportPanel = (function (obj) {
  obj.translate.confimSharing = 'You are going to send a request to the share client\'s browser viewport. Right?'
  obj.translate.screenNotLoaded = 'You need too load client\'s first. Please do this'; 

  $(document).on('supportSessionStarted', function () {
    obj.supportInit();
  });


  obj.supportInit = function () {
    var that = this;

    this.isClientsScreenLoaded = false;
    this.pref.screenOutpuHandler = '#screenOutputHandler';
    this.pref.togglerPointer = '[data-action=togglePointer]';
    this.pref.togglerClickPlace = '[data-action=toggleClickPlace]';
    this.pref.togglerScreenShare = '[data-action=loadClientScreen]';

    $(this.pref.togglerPointer).on('click', function (e) {
      alert('togglerPointer');
    });

    $(this.pref.togglerClickPlace).on('click', function (e) {
      if (!that.isClientsScreenLoaded) {
        alert(that.translate.screenNotLoaded)
        return;
      }

      $(this).find('strong').html('OFF');
      $(this).addClass('enabled');

      $(that.pref.screenOutpuHandler).find('img').on('click', function (e) {
        var position = {
              width: '20px',
              height: '20px',
              x: e.pageX - $(this).offset().left,
              y: e.pageY - $(this).offset().top,
              scale: 0
            },
            originWidth = $(that.pref.screenOutpuHandler).data('realWidth'),
            originHeight = $(that.pref.screenOutpuHandler).data('realHeight');
        
        position.scale = originWidth / $(this).width();

        that.socket.emit('share', {
          action: 'viewportClick',
          position: position, 
          datetime: new Date() 
        });
      });
    
    });

    $(this.pref.togglerScreenShare).on('click', function (e) {
      if (confirm(that.translate.confimSharing)) {
        that.requestClinetScreen();
      }
    });

    this.socket.on('share', function (data) {
      if (data.action === 'clientScreenCanvas') {
        var $outputHandler = $(that.pref.screenOutpuHandler);

        $outputHandler.html($('<img />', {
          src: data.screenData
        }));

        $outputHandler.data('realWidth', data.realSize.width);
        $outputHandler.data('realHeight', data.realSize.height);

        that.printLogMessage({
          content: 'Client\'s screen dump was received'
        });

        that.isClientsScreenLoaded = true;
      }
    });

  }

  obj.requestClinetScreen = function () {
    this.socket.emit('share', {
      action: 'requestClinetScreen', 
      datetime: new Date() 
    });
    this.printLogMessage({
      content: 'Screen request has been sent'
    });    
  }

  return obj;
}(wgt));