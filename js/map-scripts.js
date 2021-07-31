// account id (account id from which map will be downloaded)
const accountId = 'carto.NVYBik';
// map ids (id of a map that will be downloaded from account with specified id)
//  map id with light theme
const brightId = 'NxpJokfIoI';
//   map id with dark theme
const darkId = 'E1KFkOvIyh';
// map configuration (map options)
const starting_position = {
  center: [19, 52],
  zoom: 6,
  bearing: 0,
  pitch: 0
}
var map_options = {
  container: 'map',
  ...starting_position,
  maxZoom: 22,
  minZoom: 1,
};

//map authenticator (getting authenitactor for our map to know which map has to be downloaded)
const authenticator = mapId => window.opalSdk.MapAuthenticator.fromUrl(
  `https://map.nmaps.pl/${accountId}/${mapId}`
);
// map instance (variable that will store map instance object on which all map actions will be performed)
// assignment will happend upon map creation -> see createMap and onCreate functions
var mapApi;


var geoData;

const icons = [
  { url: 'images/icons/drzewo.png', id: 'drzewo' },
  { url: 'images/icons/głaz narzutowy.png', id: 'głaz narzutowy' },
  { url: 'images/icons/krzew.png', id: 'krzew' },
  { url: 'images/icons/skałka.png', id: 'skałka' },
  { url: 'images/icons/jaskinia.png', id: 'jaskinia' },
  { url: 'images/icons/grupa drzew.png', id: 'grupa drzew' },
  { url: 'images/icons/jar.png', id: 'jar' },
  { url: 'images/icons/aleja.png', id: 'aleja' },
  { url: 'images/icons/wodospad.png', id: 'wodospad' },
  { url: 'images/icons/źródło.png', id: 'źródło' },
  { url: 'images/icons/inne.png', id: 'inne' },
];

const icons_clicked = [
  { url: 'images/icons_clicked/drzewo_clicked.png', id: 'drzewo_clicked' },
  { url: 'images/icons_clicked/głaz narzutowy_clicked.png', id: 'głaz narzutowy_clicked' },
  { url: 'images/icons_clicked/krzew_clicked.png', id: 'krzew_clicked' },
  { url: 'images/icons_clicked/skałka_clicked.png', id: 'skałka_clicked' },
  { url: 'images/icons_clicked/jaskinia_clicked.png', id: 'jaskinia_clicked' },
  { url: 'images/icons_clicked/grupa drzew_clicked.png', id: 'grupa drzew_clicked' },
  { url: 'images/icons_clicked/jar_clicked.png', id: 'jar_clicked' },
  { url: 'images/icons_clicked/aleja_clicked.png', id: 'aleja_clicked' },
  { url: 'images/icons_clicked/wodospad_clicked.png', id: 'wodospad_clicked' },
  { url: 'images/icons_clicked/źródło_clicked.png', id: 'źródło_clicked' },
  { url: 'images/icons_clicked/inne_clicked.png', id: 'inne_clicked' },
];

// upon resolve returns object with created bitmap data and id for each icon

function fetchIMG(url) {
  return new Promise((resolve) => {
    fetch(url)
      .then(response => response.arrayBuffer())
      .then(data => {
        const blob = new window.Blob([new Uint8Array(data)], {
          type: 'image/png',
        });
        resolve(window.createImageBitmap(blob));
      });
  });
}

function fetchJSON(url) {
  return new Promise((resolve) => {
    fetch(url)
      .then(response => resolve(response.json()))
  });
}

const PomnikiIconsPromise = new Promise((resolve) => {
  Promise.all(
    icons.map(img => new Promise((resolve) => {
      fetchIMG(img.url)
        .then(image => {
          return {
            'data': image,
            'id': img.id
          }
        })
        .then(resolve)
    }))
  ).then(resolve)
});

const PomnikiIconsClickedPromise = new Promise((resolve) => {
  Promise.all(
    icons_clicked.map(img => new Promise((resolve) => {
      fetchIMG(img.url)
        .then(image => {
          return {
            'data': image,
            'id': img.id
          }
        })
        .then(resolve)
    }))
  ).then(resolve)
});

// upon resolve returns dataset with points for each Pomnik
const PomnikiDataPromise =
  fetchJSON('data/PomnikiPrzyrody/data.json')
  .then(data => {
    geoData = data;
    return window.opalSdk.createDataset('pomniki', {
      data: data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 80,
    })
  });

const PomnikiClickedDataPromise =
  fetchJSON('data/PomnikiPrzyrody/data.json')
  .then(data => {
    return window.opalSdk.createDataset('pomniki', {
      data: data,
    })
  });

