(function($)
{
    function SolverFactory(config, target){
        if (config.hasOwnProperty('useFoldingScroll'))
            return new FoldingLocationSolver(target);
        else if(config.hasOwnProperty('useScrollToAnchor'))
            return new AccordionHeaderLocationSolver(target);
        else
            return new BasicLocationSolver(target);
    };
    /** ----------------------------------------- 
     *   Solver for basic HTML
     ** ------------------------------------------**/
    function BasicLocationSolver(target)
    {
        this.target = target;
    }
    BasicLocationSolver.prototype = {
            top:function(){this.target.position().top;}
    };
    /** ----------------------------------------- 
     *   Solver for jQuery.FoldingScroll
     ** ------------------------------------------**/    
    function FoldingLocationSolver(target)
    {
        var LOC = $.FoldingScroll.__proto__.LOCATION;
        this.target = target;
        this.loc = target.data(LOC);
        if (!this.loc)
        {
            throw new Error('didn\'t find location object.');
            return;
        }
        
        var c = target.data($.FoldingScroll.__proto__.CHILDREN);
        if (c) this.loc = c[0].data(LOC);
    }
    FoldingLocationSolver.prototype = {
            top:function(){return this.loc.begin;}
    };
    /** ----------------------------------------- 
     *   Solver for jQuery.AccordionHeader
     ** ------------------------------------------**/    
    function AccordionHeaderLocationSolver(target){
        this.target = target;
    }
    AccordionHeaderLocationSolver.prototype = {
            top:function(){
                if(!$.accordion_header) throw new Error('didn\'t find jQuery.accordion_header.');
                return $.accordion_header.getScrollTopFromAnchor(this.target);
            }
    };
    
    
    /** ----------------------------------------- 
     *   Plugin main
     ** ------------------------------------------**/
    $.fn.scrollToAnchor = function(config) {
        return this.each(function()
        {
            $(this).click(function(event)
            {
                //cancel defult event
                event.preventDefault();
                
                //destination
                var target = $($(event.target).attr('href'));
                
                //position of destination
                var y = new SolverFactory(config, target).top();
                
                //resolve animation duration
                var duration = Math.abs($('body').scrollTop() - y) * .5;
                duration = Math.max(600, duration);
                
                //scroll
                $('body').animate({scrollTop:y}, {duration:duration, easing:'easeInOutExpo'});
            });
        });
    };
})(jQuery);