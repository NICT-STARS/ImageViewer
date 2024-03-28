/******************************************************************************/
/* K2goimageviewer Web Components                                             */
/* Version 2.0.0                                                              */
/* Copyright (c) k2go. All rights reserved.                                   */
/* See License.txt for the license information.                               */
/******************************************************************************/
class K2goImageViewer extends HTMLElement 
{
/*-----* properties *---------------------------------------------------------*/
  $this               = this;
  #flgTouch           = "ontouchstart"            in window;
  #flgEvent           = this.#flgTouch && "event" in window;
  #strMouseWheel      = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
  #Options = 
  {
    rate     : 0,
    maxWidth : 0,
    maxHeight: 0,
    minWidth : 0,
    minHeight: 0,
    intWidth : 0,
    intHeight: 0
  };
  #move               = function(pthis){ console.log((new Date()).toISOString() + " move"); };
  #zoom               = function(pthis){ console.log((new Date()).toISOString() + " zoom"); };
  #lock               = false;
  #ContextMenu        = (pEvent) => { pEvent.preventDefault(); pEvent.stopPropagation(); };
  #fncWheel;
  #fncStart;

  #imageDivElement;
  #imgElement;
  #destroyElement;

/******************************************************************************/
/* constructor                                                                */
/******************************************************************************/
  constructor() {
    super();
/*-----* shadow dom *---------------------------------------------------------*/
    const objShadowRoot = this.attachShadow({ mode:"open" });
    const objStyle      = document.createElement("style");
    const objTemplate   = document.createElement("template");

    objStyle.innerHTML = 
    `
    [part='k2go-image']     { width:90vw; height:80vh; margin:5%; background:#fff; overflow:hidden; position:relative; }
    [part='k2go-image'] img { position : absolute; top : 0px; left : 0px; width : 100%; cursor : pointer; }
    [part='k2go-destroy']   { display : none; }
    `;

    objTemplate.innerHTML = 
    `
      <button part="k2go-destroy">destroy</button>
      <div part="k2go-image">
        <img>
      </div>
    `;

    objShadowRoot.appendChild(objStyle);
    objShadowRoot.appendChild(objTemplate.content.cloneNode(true));

    this.#imageDivElement = this.shadowRoot.querySelector("[part='k2go-image']");
    this.#imgElement      = this.shadowRoot.querySelector("img");
    this.#destroyElement  = this.shadowRoot.querySelector("[part='k2go-destroy']");

    /*-----* event *--------------------------------------------------------------*/
    window.addEventListener("contextmenu", this.#ContextMenu);
    this.#setMainEvent();

  }
  /******************************************************************************/
  /* setOptions                                                                 */
  /******************************************************************************/
  setOptions(pOptions) 
  {
      Object.assign(this.#Options, pOptions);   
  };

  /******************************************************************************/
  /* getOptions                                                                 */
  /******************************************************************************/
  getOptions() 
  {
      return this.#Options;
  };
  /******************************************************************************/
  /* #setMainEvent                                                              */
  /******************************************************************************/
  #setMainEvent()
  {
    /******************************************************************************/
    /* main.wheel                                                                 */
    /******************************************************************************/    
    this.#fncWheel = (pEvent) =>
    {
      if (pEvent.cancelable) pEvent.preventDefault(); 
      if (this.#lock    ) return; else this.#lock = true; 

      var intX      = pEvent.pageX;
      var intY      = pEvent.pageY;
      var intDelta  = pEvent.deltaY ? -(pEvent.deltaY) : pEvent.wheelDelta ? pEvent.wheelDelta : -(pEvent.detail);
      this.#Options.intHeight = this.#imgElement.clientHeight;
      this.#Options.intWidth  = this.#imgElement.clientWidth;

      if (intDelta < 0) { this.#Options.intWidth = this.#Options.intWidth / (1 + this.#Options.rate); this.#Options.intHeight = this.#Options.intHeight / (1 + this.#Options.rate); }
      else              { this.#Options.intWidth = this.#Options.intWidth * (1 + this.#Options.rate); this.#Options.intHeight = this.#Options.intHeight * (1 + this.#Options.rate); }


      this.#_zoom({ x : intX, y : intY, width : this.#Options.intWidth, height : this.#Options.intHeight });
      this.#lock = false;
    };
    this.#imgElement.addEventListener( this.#strMouseWheel, this.#fncWheel, { passive: false });
    /******************************************************************************/
    /* drag                                                                       */
    /******************************************************************************/
    /*-----* start *--------------------------------------------------------------*/
    this.#fncStart =  (pEvent) => 
    {
      var $this         = this;
      try
      {
        if (pEvent.cancelable) pEvent.preventDefault(); 
        if (this.#lock       ) return; 

        var flgSingle     = this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : this.#flgTouch ? (pEvent.changedTouches.length == 1 ? true : false) : true;
        var flgDouble     = this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : this.#flgTouch ? (pEvent.changedTouches.length == 1 ? true : false) : false;
        var objBase1      = { x:0, y:0 };
        var objBase2      = { x:0, y:0 };
        var objMove1      = { x:0, y:0 };
        var objMove2      = { x:0, y:0 };
        var intBaseDis    = 0;
        var intMoveDis    = 0;
        this.#Options.intHeight = this.#imgElement.clientHeight;
        this.#Options.intWidth  = this.#imgElement.clientWidth;
        var intBaseWidth;
        var intBaseHeight;
        var intX;
        var intY;
        var fncMove;
        var fncEnd;

        if (flgSingle) {
          objBase1.x = this.#flgEvent ? pEvent.changedTouches[0].pageX : this.#flgTouch ? pEvent.touches.pageX : pEvent.pageX;
          objBase1.y = this.#flgEvent ? pEvent.changedTouches[0].pageY : this.#flgTouch ? pEvent.touches.pageY : pEvent.pageY;

          if (this.#imgElement.dataset.dbTap == "true")
          {
            this.#imgElement.removeEventListener(this.#flgTouch ? "touchend" : "mouseup", fncEnd, { passive:false })

            var intCounter = 0;

            setTimeout(function _loop()
            {
              $this.#lock = true;
              if (($this.#flgTouch ? 1 : (pEvent.which == 3 ? -1 : 1)) == -1) { 
                $this.#Options.intWidth = $this.#Options.intWidth / (1 + $this.#Options.rate); $this.#Options.intHeight = $this.#Options.intHeight / (1 + $this.#Options.rate); 
              } else { 
                $this.#Options.intWidth = $this.#Options.intWidth * (1 + $this.#Options.rate); $this.#Options.intHeight = $this.#Options.intHeight * (1 + $this.#Options.rate); 
              }
      
              $this.#_zoom({ x : objBase1.x, y : objBase1.y, width : $this.#Options.intWidth, height : $this.#Options.intHeight });

              intCounter = intCounter + 1;
              if (intCounter < 10) setTimeout(_loop, 50); else $this.#lock = false;
            }, 1);

            $this.#lock = false;
            return;
          }
          else 
          {
            this.#imgElement.dataset.dbTap = true;
            if (typeof this.#imgElement.dataset.zoomBefore == "function") setTimeout(function() { this.dataset.zoomBefore($this.#imageDivElement); }, 1);
          }

          setTimeout(function(){ $this.#imgElement.dataset.dbTap = false; }, 300);
        }
        else if (flgDouble)
        {
          objBase1      = (this.#flgEvent ? { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY } : this.#flgTouch ? { x : pEvent.touches.item(0).pageX, y : pEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY });
          objBase2      = (this.#flgEvent ? { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY } : this.#flgTouch ? { x : pEvent.touches.item(1).pageX, y : pEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY });
          intBaseDis    = Math.sqrt(Math.pow(objBase1.x - objBase2.x, 2) + Math.pow(objBase1.y - objBase2.y, 2));
          intBaseWidth  = this.#Options.intWidth;
          intBaseHeight = this.#Options.intHeight;
        }
        else
          return;
  /*-----* move *---------------------------------------------------------------*/
        fncMove = (pEvent) =>
        {
          try 
          {
            if (pEvent.cancelable) pEvent.preventDefault(); 
            if (this.#lock       ) return; 

            flgSingle = this.#flgEvent ? (pEvent.touches.length == 1 ? true : false) : this.#flgTouch ? (pEvent.changedTouches.length == 1 ? true : false) : true;
            flgDouble = this.#flgEvent ? (pEvent.touches.length == 2 ? true : false) : this.#flgTouch ? (pEvent.changedTouches.length == 2 ? true : false) : false;

            if (flgSingle)
            {
              objMove1.x = (this.#flgEvent ? pEvent.changedTouches[0].pageX : this.#flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX) - objBase1.x;
              objMove1.y = (this.#flgEvent ? pEvent.changedTouches[0].pageY : this.#flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY) - objBase1.y;
              objBase1.x = (this.#flgEvent ? pEvent.changedTouches[0].pageX : this.#flgTouch ? pEvent.touches.item(0).pageX : pEvent.pageX);
              objBase1.y = (this.#flgEvent ? pEvent.changedTouches[0].pageY : this.#flgTouch ? pEvent.touches.item(0).pageY : pEvent.pageY);
              this.#_move({ left : objMove1.x, top : objMove1.y });
            }
            else if (flgDouble)
            {
              objMove1   = this.#flgEvent ? { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY } : this.#flgTouch ? { x : pEvent.touches.item(0).pageX, y : pEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY };
              objMove2   = this.#flgEvent ? { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY } : this.#flgTouch ? { x : pEvent.touches.item(1).pageX, y : pEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY };
              intMoveDis = Math.sqrt (Math.pow(objMove1.x - objMove2.x, 2) + Math.pow(objMove1.y - objMove2.y, 2));
              this.#Options.intWidth   = Math.floor(intBaseWidth  * (intMoveDis / intBaseDis));
              this.#Options.intHeight  = Math.floor(intBaseHeight * (intMoveDis / intBaseDis));
              intX       = Math.floor((objMove1.x + objMove2.x) / 2);
              intY       = Math.floor((objMove1.y + objMove2.y) / 2);

              if (!this.#lock)
              {
                this.#lock = true;
                this.#_zoom({ x : intX, y : intY, width : this.#Options.intWidth, height : this.#Options.intHeight });
                this.#lock =  false;
              }
            }
          }
          catch(pError)
          {
            console.error("k2goImageViewer mousemove error: " + pError);
          }
        };

        document.addEventListener(this.#flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
  /*-----* end *----------------------------------------------------------------*/
        fncEnd = (pEvent) =>
        {
          try
          {
            document.removeEventListener( this.#flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
            document.removeEventListener( this.#flgTouch ? "touchend" : "mouseup", fncEnd, { passive:false });

            if (flgSingle)
            {
              if (typeof this.#imgElement.dataset.moveAfter == "function") setTimeout(function() { $this.#imgElement.dataset.moveAfter(this.#imgElement); }, 1);
            }
            else if (flgDouble)
            {
              if (this.#lock       ) return;
              this.#_zoom({ x : intX, y : intY, width : this.#Options.intWidth, height : this.#Options.intHeight });
              this.#lock =  false;
            }
          }
          catch(pError)
          {
            console.error("k2goImageViewer mouseup error: " + pError);
          }
        };

      document.addEventListener(this.#flgTouch ? "touchend" : "mouseup", fncEnd, { passive:false });
      }
      catch(pError)
      {
        console.error("k2goImageViewer mousedown error: " + pError);
      }
    };

    this.#imgElement.addEventListener(this.#flgTouch ? "touchstart" : "mousedown", this.#fncStart);
    /******************************************************************************/
    /* destroy                                                                    */
    /******************************************************************************/
    var $this = this;
    this.#destroyElement.addEventListener("click", function() {
      $this.destroy();
    });
  };

  /******************************************************************************/
  /* destroy                                                                    */
  /******************************************************************************/
  destroy()
  {
    window.removeEventListener("contextmenu", this.#ContextMenu);
    this.#imgElement.removeEventListener( this.#strMouseWheel, this.#fncWheel, { passive: false });
    this.#imgElement.removeEventListener(this.#flgTouch ? "touchstart" : "mousedown", this.#fncStart);

    this.#imgElement.style.position = "";
    this.#imgElement.style.left     = "";
    this.#imgElement.style.top      = "";
    this.#imgElement.style.width    = this.#imgElement.naturalWidth   + "px";
    this.#imgElement.style.height   = this.#imgElement.naturalHeight  + "px";
    this.#imgElement.style.cursor   = "";

  };
  /******************************************************************************/
  /* _move                                                                      */
  /******************************************************************************/
  #_move(pPosition)
  {
    var $this = this;
    var objPosition = Object.assign (true, { left : 0, top : 0 }, pPosition);
    

    this.#imgElement.style.left = parseInt(this.#imgElement.style.left || 0) + objPosition.left + 'px';
    this.#imgElement.style.top  = parseInt(this.#imgElement.style.top  || 0) + objPosition.top  + 'px';

    if (typeof this.#move == "function") setTimeout(function() { $this.#move($this); }, 1);
  };
  /******************************************************************************/
  /* _zoom                                                                      */
  /******************************************************************************/
  #_zoom(pPosition)
  {
    var $this       = this;
    var objPosition = Object.assign({ x : null, y : null, width : null, height : null }, pPosition);
    var rect        = this.#imgElement.getBoundingClientRect();
    var intLeft     = rect.left + window.scrollX;
    var intTop      = rect.top  + window.screenY;
    var intWidth    = rect.width;
    var intHeight   = rect.height;

    if (typeof this.#imgElement.dataset.zoomBefore == "function") setTimeout(function() { this.dataset.zoomBefore($this.#imageDivElement); }, 1);

    if (objPosition.x == null                          ) objPosition.x      = intLeft + intWidth  / 2;
    if (objPosition.y == null                          ) objPosition.y      = intTop  + intHeight / 2;
    if (this.#Options.maxWidth ) objPosition.width  = objPosition.width  <= this.#Options.maxWidth  ? objPosition.width  : this.#Options.maxWidth;
    if (this.#Options.maxHeight) objPosition.height = objPosition.height <= this.#Options.maxHeight ? objPosition.height : this.#Options.maxHeight;
    if (this.#Options.minWidth ) objPosition.width  = objPosition.width  >= this.#Options.minWidth  ? objPosition.width  : this.#Options.minWidth;
    if (this.#Options.minHeight) objPosition.height = objPosition.height >= this.#Options.minHeight ? objPosition.height : this.#Options.minHeight;

    var intDiffX = (objPosition.x - intLeft) * (objPosition.width  / intWidth  - 1);
    var intDiffY = (objPosition.y - intTop ) * (objPosition.height / intHeight - 1);
    
    
    if (objPosition.width != intWidth || objPosition.height != intHeight)
    {
      this.#imgElement.style.left   = (this.#imgElement.offsetLeft - intDiffX) + "px";
      this.#imgElement.style.top    = (this.#imgElement.offsetTop  - intDiffY) + "px";
      this.#imgElement.style.width  = objPosition.width  + "px";
      this.#imgElement.style.height = objPosition.height + "px"; 
      
      if (typeof this.#zoom == "function") setTimeout(function() { $this.#zoom($this); }, 1);
    }

    if (typeof $this.#imgElement.dataset.zoomAfter == "function") setTimeout(function() { $this.dataset.zoomAfter($this); }, 1);
  };

}

customElements.get("k2go-image-viewer") || customElements.define("k2go-image-viewer", K2goImageViewer);
