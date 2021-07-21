/**
 * JS file
 */

/**
 * *******************
 * TABLE OF CONTENT
 * *******************
 * 1. Creating all neceserry map variables and objects
 *  1.1 account id
 *  1.2 map ids
 *    1.2.1 map id with light theme
 *    1.2.2 map id with dark theme
 *  1.3 map configuration
 *  1.4 map authenticator
 *  1.5 map instance
 *  1.6 geo data will store Pomniki dataset 
 *  1.7 icons array
 * 2. Creating promises to ensure synchronicity
 *  2.1 PomnikiIconsPromise
 *  2.2 PomnikiDataPromise
 *  2.3 WojewodztwaPromise
 * 3. Creating all event listeners that efects map
 *  3.1 theme toogle buton
 *  3.2 close properties window button
 *  3.3 starting position button
 *  3.4 zoom in button
 *  3.5 zoom out button
 *  3.6 properties-table-menu filter checkboxes
 * 4.
 * 5. Functions decleration
 *  5.1 onCreate
 *  5.2 createMap
 *  5.3 enDarkMode
 *  5.4 enLightMode
 *  5.5 onMapActions
 *  5.6 filterData
 */

/**
 * *************************************************
 * 1. Creating all neceserry map variables and objects
 * *************************************************
 */

// 1.1 account id (account id from which map will be downloaded)
const accountId = 'carto.NVYBik';
// 1.2 map ids (id of a map that will be downloaded from account with specified id)
//  1.2.1 map id with light theme
const brightId = 'NxpJokfIoI';
//  1.2.2 map id with dark theme
const darkId = 'E1KFkOvIyh';
// 1.3 map configuration (map options)
var map_options = {
  container: 'map',
  center: [19, 52],
  zoom: 6,
  maxZoom: 17,
  minZoom: 1,
};

// 1.4 map authenticator (getting authenitactor for our map to know which map has to be downloaded)
const authenticator = mapId => window.opalSdk.MapAuthenticator.fromUrl(
  `https://map.nmaps.pl/${accountId}/${mapId}`
);
// 1.5 map instance (variable that will store map instance object on which all map actions will be performed)
// assignment will happend upon map creation -> see createMap and onCreate functions
var mapApi;

// 1.6 geo data will store fetched geojson object with Pomniki Przyrody points
// assignemnt will happend when all data is fethed from file -> see PomnikiDataPromise
var geoData;

// 1.7 icons array (stores url and id for each icon that will be added to the map)
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

/**
 * *************************************************
 * 2. Creating promises to ensure synchronicity
 * *************************************************
 */
// 2.1 PomnikiIconsPromise
// upon resolve returns object with created bitmap data and id for each icon
const PomnikiIconsPromise = new Promise((resolve) => {
  Promise.all(
    icons.map(img => new Promise((resolve) => {
      fetch(img.url)
        .then(response => response.arrayBuffer())
        .then(data => {
          const blob = new window.Blob([new Uint8Array(data)], {
            type: 'image/png',
          });
          return window.createImageBitmap(blob);
        })
        .then(image => {
          var image_info = {};
          image_info.data = image;
          image_info.id = img.id;
          return image_info
        })
        .then(resolve)
    }))
  ).then(resolve)
});

// 2.2 PomnikiDataPromise
// upon resolve returns dataset with points for each Pomnik
const PomnikiDataPromise =
  fetch('data/PomnikiPrzyrody/data.json')
  .then(response => response.json())
  .then(data => {
    geoData = data;
    return window.opalSdk.createDataset('pomniki', {
      data: data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 80,
    })
  });

// 2.3 WojewodztwaPromise
// upon resolve returns dataset with polygons for each wojewodztwo
const WojewodztwaPromise =
  fetch('data/wojewodztwa/wojewodztwa.geojson')
  .then(response => response.json())
  .then(data => {
    return window.opalSdk.createDataset('wojewodztwa', {
      data: data,
    });
  })

/**
 * ************************************************
 * 3. Creating all event listeners that efects map
 * ************************************************
 */

// 3.1 theme toogle buton
document.getElementById('theme-toggle')
  .addEventListener("click", () => {
    map_options = {
      container: 'map',
      center: mapApi.center,
      zoom: mapApi.zoom,
      maxZoom: 17,
      minZoom: 1,
    };
    window.opalSdk.destroyMap(mapApi)

    body_element.classList.contains('light_theme') ?
      enDarkMode() :
      enLightMode();
  });

// 3.2 close properties window button
document.getElementById('click-properties-close')
  .addEventListener('click', () => {
    on_click_container.style.left = "-480px";
    mapApi.layer('points_clicked').hide();
  });

