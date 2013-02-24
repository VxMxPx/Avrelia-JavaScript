AJS.register('Library.Uri', function() {

    var _public  = {},
        Lib      = AJS.Library,
        segments = [];

    /**
     * Get particular URI's segment
     * --
     * @param  {integer} index
     * --
     * @return {string}
     */
    _public.segment = function(index) {

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

    // GET SEGMENTS, trim start and ending slash
    segments = window.location.pathname.replace(/^\/|\/$/g, '');
    segments = segments.split('/');

    return _public;

});