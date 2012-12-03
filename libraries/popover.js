AJS.register('Library.Popover', function() {
    // Popover basic template
    var template = ['<div class="popover fade in">',
                    '<div class=arrow></div>',
                    '<div class=popover-inner>',
                        '<button type="button" class="close">&times;</button>',
                        '<h3 class=popover-title />',
                        '<div class=popover-content></div>',
                    '</div>','</div>'].join('');

    var Log = AJS.Library.Log;
    /**
     * Construct an Popover element.
     * @param {object} options Following options are available:
     * - can_close  : boolean          Can poover be closed (display close button)
     * - placement  : string           Preferred placement of element,
     *                                 can be: [top]|bottom|left|right
     * - title      : string|function  Popover's title. When the function is
     *                                 passed in, it will be executed when popover
     *                                 is displayed.
     * - body       : string|function  Popover's body. When the function is
     *                                 passed in, it will be executed when popover
     *                                 is displayed.
     * - OverlayLibrary : object       If you're using block | unblock methods,
     *                                 overlay will be used to prevent interactions.
     *                                 Note, that geometry will be set, based on
     *                                 popover's position.
     * - id         : string           Set special ID to the popover.
     * - classes    : string           Add special class(es) to the popover.
     * - on_close   : function         Will be called when popover is closed.
     * - on_show    : function         Will be called when popover is shown.
     */
    var Popover = function(options) {

        this.opt = $.extend({}, {
            can_close : true,
            placement : 'top',
            title     : null,
            body      : null,
            OverlayLibrary : false,
            id        : null,
            classes   : null,
            on_close  : false,
            on_show   : false
        }, options);

        // This is actual popover element
        this.$element = $(template);

        // If type of text is string, then we'll set it now, otherwise on show
        if (typeof this.opt.title === 'string') {
            this.$element.find('h3').html(this.opt.title);
        }

        // If type of body is string, then we'll set it now, otherwise on show
        if (typeof this.opt.body === 'string') {
            this.$element.find('.popover-content').html(this.opt.body);
        }

        // Special classes?
        if (this.opt.classes) {
            this.$element.addClass(this.opt.classes);
        }

        // Special ID?
        if (this.opt.id) {
            this.$element.attr('id', this.opt.id);
        }

        // Calculate placement
        if (typeof this.opt.placement !== 'object') {

            // Loop through options and build new array
            var preferred = this.opt.placement,
                available = ['top', 'left', 'bottom', 'right'],
                placement = [preferred];

            for (var i = available.length - 1; i >= 0; i--) {
                if (available[i] === preferred) { continue; }
                placement.push(available[i]);
            }

            this.opt.placement = placement;
        }

        this.is_visible  = false;
        this.is_blocked  = false;
        this.is_appended = false;
    };

    Popover.prototype = {

        constructor : Popover,

        /**
         * Sets popover's placement.
         * @param  {object} placement Either you pass in the click event (e) or
         *                            jQuery reference to the parent element or
         *                            object in the following format:
         * - top  : integer
         * - left : integer
         * --
         * @return {void}
         */
        set_placement : function(placement) {

            // Following variables are declared:
            // placement         : {top, left, [width, height]}
            // element_dimension : {width, height}
            // window_dimension  : {width, height}

            this.$element.removeClass('top left bottom right');

            var element_dimension = {
                    width  : this.$element.outerWidth(),
                    height : this.$element.outerHeight() + 20
                },

                window_dimension = {
                    width  : $(window).width(),
                    height : $(window).height() + $(document).scrollTop()
                },
                final_placement  = {};

            // Cursor's position (event)
            if (typeof placement.pageX !== 'undefined') {
                placement = {
                    top   : {
                        top   : placement.pageY,
                        left  : placement.pageX
                    }
                };
                placement.bottom = placement.top;
                placement.left   = placement.top;
                placement.right  = placement.top;
            } // Element's position
            else if (typeof placement.offset === 'function') {

                var top    = placement.offset().top,
                    left   = placement.offset().left,
                    width  = placement.outerWidth(),
                    height = placement.outerHeight();

                placement  = {};

                // Calculate top point
                placement.top = {
                    top  : top,
                    left : left + parseInt(height / 2, 10)
                };
                // Calculate bottom point
                placement.bottom = {
                    left : left + parseInt(height / 2, 10),
                    top  : top  + height
                };
                // Calculate left point
                placement.left = {
                    top  : top + parseInt(height / 2, 10),
                    left : left
                };
                // Calculate right point
                placement.right = {
                    left : left + width,
                    top  : top + parseInt(height / 2, 10)
                };
            } // Number, we have valid absolute point
            else if (typeof placement.top === 'number') {
                placement = {
                    top : placement
                };

                placement.bottom = placement.top;
                placement.left   = placement.top;
                placement.right  = placement.top;
            }
            else {
                Log.err('You need to provide a valid placement.');
                return false;
            }

            // Try to set placement now
            for (var i = 0, l = this.opt.placement.length; i < l; i++) {
                
                var current = this.opt.placement[i];

                if (current === 'top') {
                    
                    if (placement.top.top - element_dimension.height < $(document).scrollTop()) {
                        continue;
                    }

                    if (placement.top.left + parseInt(element_dimension.width / 2, 10) > window_dimension.width) {
                        continue;
                    }

                    if (placement.top.left - parseInt(element_dimension.width / 2, 10) < 0) {
                        continue;
                    }

                    final_placement = placement.top;
                    final_placement.position = 'top';
                    break;
                }

                if (current === 'bottom') {
                    if (placement.bottom.top + element_dimension.height > window_dimension.height) {
                        continue;
                    }

                    if (placement.bottom.left + parseInt(element_dimension.width / 2, 10) > window_dimension.width) {
                        continue;
                    }

                    if (placement.bottom.left - parseInt(element_dimension.width / 2, 10) < 0) {
                        continue;
                    }

                    final_placement = placement.bottom;
                    final_placement.position = 'bottom';
                    break;
                }

                if (current === 'left') {
                    if (placement.left.top - parseInt(element_dimension.height / 2, 10) < $(document).scrollTop()) {
                        continue;
                    }

                    if (placement.left.top + parseInt(element_dimension.height / 2, 10) > window_dimension.height) {
                        continue;
                    }

                    if (placement.left.left < 0) {
                        continue;
                    }

                    final_placement = placement.left;
                    final_placement.position = 'left';
                    break;
                }

                if (current === 'right') {
                   if (placement.right.top - parseInt(element_dimension.height / 2, 10) < $(document).scrollTop()) {
                        continue;
                    }

                    if (placement.right.left + element_dimension.width > window_dimension.width) {
                        continue;
                    }

                    if (placement.right.top + parseInt(element_dimension.height / 2, 10) > window_dimension.height) {
                        continue;
                    }

                    final_placement = placement.right;
                    final_placement.position = 'right';
                    break;
                }
            }

            // If we was unable to calculate actual placement,
            // then we'll use the default one.
            if (typeof final_placement.position === 'undefined') {
                final_placement = placement[this.opt.placement[0]];
                final_placement.position = this.opt.placement[0];
            }

            // Finally position element accordingly...
            if (final_placement.position === 'top') {
                this.$element.css({
                    top  : final_placement.top  - element_dimension.height,
                    left : final_placement.left - parseInt(element_dimension.width / 2, 10)
                })
                .addClass('top');
            }
            else if (final_placement.position === 'left') {
                this.$element.css({
                    top  : final_placement.top - parseInt(element_dimension.height / 2, 10),
                    left : final_placement.left - element_dimension.width
                })
                .addClass('left');
            }
            else if (final_placement.position === 'bottom') {
                this.$element.css({
                    top  : final_placement.top,
                    left : final_placement.left - parseInt(element_dimension.width / 2, 10)
                }).
                addClass('bottom');
            }
            else if (final_placement.position === 'right') {
                this.$element.css({
                    top  : final_placement.top - parseInt(element_dimension.height / 2, 10),
                    left : final_placement.left
                })
                .addClass('right');
            }
        },

        /**
         * Shows popover.
         * @param  {object} placement Either you pass in the click event (e) or
         *                            jQuery reference to the parent element or
         *                            object in the following format:
         * - top  : integer
         * - left : integer
         * --
         * @return {void}
         */
        show : function(placement) {
            
            if (this.is_visible) { return; }

            // Set is_visible to true right now
            this.is_visible = true;

            this.$element.css('display', 'none');
            
            if (!this.is_appended) {

                this.$element.appendTo('body');

                // If it can be closed, then we'll add the button now
                var $close_button = this.$element.find('.popover-inner > button.close'),
                    _self         = this;

                $close_button.on('click', function() {
                    _self.hide();
                });

                if (this.opt.can_close !== true) {
                    $close_button.hide();
                }

                this.is_appended = true;
            }

            // Do we need to get title now?
            if (typeof this.opt.title === 'function') {
                this.$element.find('h3').html(this.opt.title());
            }

            // Do we need to get body now?
            if (typeof this.opt.body === 'function') {
                this.$element.find('.popover-content').html(this.opt.body());
            }

            // What's the dimension of this element?
            this.set_placement(placement);

            this.$element.show();

            if (typeof this.opt.on_show === 'function') {
                this.opt.on_show();
            }
        },

        /**
         * Hides popover.
         * --
         * @return {void}
         */
        hide : function() {
            this.is_visible = false;
            this.$element.hide();
            this.opt.on_hide();
        },

        /**
         * Destroys popover. (Removes the element from the DOM).
         * @return {void}
         */
        destroy : function() {

            this.$element.remove();
        },

        /**
         * Blocks the popover - nothing on it can be clicked. It can't be closed
         * even if we click outside of it.
         * --
         * @param {Boolean} is_hard If is hard block, this will prevent any click
         *                          on any element on the whole page.
         * --
         * @return {void}
         */
        block : function(is_hard) {

        },
        
        /**
         * Unblocks the popover.
         * --
         * @return {void}
         */
        unblock: function() {

        }

    };

    return Popover;

});