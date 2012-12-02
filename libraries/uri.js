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

    // GET SEGMENTS, trim start and ending slash
    segments = window.location.pathname.replace(/^\/|\/$/g, '');
    segments = segments.split('/');

    return _public;

});