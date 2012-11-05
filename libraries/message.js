AJS.register('Library.Message', function() {

    /**
     * Message class
     * --
     * @param object  $wrapper   jQuery wrapper, will contain all messages.
     * @param boolean putTogeter Put messages of the same type together.
     */
    var Message = function($wrapper, putTogeter) {
        this.putTogeter    = typeof putTogeter === 'undefined' ? true : !!putTogeter;
        this.$wrapper      = $wrapper;
        this.messages_list = null;

        this._reset_messages_list();
    };

    Message.prototype = {
        
        constructor: Message,

        // Map types from php to match js
        types_map  : { war: 'warn', ok: 'success', err: 'error', inf: 'info' },

        // Message template
        template: ['<div><div class="alert">',
                       '<button type="button" class="close" data-dismiss="alert">×</button>',
                   '</div></div>'].join(''),

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
                    message.type = this.types_map[message.type];
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

        _push_to_stack: function(messages, type) {
            var $message = $(this.template),
                $content = $message.find('.alert');
            
            type = type === 'warn' ? 'block' : type;

            $content.addClass('alert-'+type);
            $content.append(messages);

            this.$wrapper.append($message.html());
        },

        show: function() {
            var _self  = this,
                merged = {};

            this.$wrapper.html('');

            $.each(_self.messages_list, function(type, messages) {
                for (var i = 0, l = messages.length; i < l; i++) {
                    var message = messages[i];

                    if (_self.putTogeter) {
                        if (!merged[type]) { merged[type] = ''; }
                        merged[type] += '<p>' + message + '</p>';
                    }
                    else {
                        _self._push_to_stack(message, type);
                    }
                }
            });

            if (_self.putTogeter) {
                if (merged.warn)    _self._push_to_stack(merged.warn,    'warn');
                if (merged.info)    _self._push_to_stack(merged.info,    'info');
                if (merged.error)   _self._push_to_stack(merged.error,   'error');
                if (merged.success) _self._push_to_stack(merged.success, 'success');
            }

            this._reset_messages_list();
        }
    };

    return Message;
});