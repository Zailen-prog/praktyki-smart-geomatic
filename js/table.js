var table_state = {
  'data': [],
  'page': 1,
  'rows': 10,
}

var max_pages;

const columns = [
  'obiekt',
  'gatunek',
  'nazwa',
  'typ',
  'podtyp',
  'data utworzenia',
  'województwo',
  'powierzchnia',
];

var filters = {
  'obiekt': 'Wszystko',
  'gatunek': 'Wszystko',
  'nazwa': 'Wszystko',
  'typ': 'Wszystko',
  'podtyp': 'Wszystko',
  'data utworzenia': 'Wszystko',
  'województwo': 'Wszystko',
  'powierzchnia': 'Wszystko',
}

const table_wrapper = document.getElementById('table-wrapper');
const table_open_button = document.getElementById('table-show-button');
const table_open = document.querySelector("#table-open");
const table_close = document.querySelector("#table-close");

// close/open table button
table_open_button.addEventListener('click', function() {
  if (getComputedStyle(table_wrapper).bottom === "0px") {
    table_wrapper.style.bottom = "-50%";
    table_open_button.setAttribute('aria-label', 'Otwórz tabelę');
    table_open_button.style.top = "-80px";
    table_open_button.style.right = "30px";
    table_open_button.style.boxShadow = '0 1px 4px var(--box-shadow-color)';
    table_open_button.style.borderRadius = '20%';
    table_open.style.display = "block";
    table_close.style.display = "none";
    document.getElementById('click-properties-container').style.height = "100%";
  } else {
    table_wrapper.style.bottom = "0px";
    table_open_button.setAttribute('aria-label', 'Zamknij tabelę');
    table_open_button.style.top = "10px";
    table_open_button.style.right = "10px";
    table_open_button.style.boxShadow = "none";
    table_open_button.style.borderRadius = '0px';
    document.getElementById('click-properties-container').style.height = "50%";
    table_open.style.display = "none";
    table_close.style.display = "block";
  }
})

const filter_mask = document.querySelector('.filter-mask');

filter_mask.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-mask')) {
    filter_wrapper.style.display = 'none';
    filter_wrapper.style.transform = 'scale(0)';
    filter_mask.style.display = 'none';
  }
})

const filter_open = document.querySelector('.table-filter-open');
const filter_wrapper = document.querySelector('.filter-wrapper');
filter_open.addEventListener('click', () => {
  filter_wrapper.style.display = 'block';
  filter_wrapper.style.transform = 'scale(1)';
  filter_mask.style.display = 'block';
})

const filter_close = document.querySelector('.filter-close-button');
filter_close.addEventListener('click', () => {
  filter_wrapper.style.display = 'none';
  filter_wrapper.style.transform = 'scale(0)';
  filter_mask.style.display = 'none';
})

const filter_selects = document.querySelectorAll('.filter-selects-wrapper div');
filter_selects.forEach(select => {
  select.addEventListener('click', () => {
    const select_options = document.querySelector(`.filter-select-options[data-name="${select.getAttribute('aria-label')}"]`);
    document.querySelector('.filter-options').style.display = 'block';
    select_options.style.display = "block";
    var rect = select.getBoundingClientRect();
    select_options.style.width = `${select.offsetWidth}px`;
    if (select_options.offsetHeight > window.innerHeight - rect.bottom) {
      select_options.style.bottom = '20px';
    } else {
      select_options.style.top = `${rect.top}px`;
    }

    if (select_options.offsetWidth > window.innerWidth - rect.left) {
      select_options.style.right = '20px';
    } else {
      select_options.style.left = `${rect.left}px`;
    }
  })
})

const filter_options = document.querySelector('.filter-options');
filter_options.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-options')) {
    filter_options.style.display = 'none';
    document.querySelectorAll('.filter-select-options').forEach(select => {
      select.style.display = 'none';
    })
  }
})

const pagination_prev = document.querySelector('.table-pagination-prev');
pagination_prev.disabled = true;
pagination_prev.addEventListener('click', () => {
  pagination_next.disabled = false;
  table_state.page--;
  if (table_state.page == 1) pagination_prev.disabled = true;
  buildTableData();
})

const pagination_next = document.querySelector('.table-pagination-next');
pagination_next.addEventListener('click', () => {
  pagination_prev.disabled = false;
  table_state.page++;
  if (table_state.page == max_pages) pagination_next.disabled = true;
  buildTableData();
})

const pagination_curr = document.querySelector('.table-pagination-curr');
pagination_curr.value = table_state.page;
pagination_curr.addEventListener('change', () => {
  let v = parseInt(pagination_curr.value);
  if (v < 1) {
    pagination_curr.value = 1;
  } else if (v > max_pages) {
    pagination_curr.value = max_pages;
  } else if (!v) {
    pagination_curr.value = 1;
  }

  table_state.page = pagination_curr.value;

  buildTableData();
})

const pagination_select = document.querySelector('.table-pagination-rows-select');
table_state.rows = pagination_select.value;

pagination_select.addEventListener('change', () => {
  table_state.rows = pagination_select.value;
  buildTableData();
})


// top filter option
PomnikiDataPromise
  .then(() => {
    table_state.data = geoData.features;
    buildTable();
  });

// filters data based on property and its value
function filterData(filter) {
  var filteredData = {
    "type": "FeatureCollection",
    "features": []
  };

  for (let i = 0; i < geoData.features.length; i++) {
    var flag = 1;
    for (var property in filter) {
      if (!(geoData.features[i].properties[property] == filter[property] || filter[property] == 'Wszystko')) {
        flag = 0;
        break;
      }
    }
    if (flag) filteredData.features.push(geoData.features[i]);
  }
  return filteredData;
}