// 2.3 WojewodztwaPromise
// upon resolve returns dataset with polygons for each wojewodztwo
const WojewodztwaPromise =
  fetchJSON('data/wojewodztwa/wojewodztwa.geojson')
  .then(data => {
    return window.opalSdk.createDataset('wojewodztwa', {
      data: data,
    });
  })


// theme toogle buton
document.getElementById('theme-toggle')
  .addEventListener("click", () => {
    document.querySelector('.loading-screen-wrapper').style.display = 'block'
    map_options = {
      container: 'map',
      center: mapApi.center,
      zoom: mapApi.zoom,
      maxZoom: mapApi.maxZoom,
      minZoom: mapApi.minZoom,
    };
    window.opalSdk.destroyMap(mapApi)
    body_element.classList.contains('light_theme') ?
      enDarkMode() :
      enLightMode();
  });

// close properties window button
document.getElementById('click-properties-close')
  .addEventListener('click', () => {
    document.getElementById('click-properties-container').style.left = "-480px";
    mapApi.layer('pomniki_clicked').hide();
  });

// starting position button
document.getElementById('Default-position')
  .addEventListener('click', () => {
    mapApi.flyTo(starting_position)
  });
// zoom in button
document.getElementById('zoom-in')
  .addEventListener('click', () => {
    const zoom = mapApi.zoom + 1;
    mapApi.flyTo({
      zoom: zoom,
    })
  });
// zoom out button
document.getElementById('zoom-out')
  .addEventListener('click', () => {
    const zoom = mapApi.zoom - 1;
    mapApi.flyTo({
      zoom: zoom,
    })
  });

const legend_button = document.getElementById('Legend-button');
const legend_wrapper = document.querySelector('.Legend-wrapper');


legend_button.addEventListener('click', function() {
  if (legend_wrapper.style.height === "625px") {
    legend_wrapper.style.height = "0px";
    legend_button.setAttribute('aria-label', 'Pokaż legendę');
  } else {
    legend_wrapper.style.height = "625px";
    legend_button.setAttribute('aria-label', 'Schowaj legendę');
  }
});


// on enter load map with prefered color scheme
window.onload = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    enDarkMode()
  } else {
    enLightMode()
  }
}

// callled when map instance is succesfully created
function onCreate(map) {
  mapApi = map;
};
// function that creates map with all its functions and layers
function createMap(mapId) {
  window.opalSdk
    .createMap(authenticator(mapId), map_options)
    .then(onCreate)
    .then(onMapActions)
    .catch(e => console.error('Oups', e.message));
}

const body_element = document.body;
// function that changes theme to dark
function enDarkMode() {
  body_element.classList.add('dark_theme');
  body_element.classList.remove('light_theme');
  document.getElementById('theme-toggle').setAttribute('aria-label', 'Zmień na tryb jasny')
  createMap(darkId);
}

// function that changes theme to light
function enLightMode() {
  body_element.classList.add('light_theme');
  body_element.classList.remove('dark_theme');
  document.getElementById('theme-toggle').setAttribute('aria-label', 'Zmień na tryb ciemny')
  createMap(brightId);
}

