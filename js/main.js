document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');

    var hls = null;

    var EPG_URL = 'https://www.open-epg.com/files/norway.xml';

    var epgLoading = false;
    var epgError = null;

    var audioPlayer = document.getElementById('audioPlayer');
    var videoPlayer = document.getElementById('videoPlayer');

    // Dummy list, to satisfy apps2samsung
    var channels = [];

    var tvChannels = [
        // Nrk
        { name: 'NRK 1', epgId: 'NRK1Rogaland.no', url: 'https://nrk-live-no.akamaized.net/nrk1_dk7/muxed.m3u8' },
        { name: 'NRK 2', epgId: 'NRK2.no', url: 'https://nrk-live-no.akamaized.net/nrk2/muxed.m3u8' },
        { name: 'NRK 3', epgId: 'NRK3.no', url: 'https://nrk-live-no.akamaized.net/nrk3/muxed.m3u8'},
        { name: 'NRK Super', epgId: 'NRKSuper.no', url: 'https://nrk-live-no.akamaized.net/nrksuper/muxed.m3u8' },
        { name: 'NRK Teiknspråk', epgId: 'NRK1Tegnspraak.no', url: 'https://nrk-live-no.akamaized.net/nrk_tegnspraak/muxed.m3u8' },
            
        // Nrk Nett-TV
        { name: 'NRK Nett-TV 1', url: 'https://nrk-live-no.akamaized.net/nrktv4/muxed.m3u8' },
        { name: 'NRK Nett-TV 2', url: 'https://nrk-live-no.akamaized.net/nrktv5/muxed.m3u8' },
        { name: 'NRK Nett-TV 3', url: 'https://nrk-live-no.akamaized.net/nrktv6/muxed.m3u8' },
        { name: 'NRK Nett-TV 4', url: 'https://nrk-live-no.akamaized.net/nrktv7/muxed.m3u8' },        
        
        // Frikanalen
        { name: 'Frikanalen', epgId: 'Frikanalen.no', url: 'https://frikanalen.no/stream/index.m3u8' },
        
        // Red Bull TV
        { name: 'Red Bull TV', epgId: '10001', url: 'https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8' }
                
    ];
    var currentTvChannelIndex = 0;

    var radioChannels = [
        // Nrk
        { name: 'NRK P1', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p1_dk9' },
        { name: 'NRK P2', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p2' },
        { name: 'NRK P3', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p3' },
        { name: 'NRK Super', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/radio_super' },
        { name: 'NRK P1+', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p1pluss' },        
        { name: 'NRK P3 Musikk', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/p3musikk' },
        { name: 'NRK mP3', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/mp3' },
        { name: 'NRK Nyheiter', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/nyheter' },
        { name: 'NRK Klassisk', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/klassisk' },
        { name: 'NRK Jazz', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/jazz' },
        { name: 'NRK Folkemusikk', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/folkemusikk' },
        { name: 'NRK Sport', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/sport' },
        { name: 'NRK Sápmi', url: 'https://lyd.nrk.no/icecast/aac/high/s0w7hwn47m/sami' },
        
        // Bauer Media
        { name: 'Radio Norge', url: 'https://live-bauerno.sharp-stream.com/radionorge_no_aac' },
        { name: 'Radio Rock', url: 'http://live-bauerno.sharp-stream.com/radiorock_no_aac' },
        { name: 'Radio Vinyl', url: 'https://live-bauerno.sharp-stream.com/vinyl_no_aac' },
        { name: 'Radio Topp 40', url: 'http://live-bauerno.sharp-stream.com/top40_no_aac' },
        { name: 'P24-7 Mix', url: 'http://live-bauerno.sharp-stream.com/p247mix_no_aac' },
        { name: 'P24-7 Kos', url: 'http://live-bauerno.sharp-stream.com/p247kos_no_aac' },
        { name: 'P24-7 Fun', url: 'http://live-bauerno.sharp-stream.com/p247fun_no_aac' },
        { name: 'P24-7 Hot', url: 'http://live-bauerno.sharp-stream.com/p247hot_no_aac' },
        { name: 'NRJ', url: 'http://live-bauerno.sharp-stream.com/kiss_no_aac' },
        
        // Viaplay Group        
        { name: 'P4 Norge', url: 'https://p4.p4groupaudio.com/P04_AH' },
        { name: 'P5 Hits', url: 'https://p5.p4groupaudio.com/P05_AH' },
        { name: 'P6 Rock', url: 'https://p6.p4groupaudio.com/P06_AH' },
        { name: 'P7 Klem', url: 'https://p7.p4groupaudio.com/P07_AH' },
        { name: 'P8 Pop', url: 'https://p8.p4groupaudio.com/P08_AH' },
        { name: 'P9 Retro', url: 'https://p9.p4groupaudio.com/P09_AH' },
        { name: 'P10 Country', url: 'https://p10.p4groupaudio.com/P10_AH' },
        { name: 'P11 Dance', url: 'https://p11.p4groupaudio.com/P11_AH' },
        { name: 'P12 Hitmix', url: 'https://p12.p4groupaudio.com/P12_AH' },
        { name: 'P5 Nonstop Hits', url: 'https://p5n.p4groupaudio.com/P05AAH' },

        // 1FM
        { name: '1FM', url: 'https://lyd.1fm.no/1fm_hq' },
        { name: '1FM Gull', url: 'https://lyd.1fm.no/1fmgull_hq' },
        { name: '1FM Rock', url: 'https://lyd.1fm.no/1fmrock_hq' },
        { name: '1FM Jazz', url: 'https://lyd.1fm.no/1fmjazz_hq' }
    ];
    var currentRadioChannelIndex = 0;
    
    var mode = 'tv';

    var bannerTimeout = 3000;

    function loadEPG() {
        if (epgLoading) {
            return;
        }

        epgLoading = true;
        epgError = null;

        console.log('Loading EPG...');

        EPG.load(EPG_URL)
            .then(function () {
                console.log(
                    'EPG loaded:',
                    EPG.updatedAt()
                );

                epgLoading = false;

                updateChannelBanner();
            })
            .catch(function (error) {
                epgLoading = false;
                epgError = error;

                console.error(
                    'Failed to load EPG:',
                    error
                );
            });
    }

    function loadChannel(index) {
        var currentChannels = getCurrentChannels();
        var channel = currentChannels[index];

        if (mode === 'radio') {
            loadRadioChannel(channel);
        } else {
            loadTVChannel(channel);
        }

        showChannelBanner(
            index + 1,
            channel.name,
            EPG.getCurrent(channel.epgId),
            EPG.getNext(channel.epgId, 1)[0]
        );
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

    function toggleChannelBanner() {
        var banner = document.getElementById('channelBanner');
        if (!banner || banner.style.display === 'none') {
            var currentChannels = getCurrentChannels();
            var index = getCurrentChannelIndex();
            var channel = currentChannels[index];
            
            showChannelBanner(
                index + 1,
                channel.name,
                EPG.getCurrent(channel.epgId),
                EPG.getNext(channel.epgId, 1)[0]
            );
        }
        else {
            hideChannelBanner();
        }
    }

    function formatTime(date) {
        if (!date) return '';

        return date.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getProgramProgress(program) {
        var now = Date.now();

        var start = program.start.getTime();
        var stop = program.stop.getTime();

        if (now <= start) return 0;
        if (now >= stop) return 100;

        return Math.round(
            ((now - start) / (stop - start)) * 100
        );
    }

    function escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function hideChannelBanner() {
        var banner = document.getElementById('channelBanner');
        if (banner) {
            banner.style.display = 'none';
            clearTimeout(bannerTimeout);
        }
    }

    function showChannelBanner(
        channelIndex,
        channelName,
        currentProgram,
        nextProgram
    ) {
        var banner = document.getElementById('channelBanner');

        if (!banner) {
            banner = document.createElement('div');
            banner.id = 'channelBanner';

            banner.style.position = 'absolute';
            banner.style.bottom = '0';
            banner.style.left = '0';
            banner.style.width = '100%';
            banner.style.minHeight = '18%';
            banner.style.backgroundColor = 'rgba(0, 0, 0, 0.92)';
            banner.style.color = 'white';
            banner.style.fontFamily = 'Arial, sans-serif';
            banner.style.padding = '25px 50px';
            banner.style.boxSizing = 'border-box';
            banner.style.zIndex = '1000';

            document.body.appendChild(banner);
        }

        var html =
            '<div style="font-size:22px;color:#aaa;">' +
            channelIndex +
            '</div>' +

            '<div style="font-size:34px;font-weight:bold;">' +
            escapeHtml(channelName) +
            '</div>';

        if (currentProgram) {
            var progress =
                getProgramProgress(currentProgram);

            html +=
                '<div style="font-size:28px;margin-top:8px;">' +
                escapeHtml(currentProgram.title) +
                '</div>' +

                '<div style="font-size:18px;color:#bbb;margin-top:6px;">' +
                formatTime(currentProgram.start) +
                ' - ' +
                formatTime(currentProgram.stop) +
                '</div>' +

                '<div style="' +
                'height:5px;' +
                'background:#444;' +
                'margin-top:10px;' +
                'width:70%;' +
                '">' +
                '<div style="' +
                'height:100%;' +
                'width:' + progress + '%;' +
                'background:#e60000;' +
                '"></div>' +
                '</div>';
        } else {
            html +=
                '<div style="font-size:22px;color:#aaa;margin-top:8px;">' +
                'No EPG information' +
                '</div>';
        }

        if (nextProgram) {
            html +=
                '<div style="font-size:18px;color:#999;margin-top:8px;">' +
                'Next: ' +
                escapeHtml(nextProgram.title) +
                '</div>';
        }

        banner.innerHTML = html;
        banner.style.display = 'block';

        clearTimeout(bannerTimeout);

        bannerTimeout = setTimeout(function () {
            banner.style.display = 'none';
        }, 5000);
    }

    function updateChannelBanner() {
        if (mode !== 'tv') {
            return;
        }

        var channels = getCurrentChannels();
        var index = getCurrentChannelIndex();
        var channel = channels[index];

        if (!channel) {
            return;
        }

        var current = EPG.getCurrent(channel.epgId);
        var next = EPG.getNext(channel.epgId, 1)[0];

        showChannelBanner(
            index + 1,
            channel.name,
            current,
            next
        );
    }

    loadChannel(currentTvChannelIndex);

    loadEPG();

    setInterval(function () {
        if (mode === 'tv') {
            updateChannelBanner();
        }
    }, 30000);

    setInterval(function () {
        loadEPG();
    }, 6 * 60 * 60 * 1000);

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
                toggleChannelBanner();
                break;
            case 10009: // Back button
                if (confirm('Are you sure you want to exit the TVapp?')) {
                    tizen.application.getCurrentApplication().exit();
                }
        }
    });
});
