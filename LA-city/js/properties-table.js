const properties_container = document.getElementById('properties-table-container')
const properties_hide_button = document.getElementById('properties-table-hide-button')

properties_hide_button.addEventListener('click', function() {
  if (getComputedStyle(properties_container).bottom === "0px") {
    properties_container.style.bottom = "-50%"
  } else {
    properties_container.style.bottom = "0px"
  }
})