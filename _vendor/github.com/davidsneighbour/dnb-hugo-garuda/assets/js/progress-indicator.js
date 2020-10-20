/*global l32n:true*/
jQuery(document).ready(function($) {

  let winHeight = $(window).height();
  let docHeight = $(document).height();
  let progressBar = $('#readingprogress .progress-bar');
  let max;
  let value;

  max = docHeight - winHeight;
  progressBar.attr('max', max);
  $(document).on('scroll', function(){
     value = $(window).scrollTop();
     let val = (100 * value)/max;
     progressBar.attr('value', value);
     progressBar.attr('style', 'width: ' + val + '%');
  }).trigger('scroll');

  $(window).on('resize', function() {
    winHeight = $(window).height();
    docHeight = $(document).height();
    max = docHeight - winHeight;
    progressBar.attr('max', max);
    $(document).trigger('scroll');
  });

});
