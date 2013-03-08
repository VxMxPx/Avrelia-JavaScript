AJS.register('Library.Validator', function() {

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
     * Valid rules are:
     * ================
     * required         -- boolean  Fields need to have value (can't be empty)
     * is_length        -- integer  Field's value needs exact length
     * min_length       -- integer  Minimum length of field's value
     * is_true          -- boolean  You can use expression, example:
     *                              stars.count > 12, if not true, validation
     *                              will failed.
     * equals           -- string   jQuery selector for field from which 2nd
     *                              value will be selected. This is useful to
     *                              check if two passwords match.
     * is_match         -- regex    Does value of our field match particular
     *                              regular expression.
     * is_numeric       -- mixed    You can use [0, 1] to check if number is in
     *                              particular range.
     * is_whole_number  -- mixed    Check if we have full number (not float),
     *                              You can use [0, 1] to check if number is in
     *                              particular range.
     * min_val          -- integer  Field's value needs to be at least...
     * max_val          -- integer  Field's value must not be more than...
     * is_email         -- string   Do we have "valid" email, (will check only
     *                              for (any)@(any).(any))
     */
    var Validator = function(options) {

        this.opt    = $.extend({}, {
            $form          : false,
            MessageLibrary : false
        }, options);

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

            var type        = field.attr('type'),
                field_valid = true;

            // Required rule ---------------------------------------------------
            if (rule.required === true) {
                if (type === 'checkbox') {
                    if (field.attr('checked') !== 'checked') {
                        this.opt.MessageLibrary.warn(rule.message);
                        field_valid = false;
                    }
                }
                else {
                    if (!field.val().length) {
                        this.opt.MessageLibrary.warn(rule.message);
                        field_valid = false;
                    }
                }
            }

            // Rule is_length --------------------------------------------------
            if (rule.is_length) {
                if (field.val().length !== rule.is_length) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule is_true ----------------------------------------------------
            if (typeof (rule.is_true) !== 'undefined') {
                // Ensure boolean value, and check if it's not true
                if (!!rule.is_true !== true) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Minimum length --------------------------------------------------
            if (rule.min_length) {
                if (field.val().length < rule.min_length) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule equals -----------------------------------------------------
            if (rule.equals) {
                var rule_equals_val =
                    typeof this.opt.$form.find(rule.equals)['val'] !== 'undefined' ?
                        this.opt.$form.find(rule.equals)['val']() :
                        false;

                if (rule_equals_val === false ||
                        field.val() !== rule_equals_val) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule match ------------------------------------------------------
            if (rule.is_match) {
                if (field.val().match(rule.is_match) === null) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule numeric ----------------------------------------------------
            if (rule.is_numeric) {

                var rule_is_numeric_int   = parseInt(field.val(), 10),
                    rule_is_numeric_valid = true;

                if (isNaN(field.val())) {
                    this.opt.MessageLibrary.warn(rule.message);
                    rule_is_numeric_valid = false;
                    field_valid = false;
                }

                if (typeof rule.is_numeric === 'object') {
                    if (typeof rule.is_numeric[0] === 'number') {
                        if (rule_is_whole_number_int < rule.is_numeric[0]) {
                            if (rule_is_numeric_valid) {
                                this.opt.MessageLibrary.warn(rule.message);
                                rule_is_numeric_valid = false;
                                field_valid = false;
                            }
                        }
                    }
                    if (typeof rule.is_numeric[1] === 'number') {
                        if (rule_is_whole_number_int > rule.is_numeric[1]) {
                            if (rule_is_numeric_valid) {
                                this.opt.MessageLibrary.warn(rule.message);
                                rule_is_numeric_valid = false;
                                field_valid = false;
                            }
                        }
                    }
                }
            }

            // Rule is whole number --------------------------------------------
            if (rule.is_whole_number) {

                var rule_is_whole_number_int   = parseInt(field.val(), 10),
                    rule_is_whole_number_valid = true;

                if (field.val() !== ("" + rule_is_whole_number_int)) {
                    this.opt.MessageLibrary.warn(rule.message);
                    rule_is_whole_number_valid = false;
                    field_valid = false;
                }

                if (typeof rule.is_whole_number === 'object') {
                    if (typeof rule.is_whole_number[0] === 'number') {
                        if (rule_is_whole_number_int < rule.is_whole_number[0]) {
                            if (rule_is_whole_number_valid) {
                                this.opt.MessageLibrary.warn(rule.message);
                                rule_is_whole_number_valid = false;
                                field_valid = false;
                            }
                        }
                    }
                    if (typeof rule.is_whole_number[1] === 'number') {
                        if (rule_is_whole_number_int > rule.is_whole_number[1]) {
                            if (rule_is_whole_number_valid) {
                                this.opt.MessageLibrary.warn(rule.message);
                                rule_is_whole_number_valid = false;
                                field_valid = false;
                            }
                        }
                    }
                }
            }

            // Rule min_val ----------------------------------------------------
            if (rule.min_val) {

                if (rule.min_val > parseInt(field.val(), 10)) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule max_val ----------------------------------------------------
            if (rule.max_val) {

                if (rule.max_val < parseInt(field.val(), 10)) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Rule is_email ---------------------------------------------------
            if (rule.is_email) {

                if (field.val().match(/^(.+@.+\..+)$/) === null) {
                    this.opt.MessageLibrary.warn(rule.message);
                    field_valid = false;
                }
            }

            // Final checking --------------------------------------------------
            if (!field_valid) {
                this.valid = false;
                field.addClass('ajs_validation_invalid');
            }
            else {
                field.removeClass('ajs_validation_invalid');
            }
        },

        is_valid: function() {
            return this.valid;
        }
    };

    return Validator;

});