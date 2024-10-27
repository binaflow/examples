import BinaFlow from 'binaflow'
import Graphics from './graphics'

const schema = require('./cities-picker-schema_pb')
const graphics = new Graphics();

let binaFlow = new BinaFlow([schema]);
binaFlow.connect();

setInterval(() => {
    graphics.render();
}, 30);

graphics.canvas.onmousedown = (event) => {

    let request = new schema.GetCitiesRequest();
    request.setMessagetype("GetCitiesRequest");
    // Convert canvas coordinates to geographical coordinates (Mercator Projection)
    let latitude = 90 - (event.offsetY * 180 / graphics.canvas.height);
    let longitude = (event.offsetX * 360 / graphics.canvas.width) - 180;
    request.setLatitude(latitude);
    request.setLongitude(longitude);
    request.setMaxdistance(500);
    request.setMinpopulation(1_000_000);
    binaFlow.send(request, (response) => {
        for (let city of response.getCitiesList()) {
            graphics.cities = response.getCitiesList();
        }
    }, (error) => {
        console.log('Error response', error);
    });
}