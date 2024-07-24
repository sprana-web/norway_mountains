mapboxgl.accessToken = 'pk.eyJ1Ijoic2FqaXRoLTkzMCIsImEiOiJjbHM0OTdzcTMwMWFzMmpueHRyYnM5M3JvIn0.Rim5QyMVWVCM4y-oJcT2TA';

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [8.3125, 61.6375], // Center the map on Norway
    zoom: 5,
    pitch: 60, // Increase pitch for a 3D effect
    bearing: -60 // Change the bearing for better 3D view
});

map.on('load', function () {
    // Enable 3D terrain
    map.addSource('mapbox-dem', {
        'type': 'raster-dem',
        'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
        'tileSize': 512,
        'maxzoom': 14
    });
    map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

    map.addSource('mountains', {
        'type': 'geojson',
        'data': 'mountains.geojson'
    });

    map.addLayer({
        'id': 'mountains-layer',
        'type': 'circle',
        'source': 'mountains',
        'paint': {
            'circle-radius': 6,
            'circle-color': '#B42222'
        }
    });

    map.on('click', 'mountains-layer', function (e) {
        const coordinates = e.features[0].geometry.coordinates.slice();
        const { name, height } = e.features[0].properties;

        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML(`<strong>Mountain:</strong> ${name}<br><strong>Height:</strong> ${height} meters`)
            .addTo(map);

        document.getElementById('mountain-info').innerHTML = `<strong>${name}</strong><br>Height: ${height} meters`;
    });

    map.on('mouseenter', 'mountains-layer', function () {
        map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', 'mountains-layer', function () {
        map.getCanvas().style.cursor = '';
    });

    // Add mountain list
    fetch('mountains.geojson')
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('mountain-list');
            data.features.forEach((feature, index) => {
                const { name, height } = feature.properties;
                const listItem = document.createElement('li');
                listItem.textContent = `${name} (${height}m)`;
                listItem.onclick = () => {
                    map.flyTo({
                        center: feature.geometry.coordinates,
                        zoom: 14, // Adjust the zoom level for a closer view
                        pitch: 75, // Adjust the pitch for a better 3D effect
                        bearing: -60, // Adjust the bearing
                        essential: true
                    });
                    document.getElementById('mountain-info').innerHTML = `<strong>${name}</strong><br>Height: ${height} meters`;
                };
                list.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error loading GeoJSON:', error));
});

// Layer switcher logic
document.getElementById('menu').addEventListener('change', function (e) {
    const style = e.target.value === 'satellite' ? 'mapbox://styles/mapbox/satellite-streets-v11' : 'mapbox://styles/mapbox/streets-v11';
    map.setStyle(style);

    map.once('styledata', () => {
        map.addSource('mapbox-dem', {
            'type': 'raster-dem',
            'url': 'mapbox://mapbox.mapbox-terrain-dem-v1',
            'tileSize': 512,
            'maxzoom': 14
        });
        map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

        map.addSource('mountains', {
            'type': 'geojson',
            'data': 'mountains.geojson'
        });

        map.addLayer({
            'id': 'mountains-layer',
            'type': 'circle',
            'source': 'mountains',
            'paint': {
                'circle-radius': 6,
                'circle-color': '#B42222'
            }
        });
    });
});
