/******************************************************************************/
/* Sample for k2goImageViewer                                                 */
/******************************************************************************/
import "./k2go-image-viewer.js";

/******************************************************************************/
/* window.load                                                                */
/******************************************************************************/
window.addEventListener("load", () =>
{
  var imgURL = "img/sample.png";

  let viewer          = document.querySelector('k2go-image-viewer');
  var imageDivElement = viewer.shadowRoot.querySelector("[part='k2go-image']");
  var imgElement      = viewer.shadowRoot.querySelector("img");

  imgElement.src  = imgURL;
  var height      = imageDivElement.offsetHeight + "px";
  var left        = (imageDivElement.offsetWidth  - imageDivElement.offsetHeight) / 2 + "px";

  imgElement.onload = () => {
    imgElement.style.width  = "auto";
    imgElement.style.height = height;
    imgElement.style.left   = left;

    viewer.setOptions({
      rate: 0.1,
      maxWidth  : imgElement.naturalWidth * 10,
      maxHeight : imgElement.naturalHeight * 10,
      minWidth  : imgElement.naturalWidth / 2,
      minHeight : imgElement.naturalHeight / 2,
      intWidth  : imgElement.offsetWidth,
      intHeight : imgElement.offsetHeight
    });
  }
});
