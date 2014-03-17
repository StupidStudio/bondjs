/*bond.0.0.6.js | David Adalberth Andersen @ Stupid Studio | 2014-03-17*/(function ($) {
    "use strict";

    /*!
     * BondJS - A ScrollSpy that drinks Martini
     */
    function Bond(options) {

        /*!
         * Default options for BondJS
         */
        var default_options = {
            visibility: {
                top: 0,
                bottom: 0,
                victimBody: false
            },
            animation: {
                cssClass: 'spotted',
                once: false
            }
        };

        /*!
         * Extend users global options, with default options
         */
        this.option = $.extend(true, {}, default_options, options || {});

        /*!
         * Make Bond report what he is doing
         */
        this.report = false;

        /*!
         * Global array for victims
         */
        this.victims = [];

        /*!
         * Force spying global
         */
        this.forcedspying = false;

        /*!
         * Caching window and body
         */
        this.$window = $(window);
        this.$body = $('body');

        /*!
         * Scroll increment
         */
        this.scrollIncrement = 0;
        this.minScrollIncrement = 20;

        /*!
         * Set height, scroll position, and the target zone for Bonds victims
         */
        this.height = this.$window.height();
        this.scrollPosition = this.$window.scrollTop();
        this.scrollStop = 0;
        this.targetZone = {
            start: this.scrollPosition,
            end: this.scrollPosition + this.height
        };
    }
    Bond.prototype = {
        constructor: Bond,

        /*!
         * Add a array to spyon and Bond creates data for the victims
         */
        spyon: function (input) {
            if (input.length > 0) {
                if (this.report) console.log('Mr. Bond: "Reciving Misson Data"');

                /*!
                 * Loop over Bonds victims
                 */
                var i,
                    l = input.length,
                    that = this;

                for (i = 0; i < l; i++) {
                    var victim = input[i];

                    /*!
                     * Check if the victim is a jQuery object
                     * if it is, parse a raw HTMLElement to the _addVictimFunction
                     * else loop over the jQuery array, and create single victims
                     * parsing the same mission data for the array items.
                     */
                    if (victim.victim instanceof $ || victim.victim instanceof jQuery) {

                        if (victim.victim.length > 1) {
                            $.each(victim.victim, function (i, item) {
                                that._addVictimToVictims(item, victim.missionData, victim);
                            });
                        } else {
                            this._addVictimToVictims(victim.victim[0], victim.missionData, victim);
                        }

                    } else {
                        this._addVictimToVictims(victim.victim, victim.missionData, victim);
                    }
                }
            } else {
                if (this.report) console.log('Mr. Bond: "This mission data contains no victims!"');
            }
            return this;
        },
        forcespy:function (val){
            /*!
             * Forcespy forces the bond to look for victims,
             * even though the user doesn't scroll.
             */
            if(val === undefined){
                this._setScrollPosition();
                this._setTargetZone();
                this._calcVictimsPosition();
                this._iterateOverVictims();
            }else{
                this._timedForceSpy(val);
            }
        },
        start: function () {
            /*!
             * Check if there are any victims
             */
            if (this.victims.length > 0) {
                if (this.report) console.log('Mr. Bond: "Misson is a go, im spying on:"', this.victims);
                this._init();
            } else {
                if (this.report) console.log('Mr. Bond: "I need victims to watch"');
            }
            return this;
        },
        _init: function () {
            /*!
             * Start watching for user scroll
             */
            this._watchForScroll();
            this._handleScroll();
        },
        _timedForceSpy: function (val) {
            /*!
             * Force bond to search for the victims,
             * event hough, the user doesn't scroll.
             * Set the time frame for how long forcespying should
             * be active
             */
            this.forcedspying = true;
            var that = this,
                count = 0,
                time = (val+100) / 100,
                timer = setInterval(function () {
                    if (count > time){
                        that.forcedspying = false;
                        clearInterval(timer);
                    }
                    that.forcespy();
                    count++;
                }, 100);
        },
        _addVictimToVictims: function (v, missionData, obj) {
            /*!
             * Extend options with users options [missionData]
             * Set victims values
             */
            var victim = {};
            victim.missionData = $.extend(true, {}, this.option, missionData || {});
            victim.$victim = $(v);
            victim.height = victim.$victim.height();
            victim.location = victim.$victim.offset().top;
            victim.locationAndBody = victim.$victim.offset().top + victim.height;
            victim.name = victim.$victim.attr("id") || victim.$victim.attr("class") || victim.victim;
            victim.extra = obj.extra || false;

            /*!
             * Push victim to global victims array
             */
            this.victims.push(victim);
        },
        _calcVictimsPosition: function () {
            /*!
             * Calculate victims positions/location
             */
            if (this.report) console.log('Mr. Bond: "Searching for victims location"');
            var i, l = this.victims.length;
            for (i = 0; i < l; i++) {
                var victim = this.victims[i];
                victim.height = victim.$victim.height();
                victim.location = victim.$victim.offset().top;
                victim.locationAndBody = victim.$victim.offset().top + victim.height;
            }
        },
        _watchForScroll: function () {
            var that = this;

            /*!
             * Scroll and resize event handler
             */
            this.$window.scroll(function () {
                if(!that.forcedspying){
                    that._handleScroll();
                }
            }).resize(function () {
                that.height = that.$window.height();
                if(!that.forcedspying){
                    that._setTargetZone();
                    that._iterateOverVictims();
                }
            });
        },
        _handleScroll: function () {
            /*!
             * Get the position of the scroll
             */
            this._setScrollPosition();
            /*!
             * Calculate the target zone for the victims
             */
            this._setTargetZone();
            /*!
             * Iterae over victims to check if they are in the target zone
             */
            this._iterateOverVictims();
            /*!
             * Start checking for when the scroll stops
             */
            this._onScrollStop();
            /*!
             * Find scroll increment
             */
            this._calcScrollIncrement();

        },
        _calcScrollIncrement: function(){
            /*!
             * Set local variables
             */
            if(this._calcScrollIncrement.increments === undefined){
                this._calcScrollIncrement.increments = [];
            }

            /*!
             * Push increments to array
             */
            this._calcScrollIncrement.increments.push(this.targetZone.start);

            /*!
             * Remove old entries when array is bigger than numIncremtns
             */
            if(this._calcScrollIncrement.increments.length > 2) this._calcScrollIncrement.increments.shift();

            /*!
             * Calculate "average" increment
             */
            this.scrollIncrement = Math.abs(this._calcScrollIncrement.increments[0] - this._calcScrollIncrement.increments[1]);

            /*!
             * Limit minimum to minIncrement
             */
            if(this.scrollIncrement < this.minScrollIncrement || isNaN(this.scrollIncrement)){
                this.scrollIncrement = this.minScrollIncrement;
            }

        },
        _onScrollStop: function () {

            /*!
             * Checks if the scroll stops
             */
            var that = this;
            if (this.scrollStop) {
                clearTimeout(this.scrollStop);
            }
            this.scrollStop = setTimeout(function () {
                that._calcVictimsPosition();
                that._iterateOverVictims();
            }, 100);
        },
        _setScrollPosition: function () {

            /*!
             * On a Mac the scroll position can be less than null,
             * so here we fixed that, so i can't.
             */
            this.scrollPosition = this.$window.scrollTop();
            if (this.scrollPosition <= 0) {
                this.scrollPosition = 0;
            }
        },
        _setTargetZone: function () {
            /*!
             * Set the target zone
             */
            this.targetZone.start = this.scrollPosition;
            this.targetZone.end = this.scrollPosition + this.height;
        },
        _iterateOverVictims: function () {
            /*!
             * Iterate over all the victims
             */
            var i, l = this.victims.length;
            for (i = 0; i < l; i++) {
                var victim = this.victims[i];

                /*!
                 * set the target zone for the individuel victims
                 */
                var paddingTop = this.targetZone.start + this._getPadding(victim, victim.missionData.visibility.top),
                    paddingBottom = this.targetZone.end - this._getPadding(victim, victim.missionData.visibility.bottom);

                if (victim.missionData.visibility.victimBody) {

                    /*!
                     * Checks if the victims body is bigger than the window
                     */
                    if (this.height < victim.height) {
                        /*!
                         * If it is, then override and use the normal target zone values
                         */
                        this._findVictim(victim, victim.locationAndBody, victim.location, this.targetZone.end, this.targetZone.start);
                    } else {
                        /*!
                         * Fixes problem if the padding is equel to 50% on top and bottom
                         * And adds extra victimsbody padding so the victim is easy'er to spot
                         */
                        if (victim.missionData.visibility.top !== 0 && victim.missionData.visibility.top < 1) {
                            paddingTop -= (victim.height / 2) + this.scrollIncrement;
                        } else {
                            paddingTop -= this.scrollIncrement;
                        }
                        if (victim.missionData.visibility.bottom !== 0 && victim.missionData.visibility.bottom < 1) {
                            paddingBottom += (victim.height / 2) + this.scrollIncrement;
                        } else {
                            paddingBottom += this.scrollIncrement;
                        }

                        this._findVictim(victim, victim.location, victim.locationAndBody, paddingTop, paddingBottom);
                    }
                } else {
                    /*!
                     * Just spot the victims if the victims is in target zone
                     */
                    this._findVictim(victim, victim.locationAndBody, victim.location, paddingTop, paddingBottom);
                }
            }
        },
        _getPadding: function (victim, val) {
            /*!
             * Checks if the user wants pct or px values
             */
            if (val < 1) {
                return this.height * val;
            } else {
                if (this._checkPxBounds(victim)) {
                    return 0;
                } else {
                    return val;
                }
            }
        },
        _checkPxBounds: function (victim) {
            /*!
             * Checks if the px value is bigger than the window height
             */
            var top = victim.missionData.visibility.top,
                bot = victim.missionData.visibility.bottom,
                height = victim.height,
                body = victim.missionData.visibility.victimBody;

            if ((top + bot) > this.height || (top + bot + height) > this.height && body) {
                return true;
            } else {
                return false;
            }
        },
        _findVictim: function (victim, locA, locB, start, end) {
            /*!
             * Checks if the victim is in the target zone
             */
            if (locA > start && locB < end) {
                /*!
                 * Makes sure that the victims callback function is only called once
                 */
                if (!victim.called || victim.called === undefined) {
                    if (this.report) console.log('Mr. Bond: "Victim: [', victim.name, '] is IN the kill zone"');
                    this._victimInScope(victim);
                    victim.called = true;
                }
                /*!
                 * Checks if the victim is out of the scope
                 */
            } else if ((victim.called && victim.locationAndBody < this.targetZone.start) || (victim.called && victim.location > this.targetZone.end)) {
                if (this.report) console.log('Mr. Bond: "Victim: [', victim.name, '] is OFF premises"');
                this._vicimOutScope(victim);
                victim.called = false;
            }
        },
        _victimInScope: function (victim) {

            /*!
             * Set a class on the victims html
             */
            victim.$victim.addClass(victim.missionData.animation.cssClass);

            /*!
             * Checks if the victim should only be called once pr page reload
             */
            if (!victim.missionData.animation.once) {
                if (victim.missionData.animation.in) victim.missionData.animation.in(victim);
            } else {
                if (victim.missionData.animation.in && !victim.eleminated) {
                    victim.missionData.animation.in(victim);
                    victim.eleminated = true;
                }
            }
        },
        _vicimOutScope: function (victim) {
            /*!
             * Call the callback function and removes the css class
             */
            if (victim.$victim.hasClass(victim.missionData.animation.cssClass)) victim.$victim.removeClass(victim.missionData.animation.cssClass);
            if (victim.missionData.animation.out) victim.missionData.animation.out(victim);
        }
    };

    window.Bond = Bond;

}(jQuery));
