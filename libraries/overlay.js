AJS.register('Library.Overlay', function() {

    // Number of initialized overlays, used to generate unique IDs
    var count    = 0,
        defaults = {
            loading   : false,
            $parent   : false,
            can_close : false,
            on_click  : false,
            id        : count,
            classes   : []
        };

    /**
     * Construct overlay object - use: o = new Lib.Overlay();
     * @param {object} options Following options are available:
     * - loading   : boolean           Loading indicator will be displayed.
     * - parent    : jQuery reference  Parent element to which overlay will be attached.
     *                                 Leave it empty for full screen overlay.
     * - can_close : boolean           If true, click on overlay will hide it.
     * - on_click  : function          Callback for when overlay is clicked.
     * - id        : string            Specific ID.
     * - classes   : array             Specific classes.
     */
    var Overlay = function(options) {

        // General options
        this.opt = $.extend({}, defaults, options);

        // Create overlay element from template
        this.$overlay        = $('<div class="overlay" />');

        // Do we have parent?
        if (!this.opt.$parent) {
            this.opt.classes.push('overlay-expanded');
        }

        // Set loading
        if (this.opt.loading) {
            this.opt.classes.push('loading');
        }

        // Set unique ID and classes to the element
        this.$overlay.attr('id', this.opt.id);

        if (this.opt.classes.length) {
            this.$overlay.addClass(this.opt.classes.join(' '));
        }

        // If current overlay visible
        this.is_visible = false;

        // Increase count of initialized objects by one
        count = count + 1;
    };

    Overlay.prototype = {

        constructor: Overlay,

        /**
         * Overlay click callback. Must be function. Set to false to unset.
         * @param  {Mixed}  callback Function or false.
         * @return {Object} this
         */
        click_callback: function(callback) {

            if (typeof callback === 'function') {
                this.$overlay.on('click.callback', callback);
            }
            else {
                this.$overlay.unbind('click.callback');
            }

            return this;
        },

        /**
         * Simply so, display the overlay, if not already visible.
         */
        show: function() {

            var _this = this;

            if (this.is_visible) { return false; }

            if (this.opt.$parent) {
                var parent = {
                    top:     this.opt.$parent.position().top,
                    left:    this.opt.$parent.position().left,
                    width:   this.opt.$parent.width(),
                    height:  this.opt.$parent.height()
                };

                this.$overlay.css({
                    display  : 'none',
                    top      : parent.top,
                    left     : parent.left,
                    width    : parent.width,
                    height   : parent.height,
                    position : 'absolute'
                });
            }

            // Add events
            if (this.opt.can_close) {
                this.$overlay.on('click', function() {
                    _this.hide();
                });
            }

            if (typeof this.opt.on_click === 'function') {
                this.$overlay.on('click', function(e) {
                    return this.opt.on_click();
                });
            }

            this.is_visible = true;

            this.$overlay.appendTo('body');
            this.$overlay.fadeIn('fast');
        },

        /**
         * Simply so, hide - destroy the overlay
         */
        hide: function() {
            var _this = this;

            this.is_visible = false;

            this.$overlay.fadeOut('fast', function() {
                _this.$overlay.remove();
            });
        }
    };

    return Overlay;

});