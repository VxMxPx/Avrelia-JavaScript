AJS.register('Library.Form', function() {

    var Lib = AJS.Library;

    /**
     * Form library
     * --
     * @param {object} options Following options are available:
     * - form       : object jQuery reference
     * - [ignore]   : array  An array of fields which should be ignored.
     * - [defaults] : array  Default value for when field has no value.
     */
    var Form = function(options) {

        this.$form = $form;

        // List of fields we'll ignore
        this.ignore = options.ignore || [];

        // All form's fields
        this.fields = [];

        // Defaults
        this.defaults = [];

        // Appended fields.
        this.appended = [];
    };

    Form.prototype = {

        constructor: Form,

        /**
         * Append new (jQuery) form field to the rest. This is useful if we wanna
         * use external form's fields.
         * --
         * @param  {object} $field jQuery selected form field.
         * @return {object} this
         */
        append_field: function($field) {
            this.appended.push($field);
            this.fields.push($field);
            return this;
        },

        /**
         * Useful if we add / remove some fields in since last form request.
         * In first submit or after ignore_fields modification fields will be
         * auto refresh.
         * @return {object} this
         */
        refresh_fields: function() {

            var fields = this.$form.find('input, textarea, select'),
            ignore = this.ignore;

            if (ignore.length > 0) {
                fields = $.map(fields, function(item, index) {
                    var current = $(item);

                    if ($.inArray(current.attr('name'),     ignore) !== -1 ||
                            $.inArray('#' + current.attr('id'), ignore) !== -1) {
                        return null;
                    }
                    else {
                        return current;
                    }
                });
            }

            // Do we have any appended fields?
            if (this.appended.length > 0) {
                for (var i = this.appended.length - 1; i >= 0; i--) {
                    fields.push(this.appended[i]);
                };
            }

            this.fields = fields;

            return this;
        },

        /**
         * Return list of fields
         * @return {array} List of all fields in following format:
         *                 [
         *                     {name:'name', value:'value', field:$jquery_ref},
         *                     ...
         *                 ]
         */
        get_fields_raw: function() {

            if (!this.fields.length) {
                this.refresh_fields();
            }

            return $.map(this.fields, function(item, index) {
                var $item = $(item);
                return {name: $item.attr('name'), value: $item.val(), field: $item};
            });
        },

        /**
         * Get fields in format which can be posted, example:
         * {key: value, another: value: third: [array, values, in]}
         * In case of check-boxes, etc.. will return only checked items.
         * @return {object}
         */
        get_fields_post: function() {
            var result        = {},
                fields_length = this.fields.length;

            if (!fields_length) {
                this.refresh_fields();
                fields_length = this.field.length;
            }

            if (fields_length > 0) {
                for (var i = 0; i < fields_length; i++) {
                    var $field = $(this.fields[i]),
                        type   = $field.attr('type'),
                        key    = $field.attr('name'),
                        value  = $field.val();

                    // Check field type
                    if (type === 'checkbox' || type === 'radio') {
                        if (!$field.is(':checked')) {
                            continue;
                        }
                    }

                    if (typeof result[key] === 'undefined') {
                        result[key] = value;
                    }
                    else {
                        if (typeof result[key] === 'string') {
                            result[key] = [result[key], value];
                        }
                        else {
                            result[key].push(value);
                        }
                    }
                }
            }

            if (this.defaults.length > 0) {
                $.map(this.defaults, function(item, index) {
                    if (typeof result[index] === 'undefined') {
                        result[index] = item;
                    }
                });
            }

            return result;
        }
    };

    return Form;

});