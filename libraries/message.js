AJS.register('Library.Message', function() {

        // Single message item template
    var template = ['<div><div class="alert">',
                       '<button type="button" class="close" data-dismiss="alert">×</button>',
                   '</div></div>'].join(''),

        // Map types to css classes
        types_map = { war: 'warn', ok: 'success', err: 'error', inf: 'info' };


    /**
     * Message class
     * --
     * @param object  options  Following options are available:
     *
     * $wrapper          : object  jQuery wrapper, which contain all messages.
     * [can_close]       : boolean Can messages be closed (they have -x-)
     *                             Default = true
     * [group]           : boolean Group messages of same type together.
     *                             Default = true
     * [autohide]        : integer If set, messages will disapear after
     *                             particular amount of time.
     *                             Default = false
     * [animation_speed] : mixed   Speed of animations (int, 'fast', 'slow')
     *                             Default = false
     * [in_animation]    : string  Which animation to use on show.
     *                             (jQuery animations)
     *                             Default = show
     * [out_animation]   : string  Which animation to use on hide.
     *                             Default = hide
     */
    var Message = function(options) {

        this.opt = $.extend({}, {
            $wrapper        : false,
            can_close       : true,
            group           : true,
            autohide        : false,
            animation_speed : null,
            in_animation    : 'show',
            out_animation   : 'hide'
        }, options);

        this.messages_list = {
            'warn'   : [],
            'info'   : [],
            'error'  : [],
            'success': []
        };

        this.autohide_timer = false;
    };

    Message.prototype = {

        constructor: Message,

        /**
         * Add message.
         * --
         * @param  {string} type
         * @param  {string} message
         * @param  {string} title
         * --
         * @return {void}
         */
        _add: function(type, message, title) {

            if (title) {
                message = message + '<h4>' + title + '</h4>';
            }

            this.messages_list[type].push(message);
        },

        /**
         * Add messages from an array.
         * --
         * @param  {array}  messages
         * --
         * @return {object} this
         */
        from_array: function(messages) {

            if (!messages) { return this; }

            if (messages.length) {
                for (var i = 0, l = messages.length; i < l; i++) {
                    var message = messages[i];
                    message.type = types_map[message.type];
                    this[message.type](message.message);
                }
            }

            return this;
        },

        /**
         * Will add another message of type warning.
         * Messages won't be displayed until you call show method.
         * --
         * @param  {string} message
         * @param  {string} title
         * --
         * @return {object} this
         */
        warn: function(message, title) {
            title = title || false;
            this._add('warn', message, title);
            return this;
        },

        /**
         * Will add another message of type information.
         * Messages won't be displayed until you call show method.
         * --
         * @param  {string} message
         * @param  {string} title
         * --
         * @return {object} this
         */
        info: function(message, title) {
            title = title || false;
            this._add('info', message, title);
            return this;
        },

        /**
         * Will add another message of type error.
         * Messages won't be displayed until you call show method.
         * --
         * @param  {string} message
         * @param  {string} title
         * --
         * @return {object} this
         */
        error: function(message, title) {
            title = title || false;
            this._add('error', message, title);
            return this;
        },

        /**
         * Will add another message of type success.
         * Messages won't be displayed until you call show method.
         * --
         * @param  {string} message
         * @param  {string} title
         * --
         * @return {object} this
         */
        success: function(message, title) {
            title = title || false;
            this._add('success', message, title);
            return this;
        },

        /**
         * Will empty all messages.
         * --
         * @return {void}
         */
        _reset_messages_list: function() {
            this.messages_list = {
                'warn'   : [],
                'info'   : [],
                'error'  : [],
                'success': []
            };
        },

        /**
         * This is an privately used method to show wrapper.
         * --
         * @return {void}
         */
        _show_wrapper: function() {
            this.opt.$wrapper[this.opt.in_animation](this.opt.animation_speed);
        },

        /**
         * This is an privately used method to hide wrapper.
         * --
         * @return {void}
         */
        _hide_wrapper: function() {
            this.opt.$wrapper[this.opt.out_animation](this.opt.animation_speed);
        },

        /**
         * This is an privately used method to push message to stack.
         * --
         * @param  {string} messages
         * @param  {string} type
         * --
         * @return {void}
         */
        _push_to_stack: function(messages, type) {
            var $message = $(template),
                $content = $message.find('.alert');

            // Can't close?
            if (!this.opt.can_close) {
                $message.find('button.close').remove();
            }

            type = type === 'warn' ? 'block' : type;

            $content.addClass('alert-'+type);
            $content.append(messages);

            this.opt.$wrapper.append($message.html());
        },

        /**
         * Show all messages.
         * --
         * @return {void}
         */
        show: function() {
            var _self  = this,
                merged = {};

            this.opt.$wrapper.html('');

            $.each(_self.messages_list, function(type, messages) {
                for (var i = 0, l = messages.length; i < l; i++) {
                    var message = messages[i];

                    if (_self.opt.group) {
                        if (!merged[type]) { merged[type] = ''; }
                        merged[type] += '<p>' + message + '</p>';
                    }
                    else {
                        _self._push_to_stack(message, type);
                    }
                }
            });

            if (this.opt.group) {
                if (merged.warn)    this._push_to_stack(merged.warn,    'warn');
                if (merged.info)    this._push_to_stack(merged.info,    'info');
                if (merged.error)   this._push_to_stack(merged.error,   'error');
                if (merged.success) this._push_to_stack(merged.success, 'success');
            }

            this._reset_messages_list();

            // Do we have autohide?
            if (this.opt.autohide) {
                // Do we have any previously set timer?
                if (this.autohide_timer) {
                    // Crush it now!!!
                    clearTimeout(this.autohide_timer);
                }

                // Set new timer
                this.autohide_timer = setTimeout(
                                        $.proxy(_self._hide_wrapper, _self),
                                        this.opt.autohide);
            }

            // Should we show messages in some nice way?
            this._show_wrapper();
        },

        /**
         * Hide all messages.
         * --
         * @return {void}
         */
        hide: function() {
            this._hide_wrapper();
        },

        /**
         * Will remove all messages.
         * --
         * @return {void}
         */
        clear: function() {

            this.opt.$wrapper.html('');
            this._reset_messages_list();

            if (this.autohide_timer) {
                // Crush it now!!!
                clearTimeout(this.autohide_timer);
            }

            this.autohide_timer = false;
        }
    };

    return Message;
});