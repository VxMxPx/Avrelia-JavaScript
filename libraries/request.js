AJS.register('Library.Request', function() {

    var Lib      = AJS.Library,
        defaults = {
            url             : '',
            OverlayLibrary  : false,
            ResponseLibrary : false,
            type            : 'json',
            limit           : 'last'
        };

    /**
     * Request library is used to handle request to server,
     * and can react on some types of responses - like redirect, messages, etc..
     * --
     * @param {array} options
     *
     * Available options are:
     * ======================
     * url               -- string  A url to which request should be made.
     *                              This can be full url, or only segment(s).
     *                              If only segments, then full url will be
     *                              created using Lib.Config.get('base_url')
     * [OverlayLibrary]  -- mixed   An overlay library to handle overlays.
     *                              This can be an array with more than just one
     *                              overlay library.
     * [ResponseLibrary] -- object  Response library handler.
     * [type]            -- string  ([xml], json, script, html) Expected data type.
     * [limit]           -- string  (first, [last], false) What happens when we have
     *                              multiple request, should we keep only first,
     *                              only last, or all of them.
     */
    var Request = function(options) {

        this.opt = $.extend({}, defaults, options);

        // Check if url contains :// if it does then assume that full url was
        // provided - something like http://google.com or https://google.com;
        // If that's true, then just set the url as it is.
        // If not, then call url() function, and pass in the url, to generate
        // full absolute url.
        this.opt.url = this.opt.url.match(/:\/\//) ? this.opt.url : AJS.url(this.opt.url);

        // Is any request in progress right now?
        this.in_progress = 0;

        // Current (or last) request
        this.current_request = null;

        // Temporarily appended URI.
        this.appeneded = null;

        // All requests made so far.
        this.stack = [];
    };

    Request.prototype = {

        constructor: Request,

        _show_overlays : function() {

            // Check if we have any overlay at all...
            if (this.opt.OverlayLibrary) {

                // Check if is one library of array of multiple libraries
                if (typeof this.opt.OverlayLibrary['opt'] === 'undefined') {

                    // We have multiple libraries
                    for (var i = this.opt.OverlayLibrary.length - 1; i >= 0; i--) {
                        this.opt.OverlayLibrary[i].show();
                    }
                }
                else {
                    this.opt.OverlayLibrary.show();
                }
            }
        },

        _hide_overlays : function() {

            // Check if we have any overlay at all...
            if (this.opt.OverlayLibrary) {

                // Check if is one library of array of multiple libraries
                if (typeof this.opt.OverlayLibrary['opt'] === 'undefined') {

                    // We have multiple libraries
                    for (var i = this.opt.OverlayLibrary.length - 1; i >= 0; i--) {
                        this.opt.OverlayLibrary[i].hide();
                    }
                }
                else {
                    this.opt.OverlayLibrary.hide();
                }
            }
        },

        /**
         * Take get, and appended get / segments and create full URL. After that,
         * it will unset temporarily appended items.
         * --
         * @return {string}
         */
        _resolve_url : function() {
            var full_url = this.opt.url;


            if (this.appended) {

                // Question mark in our URL?
                if (full_url.match(/\?/)) {
                    var segments = full_url.split(/\?/);

                    full_url = segments.shift() + '/' + this.appended;

                    if (segments.length) {

                        full_url = full_url +
                            (this.appended.match(/\?/) ? '&' : '?') +
                            segments.join('?');
                    }
                }
                else {

                    full_url = full_url + '/' + this.appended;
                }

                // Reset it back to null, as it is temporary, and valid only per
                // one request.
                this.appended = null;

                // Cleanup the trash
                full_url = full_url.replace(/([^:\/\/])[\/]+/g, '$1/');
            }

            return full_url;
        },

        _make_request: function(type, data) {

            data = data || null;

            // Increase requests currently in progress
            this.in_progress = this.in_progress + 1;

            // If we allow only one, then return current if anything is in progress
            if (this.in_progress > 1 && this.opt.limit === 'first') {
                return this.current_request;
            }

            // If we allow only last, then cancel everything currently in progress
            if (this.in_progress > 1 && this.opt.limit === 'last') {
                this.cancel_all();
            }

            // If we have overlay, then now is the time to show it.
            // If anything is already in progress, then overlay is visible anyway.
            if (this.in_progress === 1) {
                this._show_overlays();
            }

            // Make new request finally
            this.current_request = $.ajax(this._resolve_url(), {
                type     : type,
                data     : data,
                dataType : this.opt.type
            });

            // Register on complete event
            this.current_request.always($.proxy(this._on_complete, this));

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
            
            var response = '';

            this.in_progress = this.in_progress-1;

            if (this.in_progress === 0) {
                this._hide_overlays();
            }

            if (this.opt.ResponseLibrary) {

                return this.opt.ResponseLibrary.handle(jqXHR, textStatus);
            }
            else {
                
                return jqXHR;
            }
        },

        /**
         * Append URI to the main URL. After the request was made, this will be
         * removed automatically.
         * --
         * @param  {string} uri Example 'filter.json?order=desc'
         * --
         * @return {void}
         */
        append_uri: function(uri) {
            this.appended = uri;
        },

        /**
         * Will cancel all request currently in progress.
         */
        cancel_all: function()
        {
            if (this.stack.length && this.in_progress) {

                for (var i = this.stack.length - 1; i >= 0; i--) {
                    this.stack[i].abort();
                }
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