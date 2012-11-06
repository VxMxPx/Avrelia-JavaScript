AJS.register('Library.Config', function() {
    var _public = {},
        items   = window.AJS_MainConfig || {};

    _public.get = function(key, default_value) {
        return typeof items[key] !== 'undefined' ?
                items[key] :
                default_value;
    };

    return _public;
});