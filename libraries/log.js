AJS.register('Library.Log', function() {
    var _public = {},

        // Just contains all the logs added
        storage = { info:[], warn:[], error:[], debug:[], log:[] };

    /**
     * Add the log message internally. If in debug mode (provided through
     * configuration) then message will be dump to console (if available).
     * --
     * @param  {string} type
     * @param  {mixed}  message
     * --
     * @return {void}
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

    /**
     * Add an information.
     * --
     * @param  {mixed} message
     * --
     * @return {void}
     */
    _public.info = function(message) {
        _add('info', message);
    };

    /**
     * Add a warning.
     * --
     * @param  {mixed} message
     * --
     * @return {void}
     */
    _public.warn = function(message) {
        _add('warn', message);
    };

    /**
     * Add an error.
     * --
     * @param  {mixed} message
     * --
     * @return {void}
     */
    _public.error = function(message) {
        _add('error', message);
    };

    /**
     * Add a debug.
     * --
     * @param  {mixed} message
     * --
     * @return {void}
     */
    _public.debug = function(message) {
        _add('debug', message);
    };

    /**
     * Add a log.
     * --
     * @param  {mixed} message
     * --
     * @return {void}
     */
    _public.log = function(message) {
        _add('log', message);
    };

    return _public;

});