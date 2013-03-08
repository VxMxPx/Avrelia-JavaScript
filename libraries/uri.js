AJS.register('Library.Uri', function() {

    var _public  = {},
        Lib      = AJS.Library,
        segments = [];

    /**
     * Will extract segments from the URI and put them to the segments array
     * @return {[type]} [description]
     */
    function _extract_segments() {
        // GET SEGMENTS, trim start and ending slash
        segments = window.location.pathname.replace(/^\/|\/$/g, '');
        segments = segments.split('/');
    }

    /**
     * Get particular URI's segment
     * --
     * @param  {integer} index
     * --
     * @return {string}
     */
    _public.segment = function(index) {
        _extract_segments();
        if (typeof segments[index] !== 'undefined') {
            return segments[index];
        }
    };

    /**
     * Get current full uri (including #!/)
     * --
     * @return {string}
     */
    _public.current = function() {
        return window.location.pathname + (window.location.hash || '');
    };

    return _public;

});