var table_state = {
  'data': [],
  'page': 1,
  'rows': 10,
};

var max_pages;

var columns = {
  'obiekt': 1,
  'gatunek': 1,
  'nazwa': 1,
  'typ': 1,
  'podtyp': 1,
  'data utworzenia': 1,
  'województwo': 1,
  'powierzchnia': 1,
};

var filters = {
  'obiekt': 'Wszystko',
  'gatunek': 'Wszystko',
  'nazwa': 'Wszystko',
  'typ': 'Wszystko',
  'podtyp': 'Wszystko',
  'data': [new Date('0001'), new Date()],
  'województwo': 'Wszystko',
  'powierzchnia': 'Wszystko',
};

var options = {};

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
    filter_mask.style.pointerEvents = 'none';
    filter_wrapper.style.transform = 'scale(0)';
  }
})

const filter_open = document.querySelector('.table-filter-open');
const filter_wrapper = document.querySelector('.filter-wrapper');
filter_open.addEventListener('click', () => {
  filter_mask.style.pointerEvents = 'auto';
  filter_wrapper.style.transform = 'scale(1)';
})

const filter_close = document.querySelector('.filter-close-button');
filter_close.addEventListener('click', () => {
  filter_wrapper.style.transform = 'scale(0)';
  filter_mask.style.pointerEvents = 'none';
})

const filter_clear = document.querySelector('.filter-clear-button');
filter_clear.addEventListener('click', () => {
  filters = {
    'obiekt': 'Wszystko',
    'gatunek': 'Wszystko',
    'nazwa': 'Wszystko',
    'typ': 'Wszystko',
    'podtyp': 'Wszystko',
    'data': [new Date('0001'), new Date()],
    'województwo': 'Wszystko',
    'powierzchnia': 'Wszystko',
  };
  var filtered_data = filterData(filters);
  table_state.data = filtered_data.features;
  PomnikiDataPromise.then(dataset => dataset.setData(filtered_data));
  buildTableData();
  const selects = document.querySelectorAll('.filter-selects-wrapper div[aria-label]');
  selects.forEach(select => {
    select.innerHTML = `<span>${filters[select.getAttribute('aria-label')]}</span>`
  })
  const select_dates = document.querySelectorAll('.filter-date input');
  select_dates.forEach(select_date => {
    if (select_date.getAttribute('name') == 'data-od') {
      select_date.value = '';
    } else {
      select_date.value = '';
    }
  })
})

const filter_selects = document.querySelectorAll('.filter-selects-wrapper div[aria-label]');
filter_selects.forEach(select => {
  select.addEventListener('click', () => {
    const select_options = document.querySelector(`.filter-select-container[data-name="${select.getAttribute('aria-label')}"]`);
    document.querySelector('.filter-options').style.pointerEvents = 'auto';
    var rect = select.getBoundingClientRect();
    select_options.style.width = `${select.offsetWidth}px`;

    if (select_options.offsetHeight > window.innerHeight - rect.bottom) {
      select_options.style.top = `${window.innerHeight - select_options.offsetHeight - 20}px`;
      // select_options.style.top = 'initial';
    } else {
      select_options.style.top = `${rect.top}px`;
      // select_options.style.bottom = 'initial';
    }

    if (select_options.offsetWidth > window.innerWidth - rect.left) {
      select_options.style.right = '20px';
      select_options.style.left = `initial`;
    } else {
      select_options.style.left = `${rect.left}px`;
      select_options.style.right = 'inital';
    }
    select_options.style.transform = "scale(1)";
  })
})

const filter_dates = document.querySelectorAll('.filter-date input');
filter_dates.forEach(filter_date => {
  filter_date.addEventListener('blur', (event) => {
    if (event.target.getAttribute('name') == 'data-od') {
      filters['data'][0] = isNaN(new Date(event.target.value)) ? new Date('0001') : new Date(event.target.value);
    } else {
      filters['data'][1] = isNaN(new Date(event.target.value)) ? new Date() : new Date(event.target.value);
    }
    var filtered_data = filterData(filters);
    table_state.data = filtered_data.features;
    PomnikiDataPromise.then(dataset => dataset.setData(filtered_data));
    buildTableData();
  })
})


const filter_options = document.querySelector('.filter-options');
filter_options.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-options')) {
    filter_options.style.pointerEvents = 'none';
    document.querySelectorAll('.filter-select-container').forEach(select => {
      select.style.transform = 'scale(0)';
      select.querySelector('input[type=\'text\']').value = '';
      select.querySelectorAll('filter-select-options label').forEach(label => {
        label.style.display = 'block';
      })
    })
  }
})

