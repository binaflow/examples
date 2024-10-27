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
    sendRequest(graphics.maxDistanceInfo.x, graphics.maxDistanceInfo.y, graphics.maxDistanceInfo.radius);
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
    request.setMaxdistance(graphics.convertPixelsToKilometers(maxDistance, offsetX, offsetY));
    request.setMinpopulation(graphics.minPopulation);
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

onkeydown = (event) => {
    if (event.key === 'ArrowLeft') {
        graphics.minPopulation -= 100_000;
    }
    if (event.key === 'ArrowRight') {
        graphics.minPopulation += 100_000;
    }
};