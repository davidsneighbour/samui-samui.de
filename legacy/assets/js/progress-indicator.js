let barBg = document.getElementById("readingprogress-bg");
let body = document.body;
let html = document.documentElement;
barBg.style.minWidth = document.width + "px";

document.getElementsByTagName("body")[0].onresize = function() {
  // Update the gradient width
  barBg.style.minWidth = document.width + "px";
};

window.onscroll = function() {
  // Change the width of the progress bar
  let bar = document.getElementById("readingprogress");
  let dh  = Math.max( body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight );
  let wh  = window.innerHeight;
  let pos = pageYOffset || (document.documentElement.clientHeight ? document.documentElement.scrollTop : document.body.scrollTop);
  bar.style.width = ((pos / (dh - wh)) * 100) + "%";
};
