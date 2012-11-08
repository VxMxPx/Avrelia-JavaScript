AJS.register('Library.Request', function() {

    var Lib      = AJS.Library,
        defaults = {
            url         : '',
            message     : false,
            overlay     : false,
            data_type   : 'json',
            on_multiple : 'last'
        };

    /**
     * Request library is used to handle request to server, and can react on some
     * types of responses - like redirect, messages, etc...
     * --
     * @param {array} options 
     * 
     * Available options are:
     * ======================
     * url           -- string  A url to which request should be made. This can
     *                          be full url, or only segment(s).
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

        this.opt = $.extend({}, defaults, options);

        // Check if url contains :// if it does then assume that full url was
        // provided - something like http://google.com or https://google.com;
        // If that's true, then just set the url as it is. 
        // If not, then call url() function, and pass in the url, to generate
        // full absolute url.
        this.opt.url = this.opt.url.match(/:\/\//) ? this.opt.url : url(this.opt.url);

        // Is any request in progress right now?
        this.in_progress = 0;

        // All requests made so far.
        this.stack = [];
    };

    Request.prototype = {

        constructor: Request,

        _make_request: function(type, data) {
            data = data || null;

            request = $.ajax(this.url, {
                type: type,
                data: data
            });

            // Increase requests currently in progress
            this.in_progress++;

            // Push request to the stack
            this.stack.push(request);
        },

        do_post: function(data) {
            data = typeof data === 'object' ? data : {data: data};
            return this._make_request('post', data);
        },

        do_get: function(data) {
            data = typeof data === 'object' ? data : {data: data};
            return this._make_request('get', data);
        },

        do_put: function(data) {
            data = typeof data === 'object' ? data : {data: data};

            data['_method'] = 'put';
            return this._make_request('post', data);
        },

        do_delete: function(data) {
            data = typeof data === 'object' ? data : {data: data};

            data['_method'] = 'delete';
            return this._make_request('post', data);
        }

    };

    return Request;

});