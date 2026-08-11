document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    
    var videoPlayer = document.getElementById('videoPlayer');
    
    var hls = null;
    var mode = 'tv';
    
    var debugButtonTimeout = null;
    var channelNumberTimeout = null;
    var channelBannerTimeout = null;

    var currentChannelIndex = 0;
    var channels = [
        { name: 'NRK 1', url: 'https://nrk-live-no.akamaized.net/nrk1_dk7/muxed.m3u8' },
        { name: 'NRK 2', url: 'https://nrk-live-no.akamaized.net/nrk2/muxed.m3u8' },
        { name: 'NRK 3', url: 'https://nrk-live-no.akamaized.net/nrk3/muxed.m3u8' },
        { name: 'NRK Super', url: 'https://nrk-live-no.akamaized.net/nrksuper/muxed.m3u8' },
        { name: 'NRK Teiknspråk', url: 'https://nrk-live-no.akamaized.net/nrk_tegnspraak/muxed.m3u8' }
    ];
    
    var currentRadioChannelIndex = 0;
    var radioChannels = [
        { name: 'NRK P1', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p1_dk9_aac_h' },
        { name: 'NRK P2', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p2_aac_h' },
        { name: 'NRK P3', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p3_mp3_h' },
        { name: 'Radio Rock', url: 'http://live-bauerno.sharp-stream.com/radiorock_no_aac' },
        { name: 'Radio Vinyl', url: 'https://live-bauerno.sharp-stream.com/vinyl_no_mp3' },
        { name: 'P6 Rock', url: 'https://p6.p4groupaudio.com/P06_AH' },
    ];    

    function loadChannel(index) {        
        var currentChannels = getCurrentChannels();

        if (index < 0 || index >= currentChannels.length) {
            console.error(
                'Invalid channel index:',
                index,
                'mode:',
                mode,
                'channel count:',
                currentChannels.length
            );
            return;
        }

        if (hls) {
            hls.destroy();
            hls = null;
        }

        videoPlayer.pause();
        videoPlayer.removeAttribute('src');
        videoPlayer.load();

        if (Hls.isSupported()) {
            console.log('HLS.js is supported');
            hls = new Hls();
            hls.loadSource(currentChannels[index].url);
            hls.attachMedia(videoPlayer);
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log('HLS manifest parsed');
                videoPlayer.play();
            });
            hls.on(Hls.Events.ERROR, function(event, data) {
                console.error('HLS.js error:', data);
            });
        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('Native HLS support detected');
            videoPlayer.src = currentChannels[index].url;
            videoPlayer.onloadedmetadata = function() {
                console.log('Video metadata loaded');
                videoPlayer.play();
            });
            videoPlayer.onerror = function(event) {
                console.error('Video player error:', event);
            });
        } else {
            console.error('HLS is not supported in this browser.');
            alert('HLS is not supported in this browser. Please use a compatible browser.');
        }

        // Display the channel banner
        showChannelBanner(index + 1, currentChannels[index].name);
    }

    function getCurrentChannels() {
        return mode === 'radio' ? radioChannels : channels;
    }

    function getCurrentChannelIndex() {
        return mode === 'radio'
            ? currentRadioChannelIndex
            : currentChannelIndex;
    }

    function setCurrentChannelIndex(index) {
        if (mode === 'radio') {
            currentRadioChannelIndex = index;
        } else {
            currentChannelIndex = index;
        }
    }

    function changeChannel(direction) {
        var currentChannels = getCurrentChannels();

        if (currentChannels.length === 0) {
            return;
        }

        var index = getCurrentChannelIndex();

        index += direction;

        if (index >= currentChannels.length) {
            index = 0;
        }

        if (index < 0) {
            index = currentChannels.length - 1;
        }

        setCurrentChannelIndex(index);

        loadChannel(index);
    }


    function switchToTV() {
        mode = 'tv';
        loadChannel(currentChannelIndex);
    }

    function switchToRadio() {
        mode = 'radio';
        loadChannel(currentRadioChannelIndex);
    }

    function showChannelBanner(channelNumber, channelName) {
        var banner = document.getElementById('channelBanner');
        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'channelBanner';
            banner.style.position = 'absolute';
            banner.style.bottom = '0';
            banner.style.left = '0';
            banner.style.width = '100%';
            banner.style.height = '15%';
            banner.style.backgroundColor = 'rgba(0, 0, 0, 1)';
            banner.style.color = 'white';
            banner.style.fontSize = '30px'; // Increase font size
            banner.style.fontFamily = 'Helvetiva Neue, sans-serif';
            banner.style.padding = '10px';
            banner.style.boxSizing = 'border-box';
            banner.style.zIndex = '1000';
            banner.style.display = 'flex';
            banner.style.alignItems = 'center';
            banner.style.paddingBottom = '10px';
            document.body.appendChild(banner);
        }
        banner.innerHTML = `<span style="margin-left: 50px;">${channelNumber}. ${channelName}</span>`;
        banner.style.display = 'block';

        clearTimeout(channelBannerTimeout);

        channelBannerTimeout = setTimeout(function() {
            banner.style.display = 'none';
        }, 6000);
    }
    
    function handleChannelNumber(number) {
        enteredChannelNumber += number;

        console.log('Entered channel number:', enteredChannelNumber);

        showChannelNumber();

        clearTimeout(channelNumberTimeout);

        channelNumberTimeout = setTimeout(function() {
            selectEnteredChannel();
        }, 1500);
    }

    function selectEnteredChannel() {
        if (!enteredChannelNumber) {
            return;
        }

        var channelNumber = parseInt(enteredChannelNumber, 10);
        var currentChannels = mode === 'radio' ? radioChannels : channels;

        enteredChannelNumber = '';

        if (isNaN(channelNumber) || channelNumber < 1) {
            return;
        }

        if (channelNumber > currentChannels.length) {
            console.log(
                'Channel does not exist:',
                channelNumber,
                'in mode:',
                mode
            );
            return;
        }

        var index = channelNumber - 1;

        if (mode === 'radio') {
            currentRadioChannelIndex = index;
        } else {
            currentChannelIndex = index;
        }

        loadChannel(index);
    }


    function showChannelNumber() {
        var banner = document.getElementById('channelBanner');

        if (!banner) {
            return;
        }

        banner.innerHTML =
            '<span style="margin-left: 50px;">' +
            enteredChannelNumber +
            '</span>';

        banner.style.display = 'block';
    }


    function showDebugButton(event) {
        var debug = document.getElementById('debugButton');

        if (!debug) {
            debug = document.createElement('div');
            debug.id = 'debugButton';

            debug.style.position = 'fixed';
            debug.style.top = '30px';
            debug.style.left = '30px';
            debug.style.backgroundColor = 'rgba(0, 0, 0, 0.85)';
            debug.style.color = '#00ff00';
            debug.style.padding = '15px 25px';
            debug.style.fontSize = '28px';
            debug.style.fontFamily = 'monospace';
            debug.style.zIndex = '99999';
            debug.style.border = '2px solid #00ff00';
            debug.style.borderRadius = '5px';

            document.body.appendChild(debug);
        }

        var keyName = event.key || 'Unknown';

        debug.innerHTML =
            'BUTTON: ' + keyName +
            '<br>keyCode: ' + event.keyCode;

        debug.style.display = 'block';

        clearTimeout(debugButtonTimeout);

        debugButtonTimeout = setTimeout(function() {
            debug.style.display = 'none';
        }, 2000);
    }

    loadChannel(currentChannelIndex);

    document.addEventListener('keydown', function(event) {

        // Debug: display every remote button pressed
        showDebugButton(event);

        // Numeric remote buttons
         if (event.key >= '0' && event.key <= '9') { 
            handleChannelNumber(event.key); 
            return; 
        }

        switch (event.key) {
            case 'ArrowUp':
                changeChannel(1);
                break;
            case 'ArrowDown':
                changeChannel(-1);
                break;            
            case 'ArrowLeft':
                switchToTV();
                break;
            case 'ArrowRight':
                switchToRadio();
                break;
            case 'Enter': 
            case 'OK': 
                clearTimeout(channelNumberTimeout); 
                selectEnteredChannel(); 
                break;
            case 'Back': // Back button on Samsung TV remotes
                if (confirm('Are you sure you want to exit TVapp?')) {
                    tizen.application.getCurrentApplication().exit();
                }
                break;
            default:
                switch (event.keyCode) {
                    case 427: // CH_UP button
                    case 38: // Arrow Up
                        changeChannel(1);
                        break;
                    case 428: // CH_DOWN button
                    case 40: // Arrow down
                        changeChannel(-1);
                        break;
                    case 41:
                        clearTimeout(channelNumberTimeout); 
                        selectEnteredChannel(); 
                        break;
                    case 37: // Arrow left
                        switchToTV();
                        break;
                    case 456: // Arrow right
                        switchToRadio();
                        break;
                    case 10009: // CH_DOWN button
                    	if (confirm('Are you sure you want to exit the TVapp?')) {
                            tizen.application.getCurrentApplication().exit();
                        }
                }
        }
    });
});
