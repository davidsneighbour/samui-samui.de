jQuery(document).ready(function ($) {

  'use strict';

  // back to top link
  let offset = 220;
  let duration = 500;
  jQuery('body').append('<a href="#" id="back-to-top">Zur&uuml;ck nach oben</a>');
  jQuery(window).scroll(function () {
      if (jQuery(this).scrollTop() > offset) {
          jQuery('#back-to-top').fadeIn(duration);
      } else {
          jQuery('#back-to-top').fadeOut(duration);
      }
  });
  jQuery('#back-to-top').on('click', function (event) {
      event.preventDefault();
      //jQuery('html, body').animate({scrollTop: 0}, 1000, 'swing');
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      return false;
  });

  jQuery('.is-datediff').each(function(){
    let $this = $(this);
    let $date1 = moment($this.data('from'));
    let $date2 = moment(new Date());
    $this.text($date2.diff($date1, 'days')+1);
  });

  jQuery('.is-datediff-month').each(function(){
    let $this = $(this);
    let $date1 = moment($this.data('from'));
    let $date2 = moment(new Date());
    $this.text(parseInt($date2.diff($date1, 'months')));
  });

  jQuery('.is--datediff').each(function(){
      let $this = $(this);
      let $date1 = moment($this.data('date'));
      let $date2 = moment(new Date());
      let $type = $this.data('type');
      if ($type === 'months'){
          $this.text(parseInt($date2.diff($date1, 'months')));
      } else {
          $this.text($date2.diff($date1, 'days')+1);
      }
  });

  // cookieconsent
  // https://cookieconsent.osano.com/documentation/javascript-api/
  window.cookieconsent.initialise({
    "theme": "edgeless",
    "position": "bottom-right",
    "type": "info",
    "revokable": false,
    "content": {
      "message": "Auf dieser Webseite werden Cookies genutzt, um Funktionen und Vorg&auml;nge zu gew&auml;hrleisten, die seit Jahrzehnten so im Internet funktioniert haben.",
      "allow": "Yeah, Cookies!!!1Eins",
      "dismiss": "Yeah, Cookies!!!1Eins",
      "deny": "Keine Cookies f&uuml;r mich.",
      "link": "Weitere Informationen",
      "href": "/datenschutzerklaerung/"
    }
  });
});

// make navbar static on scroll
let bottom = false;
jQuery(window).scroll(function () {
    'use strict';
    let menu = jQuery('#topnavigation');
    let offset = menu.offset();
    if (bottom === false) {
        bottom = offset.top;
    }
    if (jQuery(window).scrollTop() > bottom) {
        menu.addClass('navbar-fixed-top');
    } else {
        menu.removeClass('navbar-fixed-top');
    }
});
