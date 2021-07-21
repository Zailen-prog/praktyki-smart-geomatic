const on_click_content = document.getElementById('click-properties-list')
const on_click_container = document.getElementById('click-properties-container')

function onClickProperties(data) {
  var html_string = '<ul>';
  for (const property in data) {
    switch (property) {
      case 'link':
        html_string += `<li>${property} : <a target="_blank" rel="noopener noreferrer" href = ${data[property]} ><b>Więcej informacji</b><a></li>`;
        break;
      case 'data_utwor':
        html_string += `<li>${property} : <b>${new Date(data[property]).toLocaleDateString()}</b></li>`;
        break;
      default:
        html_string += `<li>${property} : <b>${data[property]}</b></li>`;
    }
  }
  html_string += '</ul>';
  on_click_content.innerHTML = html_string;
  html_string = null;
  on_click_container.style.left = "0px";
}