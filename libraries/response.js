AJS.register('Library.Response', function() {

    var Lib = AJS.Library;

    /**
     * Response library is used to handle response from the server, and will
     * react on some special responses, like redirect, messages, etc..
     * --
     * @param {object} options
     *
     * Available options are:
     * ======================
     * [MessageLibrary]      -- object  A message library to handle messages.
     * [OverlayLibrary]      -- object  An overlay library to be displayed on redirects.
     * [overlay_on_redirect] -- boolean Weather to display overlay when redirecting.
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
    var Response = function(options) {
        this.opt = $.extend({}, {
            MessageLibrary      : false,
            OverlayLibrary      : false,
            overlay_on_redirect : false
        }, options);
    };

    Response.prototype = {

        constructor : Response,

        handle      : function(jqXHR, textStatus) {

            // What's the status?
            if (textStatus === 'success') {

                // Extract JSON if expected or just return response
                if (typeof jqXHR.responseText === 'string') {
                    response = $.parseJSON(jqXHR.responseText);
                }
                else {
                    response = typeof jqXHR.responseText !== 'undefined' ?
                                    jqXHR.responseText :
                                    jqXHR;
                }

                // Now if we don't have object, no point to continue
                if (typeof response !== 'object') {
                    return response;
                }

                // Do we have redirect?
                if (typeof response.redirect === 'string') {
                    if (!response.redirect.match(/:\/\//)) {
                        response.redirect = AJS.url(response.redirect);
                    }

                    // Display overlay on redirect?
                    if (this.opt.overlay_on_redirect && this.opt.OverlayLibrary) {

                        this.opt.OverlayLibrary.show();
                    }

                    // Here we go ...
                    window.location.replace(response.redirect);
                    return;
                }

                // Handle messages now!
                if (this.opt.MessageLibrary && typeof response.messages === 'object') {
                    if (response.messages.length) {
                        this.opt.MessageLibrary.from_array(response.messages);
                        this.opt.MessageLibrary.show();
                    }
                }

                // That's it...
                return response;
            }
        }

    };

    return Response;

});