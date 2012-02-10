/** -----------------------------------------------------------
 *    FoldingScroll
 *    @author shin yamaharu
 *    =========================================================
 *    ver 0.1  2012.2.7
 ** --------------------------------------------------------**/
(function(jQuery)
{
	
/**---------------------------------------------------------------------------------------------
 * Main class
 *----------------------------------------------------------------------------------------------/
   /*==========================================================================
    *
    * Constructor
    *
    *=========================================================================*/
    function FoldingScroll()
    {
    	this.window = $(window);
        this.currentAnchor = "";
        
        var that = this;
        this.window.bind('scroll', function(e){that.onScroll();});
        
        //requires 'jquery-hashchange-plugin' : 
        //http://benalman.com/projects/jquery-hashchange-plugin/
        if($.fn.hashchange) 
        	this.window.hashchange(function(){that.onHashChange();});
    }
    
   /*==========================================================================
    *
    * Class Method / Constants
    *
    *=========================================================================*/
    FoldingScroll.PAGE     = 'PAGE';
    FoldingScroll.getInstance = function() {
		return FoldingScroll._instance || (FoldingScroll._instance = new FoldingScroll());
	};

   /*==========================================================================
    *
    * Class
    *
    *=========================================================================*/
    FoldingScroll.prototype =
    {
        /**-------------------------------------
         *  register page element.
         *  @param pageElement	jQuery object
         **------------------------------------*/
        register: 
            function(pageElement)
            {
        		var page = new Page(pageElement);
        		
                //set reference of Page for other plugin.
        		pageElement.data(FoldingScroll.PAGE, page);
                
                this.resolveScrollOrder(page);
            },
        
        /**--------------------------------------------------------------------
         * HTMLで定義されたpageツリーを、適切なスクロール順になるように再構築する
         * @param page		jQuery object
         * @param current	current jQuery object. 
         * 					再起的に呼び出される際に渡される
         **------------------------------------------------------------------*/
        resolveScrollOrder : 
            function(page, current)
            {
                var parentPage = page.dom.parent();
                if(parentPage.is('body')) return;
                
                parentPage = page.parent;
                
                page = current || page;
                
                var nodeID   = page.id;
                if (parentPage)
                {
                	var parentID = parentPage.id; 
                	parentPage.children.push(page);
                    
                    //親があった場合入れ替える
                    Page.all[parentID] = page;
                    Page.all[nodeID] = parentPage;
                    page.id = parentID;
                    parentPage.id = nodeID;
                }
                else
                {
                    this.resolveScrollOrder(parentPage, page);
                }
            },
            
        /**--------------------------------------------------------------------
         * page要素の高さからbodyの高さを決定.
         * スクロールのヘルパーであるLocationオブジェクトの作成
		 **------------------------------------------------------------------*/
        calculate : 
            function()
            {
                var y = 0;
                Page.each(function(page)
                {
                	y += page.update(y);
                });
                //update body height.
                $('body').height(y);
            },
            
	    /**--------------------------------------------------------------------
	     * update location hash by scroll.
		 * @param pageID 
		 * @param scTop
		 **------------------------------------------------------------------*/
    	updateHash : 
        	function(pageID, scTop) {
        		if (this.currentAnchor == pageID) return;
        		this.currentAnchor = pageID;
    			window.location.hash = pageID;
    			this.window.scrollTop(scTop);
			},
        
        /*==========================================================================
         *
         * Event handlers
         *
         *=========================================================================*/
        onScroll : 
            function()
            {
        		var scTop = $(window).scrollTop();
        		var that = this;
                Page.each(
	                function(page, i)
	                {
	                    page.updatePosition(scTop);
	                    //update location hash if needed.
	                    if (page.status == PageStatus.PLAY)
	                    	that.updateHash(page.dom.attr('id'), scTop);
	                });
            },
            
        onHashChange :
        	function() 
    		{
        		var hash = location.hash;
    			if ('#' + this.currentAnchor == hash) return;
    			Page.each(function(pageElement, i)
    	        {
    				if (pageElement.hasHash(hash))
    					$(window).scrollTop(pageElement.begin);
    	        });
    		}
    };
    
    
/** --------------------------------------------------------------------------------------------- 
 *   PageStatus
 ** -------------------------------------------------------------------------------------------**/
    function PageStatus(){};
    PageStatus.WAIT = 'WAIT';
    PageStatus.PLAY = 'PLAY';
    PageStatus.GONE = 'GONE';
/** --------------------------------------------------------------------------------------------- 
 *   Page
 ** -------------------------------------------------------------------------------------------**/
    /*==========================================================================
     *
     * Class variable, method, constants
     *
     *=========================================================================*/
    Page.sid = 0;
    Page.all = [];
    Page.BASE_Z_INDEX = 1000;
    Page.detectParent = function(target) {
    	var result = null;
    	target = target.dom.parent().get(0);
    	Page.all.forEach(
    			function(page) {
    				if(page.dom.get(0) == target) result = page;
    			});
    	return result;
    };
    Page.each = 
    	function(f)
    	{
    	Page.all.forEach(f, this);
    	};
    /*==========================================================================
    *
    * Constructor
    *
    *=========================================================================*/
    function Page(dom)
    {
    	this.id       = Page.sid ++; 
        this.dom      = dom;
        this.parent   = Page.detectParent(this);

        Page.all.push(this);
        
        this.initialize();
    }
    /*==========================================================================
    *
    * Class
    *
    *=========================================================================*/
    Page.prototype =
    {
        toString :
            function()
            {
                return 'Page[' + this.id + '] begin:' + this.begin + ', end:' + this.end;
            },
            
        initialize :
        	function() 
        	{
	        	this.status   = PageStatus.WAIT;
	        	this.begin    = NaN;
	        	this.end      = NaN;
	        	this.children = [];
	        	//page要素を通常フローから切り離す
	            this.dom.css({position : 'fixed'});
			},
        
        update :
        	function(y) 
        	{
	        	// 内包するpage要素を含まないコンテナのサイズ
	        	var h = this.outerHeight();
	        	// page要素の大きさとz-indexを更新
	        	this.updateSize(h);
	        	// update location.
	            this.begin = y;
	            this.end   = y + h;
	            return h;
			},
        
        updateSize :
        	function(h) 
        	{
        		this.dom.css(
                {
                    width: $(window).width(),
                    height: h,
                    zIndex: Page.BASE_Z_INDEX - this.id
                });
			},
			
		updatePosition :
			function(scTop) 
			{
				this.dom.css({
	                top        : this.top(scTop),
	                visibility : this.visibility()
	            });
				this.updateStatus(scTop);
			},
			
		/**
         * page要素の状態を行進
         * @param scTop
         */
        updateStatus : 
            function(scTop)
            {
                if (this.isInView(scTop))
                    this.status = PageStatus.PLAY;
                else
                    this.status = (this.begin > scTop) ? PageStatus.WAIT : PageStatus.GONE;
            },
        
        /**
         * page要素が可視範囲に存在するかどうか
         * @param scTop
         * @returns {Boolean}
         */
        isInView: 
            function(scTop)
            {
                return this.begin <= scTop && this.end > scTop;
            },
            
        hasHash :
        	function(hash) {
				return '#' + this.dom.attr('id') == hash;
			},
        
        /**
         * page要素のあるべきスクリーンy座標
         * @param scTop
         * @returns
         */
        top :
            function(scTop)
            {
                return this.status == PageStatus.PLAY ? -(scTop-this.begin) : 0;
            },
            
        outerHeight :
        	function() {
				return Math.max(this.dom.outerHeight(true), $(window).height());
			},
            
        /**
         * page要素のあるべき表示状態
         * @returns
         */
        visibility :
            function()
            {
                return this.status == PageStatus.GONE ? 'hidden' : 'visible';
            }
    };
/**--------------------------------------------------------------------------------------------- 
 *   Utility
 **-------------------------------------------------------------------------------------------**/
    /**----------------------------------------- 
     *   Auto Instantiate
     **------------------------------------------**/
    jQuery.fn.Instantiate = function()
    {
        this.each(function()
        {
            var $self = $(this), 
                $controller = $self.attr('data-script');

            if ($self[$controller]) $self[$controller]();
        });
    };
/**--------------------------------------------------------------------------------------------- 
 *   Plugin defination
 **-------------------------------------------------------------------------------------------**/
    jQuery.fn.FoldingScroll = function() {
    	//set reference of FoldingScroll class for other plugin.
    	jQuery.fn.FoldingScroll._class_ = FoldingScroll;
    	//register page element.
        FoldingScroll.getInstance().register($(this));
    };
    /**----------------------------------------- 
     *   on ready document
     **------------------------------------------**/
    jQuery(function()
    {
        //create FoldingScroll instance which is a singleton.
        var fs = FoldingScroll.getInstance();
        
        //register DOM which asigned 'data-script' attribute to FoldingScroll.
        $('[data-script]').Instantiate();
        
        //calculate BODY and page element height.
        fs.calculate();
        
        //re-calc when window will be resized
        //TODO リサイズしたときbodyのサイズがへん？
        jQuery(window).resize(function(){fs.calculate();});
    });
})(jQuery);