const properties_container = document.getElementById('table-wrapper');
const properties_hide_button = document.getElementById('table-show-button');

var table_state = {
  'data': [],
  'page': 1,
  'rows': 10,
}
var max_pages;

const columns_filter = [
  'obiekt',
  'gatunek',
  'nazwa',
  'typ',
  'podtyp',
  'data utworzenia',
  'województwo',
  'powierzchnia',
];

// close/open table button
properties_hide_button.addEventListener('click', function() {
  if (getComputedStyle(properties_container).bottom === "0px") {
    properties_container.style.bottom = "-50%";
    properties_hide_button.setAttribute('aria-label', 'Otwórz tabelę');
    document.getElementById('click-properties-container').style.height = "100%";
  } else {
    properties_container.style.bottom = "0px";
    properties_hide_button.setAttribute('aria-label', 'Zamknij tabelę');
    document.getElementById('click-properties-container').style.height = "50%";
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
  .then(dataset => {
    const filter_array = [
      'drzewo',
      'głaz narzutowy',
      'krzew',
      'skałka',
      'jaskinia',
      'grupa drzew',
      'jar',
      'aleja',
      'wodospad',
      'źródło',
      'inne'
    ];

    var new_filter_array = filter_array;
    var filtered_data = geoData.features;
    const filter_all = document.querySelectorAll('.table-fieldset input')[0];
    const filter_seperate = document.querySelectorAll(".table-fieldset input[value]");

    filter_all.addEventListener('click', () => {
      if (filter_all.checked) {
        new_filter_array = filter_array;
        table_state.data = geoData.features;
        dataset.setData(geoData);
        filter_seperate.forEach(input => {
          input.checked = true;
        });
      } else {
        new_filter_array = [];
        filtered_data = filterData(geoData, 'obiekt', new_filter_array);
        table_state.data = filtered_data.features;
        dataset.setData(filtered_data);
        filter_seperate.forEach(input => {
          input.checked = false;
        });
      }
      buildTable();
    });

    filter_seperate.forEach(input => {
      input.addEventListener('click', () => {
        if (document.querySelectorAll('.table-fieldset input:checked').length == 11) {
          filter_all.checked = true;
        }

        if (input.checked) {
          new_filter_array.push(input.value);
        } else {
          new_filter_array = new_filter_array.filter(item => item !== input.value);
          filter_all.checked = false;
        }
        filtered_data = filterData(geoData, 'obiekt', new_filter_array);
        table_state.data = filtered_data.features;
        dataset.setData(filtered_data);
        buildTable();
      });
    });

    table_state.data = geoData.features;

    buildTable();

  });

// filters data based on property and its value
function filterData(data, property, filter) {
  var filteredData = {
    "type": "FeatureCollection",
    "features": []
  };

  for (let i = 0; i < data.features.length; i++) {
    if (filter.includes(data.features[i].properties[property])) {
      filteredData.features.push(data.features[i]);
    }
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

    for (let element of columns_filter) {

      if (element == 'data utworzenia') {
        var property = new Date(row.properties[element]).toLocaleDateString();
      } else {
        var property = row.properties[element];
      }

      HTML_data += `<td>${property}</td>`;
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
  columns_filter.forEach(column => {
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