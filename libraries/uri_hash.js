AJS.register('Library.UriHash', function() {

    var _public  = {},
        // List of segments, for URI: 'events/list/sort=desc/'
        // it would be: [ 'events', 'list', {sort: 'desc'} ]
        segments = [];

    /**
     * Will extract segments from URI
     * --
     * @return {void}
     */
    function _extract_segments()
    {
        // Resolve URI
        var temp_segments = window.location.hash.split('/');

        if (temp_segments.length) {
            // We wanna keep segments only if we have #!
            if (temp_segments[0] !== '#!' && temp_segments[0].substr(0,2) !== '#!') {
                segments = [];
            }
            else {

                if (temp_segments[0].substr(0,2) === '#!') {
                    temp_segments[0] = temp_segments[0].substr(2);
                }
                else {
                    temp_segments[0] = '';
                }

                for (var i = 0; i < temp_segments.length; i++) {

                    if (!temp_segments[i].length) { continue; }

                    if (temp_segments[i].match(/\=/)) {
                        var sub_segments = temp_segments[i].split('=', 2);
                        temp_segments[i] = {
                            key: sub_segments[0],
                            val: sub_segments[1]
                        };
                    }

                    segments.push(temp_segments[i]);
                }
            }
        }
    }

    /**
     * Return an array of all currently set segments in the hash.
     * --
     * @return {void}
     */
    _public.get_segments = function() {
        _extract_segments();
        return segments;
    };

    /**
     * Return full current URI.
     * --
     * @return {void}
     */
    _public.get_full = function() {
        var full_hash = '#!';
        for (var i = 0, l = segments.length; i < l; i++) {
            if (segments[i] === false) {
                continue;
            }

            if (typeof segments[i].key !== 'undefined') {
                full_hash = full_hash + '/' + segments[i].key + '=' + segments[i].val;
            }
            else {
                full_hash = full_hash + '/' + segments[i];
            }
        }

        return full_hash !== '#!' ? full_hash : '';
    };

    /**
     * Get segment or get-segment of uri, this apply only to #!/ URLs.
     * Example:
     *     http://domain.tld/news#!/list/page=2
     * --
     * @param  {mixed} segment Either integer, segment index, or string, get-key.
     *                         Above example: 0:'list', 1:'page=2', 'page':'2'
     * --
     * @return {string}
     */
    _public.get = function(segment) {
        if (typeof segment === 'number') {
            if (typeof segments[segment] !== undefined) {

                return segments[segment];
            }
        }
        else {
            for (var i = segments.length - 1; i >= 0; i--) {
                if (typeof segments[i].key !== 'undefined') {
                    if (segments[i].key === segment) {

                        return segments[i].val;
                    }
                }
            }
        }

        return false;
    };

    /**
     * Will check if particular segment is set.
     * --
     * @param  {mixed}  segment Either integer, segment index, or string, get-key.
     * --
     * @return {boolean}
     */
    _public.has = function(segment) {
        // Grab result and cast it as boolean
        return !!_public.get(segment);
    };

    /**
     * Change URI, either by appending or replacing segments.
     * You need to call apply after this action.
     * --
     * @param {mixed}  segment Either integer: segment index, or string: get-key,
     *                         or boolean: false to append segment to the end of URI.
     * @param {string} value
     * --
     * @return {object} this
     */
    _public.set = function(segment, value) {
        if (segment === false) {
            segments.push(value);
        }
        else if (typeof segment === 'number') {
            if (typeof segments[segment] === 'undefined') {
                segments.push(value);
            }
            else {
                segments[segment] = value;
            }
        }
        else {
            if (_public.get(segment) !== false) {
                for (var i = segments.length - 1; i >= 0; i--) {
                    if (typeof segments[i].key !== 'undefined') {
                        if (segments[i].key === segment) {
                            segments[i].val = value;
                        }
                    }
                }
            }
            else {
                segments.push({
                    key: segment,
                    val: value
                });
            }
        }

        return _public;
    };

    /**
     * Apply changes after setting or removing URI segments.
     * --
     * @return {object} this
     */
    _public.apply = function() {
        window.location.hash = _public.get_full();

        return _public;
    };

    /**
     * Remove segment.
     * --
     * @param  {mixed} segment Either integer, segment index, or string, get-key.
     * --
     * @return {object} this
     */
    _public.remove = function(segment) {
        var i = 0,
            new_segments = [];

        if (typeof segment === 'number') {
            if (typeof segments[segment] !== 'undefined') {
                segments[segment] = false;
            }
        }
        else {
            for (i = segments.length - 1; i >= 0; i--) {
                if (typeof segments[i].key !== 'undefined') {
                    if (segments[i].key === segment) {
                        segments[i] = false;
                    }
                }
            }
        }

        for (i = 0; i < segments.length; i++) {
            if (segments[i] !== false) {
                new_segments.push(segments[i]);
            }
        }

        segments = new_segments;

        return _public;
    };

    // Will extract segments from the URI
    _extract_segments();

    return _public;

});