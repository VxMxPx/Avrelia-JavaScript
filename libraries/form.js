AJS.register('Library.Form', function() {

    var Lib = AJS.Library;

    /**
     * Form class
     * --
     * @param {object} $form  jQuery reference to the form.
     * @param {string} url    The URL where the form supposed to be submitted.
     *                        You can provide just uri/segments and the rest will
     *                        be auto added. base_url + url || http://url
     */
    var Form = function($form, url) {

        this.$form = $form;

        // Check if we have :// in url, - if not, prepend url from config.
        this.url = (function() {
            if (url.match('://')) {
                return url;
            }
            else {
                return Lib.Config.get('base_url') + url;
            }
        }());

        // List of fields we'll ignore
        this.ignore = [];

        // All form's fields
        this.fields = [];

        // Message model
        this.message = null;

        // Defaults
        this.defaults = [];

        // Appended fields.
        this.appended = [];
    };

    Form.prototype = {

        constructor: Form,

        /**
         * Specify list of fields which will be ignored
         * @param  {array}  ignore An array of fields which should be ignored.
         *                         This should contain either field name, of #id
         * @return {object} this
         */
        ignore_fields: function(ignore) {

            // Reset current fields
            this.fields = [];

            // Set ignore
            this.ignore = ignore;

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

            this.appended.push($field);
            this.fields.push($field);
            return this;
        },

        /**
         * Register message model, in case we're expecting properly formatted json
         * to be returned from submit method.
         * @param  {object} message_model
         * @return {object} this
         */
        register_message: function(message_model) {

            this.message = message_model;

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
        },

        /**
         * Set defaults for when particular field has no value.
         * @param  {object} list {field_name: default, field_name_2: default}
         * @return {object} this
         */
        set_defaults: function(defaults) {

            this.defaults = defaults;
            return this;
        },

        /**
         * Register submit event, - when form will be submitted, default action 
         * will be prevented and instead this class submit will run.
         * --
         * @return {object} this
         */
        register_submit: function() {

            var _this = this;

            this.$form.submit(function(e) {
                e.preventDefault();
                _this.submit();
            });

            return this;
        },

        /**
         * Post the form to the selected URL
         * @return {object} jQuery ajax request object
         */
        submit: function() {

            if (this.fields.length === 0) {
                this.refresh_fields();
            }

            return $.ajax({
                type: 'POST',
                url:  this.url,
                data: this.get_fields_post()
            });
        }
    };

    return Form;

});