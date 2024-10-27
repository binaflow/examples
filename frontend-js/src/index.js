import BinaFlow from 'binaflow'
import Graphics from './graphics'

const schema = require('./cities-picker-schema_pb')
const graphics = new Graphics();

let binaFlow = new BinaFlow([schema]);
binaFlow.connect();

setInterval(() => {
    graphics.render();
}, 30);

graphics.canvas.onmouseup = (event) => {
    graphics.maxDistanceInfo.endDownTime = Date.now();
    sendRequest(event.offsetX, event.offsetY, graphics.maxDistanceInfo.radius);
}

graphics.canvas.onmousedown = (event) => {
    graphics.maxDistanceInfo = {
        x: event.offsetX,
        y: event.offsetY,
        startDownTime: Date.now(),
        endDownTime: null
    }
}

function sendRequest(offsetX, offsetY, maxDistance) {
    let request = new schema.GetCitiesRequest();
    request.setMessagetype("GetCitiesRequest");
    // Convert canvas coordinates to geographical coordinates (Equirectangular projection)
    let latitude = 90 - (offsetY * 180 / graphics.canvas.height);
    let longitude = (offsetX * 360 / graphics.canvas.width) - 180;
    request.setLatitude(latitude);
    request.setLongitude(longitude);
    let distanceLatitude = maxDistance * 180 / graphics.canvas.height; // in degrees
    let distanceLongitude = maxDistance * 360 / graphics.canvas.width; // in degrees
    let maxDistanceKm = Math.min(
        distanceLatitude * 111, // 1 degree latitude ≈ 111 km
        distanceLongitude * 111 * Math.cos(latitude * Math.PI / 180) // longitude depends on latitude
    );
    request.setMaxdistance(maxDistanceKm);
    request.setMinpopulation(1_000_000);
    binaFlow.send(request, (response) => {
        if (response.getCitiesList().length === 0) {
            console.log('No cities found');
            graphics.cities = [];
            return;
        }
        for (let city of response.getCitiesList()) {
            graphics.cities = response.getCitiesList();
        }
    }, (error) => {
        console.log('Error response', error);
    });
}