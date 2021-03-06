(function($) {
    
    // default settings
    var defaults = {
        'animationType' : 'fade', // @string: fade, no-effect, random, slide
        'autoslide'     : true,   // @bool
        'fixedSize'     : false,  // @object{ width: string(100%), height: string(300px) }
        'nav'           : true,   // @bool
        'progressBar'   : true,   // @bool
        'responsive'    : true,   // @bool
        'speed'         : 7000    // @int
        },
        Slider;
    
    /**
     * Object Slider - constructor
     *
     * @param (object) elem -> selector
     * @param (object) options -> personilized options
     */
    Slider = function(elem, options) {
        this.elem = elem;
        this.settings = $.extend(true, {}, defaults, options);
        this.init();
    };
    
    // init based on settings
    Slider.prototype.init = function() {
        var _this = this;
        
        if(_this.settings.fixedSize) {
            _this.fixedSize();
        } else if(_this.settings.responsive) {
            _this.responsive();
            $(window).resize(function(){
                _this.responsive();
            });
        }
        
        _this.showFirst();
        
        if(_this.settings.nav) {
            _this.addNav();
        }
        
        if(_this.settings.progressBar) {
            _this.addProgressBar();
        }
        
        if(_this.settings.autoslide) {
            _this.startAutoslide();
            _this.elem.find('div').click(function(){
                if ($(this).hasClass('paused')) {
                    $('<span class="playImg"></span>').appendTo(_this.elem).fadeIn(600, function(){
                        $(this).fadeOut(600, function(){
                            $(this).remove()
                        });
                    });
                    _this.startAutoslide();
                } else {
                    $('<span class="pauseImg"></span>').appendTo(_this.elem).fadeIn(600, function(){
                        $(this).fadeOut(600, function(){
                            $(this).remove()
                        });
                    });
                    _this.clear();
                }
                $(this).toggleClass('paused');
            });
        }
    };
    
    
    // adjust element height
    Slider.prototype.responsive = function() {
        var elemW = this.elem.width();
        this.elem.css('height', elemW * 30 / 100);
    };
    
    // set slider to fixed size
    Slider.prototype.fixedSize = function() {
        var _this = this;
        if (_this.settings.fixedSize.width && _this.settings.fixedSize.height) {
            _this.elem.css({
                'width': _this.settings.fixedSize.width,
                'height': _this.settings.fixedSize.height
            });
        }
    };
    
    // hide all slides and show only the first
    Slider.prototype.showFirst = function() {
        this.elem.find('div:not(div:first)').hide();
        this.elem.find('div:first').addClass('activeSlide');
    };
    
    // add left-right buttons
    Slider.prototype.addNav = function() {
        var _this = this;
        $('<span class="leftSlide"></span><span class="rightSlide"></span>').appendTo(_this.elem);
        this.elem.find('.rightSlide').click(function(){
            _this.clear();
            _this.showNext(1);
        });
        this.elem.find('.leftSlide').click(function(){
            _this.clear();
            _this.showNext(-1);
        });
    };
    
    // clear timeout and reset progressbar
    Slider.prototype.clear = function() {
        if(this.settings.autoslide) {
            clearTimeout(this.timerSlide);
        }
        if(this.settings.progressBar) {
            this.elem.find('.prgBar').stop().css('width', 0);
        }
    };
    
    // add progressbar
    Slider.prototype.addProgressBar = function() {
        $('<span class="prgBar"></span>').appendTo(this.elem);
    };
    
    // show next slide :: PN = direction
    Slider.prototype.showNext = function(PN) {
        var _this = this,
            active = _this.elem.find('div.activeSlide');
        active.removeClass('paused');
        if (PN > 0) {
            var toShow = active.next('div').length ? active.next() : active.siblings('div').first();
        } else {
            var toShow = active.prev('div').length ? active.prev() : active.siblings('div').last();
        }
        _this.applyEffect(active, toShow, PN);
        if(_this.settings.autoslide) _this.startAutoslide();
    };
    
    // set timeout for autosliding and animate progressbar
    Slider.prototype.startAutoslide = function() {
        var _this = this;
        if (_this.settings.progressBar) {
            var prgBar = _this.elem.find('.prgBar');
            prgBar.animate({
                'width': '100%'
            }, _this.settings.speed,
            function(){
                prgBar.css('width', 0);
            });
        }
        _this.timerSlide = setTimeout(function(){
            _this.showNext(1);
        }, _this.settings.speed);
    };
    
    // apply effect based on settings :: active = slide to hide | toShow = slide to show | PN = direction
    Slider.prototype.applyEffect = function(active, toShow, PN) {
        var _this = this;
        switch (_this.settings.animationType) {
            case 'fade':
                fadeEffect(active, toShow);
                break;
            case 'no-effect':
                noEffect(active, toShow);
                break;
            case 'slideH':
                slideHorizontalEffect(active, toShow, PN);
                break;
            case 'slideV':
                slideVerticalEffect(active, toShow, PN);
                break;
            case 'random':
                var pickRand = Math.floor((Math.random()*3)+1);
                if(pickRand == 1) fadeEffect(active, toShow);
                else if(pickRand == 2) slideHorizontalEffect(active, toShow, PN);
                else if(pickRand == 3) slideVerticalEffect(active, toShow, PN);
                else noEffect(active, toShow);
                break;
            default:
                _this.fadeEffect(active, toShow);
                break;
        }
    };
    
    /**
    * EFFECTS
    */
    
    // fade
    var fadeEffect = function(active, toShow) {
        active.fadeOut(500).removeClass('activeSlide');
        toShow.fadeIn(300).addClass('activeSlide');
    };
    
    // no-effect
    var noEffect = function(active, toShow) {
        active.hide().removeClass('activeSlide');
        toShow.show().addClass('activeSlide');
    };
    
    // horizontal slide
    var slideHorizontalEffect = function(active, toShow, PN) {
        if (PN > 0) {
            var l1 = '-100%',
                l2 = '+100%';
        } else {
            var l1 = '+100%',
                l2 = '-100%';
        }
        active.stop().animate({
            left : l1
        }, 400, function(){
            $(this).css({
                left: 0,
                display: 'none'
            });
        }).removeClass('activeSlide');
        toShow.css({
            left : l2,
            display : 'block'
        }).stop().animate({
            left: '0'
        }, 400).addClass('activeSlide');
    };
    
    // vertical slide
    var slideVerticalEffect = function(active, toShow, PN) {
        if (PN > 0) {
            var l1 = '-100%',
                l2 = '+100%';
        } else {
            var l1 = '+100%',
                l2 = '-100%';
        }
        active.stop().animate({
            top : l1
        }, 500, function(){
            $(this).css({
                top: 0,
                display: 'none'
            });
        }).removeClass('activeSlide');
        toShow.css({
            top : l2,
            display : 'block'
        }).stop().animate({
            top: '0'
        }, 500).addClass('activeSlide');
    };
    
    /**
     * CREATE NEW SLIDER
     *
     * @param (object)options -> see defaults for available options
     * @return (object)
     */
    $.fn.sSlider = function( options ) {
        return this.each(function(){
            if (!$(this).hasClass('sSlider')) {
                $(this).addClass('sSlider');
            }
            new Slider($(this), options);
        });
    };    
}(jQuery));