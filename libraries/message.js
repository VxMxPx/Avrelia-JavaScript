AJS.register('Library.Message', function() {

    var defaults = {
            $wrapper        : false,
            can_close       : true,
            group           : true,
            autohide        : false,
            animation_speed : false,
            in_animation    : false,
            out_animation   : false
        },

        // Single message item template
        template = ['<div><div class="alert">',
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
     *                             Default = false
     * [out_animation]   : string  Which animation to use on hide.
     *                             Default = false
     */
    var Message = function(options) {

        this.opt = $.extend({}, defaults, options);

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

        _add: function(type, message, title) {
            if (title) {
                message = message + '<h4>' + title + '</h4>';
            }

            this.messages_list[type].push(message);
        },

        // Take messages from an array
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

        warn: function(message, title) {
            title = title || false;
            this._add('warn', message, title);
            return this;
        },

        info: function(message, title) {
            title = title || false;
            this._add('info', message, title);
            return this;
        },

        error: function(message, title) {
            title = title || false;
            this._add('error', message, title);
            return this;
        },

        success: function(message, title) {
            title = title || false;
            this._add('success', message, title);
            return this;
        },

        _reset_messages_list: function() {
            this.messages_list = {
                'warn'   : [],
                'info'   : [],
                'error'  : [],
                'success': []
            };
        },

        _show_wrapper: function() {
            this.opt.$wrapper[this.opt.in_animation](this.opt.animation_speed);
        },

        _hide_wrapper: function() {
            this.opt.$wrapper[this.opt.out_animation](this.opt.animation_speed);
        },

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

            if (_self.opt.group) {
                if (merged.warn)    _self._push_to_stack(merged.warn,    'warn');
                if (merged.info)    _self._push_to_stack(merged.info,    'info');
                if (merged.error)   _self._push_to_stack(merged.error,   'error');
                if (merged.success) _self._push_to_stack(merged.success, 'success');
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
                                        $.proxy(this._hide_wrapper, this), 
                                        this.opt.autohide);
            }

            // Should we show messages in some nice way?
            if (this.opt.in_animation) {
                this._show_wrapper();
            }
        }
    };

    return Message;
});