function pagination(data, rows, page) {
  max_pages = Math.ceil(data.length / rows);
  if (page > max_pages) {
    page = max_pages;
    table_state.page = page;
  } else if (page == 0) {
    page = 1;
    table_state.page = page;
  }
  var trimStart = (page - 1) * rows;
  var trimEnd = page * rows;

  var trimmedData = data.slice(trimStart, trimEnd);
  max_pages = Math.ceil(data.length / rows);

  return trimmedData;
}

function buildTable() {
  buildTableHeader();
  buildTableData();
}

function buildTableData() {
  const table_data = document.querySelector(".table-content-data");

  var table_list = pagination(table_state.data, table_state.rows, table_state.page);

  var HTML_data = '';
  for (let row of table_list) {
    HTML_data += `<tr id=${row.geometry.coordinates}>`;

    for (let element of columns) {

      if (element == 'data utworzenia') {
        var property = new Date(row.properties[element]).toLocaleDateString();
      } else {
        var property = row.properties[element];
      }

      HTML_data += `<td data-label= ${element}>${property}</td>`;
    }

    HTML_data += `</tr>`;
  }
  table_data.innerHTML = HTML_data;
  // adding fly to on click event to each row
  document.querySelectorAll('.table-content-data tr').forEach(row => {
    row.addEventListener('click', e => {
      mapApi.flyTo({
        zoom: 22,
        center: row.id.split(',')
      });
    });
  });
  buildSelect();
  const pagination_counter = document.querySelector('.table-pagination-counter');
  if (table_state.page > 0) {
    pagination_counter.innerHTML =
      `${(table_state.page - 1) * table_state.rows + 1}
     - ${(table_state.page * table_state.rows) + 1 > table_state.data.length
        ? table_state.data.length :
        (table_state.page * table_state.rows) + 1}
      z ${table_state.data.length}`;
  } else {
    pagination_counter.innerHTML =
      `0 - 0 z 0`;
  }
  pagination_curr.value = table_state.page;

  updateButtons();
}

function buildTableHeader() {
  const table_header = document.querySelector(".table-content-header");

  var HTML_header = `<tr>`;
  columns.forEach(column => {
    HTML_header += `<th>${column}<div /></th>`;
  });
  HTML_header += `</tr>`;
  table_header.innerHTML = HTML_header;

  const table_columns = document.querySelectorAll(".table-content-header th");

  var order = {};
  table_columns.forEach(column => {
    const content = column.textContent;
    order[content] = 'asc';
    column.addEventListener('click', () => {
      const arrow = column.querySelector('div');
      order[content] = order[content] == 'asc' ? 'desc' : 'asc';
      document.querySelectorAll(".table-content-header th div")
        .forEach(el => el.innerHTML = '');
      if (order[content] == 'asc') {
        arrow.innerHTML = '&#9650';
      } else {
        arrow.innerHTML = '&#9660';
      }
      table_state.data = sortData(table_state.data, content, order[content]);
      buildTableData();
    })
  })
}

function buildSelect() {
  const selects = document.querySelectorAll('.filter-selects-wrapper div')
  selects.forEach(select => {
    var aria_label = select.getAttribute('aria-label');
    var options_container = document.querySelector(`.filter-select-options[data-name='${aria_label}']`);
    var optionHTML = "";
    optionHTML += `<label>Wszystko
    <input type=\"radio\" name=${aria_label} value="Wszystko"></label>`;
    var options = findUniqueValues(aria_label);
    for (let i = 0; i < options.length; i++) {
      optionHTML += `<label>${options[i]}
      <input type=\"radio\" name=${aria_label} value="${options[i]}"></label>`;
    }
    // console.log(optionHTML)
    options_container.innerHTML = optionHTML;
    options_container.querySelectorAll('input').forEach(option => {
      option.addEventListener('click', (event) => {
        event.cancelBubble = true;
        event.preventDefault();
        options_container.style.display = "none";
        filter_options.style.display = 'none';
        select.querySelector('span').innerHTML = option.value;

        filters[aria_label] = option.value;
        var filtered_data = filterData(filters);
        table_state.data = filtered_data.features;
        PomnikiDataPromise.then(dataset => dataset.setData(filtered_data));
        buildTableData();
      });
    });
  });
}

function findUniqueValues(property) {
  var lookup = {};
  var items = table_state.data;
  var result = [];

  for (var item, i = 0; item = items[i++];) {

    var name = item.properties[property];
    if (!(name in lookup)) {
      lookup[name] = 1;
      result.push(name);
    }
  }
  return result;
}

function sortData(data, property, order = 'desc') {
  if (order == 'asc') {
    // if(property == 'data utworzenia' || property == 'powierzchnia')
    return data.sort((a, b) => a.properties[property].localeCompare(b.properties[property]));
  }
  return data.sort((a, b) => b.properties[property].localeCompare(a.properties[property]));
}

function updateButtons() {
  var page = table_state.page;
  if (page > 1 && page < max_pages) {
    pagination_next.disabled = false;
    pagination_prev.disabled = false;
  }
  if (page == max_pages) {
    pagination_next.disabled = true;
    pagination_prev.disabled = false;
  }
  if (page == 1) {
    pagination_next.disabled = false;
    pagination_prev.disabled = true;
  }
}