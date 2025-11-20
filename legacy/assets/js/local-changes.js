// show brandname in topnavigation when it's sticky
window.addEventListener("scroll", function () {
    const topnavBrandname = document.getElementById('topnavigationbrand');
    const topnavigation = document.getElementById('topnavigation');
    const distanceTopnavigation = topnavigation.getBoundingClientRect().top;
    if (distanceTopnavigation <= 0) {
        if (topnavBrandname.classList.contains('d-md-none')) {
            topnavBrandname.classList.remove('d-md-none')
        };
    } else {
        if (!topnavBrandname.classList.contains('d-md-none')) {
            topnavBrandname.classList.add('d-md-none')
        };
    };
});
