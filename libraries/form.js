AJS.register('Library.Form', function() {

    var Lib = AJS.Library;

    /**
     * Form library
     * --
     * @param {object} options Following options are available:
     * - form       : object jQuery reference
     * - [ignore]   : array  An array of fields which should be ignored.
     * - [defaults] : array  Default value for when field has no value.
     * - [append]   : array  List of fields which we want to append to the rest
     *                       of the form fields.
     */
    var Form = function(options) {

        this.opt = $.extend({}, {
            $form    : false,
            ignore   : [],
            fields   : [],
            defaults : [],
            append   : []
        }, options);
    };

    Form.prototype = {

        constructor: Form,

        /**
         * Will reset the form - set all fields to be default.
         * NOTE: This will set fields to their default values as set in HTML,
         * if you want to empty the form, use do_empty instead.
         * --
         * @return {object} this
         */
        do_reset : function() {

            // Probably not, worth trying though.
            if (typeof this.opt.$form['reset'] === 'function') {
                this.opt.$form.reset();
                return this;
            }

            // Probably yes!
            if (typeof this.opt.$form[0]['reset'] === 'function') {
                this.opt.$form[0].reset();
                return this;
            }

            // None of them, throw some error
            Lib.Log.war('Seems form has no method reset(), can\'t proceed.');
            return this;
        },

        /**
         * Will empty the form - set all fields to be empty, un-checked, etc...
         * NOTE: This will NOT restore the default values, but actually set all
         * values to be empty. If you want to reset form, use do_reset instead.
         * --
         * @return {object} this
         */
        do_empty : function() {

            var fields = this.get_fields_raw();

            if (fields.length) {

                for (var i = fields.length - 1; i >= 0; i--) {
                    var $field = fields[i].field;

                    // We must check the type and reset appropriately
                    if ($field.attr('checked')) {
                        $field.removeAttr('checked');
                    }
                    else if ($field.attr('selected')) {
                        $field.removeAttr('selected');
                    }
                    else if (typeof $field['val'] !== 'undefined') {
                        $field.val('');
                    }
                }
            }

            return this;
        },

        /**
         * Append new (jQuery) form field to the rest. This is useful if we wanna
         * use external form's fields.
         * --
         * @param  {object} $field jQuery selected form field.
         * @return {object} this
         */
        append_field: function($field) {
            this.opt.append.push($field);
            this.opt.fields.push($field);
            return this;
        },

        /**
         * Useful if we add / remove some fields in since last form request.
         * In first submit or after ignore_fields modification fields will be
         * auto refresh.
         * @return {object} this
         */
        refresh_fields: function() {

            var fields = this.opt.$form.find('input:not([type=reset], [type=submit]), textarea, select'),
                ignore = this.opt.ignore;

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
            if (this.opt.append.length > 0) {
                for (var i = this.opt.append.length - 1; i >= 0; i--) {
                    fields.push(this.opt.append[i]);
                }
            }

            this.opt.fields = fields;

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

            if (!this.opt.fields.length) {
                this.refresh_fields();
            }

            return $.map(this.opt.fields, function(item, index) {
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
                fields_length = this.opt.fields.length;

            if (!fields_length) {
                this.refresh_fields();
                fields_length = this.opt.fields.length;
            }

            if (fields_length > 0) {
                for (var i = 0; i < fields_length; i++) {
                    var $field = $(this.opt.fields[i]),
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

            if (this.opt.defaults.length > 0) {
                $.map(this.opt.defaults, function(item, index) {
                    if (typeof result[index] === 'undefined') {
                        result[index] = item;
                    }
                });
            }

            return result;
        },

        /**
         * Get fields in serialized format, example:
         * name=Some+name&description=Some+Description
         *
         * @return {string}
         */
        get_serialized: function() {
            var fields_length = this.opt.fields.length;

            if (!fields_length) {
                this.refresh_fields();
                fields_length = this.opt.fields.length;
            }

            return fields_length > 0 ? this.opt.fields.serialize() : '';
        }

    };

    return Form;

});