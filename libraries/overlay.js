AJS.register('Library.Overlay', function() {

    // Number of initialized overlays, used to generate unique IDs
    var Lib      = AJS.Library,
        count    = 0;

    /**
     * Construct overlay object - use: o = new Lib.Overlay();
     * @param {object} options Following options are available:
     * - loading     : boolean           Loading indicator will be displayed.
     * - $parent     : jQuery reference  Parent element to which overlay will be attached.
     *                                   Leave it empty for full screen overlay.
     * - padding     : integer           Overlay padding when displayed. Only if
     *                                   you provided parent element.
     *                                   NOTE: Padding is applied only when using
     *                                   parent for positioning.
     * - can_close   : boolean           If true, click on overlay will hide it.
     * - on_click    : function          Callback for when overlay is clicked.
     * - id          : string            Specific ID.
     * - classes     : array             Specific classes.
     */
    function Overlay(options) {

        // General options
        this.opt = $.extend({}, {
            loading     : false,
            $parent     : false,
            text        : null,
            padding     : 0,
            auto_resize : false,
            can_close   : false,
            on_click    : false,
            id          : null,
            classes     : []
        } , options);

        // Create overlay element from template
        this.$overlay        = $('<div class=overlay />');

        // Do we have parent?
        if (!this.opt.$parent) {
            this.opt.classes.push('overlay-expanded');
        }

        // Do we have text?
        if (this.opt.text) {
            this.$overlay.append('<div class=text>' + this.opt.text + '</div>');
        }

        // Set loading
        if (this.opt.loading) {
            this.opt.classes.push('loading');
        }

        // If we have id which is completely the same as count, then we'll
        // prepend something, so that  it won't be just a number.
        if (!this.opt.id) {
            this.opt.id = 'ajs_overlay_' + count;
        }

        // Set unique ID and classes to the element
        this.$overlay.attr('id', this.opt.id);

        if (this.opt.classes.length) {
            this.$overlay.addClass(this.opt.classes.join(' '));
        }

        // If current overlay visible
        this.is_visible  = false;
        this.is_appended = false;
        this.is_freezed  = false;

        // Increase count of initialized objects by one
        count = count + 1;
    }

    Overlay.prototype = {

        constructor : Overlay,

        /**
         * Overlay click callback. Must be function. Set to false to unset.
         * @param  {Mixed}  callback Function or false.
         * --
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
         * Won't allow to hide overlay until unfreezed.
         * --
         * @return {object} this
         */
        freeze : function() {

            this.is_freezed = true;
            return this;
        },

        /**
         * Allow overly to be hidden again.
         * --
         * @return {object} this
         */
        unfreeze : function() {

            this.is_freezed = false;
            return this;
        },

        /**
         * Will update overlay's dimension, taken from parent
         * --
         * @param {boolean} animated Should dimension change be animated?
         * --
         * @return {void}
         */
        update : function(animated) {
            // If geometry wasn't set, and we do have parent,
            // we'll use parent to set geometry.
            if (this.opt.$parent) {
                geometry = {
                    top:     this.opt.$parent.offset().top - this.opt.padding,
                    left:    this.opt.$parent.offset().left - this.opt.padding,
                    width:   this.opt.$parent.outerWidth() + (this.opt.padding * 2),
                    height:  this.opt.$parent.outerHeight() + (this.opt.padding * 2)
                };
            }

            // If we have geometry, either set by parent or pass in, we'll use it
            if (typeof geometry === 'object') {
                this.$overlay[animated ? 'animate' : 'css']({
                    top      : geometry.top,
                    left     : geometry.left,
                    width    : geometry.width,
                    height   : geometry.height
                });
            }
        },

        /**
         * Simply so, display the overlay, if not already visible.
         * --
         * @param  {object} geometry You can specify where exactly to show overlay,
         *                          if not, the parent's position will be used,
         *                          or nothing will be set (u can set it in css).
         *                          NOTE: Padding won't be applied to geometry.
         * - top    : integer
         * - left   : integer
         * - width  : integer
         * - height : integer
         * --
         * @return {void}
         */
        show: function(geometry) {

            var _this = this;

            // Check if parent is visible at all... If it isn't then we won't
            // show overlay either
            if (this.opt.$parent && !this.opt.$parent.is(':visible')) {
                Lib.Log.info('Lib.Overlay; Parent is not visible, won\'t display overlay.');
                return false;
            }

            // If is already visible we won't display it again
            if (this.is_visible) {
                Lib.Log.info('Lib.Overlay; I\'m already visible! Quting.');
                return false;
            }

            // If geometry wasn't set, and we do have parent,
            // we'll use parent to set geometry.
            if (!geometry && this.opt.$parent) {
                geometry = {
                    top:     this.opt.$parent.offset().top - this.opt.padding,
                    left:    this.opt.$parent.offset().left - this.opt.padding,
                    width:   this.opt.$parent.outerWidth() + (this.opt.padding * 2),
                    height:  this.opt.$parent.outerHeight() + (this.opt.padding * 2)
                };
            }

            // If we have geometry, either set by parent or pass in, we'll use it
            if (typeof geometry === 'object') {
                this.$overlay.css({
                    display  : 'none',
                    top      : geometry.top,
                    left     : geometry.left,
                    width    : geometry.width,
                    height   : geometry.height,
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

            if (!this.is_appended) {
                this.$overlay.appendTo('body');
                this.is_appended = true;
            }

            this.$overlay.stop(true, true).fadeIn('fast');
        },

        /**
         * Simply so, hide the overlay.
         * --
         * @return {void}
         */
        hide: function() {

            if (this.is_freezed) {

                Lib.Log.info('Lib.Overlay; Overley is freezed, won\'t hide it until unfreezed.');
                return;
            }

            this.is_visible = false;
            this.$overlay.stop(true, true).fadeOut('fast');
        }
    };

    return Overlay;

});