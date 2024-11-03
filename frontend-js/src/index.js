import BinaFlow from '@binaflow/binaflow-js-client'
import Graphics from './graphics'

const schema = require('./cities-picker-schema_pb')
const graphics = new Graphics();
const binaflowTestData = {
    isInProcess: false,
    startTestingTime: 0,
    endTestingTime: 0,
    exchangeIteration: 0,
    fastestExchangeTime: 0,
    slowestExchangeTime: 0,
    averageExchangeTime: 0,
};
const httpTestData = {
    isInProcess: false,
    startTestingTime: 0,
    endTestingTime: 0,
    exchangeIteration: 0,
    fastestExchangeTime: 0,
    slowestExchangeTime: 0,
    averageExchangeTime: 0,
};
graphics.binaflowTestData = binaflowTestData;
graphics.httpTestData = httpTestData;

let binaFlow = new BinaFlow([schema]);
binaFlow.onOpen = () => {
    console.log('Connected to BinaFlow');
}
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
        graphics.cities = response.getCitiesList();
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
    if (event.key === '1') {
        if (!binaflowTestData.isInProcess && !httpTestData.isInProcess) {
            if (binaflowTestData.endTestingTime === 0) {
                binaflow_load_test();
            } else {
                binaflowTestData.exchangeIteration = 0;
                binaflowTestData.startTestingTime = 0;
                binaflowTestData.endTestingTime = 0;
                binaflowTestData.fastestExchangeTime = 0;
                binaflowTestData.slowestExchangeTime = 0;
                binaflowTestData.averageExchangeTime = 0;
                binaflow_load_test();
            }
        }
    }
    if (event.key === '2') {
        if (!binaflowTestData.isInProcess && !httpTestData.isInProcess) {
            if (httpTestData.endTestingTime === 0) {
                http_load_test();
            } else {
                httpTestData.exchangeIteration = 0;
                httpTestData.startTestingTime = 0;
                httpTestData.endTestingTime = 0;
                httpTestData.fastestExchangeTime = 0;
                httpTestData.slowestExchangeTime = 0;
                httpTestData.averageExchangeTime = 0;
                http_load_test();
            }
        }
    }
    if (event.key === '3') {
    }
};

async function binaflow_load_test() {
    binaflowTestData.isInProcess = true;
    binaflowTestData.startTestingTime = Date.now();
    while (binaflowTestData.exchangeIteration < 100) {
        let startExchangeTime = Date.now();
        let request = new schema.GetCitiesRequest();
        request.setMessagetype("GetCitiesRequest");
        request.setLatitude(0);
        request.setLongitude(0);
        request.setMaxdistance(100_000_000);
        request.setMinpopulation(graphics.minPopulation);
        let isWaiting = true;
        binaFlow.send(request, (response) => {
            isWaiting = false;
        }, (error) => {
            console.log('Error response', error);
        });
        while (isWaiting) {
            await sleep(1);
        }
        binaflowTestData.exchangeIteration++;
        let exchangeTime = Date.now() - startExchangeTime;
        if (exchangeTime < binaflowTestData.fastestExchangeTime || binaflowTestData.fastestExchangeTime === 0) {
            binaflowTestData.fastestExchangeTime = exchangeTime;
        }
        if (exchangeTime > binaflowTestData.slowestExchangeTime) {
            binaflowTestData.slowestExchangeTime = exchangeTime;
        }
        binaflowTestData.averageExchangeTime = (binaflowTestData.averageExchangeTime * (binaflowTestData.exchangeIteration - 1) + exchangeTime) / binaflowTestData.exchangeIteration;
    }
    binaflowTestData.endTestingTime = Date.now();
    binaflowTestData.isInProcess = false;
}

async function http_load_test() {
    httpTestData.isInProcess = true;
    httpTestData.startTestingTime = Date.now();
    while (httpTestData.exchangeIteration < 100) {
        let startExchangeTime = Date.now();
        let isWaiting = true;
        fetch(`/cities?latitude=0&longitude=0&maxDistance=100000000&minPopulation=${graphics.minPopulation}`)
            .then(response => response.json())
            .then(data => {
                isWaiting = false;
            });
        while (isWaiting) {
            await sleep(1);
        }
        httpTestData.exchangeIteration++;
        let exchangeTime = Date.now() - startExchangeTime;
        if (exchangeTime < httpTestData.fastestExchangeTime || httpTestData.fastestExchangeTime === 0) {
            httpTestData.fastestExchangeTime = exchangeTime;
        }
        if (exchangeTime > httpTestData.slowestExchangeTime) {
            httpTestData.slowestExchangeTime = exchangeTime;
        }
        httpTestData.averageExchangeTime = (httpTestData.averageExchangeTime * (httpTestData.exchangeIteration - 1) + exchangeTime) / httpTestData.exchangeIteration;
    }
    httpTestData.endTestingTime = Date.now();
    httpTestData.isInProcess = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}