const filter_search_options = document.querySelectorAll('.filter-select-container input[type=\'text\']')
filter_search_options.forEach(search => {
  var data_name = search.getAttribute('data-name');
  search.addEventListener('keyup', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    var filtered_options = [];
    for (let i = 0; i < options[data_name].length; i++) {
      if (options[data_name][i].toLowerCase().indexOf(searchTerm) != -1) {
        filtered_options.push(options[data_name][i]);
      }
    }
    const options_container = document.querySelector(`.filter-select-container[data-name=${data_name}]`);
    buildSelectContent(options_container, filtered_options);
  })
})


const filter_columns_open = document.querySelector('.table-filter-columns');
const filter_columns_mask = document.querySelector('.filter-columns');
const filter_columns_wrapper = document.querySelector('.filter-columns-wrapper');
const filter_columns = document.querySelectorAll('.filter-select-columns');

filter_columns_open.addEventListener('click', () => {
  filter_columns_mask.style.pointerEvents = 'auto';
  filter_columns_wrapper.style.transform = 'scale(1)';
})

filter_columns_mask.addEventListener('click', (event) => {
  if (event.target.classList.contains('filter-columns')) {
    filter_columns_mask.style.pointerEvents = 'none';
    filter_columns_wrapper.style.transform = 'scale(0)';
  }
})

filter_columns.forEach(filter_column => {
  filter_column.querySelector('input').addEventListener('change', (event) => {
    if (event.target.checked) {
      filter_column.querySelector('svg').style.display = 'block';
      columns[filter_column.querySelector('span').innerText.toLowerCase()] = 1;
    } else {
      filter_column.querySelector('svg').style.display = 'none';
      columns[filter_column.querySelector('span').innerText.toLowerCase()] = 0;
    }
    buildTable();
  })
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

function filterData(filter) {
  var filteredData = {
    "type": "FeatureCollection",
    "features": []
  };

  for (let i = 0; i < geoData.features.length; i++) {
    var flag = 1;
    for (var property in filter) {
      if (property == 'data') {
        if (!(dateInRange(new Date(geoData.features[i].properties['data utworzenia']), filter[property][0], filter[property][1]))) {
          flag = 0;
          break;
        }
      } else if (!(geoData.features[i].properties[property] == filter[property] || filter[property] == 'Wszystko')) {
        flag = 0;
        break;
      }
    }
    if (flag) filteredData.features.push(geoData.features[i]);
  }
  return filteredData;
}

function dateInRange(date, start, end) {
  return (
    start <= date && date <= end
  );
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

    for (let name in columns) {
      if (columns[name]) {
        if (name == 'data utworzenia') {
          var property = new Date(row.properties[name]).toLocaleDateString();
        } else {
          var property = row.properties[name];
        }

        HTML_data += `<td data-label= ${name}>${property}</td>`;
      }
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
  buildSelects();
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
  for (let name in columns) {
    if (columns[name]) {
      HTML_header += `<th data-name='sortuj po ${name.toUpperCase()}'>${name.toUpperCase()}<div /></th>`;
    }
  };
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
        table_state.data = sortData(table_state.data, content.toLowerCase(), order[content]);
        buildTableData();
      })
      // column.addEventListener('mouseover', (event) => {
      //   getComputedStyle(column,':before')
      // })
  })
}

function buildSelects() {
  const selects = document.querySelectorAll('.filter-selects-wrapper div[aria-label]')
  selects.forEach(select => {
    var aria_label = select.getAttribute('aria-label');
    var options_container = document.querySelector(`.filter-select-container[data-name='${aria_label}']`);

    options[aria_label] = findUniqueValues(aria_label);
    buildSelectContent(options_container, options[aria_label]);
  });
}

function buildSelectContent(options_container, data) {
  var optionHTML = ``;
  const data_name = options_container.getAttribute('data-name')
  for (let i = 0; i < data.length; i++) {
    let option = data[i];
    optionHTML += `<label>${option}
      <input type=\"radio\" name=${data_name} value="${option}"></label>`;
  }

  const select_options = options_container.querySelector('.filter-select-options');

  const select = document.querySelector(`.filter-selects-wrapper div[aria-label=${data_name}]`);

  select_options.innerHTML = optionHTML;
  options_container.querySelectorAll('input[type=\'radio\']').forEach(option => {
    option.addEventListener('click', (event) => {
      event.cancelBubble = true;
      event.preventDefault();
      options_container.style.transform = "scale(0)";
      options_container.querySelector('input[type=\'text\']').value = '';
      filter_options.style.pointerEvents = 'none';
      if (select.querySelector('span').innerHTML != option.value) {
        select.querySelector('span').innerHTML = option.value;
        filters[data_name] = option.value;
        var filtered_data = filterData(filters);
        table_state.data = filtered_data.features;
        PomnikiDataPromise.then(dataset => dataset.setData(filtered_data));
        buildTableData();
      }
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