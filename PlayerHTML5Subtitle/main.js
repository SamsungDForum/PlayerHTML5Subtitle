(function(){
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[PlayerHTML5Subtitle]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    var video;
    var videoControls;

    var playBtn;
    var stopBtn;
    var pauseBtn;
    var CCBtn;
    var fullscreenBtn;

    var isFull = false;

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = [
            'MediaPause',
            'MediaPlay',
            'MediaStop',
            'ColorF0Red'
        ];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }

    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                //key RETURN
                case 10009:
                    log("RETURN");
                    tizen.application.getCurrentApplication().hide();
                    break;

                //key PLAY
                case 415:
                    play();
                    break;

                //key STOP
                case 413:
                    stop();
                    break;

                //key PAUSE
                case 19:
                	pause();
                	break;

                //key Red
                case 403:
                    if (video.textTracks[selectedIndex].mode === 'showing') {
                        video.textTracks[selectedIndex].mode = 'hidden';
                        document.getElementById('subtitles-' + video.textTracks[selectedIndex].language).setAttribute('data-state', 'inactive');
                    }
                    else {
                        video.textTracks[selectedIndex].mode = 'showing';
                        document.getElementById('subtitles-' + video.textTracks[selectedIndex].language).setAttribute('data-state', 'active');
                    }
                	break;

                //key Enter
                case 13:
                	changeScreenSize();
                	break;

                default:
                    log("Unhandled key: " + e.keyCode);
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    /**
     * Init the video player using video / track elements.
     */
    function initVideoPlayer() {
        video = document.getElementById('video');
        videoControls = document.getElementById('video-controls');

        // Set the button elements
        playBtn = document.getElementById('play');
        stopBtn = document.getElementById('stop');
        pauseBtn = document.getElementById('pause');
		CCBtn = document.getElementById('subtitles');
        fullscreenBtn = document.getElementById('fullscreen');

        createSubtitleMenuItem();
        createSubtitleMenu();

        registerMouseEvents();

        video.addEventListener('loadedmetadata', function () {
            log("Meta data loaded.");
        });
        video.addEventListener('timeupdate', function () {
            log("Current time: " + video.currentTime);
        });
        video.addEventListener('play', function () {
            log("Playback started.");
        });
        video.addEventListener('pause', function () {
            log("Playback paused.");
        });
        video.addEventListener('ended', function () {
            log("Playback finished.");
            init();
        });
    }

    var subtitleMenuButtons = [];
    var selectedIndex = 0;
    var createSubtitleMenuItem = function(id, language, label) {
    	var item = document.createElement('li');
    	var button = item.appendChild(document.createElement('button'));
    	button.id = id;
    	button.className = 'subtitles-button';
    	button.value = label;
    	if (language !== null){
    		button.lang = language;
        }
    	button.setAttribute('data-state', 'inactive');

    	button.appendChild(document.createTextNode(label));
    	button.addEventListener('click', function(e) {
    		// all buttons to inactive
    		subtitleMenuButtons.map(function(v, i, a) {
    			subtitleMenuButtons[i].setAttribute('data-state', 'inactive');
    		});
    		// show OR hide the subtitle.
    		var selectedLang = this.getAttribute('lang');
    		for (var i = 0; i < video.textTracks.length; i++) {
    			if (video.textTracks[i].language === selectedLang) {
    				video.textTracks[i].mode = 'showing';
    				this.setAttribute('data-state', 'active');
                    selectedIndex = i;
    			}
    			else {
    				video.textTracks[i].mode = 'hidden';
    			}
    		}
    		subtitlesMenu.style.display = 'none';
    	});
    	subtitleMenuButtons.push(button);
    	return item;
    }

    var subtitlesMenu;
    function createSubtitleMenu() {

    	if (video.textTracks) {
    		var fragment = document.createDocumentFragment();
            var ul = document.createElement('ul');
    		subtitlesMenu = fragment.appendChild(ul);
    		subtitlesMenu.className = 'subtitles-menu';
    		subtitlesMenu.appendChild(createSubtitleMenuItem('subtitles-off', '', 'Off'));
    		for (var i = 0; i < video.textTracks.length; i++) {
    			subtitlesMenu.appendChild(createSubtitleMenuItem('subtitles-' + video.textTracks[i].language, video.textTracks[i].language, video.textTracks[i].label));
    		}
    		document.body.appendChild(subtitlesMenu);
    	}
    	CCBtn.addEventListener('click', function(e) {
    		if (subtitlesMenu) {
    			subtitlesMenu.style.display = (subtitlesMenu.style.display === 'block' ? 'none' : 'block');
    		}
            if(isFull === true){
                subtitlesMenu.classList.add('fullscreenMode');
            }
            else{
                subtitlesMenu.classList.remove('fullscreenMode');
            }
    	});
    }

    function registerMouseEvents() {
        playBtn.addEventListener('click', function(){
            log("play Button is clicked.");
            video.play();
        });
        stopBtn.addEventListener('click', function(){
            log("stop Button is clicked.");
            video.pause();
            video.currentTime = 0;
        });
        pauseBtn.addEventListener('click', function(){
            log("pause Button is clicked.");
            video.pause();
        });
        fullscreenBtn.addEventListener('click', function(){
            log("fullscreen Button is clicked.");
            changeScreenSize();
        });
    }

    function changeScreenSize() {
    	if(isFull === false){
            if(subtitlesMenu.style.display === 'block'){
                subtitlesMenu.classList.add('fullscreenMode');
            }
            video.classList.add('fullscreenMode');
            videoControls.classList.add('fullscreenMode');
            isFull = true;
            fullscreenBtn.innerHTML = "ReturnScreen";
        }
        else{
            if(subtitlesMenu.style.display === 'block'){
                subtitlesMenu.classList.remove('fullscreenMode');
            }
            video.classList.remove('fullscreenMode');
            videoControls.classList.remove('fullscreenMode');
            isFull = false;
            fullscreenBtn.innerHTML = "FullScreen";
        }
    }

    /**
     * Stop the player when application is closed.
     */
    function onUnload() {
    	log('onUnload');
        stop();
    }

    /**
     * Function to init video playback.
     */
    function init() {
        video.load();
    }

    /**
     * Function to start video playback.
     * Create video element if it does not exist yet.
     */
    function play() {
    	video.play();
    }

    /**
     * Function to pause video playback.
     */
    function pause() {
    	video.pause();
    }

    /**
     * Function to stop video playback.
     */
    function stop() {
    	video.pause();
    	video.currentTime = 0;

        init();
    }

    /**
     * Start the application once loading is finished
     */
    window.onload = function () {
    	if (window.tizen === undefined) {
    		log('This application needs to be run on Tizen device');
    	}

        displayVersion();
        registerKeys();
        registerKeyHandler();
        initVideoPlayer();

        document.body.addEventListener('unload', onUnload);
    };
})();