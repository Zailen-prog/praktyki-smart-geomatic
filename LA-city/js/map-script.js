// your account_id
const accountId = 'carto.NVYBik'
//  your map_id
const mapId = 'NxpJokfIoI'
const brightId = 'NxpJokfIoI'
const darkId = 'E1KFkOvIyh'
// map configuration
const options = {
  container: 'map',
  maxBounds: [-120, 33.25, -116.2, 34.8],
  zoom: 1
};

let mapApi

const authenticator = window.opalSdk.MapAuthenticator.fromUrl(
  `https://map.nmaps.pl/${accountId}/${mapId}`
)
// callled when map instance is succesfully created
function onCreate(map) {
  // map has been created
  mapApi = map
  return map
}

// callled when map instance could not be created
function onError(error) {
  console.log("oups! something goes wrong", error);
}

let geoData
let popup
let popupValue

// create map instance
window.opalSdk
  .createMap(authenticator, options)
  .then(onCreate)
  .then(mapInstance => {

    mapInstance.event$.subscribe((event) => {
      if (event.type === 'load') {

        const close_button = document.getElementById('click-properties-close')

        close_button.addEventListener('click', function () {
          on_click_container.style.left = "-480px"
          mapInstance.layer('points_clicked').hide()
        })

        const icons = [
          { url: 'images/icons/icon1.png', id: 'icon1' },
          { url: 'images/icons/icon2.png', id: 'icon2' },
          { url: 'images/icons/icon3.png', id: 'icon3' },
          { url: 'images/icons/icon4.png', id: 'icon4' },
          { url: 'images/icons/icon5.png', id: 'icon5' },
          { url: 'images/icons/icon6.png', id: 'icon6' },
          { url: 'images/icons/icon7.png', id: 'icon7' },
          { url: 'images/icons/icon8.png', id: 'icon8' },
          { url: 'images/icons/icon9.png', id: 'icon9' },
          { url: 'images/icons/icon10.png', id: 'icon10' },
          { url: 'images/icons/icon11.png', id: 'icon11' },
          { url: 'images/icons/icon12.png', id: 'icon12' },
          { url: 'images/icons/icon13.png', id: 'icon13' },
          { url: 'images/icons/icon14.png', id: 'icon14' },
          { url: 'images/icons/icon15.png', id: 'icon15' },
        ]

        const icons_clicked = [
          { url: 'images/icons_clicked/icon1.png', id: 'icon1_clicked' },
          { url: 'images/icons_clicked/icon2.png', id: 'icon2_clicked' },
          { url: 'images/icons_clicked/icon3.png', id: 'icon3_clicked' },
          { url: 'images/icons_clicked/icon4.png', id: 'icon4_clicked' },
          { url: 'images/icons_clicked/icon5.png', id: 'icon5_clicked' },
          { url: 'images/icons_clicked/icon6.png', id: 'icon6_clicked' },
          { url: 'images/icons_clicked/icon7.png', id: 'icon7_clicked' },
          { url: 'images/icons_clicked/icon8.png', id: 'icon8_clicked' },
          { url: 'images/icons_clicked/icon9.png', id: 'icon9_clicked' },
          { url: 'images/icons_clicked/icon10.png', id: 'icon10_clicked' },
          { url: 'images/icons_clicked/icon11.png', id: 'icon11_clicked' },
          { url: 'images/icons_clicked/icon12.png', id: 'icon12_clicked' },
          { url: 'images/icons_clicked/icon13.png', id: 'icon13_clicked' },
          { url: 'images/icons_clicked/icon14.png', id: 'icon14_clicked' },
          { url: 'images/icons_clicked/icon15.png', id: 'icon15_clicked' },
        ]
        const promised = Promise.all(
          icons_clicked.map(img => new Promise((resolve, reject) => {
            fetch(img.url)
              .then(response => response.arrayBuffer())
              .then(data => {
                const blob = new window.Blob([new Uint8Array(data)], {
                  type: 'image/png',
                })
                return window.createImageBitmap(blob)
              })
              .then(image => mapInstance.images().add(img.id, image))
            resolve();
          }))
        )

        Promise.all(
          icons.map(img => new Promise((resolve, reject) => {
            fetch(img.url)
              .then(response => response.arrayBuffer())
              .then(data => {
                const blob = new window.Blob([new Uint8Array(data)], {
                  type: 'image/png',
                })
                return window.createImageBitmap(blob)
              })
              .then(image => mapInstance.images().add(img.id, image))
            resolve();
          }))
        )
          .then(() => {
            fetch('tourism_point.geojson')
              .then(response => response.json())
              .then(data => {
                for (var i = 0; i < data.features.length; i++) {
                  var icon_nr
                  switch (data.features[i].properties.tourism) {
                    case 'apartment':
                      icon_nr = 1;
                      break;
                    case 'aquarium':
                      icon_nr = 2;
                      break;
                    case 'artwork':
                      icon_nr = 3;
                      break;
                    case 'attraction':
                      icon_nr = 4;
                      break;
                    case 'camp_site':
                      icon_nr = 5;
                      break;
                    case 'caravan_site':
                      icon_nr = 12;
                      break;
                    case 'chalet': case 'guest_house': case 'hostel': case 'hotel': case 'motel':
                      icon_nr = 9;
                      break;
                    case 'gallery':
                      icon_nr = 6;
                      break;
                    case 'historic':
                      icon_nr = 7;
                      break;
                    case 'information':
                      icon_nr = 8;
                      break;
                    case 'museum':
                      icon_nr = 11;
                      break;
                    case 'picnic_site': case 'picnic_table':
                      icon_nr = 10;
                      break;
                    case 'viewpoint':
                      icon_nr = 13;
                      break;
                    case 'zoo':
                      icon_nr = 14;
                      break;
                    default:
                      icon_nr = 15
                  }
                  data.features[i].properties.icon = "icon" + icon_nr;
                  data.features[i].properties.id = i;
                }
                return data
              })
              .then(data => {
                geoData = data
                return window.opalSdk.createDataset('points', {
                  data: data,
                  cluster: true,
                  clusterMaxZoom: 14,
                  clusterRadius: 80,
                })
              })
              .then(dataset => {
                createLayers(mapInstance, dataset)

                promised.then(() => {
                  new Promise((resolve, reject) => {
                    mapInstance.addData(dataset, {
                      id: 'points_clicked',
                      type: 'symbol',
                      filter: ["all",
                        ['!', ['has', 'point_count']],
                      ],
                      layout: {
                        'icon-allow-overlap': true,
                        'icon-image': ["concat", ['get', 'icon'], "_clicked"],
                        'icon-size': 0.6,
                      },
                    })
                    resolve();
                  }).then(() => {
                    mapInstance.layer('points_clicked').hide();
                  })
                })

                document.querySelectorAll('.properties-panel-menu-input').forEach((input) => {
                  input.addEventListener('change', function () {
                    if (input.checked) {
                      if (input.value === 'all') {
                        filterData(geoData, null)
                        dataset.setData(filterData(geoData, null));
                      } else {
                        filterData(geoData, input.value)
                        dataset.setData(filterData(geoData, input.value));
                      }
                    }
                  })
                })
              }) // end .then(() => 
          })

        mapInstance.controls().add('NavigationControl', {
          showZoom: true,
          showCompass: true,
          visualizePitch: true
        }, 'top-right')

        mapInstance.layer('boundary_2').hide()
        mapInstance.layer('boundary_3').hide()
        mapInstance.layer('poi_z14').hide()
        mapInstance.layer('poi_z15').hide()
        mapInstance.layer('poi_z16').hide()
        mapInstance.layer('poi_transit').hide()
      } // end if (event.type === 'load')

      if (event.type === 'mousemove') {
        const coords = event.data.point
        const layers = ['points']
        const target = mapInstance.query(coords, { layers })
        if (target.length >= 1) {
          if (popupValue != target[0].properties.name) {
            if (popup) { popup.remove() }
            popupValue = target[0].properties.name
            popupValue
              ?
              (popup = window.opalSdk
                .createPopup({
                  closeButton: false,
                  closeOnClick: false,
                })
                .setLngLat(target[0].geometry.coordinates)
                .setHTML(
                  `<div style="font-size: 14px; font-weight: bold;">${popupValue
                  }</div>`
                )) :
              (popupValue = null)

            mapInstance.addPopup(popup)
          } // end if (popupValue != target[0].properties.name)
          mapInstance.canvas.style.cursor = 'pointer'
        } else if (target.length === 0) {
          mapInstance.canvas.style.cursor = 'default'

          if (popup || popupValue) {
            popup.remove()
            popup = null
            popupValue = null
          } // end if (popup || popupValue)
        } // end else if (target.length === 0)
      } // end  if (event.type === 'mousemove')

      if (event.type === 'click') {
        const coords = event.data.point
        const layers = ['points']
        const target = mapInstance.query(coords, { layers })
        if (target.length >= 1) {

          mapInstance.layer('points_clicked').setFilter(['==', ['get', 'id'], target[0].properties.id])
          mapInstance.layer('points_clicked').show()

          const objectProperties = {
            ...target[0].properties
          }
          onClickProperties(objectProperties);
        }
      } // end if (event.type === 'click')

    }) // end mapInstance.event$.subscribe((event)
  })
  .catch(e => console.error('Oups', e.message))

