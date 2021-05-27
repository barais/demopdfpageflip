
var pdfjsLib = window['pdfjs-dist/build/pdf'];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.js';

'use strict';


const DEFAULT_URL = "/src/img/file.pdf";
// To test the AcroForm and/or scripting functionality, try e.g. this file:
// var DEFAULT_URL = "../../test/pdfs/160F-2019.pdf";

const SEARCH_FOR = ""; // try 'Mozilla';

// For scripting support, note also `enableScripting` below.
//const SANDBOX_BUNDLE_SRC = "../../node_modules/pdfjs-dist/build/pdf.sandbox.js";

const container1 = document.getElementById("viewerContainer");

const PAGE_TO_VIEW = 1;
const SCALE = 1.0;

const container = document.getElementById("pageContainer");


const eventBus = new pdfjsViewer.EventBus();
const CSS_UNITS = 96/72;

let loadedpages = [];
let currentPage = 0;
let pdfDocument ={};
let height = 0;
let render = {};

// Loading document.
const loadingTask = pdfjsLib.getDocument({
  url: DEFAULT_URL,
  //  cMapUrl: CMAP_URL,
  //  cMapPacked: CMAP_PACKED,
});

window.addEventListener('resize', function(event){console.log(event)})

window.onresize  = ( () => {
  setTimeout(() => {
    console.log("resize")
    var w = document.documentElement.clientWidth;
      var h = document.documentElement.clientHeight;
      console.log("h "+ h +  " w " +w)
      console.log("h "+ window.innerHeight +  " w " +window.innerWidth)
    clean();
    console.log(currentPage)
    console.log(height)
    drawpdf(currentPage)
      
  }, 0);

});

function clean() {
  loadedpages = [];  
  document.querySelectorAll('.page').forEach(e => e.remove());
}



function drawpdf(page){
  console.log(render)
  let scale = render.boundsRect.height / height

  for (let i = page; i < page + 4; i++) {
    if (!loadedpages.includes(i)) {
      loadedpages.push(i);
      pdfDocument.getPage(i + 1).then((pdfPage) => {
        // Creating the page view with default parameters.
        const pdfPageView = new pdfjsViewer.PDFPageView({
          container: document.getElementById("page" + i),
          id: i + 1,
          scale: scale,
          defaultViewport: pdfPage.getViewport({
            scale: scale
          }),
          eventBus,
          // We can enable text/annotations layers, if needed
          textLayerFactory: new pdfjsViewer.DefaultTextLayerFactory(),
          annotationLayerFactory: new pdfjsViewer.DefaultAnnotationLayerFactory(),
        });
        // Associates the actual page with the view, and drawing it
        pdfPageView.setPdfPage(pdfPage);
        return pdfPageView.draw();
      });

    }


  }

}

document.addEventListener('DOMContentLoaded', function () {


  //loadPdf('/src/img/file.pdf');
  loadingTask.promise.then((pdfDocument_) => {
    pdfDocument = pdfDocument_;
    for (let i = 0; i < pdfDocument.numPages; i++) {
      let $div = $("<div></div>", {
        id: "page" + i,
        "class": "mypage pdfViewer singlePageView"
      });
      $("#book").append($div);
    }
    pdfDocument.getPage(1).then((pdfPage) => {

      const width = (pdfPage._pageInfo.view[2] - pdfPage._pageInfo.view[0]) * CSS_UNITS
      height = (pdfPage._pageInfo.view[3] - pdfPage._pageInfo.view[1]) * CSS_UNITS
      console.log(document.documentElement.clientWidth * height / width);
      console.log(document.documentElement.clientHeight * width / height);

      const pageFlip = new St.PageFlip(document.getElementById('book'), {
        width: width, // base page width
        height: height, // base page height

        size: "stretch",
        // set threshold values:
        minWidth: 315,
        maxWidth: document.documentElement.clientHeight * width / height,
        minHeight: 600,
        maxHeight:document.documentElement.clientHeight / height * width,


        // draw book shadows
        drawShadow: true,

        // animation speed
        flippingTime: 500,

        // allows to switch to portrait mode
        usePortrait: true,

        // z-index property
        startZIndex: 0,

        // auto resizes the parent container to fit the book
        autoSize: true,

        // max opacity of shadow
        maxShadowOpacity: 1,

        // shows book cover
        showCover: true,

        // supports mobile scroll?
        mobileScrollSupport: true
      });
      pageFlip.on('flip', (e) => {
          currentPage = e.data;
          render = e.object.render
          drawpdf(e.data)
              });




      pageFlip.loadFromHTML(document.querySelectorAll('.mypage'));

    });



  });



  // 





});