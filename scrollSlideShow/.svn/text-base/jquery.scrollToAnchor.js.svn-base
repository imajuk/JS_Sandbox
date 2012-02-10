(function(jQuery)
{
    function SolverFactory(){};
    SolverFactory.prototype = {
            create:function(config, target){
                if (config.hasOwnProperty('useFoldingScroll'))
                    return new FoldingLocationSolver(target);
                else if(config.hasOwnProperty('useScrollToAnchor'))
                    return new AccordionHeaderLocationSolver(target);
                else
                    return new BasicLocationSolver(target);
            }
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
        this.target = target;
        this.page = target.data(jQuery.fn.FoldingScroll._class_.PAGE);
        if (!this.page)
        {
            throw new Error('didn\'t find location object.');
            return;
        }
        
        var c = this.page.children;
        if (c.length > 0) this.page = this.page.children[0];
    }
    FoldingLocationSolver.prototype = {
            top:function(){return this.page.begin;}
    };
    /** ----------------------------------------- 
     *   Solver for jQuery.AccordionHeader
     ** ------------------------------------------**/    
    function AccordionHeaderLocationSolver(target){
        this.target = target;
    }
    AccordionHeaderLocationSolver.prototype = {
            top:function(){
                if(!jQuery.accordion_header) throw new Error('didn\'t find jQuery.accordion_header.');
                return jQuery.accordion_header.getScrollTopFromAnchor(this.target);
            }
    };
    
    
    /** ----------------------------------------- 
     *   Plugin main
     ** ------------------------------------------**/
    jQuery.fn.scrollToAnchor = 
    	function(config) {
			return $(this).each(
				function() 
				{
					$(this).click(
					    function(event) {
							event.preventDefault();
							var target = $($(event.target).attr('href'));
							var y = SolverFactory.prototype.create(config, target).top();
							var duration = Math.abs($('body').scrollTop() - y) * .5;
							duration = Math.max(600, duration);
							$('body').animate(
							    {scrollTop : y}, 
							    {duration : duration, easing : 'easeInOutExpo'}
							);
						});
		});
	};
})(jQuery);