function filterData(data, filter) {
  var filteredData = {
    "type": "FeatureCollection",
    "name": "sql_statement",
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
  }
  var f = []
  var j = 0;

  for (var i = 0; i < data.features.length; i++) {
    if (filter == null) {
      f[i] = data.features[i]
    } else if (data.features[i].properties.icon == filter) {
      f[j] = data.features[i]
      j++
    }
  }
  filteredData.features = f
  return filteredData
}

function createLayers(mapApi, data) {
  mapApi.addData(data, {
    id: 'clusters-points',
    type: 'circle',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': 'rgb(0, 123, 255)',
      'circle-radius': [
        'step',
        ['get', 'point_count'],
        20,
        5,
        //
        22.5,
        10,
        //
        25,
        25,
        //
        30,
        50,
        //
        35,
        75,
        //
        40,
        100,
        //
        45,
        150,
        //
        50,
        200,
        //
        55,
        250,
        //
        65,
        400,
        //
        70
      ],
      'circle-stroke-width': 1,
      'circle-stroke-color': '#fff',
    }
  })

  mapApi.addData(data, {
    id: 'clusters-points-count',
    type: 'symbol',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': '{point_count_abbreviated}',
      'text-font': ['Roboto Bold'],
      'text-size': 14,
      'text-offset': [0, 0.15],
    },
    paint: {
      'text-color': '#ffffff',
    },
  })

  mapApi.addData(data, {
    id: 'points',
    type: 'symbol',
    filter: ["all",
      ['!', ['has', 'point_count']],
    ],
    layout: {
      'icon-allow-overlap': true,
      'icon-image': ['get', 'icon'],
      'icon-size': 0.6,
    },
  })
}
