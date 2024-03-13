// import lazySizes from './lazysizes';

// // https://github.com/aFarkas/lazysizes
// // needs to be called explicitly, because webpack can't see into uncompiled hugo
// lazySizes.init();

/*******************************************************************************
 * Datediff shortcode functionality
 ******************************************************************************/
let elements = document.querySelectorAll(".is--datediff");
Array.prototype.forEach.call(elements, function (el) {
	var date1 = new Date(el.getAttribute("data-date"));
	var date2 = new Date();
	var Difference_In_Time = date2.getTime() - date1.getTime();
	var Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
	el.textContent = Math.floor(Difference_In_Days);
});

/*******************************************************************************
 * make navbar static on scroll
 ******************************************************************************/
let bottom = false;
window.addEventListener("scroll", function () {
	"use strict";
	let menu = document.getElementById("topnavigation");
	let offset = menu.getBoundingClientRect();
	if (bottom === false) {
		bottom = offset.top;
	}
	let bodyOffset = window.pageYOffset || document.documentElement.scrollTop;
	if (bodyOffset > bottom) {
		menu.classList.add("navbar-fixed-top");
	} else {
		menu.classList.remove("navbar-fixed-top");
	}
});

/*******************************************************************************
 * Back to top functionality
 ******************************************************************************/
let offset = 220;
let backToTopLink = document.createElement("a");
backToTopLink.href = "#";
backToTopLink.id = "back-to-top";
backToTopLink.innerHTML = "Zur&uuml;ck nach oben";
document.body.appendChild(backToTopLink);
window.addEventListener("scroll", function () {
	let backToTopLinkDiv = document.getElementById("back-to-top");
	let location = document.body.getBoundingClientRect();
	if (Math.abs(location.top) > offset) {
		backToTopLinkDiv.classList.add("d-block");
		backToTopLinkDiv.classList.remove("d-none");
	} else {
		backToTopLinkDiv.classList.add("d-none");
		backToTopLinkDiv.classList.remove("d-block");
	}
});
document.getElementById("back-to-top").addEventListener("click", function () {
	window.scroll({ top: 0, left: 0, behavior: "smooth" });
	return false;
});
