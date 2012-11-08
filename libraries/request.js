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

        // Current (or last) request
        this.current_request = null;

        // All requests made so far.
        this.stack = [];
    };

    Request.prototype = {

        constructor: Request,

        _make_request: function(type, data) {
            data = data || null;

            // If we have overlay, then now is the time to show it.
            // If anything is already in progress, then overlay is visible anyway.
            if (!this.in_progress && this.opt.overlay) {
                this.opt.overlay.show();
            }

            // If we allow only one, then return current if anything is in progress
            if (this.in_progress > 0 && this.opt.on_multiple === 'first') {
                return this.current_request;
            }

            // If we allow only last, then cancel everything currently in progress
            if (this.in_progress > 0 && this.opt.on_multiple === 'last') {
                this.cancel_all();
            }

            // Make new request finally
            this.current_request = $.ajax(this.opt.url, {
                type     : type,
                data     : data,
                dataType : this.opt.data_type
            });

            // Register on complete event
            this.current_request.complete($.proxy(this._on_complete, this));

            // Increase requests currently in progress
            this.in_progress = this.in_progress+1;

            // Push request to the stack
            this.stack.push(this.current_request);

            // Return it
            return this.current_request;
        },

        /**
         * When particular request finishes we'll trigger this, - 
         * it will decrease in progress counter and hide overlay if needed + it
         * will set messages, etc...
         */
        _on_complete: function(jqXHR, textStatus) {
            
            this.in_progress = this.in_progress-1;

            if (this.in_progress === 0 && this.opt.overlay) {
                this.opt.overlay.hide();
            }

            console.log(jqXHR);

            // What's the status?
            if (textStatus === 'success') {
            }
        },

        /**
         * Will cancel all request currently in progress.
         */
        cancel_all: function()
        {
            if (this.stack.length && this.in_progress) {

                for (var i = this.stack.length - 1; i >= 0; i--) {
                    this.stack[i].abort();
                };

                this.in_progress = 0;
            }

            return this;
        },

        do_post: function(data) {
            data = typeof data === 'object' ? data : {};
            return this._make_request('post', data);
        },

        do_get: function(data) {
            data = typeof data === 'object' ? data : {};
            return this._make_request('get', data);
        },

        do_put: function(data) {
            data = typeof data === 'object' ? data : {};

            data['_method'] = 'put';
            return this._make_request('post', data);
        },

        do_delete: function(data) {
            data = typeof data === 'object' ? data : {};

            data['_method'] = 'delete';
            return this._make_request('post', data);
        }

    };

    return Request;

});