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

let points
let popup
let popupValue

// create map instance
window.opalSdk
  .createMap(authenticator, options)
  .then(onCreate)
  .then(mapInstance => {

    mapInstance.event$.subscribe((event) => {
      if (event.type === 'load') {

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
        icons_clicked.map(img => {
          fetch(img.url)
            .then(response => response.arrayBuffer())
            .then(data => {
              const blob = new window.Blob([new Uint8Array(data)], {
                type: 'image/png',
              })
              return window.createImageBitmap(blob)
            })
            .then(image => mapInstance.images().add(img.id, image))
        })

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
                  data.features[i].properties.id = i;
                }
                return data
              })
              .then(data => {
                points = window.opalSdk.createDataset('points', {
                  data: data,
                  cluster: true,
                  clusterMaxZoom: 14,
                  clusterRadius: 80,
                })

                return points
              })
              .then(dataset => {
                mapInstance.addData(dataset, {
                  id: 'clusters-points',
                  type: 'circle',
                  filter: ['has', 'point_count'],
                  paint: {
                    'circle-color': '#CA2400',
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

                mapInstance.addData(dataset, {
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

                mapInstance.addData(dataset, {
                  id: 'points',
                  type: 'symbol',
                  filter: ["all",
                    ['!', ['has', 'point_count']],
                    // ["in", "tourism", ...['asdasd']],
                  ],
                  layout: {
                    'icon-allow-overlap': true,
                    'icon-image': [
                      'match',
                      ['get', 'tourism'],
                      'apartment',
                      'icon1',
                      'aquarium',
                      'icon2',
                      'artwork',
                      'icon3',
                      'attraction',
                      'icon4',
                      'camp_site',
                      'icon5',
                      'caravan_site',
                      'icon12',
                      'chalet',
                      'icon9',
                      'gallery',
                      'icon6',
                      'guest_house',
                      'icon9',
                      'historic',
                      'icon7',
                      'hostel',
                      'icon9',
                      'hotel',
                      'icon9',
                      'information',
                      'icon8',
                      'motel',
                      'icon9',
                      'museum',
                      'icon11',
                      'picnic_site',
                      'icon10',
                      'picnic_table',
                      'icon10',
                      'viewpoint',
                      'icon13',
                      'zoo',
                      'icon14',
                      'icon15',
                    ],
                    'icon-size': 0.6,
                  },
                }) // end mapInstance.addData(points

                const p_clicked_p = new Promise((resolve, reject) => {
                  mapInstance.addData(points, {
                    id: 'points_clicked',
                    type: 'symbol',
                    filter: ["all",
                      ['!', ['has', 'point_count']],
                      // ["==", "$geometry-coordinates", target[0].geometry.coordinates],
                    ],
                    layout: {
                      'icon-allow-overlap': true,
                      'icon-image': [
                        'match',
                        ['get', 'tourism'],
                        'apartment',
                        'icon1_clicked',
                        'aquarium',
                        'icon2_clicked',
                        'artwork',
                        'icon3_clicked',
                        'attraction',
                        'icon4_clicked',
                        'camp_site',
                        'icon5_clicked',
                        'caravan_site',
                        'icon12_clicked',
                        'chalet',
                        'icon9_clicked',
                        'gallery',
                        'icon6_clicked',
                        'guest_house',
                        'icon9_clicked',
                        'historic',
                        'icon7_clicked',
                        'hostel',
                        'icon9_clicked',
                        'hotel',
                        'icon9_clicked',
                        'information',
                        'icon8_clicked',
                        'motel',
                        'icon9_clicked',
                        'museum',
                        'icon11_clicked',
                        'picnic_site',
                        'icon10_clicked',
                        'picnic_table',
                        'icon10_clicked',
                        'viewpoint',
                        'icon13_clicked',
                        'zoo',
                        'icon14_clicked',
                        'icon15_clicked',
                      ],
                      'icon-size': 0.6,
                    },
                  })
                  resolve();
                }).then(() => {
                  mapInstance.layer('points_clicked').hide();
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

      const close_button = document.getElementById('click-properties-close')

      close_button.addEventListener('click', function () {
        mapInstance.layer('points_clicked').hide()
      })

    }) // end mapInstance.event$.subscribe((event)
  })
  .catch(e => console.error('Oups', e.message))