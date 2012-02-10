jQuery(function()
{
    /** ----------------------------------------- 
     *   Accordion Header
     ** ------------------------------------------**/
    function AccordionHeader()
    {
        this.targets = [];
        this.highlightsTargets = [];
        this.currentMargin = 0;
        this.margins = {};
        
        $(window).scroll(jQuery.proxy(this, 'scroll'));
    };
    AccordionHeader.prototype =
    {
        register: function(targetID, highlightID)
        {
            var dom = $("#" + targetID);

            //lock position
            var border = dom.position().top - this.currentMargin;
            
            //memo integral margin
            this.margins["#" + targetID] = this.currentMargin;
            
            //update integral margin
            this.currentMargin += dom.height();

            var target = new BarTarget(targetID, border, highlightID);
            this.targets.push(target);
            

            if (highlightID == undefined) return;
            
            this.highlightsTargets.push(target);
            this.highlightsTargets.sort(
                function(a, b)
                {
                    var val1 = a.border;
                    var val2 = b.border;
                    return val1 == val2 ? 0 : val1 > val2 ? -1 : 1;
                }
            );
        },
        scroll : function()
        {
            var tp = $(window).scrollTop();
            this.targets.forEach(
                function(target, i)
                {
                    target.update(tp);
                }, this
            );
            
            this.highlitCurrentMenu(tp);
        },

        highlitCurrentMenu : function(tp)
        {
            var highlight = false;
            this.highlightsTargets
                .forEach(function(target)
                {
                    highlightItem = target.highlight;
                    if (!highlight && target.border < tp)
                    {
                        highlight = target;
                        target.lightOn();
                    }
                    else
                    {
                        target.lightOff();
                    }
                }, this);
        },
        
        getScrollTopFromAnchor : function(anchor, duration){
            var destination = $(anchor);
            for ( var hid in this.margins)
            {
                if ($(hid, destination).length == 1)
                {
                    return destination.offset().top - this.margins[hid] + 1;
                    break;
                }
            }
            return undefined;
        }
        
    };

    /** ----------------------------------------- 
     *   BarTarget
     ** ------------------------------------------**/
    function BarTarget(id, border, highlight)
    {
        this.id = id;
        this.domElement = $("#" + id); 
        this.contentTop = this.domElement.position().top;
        this.height = this.domElement.height();
        this.parent = this.domElement.parent().get(0);
        this.border = border;
        this.isHighlight = false;
        if (highlight != undefined)
            this.highlight = $("#" + highlight);
    }
    BarTarget.prototype = {
        toString : function()
        {
            return 'BarTarget[id:' + this.id + ', isHighlight:' + this.isHighlight + ']';
        },
        update : function(tp)
        {
            if (tp > this.border)
                this.fixed();
            else
                this.un_fix();
        },
        fixed : function()
        {
            if (this.isHighlight) return;
            
            this.isHighlight = true;
            var _dammy = $('<div id="' + this.id + "_d" + '" style="height:' + this.height
                    + 'px;background-color:#FFF;visibility:hidden;"></div>');
            $(this.domElement).before(_dammy);
            
            this.domElement.css(
            {
                position: "fixed",
                top: this.contentTop - this.border + "px",
            });
        },
        un_fix : function()
        {
            if (!this.isHighlight) return;

            $("#" + this.id + "_d").remove();
            this.isHighlight = false;
            this.domElement.css("position", "static");
        },
        lightOn: function()
        {
            this.highlight.stop().animate(
            {
                'backgroundColor': '#FFF',
            }, 1000, "easeOutExpo");
            $("a:link", this.highlight).stop().animate(
            {
                color: "#000"
            }, 1000, "easeOutExpo");
        },
        lightOff: function()
        {
            this.highlight.stop().animate(
            {
                'backgroundColor': '#000',
            }, 500, "easeOutExpo");
            $("a:link", this.highlight).stop().animate(
            {
                color: "#FFF"
            }, 500, "easeOutExpo");
        }
    };


    /** ----------------------------------------- 
     *   Plugin Main
     ** ------------------------------------------**/
    jQuery.accordion_header = new AccordionHeader();
    jQuery.fn.accordion_header = function()
    {
        return this.each(function(i)
        {
            var target = $(this);
            jQuery.accordion_header.register(target.attr('id'), target.attr('data-highlight'));
        });
        
    };
});