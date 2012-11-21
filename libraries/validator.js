AJS.register('Library.Validator', function() {

    var defaults = {
        $form          : false,
        MessageLibrary : false
    };

    /**
     * Validator allow us to easily check values of various form fields.
     * --
     * @param {object} options
     *
     * Available options are:
     * ======================
     * $form            -- array  jQuery Reference to the form we wanna check.
     * [MessageLibrary] -- object If you wanna to display message when the
     *                            field validation fails.
     */
    var Validator = function(options) {

        this.opt    = $.extend({}, defaults, options);
        this.valid  = true;
        this.fields = [];
    };

    Validator.prototype = {

        constructor: Validator,

        field: function(field, rules) {

            this.fields.push({
                field: field,
                rules: rules
            });

            return this;
        },

        check: function() {

            this.valid = true;

            for (var i = 0, l = this.fields.length; i < l; i++) {
                var current = this.fields[i],
                    $field = this.opt.$form.find(current.field);

                for (var i2 = 0, l2 = current.rules.length; i2 < l2; i2++) {
                    this._validate_field($field, current.rules[i2]);
                }
            }

            this.fields = [];
        },

        _validate_field: function(field, rule) {
            var type = field.attr('type');

            // Required rule ---------------------------------------------------
            if (rule.required === true) {
                if (type === 'checkbox') {
                    if (field.attr('checked') !== 'checked') {
                        this.opt.MessageLibrary.warn(rule.message);
                        this.valid = false;
                    }
                }
                else {
                    if (!field.val().length) {
                        this.opt.MessageLibrary.warn(rule.message);
                        this.valid = false;
                    }
                }
            }

            // Rule length -----------------------------------------------------
            if (rule.length) {
                if (field.val().length !== rule.length) {
                    this.opt.MessageLibrary.warn(rule.message);
                    this.valid = false;
                }
            }

            // Minimum length --------------------------------------------------
            if (rule.min_length) {
                if (field.val().length < rule.min_length) {
                    this.opt.MessageLibrary.warn(rule.message);
                    this.valid = false;
                }
            }

            // Rule equals -----------------------------------------------------
            if (rule.equals) {
                var rule_equals_val =
                    typeof this.opt.$form.find(rule.equals)['val'] !== 'undefined'
                        ? this.opt.$form.find(rule.equals)['val']()
                        : false;

                if (rule_equals_val === false ||
                        field.val() !== rule_equals_val) {
                    this.opt.MessageLibrary.warn(rule.message);
                    this.valid = false;
                }
            }

            // Rule match ------------------------------------------------------
            if (rule.is_match) {
                if (field.val().match(rule.is_match) === null) {
                    this.opt.MessageLibrary.warn(rule.message);
                    this.valid = false;
                }
            }

            // Rule is_email ---------------------------------------------------
            if (rule.is_email) {
                if (field.val().match(/^(.+@.+\..+)$/) === null) {
                    this.opt.MessageLibrary.warn(rule.message);
                    this.valid = false;
                }
            }
        },

        is_valid: function() {
            return this.valid;
        }
    };

    return Validator;

});