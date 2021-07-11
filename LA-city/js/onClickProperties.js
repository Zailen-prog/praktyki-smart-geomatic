const div_element = document.getElementById('click_properties')
function onClickProperties(data) {
    var html_string = '<ul>'
    for (var key in data) {
        var value = data[key];
        html_string += '<li>' + key + ' : ' + value + '</li>'
    }
    html_string += '</ul>'
    div_element.innerHTML = html_string
    html_string = null;
    div_element.style.left = "0px"
}
