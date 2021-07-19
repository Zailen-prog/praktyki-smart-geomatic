const properties_container = document.getElementById('properties-panel-container')
const properties_open_button = document.getElementById('properties-panel-button')

properties_open_button.addEventListener('click', function () {
    properties_open_button.children[0].classList.toggle('open')
    if (getComputedStyle(properties_container).bottom === "0px") {
        properties_container.style.bottom = "-40%"
    }
    else {
        properties_container.style.bottom = "0px"
    }
})