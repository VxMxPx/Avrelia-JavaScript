AJS.register('Library.Language', function() {

    var _public    = {},
        Lib        = AJS.Library,
        Dictionary = window.AJS_Dictionary || {};

    /**
     * Translate particular string, shortcut exists for this methos: AJS.l
     * Languages are provided thought window.AJS_Dictionary, in following format:
     * {
     *     'KEY' : 'Value'
     * }
     *
     * Further informations: https://github.com/VxMxPx/Avrelia-Framework/wiki/Languages
     * --
     * @param  {string} key
     * @param  {array}  params optional
     * --
     * @return {string}
     */
    _public.translate = function(key, params) {

        if (typeof Dictionary[key] !== 'undefined') {
            var result = Dictionary[key];

            // Check for any variables
            if (typeof params !== 'undefined') {
                if (typeof params !== 'object') { params = [params]; }

                for (var i = 0, l = params.length; i < l; i++) {
                    var lang_key = i + 1;
                    result = result.replace(
                                new RegExp('\\{' + lang_key + ' ?(.*?)\\}'),
                                params[i].replace('{?}', '$1'));
                }
            }

            return result;
        }
        else {
            Lib.Log.warn("Language key not found: " + key);
            return key;
        }
    };

    return _public;
});