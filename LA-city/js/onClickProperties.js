const on_click_content = document.getElementById('click-properties-list')
const on_click_container = document.getElementById('click-properties-container')

function onClickProperties(data) {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://cors-anywhere.herokuapp.com/" + data.link, true);

    xhr.responseType = "document";

    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = xhr.responseXML.querySelectorAll("#j_idt23");
            console.log(response)
        }
    }

    xhr.onerror = function () {
        console.error(xhr.status, xhr.statusText)
    }
    xhr.send();

    var html_string = '<ul>';
    for (const property in data) {
        html_string += '<li>' + property + ' : ' + data[property] + '</li>';
    }
    html_string += '</ul>';
    on_click_content.innerHTML = html_string;
    html_string = null;
    on_click_container.style.left = "0px";
}

