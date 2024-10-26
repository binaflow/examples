import BinaFlow from 'binaflow'

const schema = require('./cities-picker-schema_pb')
const canvas = document.getElementById('canvas');

const aspectRatioWidth = 1280;
const aspectRatioHeight = 640;
let gameWidth = window.innerWidth;
let gameHeight = (aspectRatioHeight * window.innerWidth) / aspectRatioWidth;
if (gameHeight > window.innerHeight) {
    gameHeight = window.innerHeight;
    gameWidth = (aspectRatioWidth * window.innerHeight) / aspectRatioHeight;
}
canvas.width = gameWidth;
canvas.height = gameHeight;

const ctx = canvas.getContext("2d");
const worldMapImage = new Image(gameWidth, gameHeight); // Equirectangular projection
worldMapImage.src = "world-map.png";
worldMapImage.addEventListener("load", () => {
    ctx.drawImage(worldMapImage, 0, 0, gameWidth, gameHeight);
});
let binaFlow = new BinaFlow([schema]);
binaFlow.onOpen = () => {
}
binaFlow.connect();

canvas.onmousedown = (event) => {
    let request = new schema.GetCitiesRequest();
    request.setMessagetype("GetCitiesRequest");
    request.setLatitude(parseFloat(event.offsetY));
    request.setLongitude(parseFloat(event.offsetX));
    binaFlow.send(request, (response) => {
        for (let city of response.getCitiesList()) {
            const latitude = city.getLatitude();
            const longitude = city.getLongitude();

            // Convert geographical coordinates to canvas coordinates
            // Mercator Projection Formula
            const x = (longitude + 180) * (gameWidth / 360);
            const y = (90 - latitude) * (gameHeight / 180);

            // Draw the city on the canvas
            ctx.fillStyle = 'red'; // Choose a color for the cities
            ctx.fillRect(x, y, 5, 5); // Draw a small square for each city

            // Draw the name of the city
            ctx.font = "12px Arial";
            ctx.fillStyle = 'red'; // Choose a color for the city names
            ctx.fillText(city.getName(), x, y);
        }
    }, (error) => {
        console.log('Error response', error);
    });
}