// 3.3 starting position button
document.getElementById('Default-position')
  .addEventListener('click', () => {
    const map_center = mapApi.center;
    const def_zoom = mapApi.zoom;
    mapApi.flyTo({
      center: map_center,
      zoom: def_zoom,
    })
  });
// 3.4 zoom in button
document.getElementById('zoom-in')
  .addEventListener('click', () => {
    const zoom = mapApi.zoom + 1;
    mapApi.flyTo({
      zoom: zoom,
    })
  });
// 3.5 zoom out button
document.getElementById('zoom-out')
  .addEventListener('click', () => {
    const zoom = mapApi.zoom - 1;
    mapApi.flyTo({
      zoom: zoom,
    })
  });

// 3.6 properties-table-menu filter checkboxes
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
    const filter_all = document.querySelectorAll('.properties-table-menu input')[0];
    const filter_seperate = document.querySelectorAll(".properties-table-menu input[value]");

    filter_all.addEventListener('click', () => {
      if (filter_all.checked) {
        new_filter_array = filter_array;
        dataset.setData(geoData);
        filter_seperate.forEach(input => {
          input.checked = true;
        });
      } else {
        new_filter_array = [];
        dataset.setData(filterData(geoData, 'obiekt', new_filter_array));
        filter_seperate.forEach(input => {
          input.checked = false;
        });
      }
    });

    filter_seperate.forEach(input => {
      input.addEventListener('click', () => {

        if (document.querySelectorAll('.properties-table-menu input:checked').length == 11) {
          filter_all.checked = true;
        }

        if (input.checked) {
          new_filter_array.push(input.value);
        } else {
          new_filter_array = new_filter_array.filter(item => item !== input.value);
          filter_all.checked = false;
        }
        dataset.setData(filterData(geoData, 'obiekt', new_filter_array));
      });
    });
  });

/**
 * *************************
 * 4.
 * *************************
 */

// on enter load map with prefered color scheme
window.onload = () => {
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    enDarkMode()
  } else {
    enLightMode()
  }
}

/**
 * ************************************************
 * 5. Functions decleration
 * ************************************************
 */
// 5.1 onCreate
// callled when map instance is succesfully created
function onCreate(map) {
  mapApi = map;
};
// 5.2 createMap
// function that creates map with all its functions and layers
function createMap(mapId) {
  window.opalSdk
    .createMap(authenticator(mapId), map_options)
    .then(onCreate)
    .then(onMapActions)
    .catch(e => console.error('Oups', e.message));
}

const body_element = document.body;
// 5.3 enDarkMode
// function that changes theme to dark
function enDarkMode() {
  body_element.classList.add('dark_theme');
  body_element.classList.remove('light_theme');
  createMap(darkId);
}

// 5.4 enLightMode
// function that changes theme to light
function enLightMode() {
  body_element.classList.add('light_theme');
  body_element.classList.remove('dark_theme');
  createMap(brightId);
}

// 5.5 onMapActions
// impelements all actions that are performed on map instance
function onMapActions() {
  var popup;
  var popupValue;
  var popup_coords;
  mapApi.event$.subscribe((event) => {
    if (event.type === 'load') {

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
                `<div style="font-size: 14px; font-weight: bold;">${popupValue
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

        mapApi.layer('points_clicked').setFilter(['==', ['get', 'id'], target[0].properties.id]);
        mapApi.layer('points_clicked').show();

        const objectProperties = {
          ...target[0].properties
        };
        onClickProperties(objectProperties);
      }
    } // end if (event.type === 'click')

  })
}

// 5.6 filterData
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

// 5.7 createLayers
// creates layers for points
function createLayers(mapApi, data, layer_id) {
  mapApi.addData(data, {
    id: `${layer_id}_clusters`,
    type: 'circle',
    filter: ['all', ['has', 'point_count'],
      // ['==', ['get', 'obiekt'], 'drzewo'],
    ],
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
    filter: ['all', ['has', 'point_count'],
      // ['==', ['get', 'obiekt'], 'drzewo']
    ],
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
    filter: ['all', ['!', ['has', 'point_count']],
      // ['==', ['get', 'obiekt'], 'źródło'],
    ],
    layout: {
      'icon-allow-overlap': true,
      'icon-image': ['get', 'obiekt'],
      'icon-size': 0.24,
    },
  });

}

// var blob = new Blob([JSON.stringify(data, null, " ")], { type: "text/plain;charset=utf-8" });
// saveAs(blob, "d.json");

// var lookup = {};
// var items = data;
// var result = [];

// for (var item, i = 0; item = items.features[i++];) {

//   var name = item.properties.nazwa;
//   if (name.indexOf('�') > -1) {
//     if (!(name in lookup)) {
//       lookup[name] = 1;
//       result.push(name);
//     }
//   }
// }
// console.log(result);