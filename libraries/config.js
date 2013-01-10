AJS.register('Library.Config', function() {
    var _public = {},
        items   = window.AJS_Config || {};

    /**
     * Get config by key, returns default if key not found.
     * --
     * @param  {string} key
     * @param  {mixed}  default_value
     * --
     * @return {mixed}
     */
    _public.get = function(key, default_value) {
        return typeof items[key] !== 'undefined' ?
                items[key] :
                default_value;
    };

    return _public;
});