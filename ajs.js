;(function($) {

    // Define ticket friend name-space
    var AJS = (function() {

            // Public methods
        var _public = {},
            
            // This will cause messages being dump to console
            // in production mode this is not desirable behavior.
            is_debug = true;

        // Collection of libraries, models and controllers
        _public.Model      = {};
        _public.Library    = {};
        _public.Controller = {};

        /**
         * Either log the error message or throw a new error, if log isn't
         * available yet.
         * --
         * @param  {string} message
         * --
         * @return {void}
         */
        function trigger_error(message)
        {
            // We'll use our build in log object, or if not set yet, 
            // we'll throw new error.
            if (typeof Library['log'] !== 'undefined') {
                Library.Log.error(message);
                return false;
            }
            else {
                throw new Error(message);
            }
        }

        /**
         * This will register a controller or library in namespace
         * if not there already. If library already exists, this will
         * trigger an error and stop execution. Libraries can't be overwritten.
         * --
         * @param  {string}   name      The name of class we need to register. Must start with
         *                              Controller || Library
         *                              Example: Controller.Events.Index
         * @param  {function} exe_class Class we wanna register
         * @param  {boolean}  autorun   Should the class be auto-initialized, true
         *                              is the default value.
         * --
         * @return {void}
         */
        _public.register = function(name, exe_class, autorun) {
            var segments = name.split('.'),
                position = 1,
                current  = _public;

            // Set autorun
            if (typeof autorun === 'undefined') {
                autorun = true;
            }

            // We need to have more than one segment!
            if (segments.length < 2) {
                
                trigger_error('You must have at least two segments in your name. ' +
                              'You have: ' + segments.length);
                
                return false;
            }

            // Check if we're having Controller || Library
            if (segments[0] !== 'Controller' && segments[0] !== 'Library') {

                trigger_error('You must register either `Controller`, `Library` ' + 
                              'or `Model` you have: `' + segments[0] + '`.');
                
                return false;
            }

            // Set current element to be segment zero, that's either controller,
            // library or model
            current = current[segments[0]];

            // This makes sense only when we have more than two segments.
            if (segments.length > 2) {
                // Last segment is reserved for the actuall callback
                for (var length = segments.length - 1; position < length; position++) {
                    if (typeof current[segments[position]] === 'undefined') {
                        // If it's not defined yet, we'll define it.
                        current[segments[position]] = {};
                    }

                    // Move cursor to the next position, one level deeper :)
                    current = current[segments[position]];
                }
            }

            // Finally, set the last segment to be callback
            if (typeof current[segments[position]] !== 'undefined') {
                // Wooops, already defined? Trigger an error
                trigger_error('Seems namespace is already registered: ' + name);
                return false;
            }
            else {
                current[segments[position]] = autorun ? exe_class() : exe_class;
            }
        };

        return _public;
    }());

    // Expose it to public
    window.AJS = AJS;
    
}(window.jQuery));