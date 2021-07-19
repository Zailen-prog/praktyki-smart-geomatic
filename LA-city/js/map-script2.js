// your account_id
const accountId = 'carto.NVYBik';
//  your map_id
const mapId = 'NxpJokfIoI';
const brightId = 'NxpJokfIoI';
const darkId = 'E1KFkOvIyh';
// map configuration
const options = {
  container: 'map',
  center: [19, 52],
  zoom: 6,
};

let mapApi;

const authenticator = window.opalSdk.MapAuthenticator.fromUrl(
  `https://map.nmaps.pl/${accountId}/${mapId}`
);
// callled when map instance is succesfully created
function onCreate(map) {
  // map has been created
  mapApi = map;
  return map;
};

// callled when map instance could not be created
function onError(error) {
  console.log("oups! something goes wrong", error);
};

let popup;
let popupValue;
let popup_coords;

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

// create map instance
window.opalSdk
  .createMap(authenticator, options)
  .then(onCreate)
  .then(mapInstance => {

    mapInstance.event$.subscribe((event) => {
      if (event.type === 'load') {

        const close_button = document.getElementById('click-properties-close');
        const default_position = document.getElementById('Default-position');
        const zoom_in = document.getElementById('zoom-in');
        const zoom_out = document.getElementById('zoom-out');
        const map_center = mapInstance.center;
        const def_zoom = mapInstance.zoom;

        close_button.addEventListener('click', () => {
          on_click_container.style.left = "-480px";
          mapInstance.layer('points_clicked').hide();
        });

        default_position.addEventListener('click', () => {
          mapInstance.flyTo({
            center: map_center,
            zoom: def_zoom,
          })
        });

        zoom_in.addEventListener('click', () => {
          const zoom = mapInstance.zoom + 1 > 22 ? 22 : mapInstance.zoom + 1;
          mapInstance.flyTo({
            zoom: zoom,
          })
        });

        zoom_out.addEventListener('click', () => {
          const zoom = mapInstance.zoom - 1 < def_zoom ? def_zoom : mapInstance.zoom - 1;
          mapInstance.flyTo({
            zoom: zoom,
          })
        });

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
              .then(image => mapInstance.images().add(img.id, image, { 'sdf': true }))
              .then(() => resolve())
          }))
        ).then(() => {
          fetch('data/PomnikiPrzyrody/PomnikiPrzyrody.json')
            .then(response => response.json())
            .then(data => {

              // var blob = new Blob([JSON.stringify(data)], { type: "text/plain;charset=utf-8" });
              // saveAs(blob, "data.json");

              // var lookup = {};
              // var items = data;
              // var result = [];

              // for (var item, i = 0; item = items.features[i++];) {

              //   var name = item.properties.obiekt;

              //   if (!(name in lookup)) {
              //     lookup[name] = 1;
              //     result.push(name);
              //   }
              // }
              // console.log(result);

              return window.opalSdk.createDataset('pomniki', {
                data: data,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 80,
              });
            })
            .then(dataset => {
              createLayers(mapInstance, dataset, 'pomniki')
            });
        });



        fetch('data/wojewodztwa/wojewodztwa.geojson')
          .then(response => response.json())
          .then(data => {
            return window.opalSdk.createDataset('wojewodztwa', {
              data: data,
            });
          })
          .then(dataset => {
            mapInstance.addData(dataset, {
              id: 'wojewodztwa',
              type: 'line',
              paint: {
                'line-color': 'black',
                'line-width': 1,
              },
            })
          });

        mapInstance.layer('boundary_2').hide();
        mapInstance.layer('boundary_3').hide();
        mapInstance.layer('poi_z14').hide();
        mapInstance.layer('poi_z15').hide();
        mapInstance.layer('poi_z16').hide();
        mapInstance.layer('poi_transit').hide();
      } // end if (event.type === 'load')

      if (event.type === 'mousemove') {
        const coords = event.data.point;
        const layers = ['pomniki'];
        const target = mapInstance.query(coords, { layers });
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

            mapInstance.addPopup(popup);
          } // end if (popupValue != target[0].properties.obiekt)
          mapInstance.canvas.style.cursor = 'pointer';
        } else if (target.length === 0) {
          mapInstance.canvas.style.cursor = 'default';

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
        const target = mapInstance.query(coords, { layers });
        if (target.length >= 1) {

          mapInstance.layer('points_clicked').setFilter(['==', ['get', 'id'], target[0].properties.id]);
          mapInstance.layer('points_clicked').show();

          const objectProperties = {
            ...target[0].properties
          };
          onClickProperties(objectProperties);
        }
      } // end if (event.type === 'click')

    }) // end mapInstance.event$.subscribe((event)
  })
  .catch(e => console.error('Oups', e.message));

function filterData(data, filter) {
  var filteredData = {
    "type": "FeatureCollection",
    "name": "sql_statement",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  };
  var f = [];
  var j = 0;

  for (var i = 0; i < data.features.length; i++) {
    if (filter == null) {
      f[i] = data.features[i];
    } else if (data.features[i].properties.icon == filter) {
      f[j] = data.features[i];
      j++;
    }
  }
  filteredData.features = f;
  return filteredData;
}

function createLayers(mapApi, data, layer_id) {
  mapApi.addData(data, {
    id: layer_id + '_clusters',
    type: 'circle',
    filter: ['all',
      ['has', 'point_count'],
      // ['==', ['get', 'obiekt'], 'drzewo'],
    ],
    paint: {
      'circle-color': 'rgb(40, 100, 40)',
      'circle-radius': [
        'step',
        ['get', 'point_count'],
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
      'circle-stroke-color': '#fff',
    }
  });

  mapApi.addData(data, {
    id: layer_id + '_cluster-count',
    type: 'symbol',
    filter: ['all',
      ['has', 'point_count'],
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
    filter: ['all',
      ['!', ['has', 'point_count']],
      // ['==', ['get', 'obiekt'], 'źródło'],
    ],
    layout: {
      'icon-allow-overlap': true,
      'icon-image': ['get', 'obiekt'],
      'icon-size': 0.24,
    },
  });

}
