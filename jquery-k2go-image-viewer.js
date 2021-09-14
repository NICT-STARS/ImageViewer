;(function($){ var objMethods = {
/******************************************************************************/
/* k2go Image Viewer for JQuery Plugin                                        */
/* version 1.0.0                                                              */
/* author  Inoue Computer Service.                                            */
/* Copyright (c) k2go. All rights reserved.                                   */
/* See License.txt for the license information.                               */
/******************************************************************************/
/******************************************************************************/
/* initialize                                                                 */
/******************************************************************************/
  initialize : function(pOptions)
  {
/*-----* variable *-----------------------------------------------------------*/
    var flgTouch      = "ontouchstart"      in window;
    var flgEvent      = flgTouch && "event" in window;
    var strMouseWheel = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";
    var $this         = this;

    $this.addClass("k2go-image-viewer");
    $this.css     ({ position : "absolute", top : "0px", left : "0px", width : "100%", cursor : "pointer" });
    $this.on      ("contextmenu.k2goImageViewer", function(){ return false; });
/*-----* options *------------------------------------------------------------*/
    $this.data("options.k2goImageViewer", $.extend(true,
    {
      rate       : 0.1,
      maxWidth   : $this.width () * 10,
      maxHeight  : $this.height() * 10,
      minWidth   : $this.width () /  2,
      minHeight  : $this.height() /  2
    }, pOptions));
/******************************************************************************/
/* this.wheel                                                                 */
/******************************************************************************/
    $this.on(strMouseWheel + ".k2goImageViewer", function(pEvent)
    {
      if (flgEvent                          ) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }
      if ($this.data("lock.k2goImageViewer")) return;                                          else $this.data("lock.k2goImageViewer", true);

      var intX      = pEvent.pageX;
      var intY      = pEvent.pageY;
      var intDelta  = pEvent.originalEvent.deltaY ? -(pEvent.originalEvent.deltaY) : pEvent.originalEvent.wheelDelta ? pEvent.originalEvent.wheelDelta : -(pEvent.originalEvent.detail);
      var intWidth  = $this.width ();
      var intHeight = $this.height();

      if (intDelta < 0) { intWidth = intWidth / (1 + $this.data("options.k2goImageViewer").rate); intHeight = intHeight / (1 + $this.data("options.k2goImageViewer").rate); }
      else              { intWidth = intWidth * (1 + $this.data("options.k2goImageViewer").rate); intHeight = intHeight * (1 + $this.data("options.k2goImageViewer").rate); }

      _zoom({ x : intX, y : intY, width : intWidth, height : intHeight });

      $this.data("lock.k2goImageViewer", false);
    });
/******************************************************************************/
/* this.drag                                                                  */
/******************************************************************************/
/*-----* start *--------------------------------------------------------------*/
    $.each(["touchstart", "mousedown"], function()
    {
      var flgTouch = this == "touchstart" ? true : false;

      $this.on((flgTouch ? "touchstart" : "mousedown") + ".k2goImageViewer", function(pEvent)
      {
        try
        {
          if (flgEvent) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }
          if ($this.data("lock.k2goImageViewer")) return;

          var flgSingle     = flgEvent ? (event.touches.length == 1 ? true : false) : flgTouch ? (pEvent.originalEvent.touches.length == 1 ? true : false) : true;
          var flgDouble     = flgEvent ? (event.touches.length == 2 ? true : false) : flgTouch ? (pEvent.originalEvent.touches.length == 2 ? true : false) : false;
          var objBase1      = { x:0, y:0 };
          var objBase2      = { x:0, y:0 };
          var objMove1      = { x:0, y:0 };
          var objMove2      = { x:0, y:0 };
          var intBaseDis    = 0;
          var intMoveDis    = 0;
          var intWidth      = $this.width ();
          var intHeight     = $this.height();
          var intBaseWidth;
          var intBaseHeight;
          var intX;
          var intY;

          if (flgSingle)
          {
            objBase1.x = flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX;
            objBase1.y = flgEvent ? event.changedTouches[0].pageY : flgTouch ? pEvent.originalEvent.touches.item(0).pageY : pEvent.pageY;

            if ($this.data("dblTap.k2goImageViewer"))
            {
              $(document).off ((flgTouch ? "touchend" : "mouseup") + ".k2goImageViewer");
              $this      .data("lock.k2goImageViewer", true);

              var intCounter = 0;

              setTimeout(function _loop()
              {
                if ((flgTouch ? 1 : (pEvent.which == 3 ? -1 : 1)) == -1) { intWidth = intWidth / (1 + $this.data("options.k2goImageViewer").rate); intHeight = intHeight / (1 + $this.data("options.k2goImageViewer").rate); }
                else                                                     { intWidth = intWidth * (1 + $this.data("options.k2goImageViewer").rate); intHeight = intHeight * (1 + $this.data("options.k2goImageViewer").rate); }

                _zoom({ x : objBase1.x, y : objBase1.y, width : intWidth, height : intHeight });
                intCounter++;

                if (intCounter < 10) setTimeout(_loop, 50); else $this.data("lock.k2goImageViewer", false);
              }, 1);

              $this.data("dblTap.k2goImageViewer", false);
              return;
            }
            else
            {
              $this.data("dblTap.k2goImageViewer", true);
              if (typeof $this.data("options.k2goImageViewer").moveBefore == "function") setTimeout(function() { $this.data("options.k2goImageViewer").moveBefore($this); }, 1);
            }

            setTimeout(function(){ $this.data("dblTap.k2goImageViewer", false); }, 300);
          }
          else if (flgDouble)
          {
            objBase1      = (flgEvent ? { x : event.touches[0].pageX, y : event.touches[0].pageY } : flgTouch ? { x : pEvent.originalEvent.touches.item(0).pageX, y : pEvent.originalEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY });
            objBase2      = (flgEvent ? { x : event.touches[1].pageX, y : event.touches[1].pageY } : flgTouch ? { x : pEvent.originalEvent.touches.item(1).pageX, y : pEvent.originalEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY });
            intBaseDis    = Math.sqrt(Math.pow(objBase1.x - objBase2.x, 2) + Math.pow(objBase1.y - objBase2.y, 2));
            intBaseWidth  = intWidth;
            intBaseHeight = intHeight;
          }
          else
            return;
/*-----* move *---------------------------------------------------------------*/
          var fncMove = function(pEvent)
          {
            try
            {
              if (flgEvent) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }

              flgSingle = flgEvent ? (event.touches.length == 1 ? true : false) : flgTouch ? (pEvent.originalEvent.touches.length == 1 ? true : false) : true;
              flgDouble = flgEvent ? (event.touches.length == 2 ? true : false) : flgTouch ? (pEvent.originalEvent.touches.length == 2 ? true : false) : false;

              if (flgSingle)
              {
                objMove1.x = (flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX) - objBase1.x;
                objMove1.y = (flgEvent ? event.changedTouches[0].pageY : flgTouch ? pEvent.originalEvent.touches.item(0).pageY : pEvent.pageY) - objBase1.y;
                objBase1.x = (flgEvent ? event.changedTouches[0].pageX : flgTouch ? pEvent.originalEvent.touches.item(0).pageX : pEvent.pageX);
                objBase1.y = (flgEvent ? event.changedTouches[0].pageY : flgTouch ? pEvent.originalEvent.touches.item(0).pageY : pEvent.pageY);
                _move({ left : objMove1.x, top : objMove1.y });
              }
              else if (flgDouble)
              {
                objMove1   = flgEvent ? { x : event.touches[0].pageX, y : event.touches[0].pageY } : flgTouch ? { x : pEvent.originalEvent.touches.item(0).pageX, y : pEvent.originalEvent.touches.item(0).pageY } : { x : pEvent.touches[0].pageX, y : pEvent.touches[0].pageY };
                objMove2   = flgEvent ? { x : event.touches[1].pageX, y : event.touches[1].pageY } : flgTouch ? { x : pEvent.originalEvent.touches.item(1).pageX, y : pEvent.originalEvent.touches.item(1).pageY } : { x : pEvent.touches[1].pageX, y : pEvent.touches[1].pageY };
                intMoveDis = Math.sqrt (Math.pow(objMove1.x - objMove2.x, 2) + Math.pow(objMove1.y - objMove2.y, 2));
                intWidth   = Math.floor(intBaseWidth  * (intMoveDis / intBaseDis));
                intHeight  = Math.floor(intBaseHeight * (intMoveDis / intBaseDis));
                intX       = Math.floor((objMove1.x + objMove2.x) / 2);
                intY       = Math.floor((objMove1.y + objMove2.y) / 2);

                if (!$this.data("lock.k2goImageViewer"))
                {
                  $this.data("lock.k2goImageViewer", true);
                  _zoom({ x : intX, y : intY, width : intWidth, height : intHeight });
                  $this.data("lock.k2goImageViewer", false);
                }
              }
            }
            catch(pError)
            {
              console.error("jQuery.k2goImageViewer mousemove error: " + pError);
            }
          };

          document.addEventListener(flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
/*-----* end *----------------------------------------------------------------*/
          $(document).one((flgTouch ? "touchend" : "mouseup") + ".k2goImageViewer", function(pEvent)
          {
            try
            {
              if (flgEvent) { if(event.cancelable) event.preventDefault(); } else { if(pEvent.cancelable) pEvent.preventDefault(); }

                document .removeEventListener( flgTouch ? "touchmove" : "mousemove", fncMove, { passive: false });
              $(document).off                ((flgTouch ? "touchend"  : "mouseup"  ) + ".k2goImageViewer");

              if (flgSingle)
              {
                if (typeof $this.data("options.k2goImageViewer").moveAfter == "function") setTimeout(function() { $this.data("options.k2goImageViewer").moveAfter($this); }, 1);
              }
              else if (flgDouble)
              {
                _zoom({ x : intX, y : intY, width : intWidth, height : intHeight });
              }
            }
            catch(pError)
            {
              console.error("jQuery.k2goImageViewer mouseup error: " + pError);
            }
          });
        }
        catch(pError)
        {
          console.error("jQuery.k2goImageViewer mousedown error: " + pError);
        }
      });
    });
  },
/******************************************************************************/
/* setOptions                                                                 */
/******************************************************************************/
  setOptions : function(pOptions)
  {
    $.extend($(".k2go-image-viewer").data("options.k2goImageViewer"), pOptions);
  },
/******************************************************************************/
/* getOptions                                                                 */
/******************************************************************************/
  getOptions : function()
  {
    var $main = $(".k2go-image-viewer");

    return {
      rate      : $main.data("options.k2goImageViewer").rate,
      maxWidth  : $main.data("options.k2goImageViewer").maxWidth,
      maxHeight : $main.data("options.k2goImageViewer").maxHeight,
      minWidth  : $main.data("options.k2goImageViewer").minWidth,
      minHeight : $main.data("options.k2goImageViewer").minHeight,
      zoom      : $main.data("options.k2goImageViewer").zoom,
      move      : $main.data("options.k2goImageViewer").move
    };
  },
/******************************************************************************/
/* destroy                                                                    */
/******************************************************************************/
  destroy : function()
  {
    var $this         = $(".k2go-image-viewer");
    var strMouseWheel = "onwheel" in document ? "wheel" : "onmousewheel" in document ? "mousewheel" : "DOMMouseScroll";

    $this.off        (     "contextmenu.k2goImageViewer");
    $this.off        (strMouseWheel + ".k2goImageViewer");
    $this.off        (      "touchstart.k2goImageViewer mousedown.k2goImageViewer");
    $this.css        ({ position : "", left : "", top : "", width : "", height : "", cursor : "" });
    $this.removeClass("k2go-image-viewer");
  }
};
/******************************************************************************/
/* _move                                                                      */
/******************************************************************************/
function _move(pPosition)
{
  var $this       = $(".k2go-image-viewer");
  var objPosition = $.extend(true, { left : 0, top : 0 }, pPosition);

  $this.css({ left:"+=" + objPosition.left, top:"+=" + objPosition.top });

  if (typeof $this.data("options.k2goImageViewer").move == "function") setTimeout(function() { $this.data("options.k2goImageViewer").move($this); }, 1);
}
/******************************************************************************/
/* _zoom                                                                      */
/******************************************************************************/
function _zoom(pPosition)
{
  var $this       = $(".k2go-image-viewer");
  var objPosition = $.extend(true, { x : null, y : null, width : null, height : null }, pPosition);
  var intLeft     = $this.offset().left;
  var intTop      = $this.offset().top;
  var intWidth    = $this.width ();
  var intHeight   = $this.height();

  if (typeof $this.data("options.k2goImageViewer").zoomBefore == "function") setTimeout(function() { $this.data("options.k2goImageViewer").zoomBefore($this); }, 1);

  if (objPosition.x == null                          ) objPosition.x      = intLeft + intWidth  / 2;
  if (objPosition.y == null                          ) objPosition.y      = intTop  + intHeight / 2;
  if ($this.data("options.k2goImageViewer").maxWidth ) objPosition.width  = objPosition.width  <= $this.data("options.k2goImageViewer").maxWidth  ? objPosition.width  : $this.data("options.k2goImageViewer").maxWidth;
  if ($this.data("options.k2goImageViewer").maxHeight) objPosition.height = objPosition.height <= $this.data("options.k2goImageViewer").maxHeight ? objPosition.height : $this.data("options.k2goImageViewer").maxHeight;
  if ($this.data("options.k2goImageViewer").minWidth ) objPosition.width  = objPosition.width  >= $this.data("options.k2goImageViewer").minWidth  ? objPosition.width  : $this.data("options.k2goImageViewer").minWidth;
  if ($this.data("options.k2goImageViewer").minHeight) objPosition.height = objPosition.height >= $this.data("options.k2goImageViewer").minHeight ? objPosition.height : $this.data("options.k2goImageViewer").minHeight;

  var intDiffX = (objPosition.x - intLeft) * (objPosition.width  / intWidth  - 1);
  var intDiffY = (objPosition.y - intTop ) * (objPosition.height / intHeight - 1);

  if (objPosition.width != intWidth || objPosition.height != intHeight)
  {
    $this.css({ left : "-=" + intDiffX, top : "-=" + intDiffY, width : objPosition.width + "px", height : objPosition.height+ "px" });
    if (typeof $this.data("options.k2goImageViewer").zoom == "function") setTimeout(function() { $this.data("options.k2goImageViewer").zoom($this); }, 1);
  }

  if (typeof $this.data("options.k2goImageViewer").zoomAfter == "function") setTimeout(function() { $this.data("options.k2goImageViewer").zoomAfter($this); }, 1);
}
/******************************************************************************/
/* entry point                                                                */
/******************************************************************************/
$.fn.k2goImageViewer = function(pMethod)
{
       if (typeof pMethod == "object" || !pMethod) return objMethods["initialize"].apply(this, arguments);
  else if (objMethods[pMethod]                   ) return objMethods[pMethod     ].apply(this, Array.prototype.slice.call(arguments, 1));
  else                                             $.error("Method " +  pMethod + " does not exist on jQuery.k2goImageViewer");
};})(jQuery);
