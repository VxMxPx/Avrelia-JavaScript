AJS.register('Library.Request', function() {

    var Lib = AJS.Library;

    /**
     * Request library is used to handle request to server, and can react on some
     * types of responses - like redirect, messages, etc...
     * --
     * @param {array} options 
     * 
     * Available options are:
     * ======================
     * url           -- string  Full url to which request should be made.
     * [message]     -- object  A message library to handle messages.
     * [overlay]     -- object  An overlay library to handle overlays.
     * [data_type]   -- string  ([xml], json, script, html) Expected data type.
     * [on_multiple] -- string  (first, [last], all) What happens when we have
     *                          multiple request, should we keep only first,
     *                          only last, or all of them.
     *
     * Responses which this library will handle properly:
     * ==================================================
     * status     -- boolean Status of request (was successful or not).
     * [redirect] -- string  Should redirect be preformed, 
     *                       www-address where to go. 
     * [messages] -- array   List of messages to display.
     * [log]      -- array   Only for debugging.
     * [data]     -- mixed   Any data that server might wanna send back 
     *                       for any reason.
     */
    var Request = function(options) {

        // Is any request in progress right now?
        this.in_progress = 0;

        // All requests made so far.
        this.stack = [];
    };

    Request.prototype = {

        constructor: Request,

        _make_request: function(type, data) {
            data = data || null;

            return $.ajax(this.url, {
                type: type,
                data: data
            });
        },

        do_post: function(data) {
            
        },

        do_get: function(data) {

        },

        do_put: function(data) {

        },

        do_delete: function(data) {

        }

    };

    return Request;

});