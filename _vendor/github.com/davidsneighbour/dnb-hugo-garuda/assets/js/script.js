/**********************************************************************
 * Back to top functionality
 *********************************************************************/
ready(function () {
  'use strict';
  let offset = 220;
  let backToTopLink = document.createElement('a');
  backToTopLink.href = '#';
  backToTopLink.id = 'back-to-top';
  backToTopLink.innerHTML = 'Zur&uuml;ck nach oben';
  document.body.appendChild(backToTopLink);
  window.addEventListener('scroll', function () {
    let backToTopLinkDiv = document.getElementById('back-to-top');
    let location = document.body.getBoundingClientRect();
    if (Math.abs(location.top) > offset) {
      backToTopLinkDiv.classList.add('d-block');
      backToTopLinkDiv.classList.remove('d-none');
    } else {
      backToTopLinkDiv.classList.add('d-none');
      backToTopLinkDiv.classList.remove('d-block');
    }
  });
  document.getElementById('back-to-top').addEventListener('click', function () {
    window.scroll({top: 0, left: 0, behavior: 'smooth'});
    return false;
  });
});

/**********************************************************************
 * Datediff shortcode functionality
 *********************************************************************/
ready(function () {
  'use strict';
  let elements = document.querySelectorAll('.is--datediff');
  Array.prototype.forEach.call(elements, function (el) {
    let $date1 = moment(el.getAttribute('data-date'));
    let $date2 = moment(new Date());
    let $type = el.getAttribute('data-type');
    if ($type === 'months') {
      el.textContent = parseInt($date2.diff($date1, 'months'));
    } else {
      el.textContent = $date2.diff($date1, 'days') + 1;
    }
  });
});

/**********************************************************************
 * make navbar static on scroll
 *********************************************************************/
ready(function () {
  'use strict';
  let bottom = false;
  window.addEventListener('scroll', function () {
    'use strict';
    let menu = document.getElementById('topnavigation');
    let offset = menu.getBoundingClientRect();
    if (bottom === false) {
      bottom = offset.top;
    }
    let bodyOffset = window.pageYOffset || document.documentElement.scrollTop;
    if (bodyOffset > bottom) {
      menu.classList.add('navbar-fixed-top');
    } else {
      menu.classList.remove('navbar-fixed-top');
    }
  });
});
