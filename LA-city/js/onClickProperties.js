const on_click_content = document.getElementById('click-properties-list')
const on_click_container = document.getElementById('click-properties-container')

function onClickProperties(data) {
    var html_string = '<ul>'
    for (const property in data) {
        html_string += '<li>' + property + ' : ' + data[property] + '</li>'
    }
    html_string += '</ul>'
    on_click_content.innerHTML = html_string
    html_string = null;
    on_click_container.style.left = "0px"
}
