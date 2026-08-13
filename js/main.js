document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');

    var hls = null;

    var audioPlayer = document.getElementById('videoPlayer');
    var videoPlayer = document.getElementById('videoPlayer');

    // Dummy list, to satisfy apps2samsung
    var channels = [];

    var tvChannels = [
        // Nrk
        { name: 'NRK 1', url: 'https://nrk-live-no.akamaized.net/nrk1_dk7/muxed.m3u8' },
        { name: 'NRK 2', url: 'https://nrk-live-no.akamaized.net/nrk2/muxed.m3u8' },
        { name: 'NRK 3', url: 'https://nrk-live-no.akamaized.net/nrk3/muxed.m3u8' },
        { name: 'NRK Super', url: 'https://nrk-live-no.akamaized.net/nrksuper/muxed.m3u8' },
        { name: 'NRK Teiknspråk', url: 'https://nrk-live-no.akamaized.net/nrk_tegnspraak/muxed.m3u8' },
        
        // Frikanalen
        { name: 'Frikanalen', url: 'https://frikanalen.no/stream/index.m3u8' }
    ];
    var currentTvChannelIndex = 0;

    var radioChannels = [
        // Nrk
        { name: 'NRK P1', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p1_dk9_aac_h' },
        { name: 'NRK P1+', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p1pluss' },        
        { name: 'NRK P2', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p2_aac_h' },
        { name: 'NRK P3', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p3_mp3_h' },
        { name: 'NRK P3 Musikk', url: 'https://cdn0-47115-liveicecast0.dna.contentdelivery.net/p3musikk_aac_h' },
        { name: 'NRK mP3', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/mp3' },
        
        // Bauer
        { name: 'Radio Rock', url: 'http://live-bauerno.sharp-stream.com/radiorock_no_aac' },
        { name: 'Radio Vinyl', url: 'https://live-bauerno.sharp-stream.com/vinyl_no_mp3' },
        { name: 'P6 Rock', url: 'https://p6.p4groupaudio.com/P06_AH' }
    ];
    var currentRadioChannelIndex = 0;
    
    var mode = 'tv';

    var bannerTimeout = 3000;

    function loadChannel(index) {
        var currentChannels = getCurrentChannels();
        var channel = currentChannels[index];

        if (mode === 'radio') {
            loadRadioChannel(channel);
        } else {
            loadTVChannel(channel);
        }

        showChannelBanner(index + 1, channel.name);
    }

    function loadTVChannel(channel) {
        console.log('Loading TV:', channel.name);

        // Stop radio
        audioPlayer.pause();
        audioPlayer.removeAttribute('src');
        audioPlayer.load();

        // Stop previous HLS instance
        if (hls) {
            hls.destroy();
            hls = null;
        }

        videoPlayer.style.display = 'block';

        if (Hls.isSupported()) {
            console.log('HLS.js is supported');

            hls = new Hls();

            hls.loadSource(channel.url);
            hls.attachMedia(videoPlayer);

            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log('HLS manifest parsed');

                videoPlayer.play().catch(function(error) {
                    console.error('TV play error:', error);
                });
            });

            hls.on(Hls.Events.ERROR, function(event, data) {
                console.error('HLS.js error:', data);
            });

        } else if (videoPlayer.canPlayType('application/vnd.apple.mpegurl')) {

            console.log('Native HLS support detected');

            videoPlayer.src = channel.url;

            videoPlayer.onloadedmetadata = function() {
                videoPlayer.play().catch(function(error) {
                    console.error('TV play error:', error);
                });
            };

            videoPlayer.onerror = function(event) {
                console.error('Video player error:', event);
            };

        } else {
            console.error('HLS is not supported');
            alert('HLS is not supported in this browser.');
        }
    }

    function loadRadioChannel(channel) {
        console.log('Loading radio:', channel.name);

        // Stop TV
        videoPlayer.pause();

        if (hls) {
            hls.destroy();
            hls = null;
        }

        videoPlayer.removeAttribute('src');
        videoPlayer.load();

        // Hide video
        videoPlayer.style.display = 'none';

        // Play radio using HTML5 audio
        audioPlayer.style.display = 'none';

        audioPlayer.pause();
        audioPlayer.src = channel.url;
        audioPlayer.load();

        audioPlayer.oncanplay = function() {
            console.log('Radio ready:', channel.name);

            audioPlayer.play().catch(function(error) {
                console.error('Radio play error:', error);
            });
        };

        audioPlayer.onerror = function(event) {
            console.error('Radio player error:', event);
            console.error('Audio error code:', audioPlayer.error);
        };
    }

    function getCurrentChannels() {
        return mode === 'radio' ? radioChannels : tvChannels;
    }

    function getCurrentChannelIndex() {
        return mode === 'radio'
            ? currentRadioChannelIndex
            : currentTvChannelIndex;
    }

    function setCurrentChannelIndex(index) {
        if (mode === 'radio') {
            currentRadioChannelIndex = index;
        } else {
            currentTvChannelIndex = index;
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

    function switchMode() {
        if (mode == 'radio') {
            switchToTV();
        } else {
            switchToRadio();
        }
    }

    function switchToTV() {
        mode = 'tv';
        loadChannel(currentTvChannelIndex);
    }

    function switchToRadio() {
        mode = 'radio';
        loadChannel(currentRadioChannelIndex);
    }

    function showCurrentChannel() {
        var currentChannels = getCurrentChannels();
        var index = getCurrentChannelIndex();
        var channel = currentChannels[index];
        showChannelBanner(index + 1, channel.name);
    }

    function showChannelBanner(channelIndex, channelName) {
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
        banner.innerHTML = `<span style="margin-left: 50px;">${channelIndex}. ${channelName}</span>`;
        banner.style.display = 'block';
        
        clearTimeout(bannerTimeout);

        banner.style.display = 'block';

        bannerTimeout = setTimeout(function() {
            banner.style.display = 'none';
        }, 3000);
    }

    loadChannel(currentTvChannelIndex);

    document.addEventListener('keydown', function(event) {
        
        switch (event.keyCode) {
            case 38: // Arrow Up
                changeChannel(1);
                break;
            case 40: // Arrow Up
                changeChannel(-1);
                break;
            case 37: // Arrow left
            case 39: // Arrow right
                switchMode();
                break;
            case 13: // Enter
                showCurrentChannel();
                break;
            case 10009: // Back button
                if (confirm('Are you sure you want to exit the TVapp?')) {
                    tizen.application.getCurrentApplication().exit();
                }
        }
    });
});
