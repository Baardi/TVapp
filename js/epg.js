/*
 * XMLTV EPG parser for TVapp
 *
 * Converts XMLTV into:
 * {
 *   "NRK1.no": [
 *      {
 *        start: Date,
 *        stop: Date,
 *        title: "...",
 *        description: "...",
 *        category: "..."
 *      }
 *   ]
 * }
 */

var EPG = (function () {
    'use strict';

    var programs = {};
    var loaded = false;
    var lastUpdated = 0;

    function parseXmltvDate(value) {
        if (!value) return null;

        // XMLTV format:
        // 20260817180000 +0200
        // 20260817180000
        var match = value.match(
            /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-])(\d{2})(\d{2}))?/
        );

        if (!match) return null;

        var year = parseInt(match[1], 10);
        var month = parseInt(match[2], 10) - 1;
        var day = parseInt(match[3], 10);
        var hour = parseInt(match[4], 10);
        var minute = parseInt(match[5], 10);
        var second = parseInt(match[6], 10);

        if (match[7]) {
            var utc = Date.UTC(
                year,
                month,
                day,
                hour,
                minute,
                second
            );

            var offset =
                (parseInt(match[8], 10) * 60 +
                    parseInt(match[9], 10)) *
                60 *
                1000;

            return new Date(
                match[7] === '+'
                    ? utc - offset
                    : utc + offset
            );
        }

        return new Date(
            year,
            month,
            day,
            hour,
            minute,
            second
        );
    }

    function text(node, selector) {
        var element = node.querySelector(selector);
        return element ? element.textContent.trim() : '';
    }

    function parse(xml) {
        var parser = new DOMParser();
        var document = parser.parseFromString(xml, 'application/xml');

        if (!document || document.querySelector('parsererror')) {
            throw new Error('Invalid XMLTV document');
        }

        var result = {};
        var entries = document.querySelectorAll('programme');

        for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];

            var channelId = entry.getAttribute('channel');
            var start = parseXmltvDate(entry.getAttribute('start'));
            var stop = parseXmltvDate(entry.getAttribute('stop'));

            if (!channelId || !start || !stop) {
                continue;
            }

            var title = text(entry, 'title');

            if (!title) {
                title = 'Unknown program';
            }

            var program = {
                start: start,
                stop: stop,
                title: title,
                description: text(entry, 'desc'),
                category: text(entry, 'category'),
                episode: text(entry, 'episode-num')
            };

            if (!result[channelId]) {
                result[channelId] = [];
            }

            result[channelId].push(program);
        }

        Object.keys(result).forEach(function (channel) {
            result[channel].sort(function (a, b) {
                return a.start.getTime() - b.start.getTime();
            });
        });

        programs = result;
        loaded = true;
        lastUpdated = Date.now();

        return result;
    }

    function load(url) {
        return fetch(url, {
            method: 'GET',
            cache: 'no-cache'
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error(
                        'EPG HTTP error: ' + response.status
                    );
                }

                return response.text();
            })
            .then(function (xml) {
                return parse(xml);
            });
    }

    function get(channelId) {
        return programs[channelId] || [];
    }

    function getCurrent(channelId) {
        var now = Date.now();
        var list = get(channelId);

        for (var i = 0; i < list.length; i++) {
            if (
                list[i].start.getTime() <= now &&
                list[i].stop.getTime() > now
            ) {
                return list[i];
            }
        }

        return null;
    }

    function getNext(channelId, count) {
        count = count || 1;

        var now = Date.now();
        var list = get(channelId);
        var result = [];

        for (var i = 0; i < list.length; i++) {
            if (list[i].start.getTime() > now) {
                result.push(list[i]);

                if (result.length >= count) {
                    break;
                }
            }
        }

        return result;
    }

    function isLoaded() {
        return loaded;
    }

    function updatedAt() {
        return lastUpdated;
    }

    return {
        parse: parse,
        load: load,
        get: get,
        getCurrent: getCurrent,
        getNext: getNext,
        isLoaded: isLoaded,
        updatedAt: updatedAt
    };
})();
