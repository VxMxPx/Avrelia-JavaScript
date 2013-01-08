AJS.register('Library.Log', function() {
    var _public = {},

        // Just contains all the logs added
        storage = { info:[], warn:[], error:[], debug:[], log:[] };

    /**
     * Add the log message internally. If debug then message
     * will be dump to console (if available).
     * --
     * @param {string} type
     * @param {mixed}  message
     */
    function _add(type, message) {
        // If we have console and debug mode is enabled,
        // we'll dump info out to it.
        if (typeof console !== 'undefined' &&
            typeof console[type] !== 'undefined' &&
            AJS.Library.Config.get('is_debug')) {
            console[type](message);
        }

        storage[type].push(message);
    }

    _public.info = function(message) {
        _add('info', message);
    };

    _public.warn = function(message) {
        _add('warn', message);
    };

    _public.error = function(message) {
        _add('error', message);
    };

    _public.debug = function(message) {
        _add('debug', message);
    };

    _public.log = function(message) {
        _add('log', message);
    };

    return _public;

});