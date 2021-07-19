const legend_button = document.getElementById('Legend-button');
const legend_container = document.getElementById('Legend-container');


legend_button.addEventListener('click', function () {
    var matrix = new WebKitCSSMatrix(getComputedStyle(legend_container).transform)
    if (matrix.m11 === 0) {
        legend_container.style.transform = "scale(1)"
    }
    else {
        legend_container.style.transform = "scale(0)"
    }
});