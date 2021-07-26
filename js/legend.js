const legend_button = document.getElementById('Legend-button');
const legend_wrapper = document.querySelector('.Legend-wrapper');


legend_button.addEventListener('click', function() {
  if (legend_wrapper.style.height === "625px") {
    legend_wrapper.style.height = "0px";
    legend_button.setAttribute('aria-label', 'Pokaż legendę');
  } else {
    legend_wrapper.style.height = "625px";
    legend_button.setAttribute('aria-label', 'Schowaj legendę');
  }
});