// your account_id
const accountId = 'carto.NVYBik'
//  your map_id
const mapId = 'NxpJokfIoI'
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

let poly
let points
let popup
let popupValue

// create map instance
window.opalSdk
  .createMap(authenticator, options)
  .then(onCreate)
  .then(mapInstance => {

    fetch('tourism_point.geojson')
      .then(response => response.json())
      .then(data => {
        points = window.opalSdk.createDataset('points', {
          data: data,
        })
      })

    mapInstance.event$.subscribe((event) => {
      if (event.type === 'load') {

        const images = [
          { url: 'images/icon1.png', id: 'icon1' },
          { url: 'images/icon2.png', id: 'icon2' },
          { url: 'images/icon3.png', id: 'icon3' },
          { url: 'images/icon4.png', id: 'icon4' },
          { url: 'images/icon5.png', id: 'icon5' },
          { url: 'images/icon6.png', id: 'icon6' },
          { url: 'images/icon7.png', id: 'icon7' },
          { url: 'images/icon8.png', id: 'icon8' },
          { url: 'images/icon9.png', id: 'icon9' },
          { url: 'images/icon10.png', id: 'icon10' },
          { url: 'images/icon11.png', id: 'icon11' },
          { url: 'images/icon12.png', id: 'icon12' },
          { url: 'images/icon13.png', id: 'icon13' },
          { url: 'images/icon14.png', id: 'icon14' },
          { url: 'images/icon15.png', id: 'icon15' },
        ]

        Promise.all(
          images.map(img => new Promise((resolve, reject) => {
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
            mapInstance.addData(points, {
              id: 'points',
              type: 'symbol',
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
              // "filter": ["in", "tourism", ...['asdasd']]
            })
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
      }

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
          }
          mapInstance.canvas.style.cursor = 'pointer'
        } else if (target.length === 0) {
          mapInstance.canvas.style.cursor = 'default'

          if (popup || popupValue) {
            popup.remove()
            popup = null
            popupValue = null
          }
        }
      }
    })
  })
  .catch(e => console.error('Oups', e.message))