// impelements all actions that are performed on map instance
function onMapActions() {
  var popup;
  var popupValue;
  var popup_coords;
  mapApi.event$.subscribe((event) => {
    if (event.type === 'load') {

      new Promise(resolve => {
          PomnikiIconsPromise
            .then(images => images.forEach((image) => {
              mapApi.images().add(image.id, image.data, { 'sdf': true })
            }))
            .then(() => {
              PomnikiDataPromise
                .then(dataset => {
                  createLayers(mapApi, dataset, 'pomniki');
                });
            });

          PomnikiIconsClickedPromise
            .then(images => images.forEach((image) => {
              mapApi.images().add(image.id, image.data, { 'sdf': true })
            }))
            .then(() => {
              PomnikiClickedDataPromise
                .then(dataset => {
                  mapApi.addData(dataset, {
                    id: 'pomniki_clicked',
                    type: 'symbol',
                    layout: {
                      'icon-allow-overlap': true,
                      'icon-image': ['concat', ['get', 'obiekt'], '_clicked'],
                      'icon-size': 0.24,
                    },
                  });
                  mapApi.layer('pomniki_clicked').hide();
                });
            });

          WojewodztwaPromise
            .then(dataset => {
              mapApi.addData(dataset, {
                id: 'wojewodztwa',
                type: 'line',
                paint: {
                  'line-color': getComputedStyle(document.body).getPropertyValue('--map-border-outline'),
                  'line-width': 1,
                },
              })
            });

          mapApi.layer('boundary_2').hide();
          mapApi.layer('boundary_country').hide();
          mapApi.layer('boundary_state').hide();
          mapApi.layer('boundary_3').hide();
          mapApi.layer('poi_z14').hide();
          mapApi.layer('poi_z15').hide();
          mapApi.layer('poi_z16').hide();
          mapApi.layer('poi_transit').hide();
          resolve();
        })
        .then(() => document.querySelector('.loading-screen-wrapper').style.display = 'none');
    } // end if (event.type === 'load')

    if (event.type === 'mousemove') {
      const coords = event.data.point;
      const layers = ['pomniki'];
      const target = mapApi.query(coords, { layers });
      if (target.length >= 1) {
        if (popup_coords != target[0].geometry.coordinates) {
          if (popup) { popup.remove() }
          popup_coords = target[0].geometry.coordinates;
          popupValue = target[0].properties.obiekt;
          popupValue ?
            (popup = window.opalSdk
              .createPopup({
                closeButton: false,
                closeOnClick: false,
              })
              .setLngLat(popup_coords)
              .setHTML(
                `<div">${popupValue
                }</div>`
              )) :
            (popupValue = null);

          mapApi.addPopup(popup);
        } // end if (popupValue != target[0].properties.obiekt)
        mapApi.canvas.style.cursor = 'pointer';
      } else if (target.length === 0) {
        mapApi.canvas.style.cursor = 'default';

        if (popup || popupValue) {
          popup.remove();
          popup = null;
          popupValue = null
        } // end if (popup || popupValue)
      } // end else if (target.length === 0)
    } // end  if (event.type === 'mousemove')

    if (event.type === 'click') {
      const coords = event.data.point;
      const layers = ['pomniki'];
      const target = mapApi.query(coords, { layers });
      if (target.length >= 1) {

        mapApi.layer('pomniki_clicked').setFilter(['==', ['get', 'gid'], target[0].properties.gid]);
        mapApi.layer('pomniki_clicked').show();

        const objectProperties = {
          ...target[0].properties
        };
        onClickProperties(objectProperties);
      }
    } // end if (event.type === 'click')

  })
}

// creates layers for points
function createLayers(mapApi, data, layer_id) {
  mapApi.addData(data, {
    id: `${layer_id}_clusters`,
    type: 'circle',
    filter: ['all', ['has', 'point_count'], ],
    paint: {
      'circle-color': getComputedStyle(document.body).getPropertyValue('--map-cluster-color'),
      'circle-radius': [
        'step', ['get', 'point_count'],
        20,
        10,
        //
        21,
        30,
        //
        22,
        60,
        //
        23,
        80,
        //
        24,
        100,
        //
        25,
        500,
        //
        26,
        1000,
        //
        28,
        2000,
        //
        30,
        3000,
        //
        32,
        4000,
        //
        34,
        5000,
        //
        36,
        6000,
        //
        38,
        7000,
        //
        40,
        8000,
        //
        45,
        10000,
        //
        50,
        15000,
        //
        55,
        20000,
        //
        60,
        25000,
        //
        70
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': getComputedStyle(document.body).getPropertyValue('--bg-color'),
    }
  });

  mapApi.addData(data, {
    id: `${layer_id}_cluster-count`,
    type: 'symbol',
    filter: ['all', ['has', 'point_count'], ],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Roboto Bold'],
      'text-size': 14,
      'text-offset': [0, 0.15],
    },
    paint: {
      'text-color': '#ffffff',
    },
  });

  mapApi.addData(data, {
    id: layer_id,
    type: 'symbol',
    filter: ['all', ['!', ['has', 'point_count']], ],
    layout: {
      'icon-allow-overlap': true,
      'icon-image': ['get', 'obiekt'],
      'icon-size': 0.24,
    },
  });

}

function onClickProperties(data) {
  const on_click_content = document.getElementById('click-properties-list');
  const on_click_container = document.getElementById('click-properties-container');
  var html_string = '<ul>';
  for (const property in data) {
    switch (property) {
      case 'link':
        html_string += `<li>${property} : <a target="_blank" rel="noopener noreferrer" href = ${data[property]} ><b>Więcej informacji</b><a></li>`;
        break;
      case 'data utworzenia':
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

function resetHeight() {
  document.body.style.height = window.innerHeight + "px";
}
window.addEventListener("resize", resetHeight);

resetHeight();