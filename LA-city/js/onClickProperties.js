const content = document.getElementById('click-properties-list')
const container = document.getElementById('click-properties-container')

function onClickProperties(data) {
    var html_string = '<ul>'
    for (var key in data) {
        var value = data[key];
        html_string += '<li>' + key + ' : ' + value + '</li>'
    }
    html_string += '</ul>'
    content.innerHTML = html_string
    html_string = null;
    container.style.left = "0px"


}

const close_button = document.getElementById('click-properties-close')

close_button.addEventListener('click', function () {
    container.style.left = "-480px"
})
