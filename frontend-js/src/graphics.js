export default class Graphics {
    canvas = null;
    ctx = null;
    worldMapImage = null;
    cities = [];
    maxDistanceInfo = null
    minPopulation = 1_000_000;
    /*
    startTestingTime: 0,
    exchangeIteration: 0,
    fastestExchangeTime: 0,
    slowestExchangeTime: 0,
    averageExchangeTime: 0,
     */
    binaflowTestData = null;
    httpTestData = null;

    constructor() {
        console.log('Graphics');
        this.canvas = document.getElementById('canvas');

        const aspectRatioWidth = 1008;
        const aspectRatioHeight = 505;
        let gameWidth = window.innerWidth;
        let gameHeight = (aspectRatioHeight * window.innerWidth) / aspectRatioWidth;
        if (gameHeight > window.innerHeight) {
            gameHeight = window.innerHeight;
            gameWidth = (aspectRatioWidth * window.innerHeight) / aspectRatioHeight;
        }
        this.canvas.width = gameWidth;
        this.canvas.height = gameHeight;

        this.ctx = canvas.getContext("2d");
        this.worldMapImage = new Image(gameWidth, gameHeight); // Equirectangular projection
        this.worldMapImage.src = "world-map.png";
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.worldMapImage, 0, 0, this.canvas.width, this.canvas.height);
        // Draw in left down corner of the canvas. Text: Min population: 1_000_000. Press <- or -> to change the value.
        const fontSize = 12;
        this.ctx.font = fontSize + "px Arial";
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`Click and hold to point on map to fetch cities in a radius`, 10, 22);
        let startHeight = this.canvas.height / 5;
        this.ctx.fillText(`Press 1 to start "binaflow load test"`, 10, startHeight);
        this.ctx.fillText(`Press 2 to start "http load test"`, 10, startHeight + fontSize);
        this.ctx.fillText(`Press 0 to stop any load test"`, 10, startHeight + fontSize * 2);
        if (this.binaflowTestData.startTestingTime > 0) {
            this.ctx.fillText(`Binaflow load test:`, 10, startHeight + fontSize * 4);
            this.ctx.fillText(`Iteration: ${this.binaflowTestData.exchangeIteration}/100`, 10, startHeight + fontSize * 5);
            if (this.binaflowTestData.endTestingTime > 0) {
                this.ctx.fillText(`Test time: ${this.binaflowTestData.endTestingTime - this.binaflowTestData.startTestingTime}ms`, 10, startHeight + fontSize * 6);
            } else {
                this.ctx.fillText(`Test time: ${Date.now() - this.binaflowTestData.startTestingTime}ms`, 10, startHeight + fontSize * 6);
            }
            this.ctx.fillText(`Fastest exchange time: ${this.binaflowTestData.fastestExchangeTime}ms`, 10, startHeight + fontSize * 7);
            this.ctx.fillText(`Slowest exchange time: ${this.binaflowTestData.slowestExchangeTime}ms`, 10, startHeight + fontSize * 8);
            this.ctx.fillText(`Average exchange time: ${this.binaflowTestData.averageExchangeTime.toFixed(0)}ms`, 10, startHeight + fontSize * 9);
        }
        if (this.httpTestData.startTestingTime > 0) {
            this.ctx.fillText(`Http load test:`, 10, startHeight + fontSize * 11);
            this.ctx.fillText(`Iteration: ${this.httpTestData.exchangeIteration}/100`, 10, startHeight + fontSize * 12);
            if (this.httpTestData.endTestingTime > 0) {
                this.ctx.fillText(`Test time: ${this.httpTestData.endTestingTime - this.httpTestData.startTestingTime}ms`, 10, startHeight + fontSize * 13);
            } else {
                this.ctx.fillText(`Test time: ${Date.now() - this.httpTestData.startTestingTime}ms`, 10, startHeight + fontSize * 13);
            }
            this.ctx.fillText(`Fastest exchange time: ${this.httpTestData.fastestExchangeTime}ms`, 10, startHeight + fontSize * 14);
            this.ctx.fillText(`Slowest exchange time: ${this.httpTestData.slowestExchangeTime}ms`, 10, startHeight + fontSize * 15);
            this.ctx.fillText(`Average exchange time: ${this.httpTestData.averageExchangeTime.toFixed(0)}ms`, 10, startHeight + fontSize * 16);
        }
        this.ctx.fillStyle = "black";
        this.ctx.fillText(`Min population: ${this.minPopulation}. Press ← or → to change the value.`, 10, this.canvas.height - 22);
        if (this.cities) {
            this.ctx.fillText(`Last fetch info: Cities: ${this.cities.length}`, 10, this.canvas.height - 10);
        }
        if (this.maxDistanceInfo) {
            this.ctx.fillText(`Max distance: ${this.convertPixelsToKilometers(
                this.maxDistanceInfo.radius,
                this.maxDistanceInfo.x,
                this.maxDistanceInfo.y,
            )}`, 10, this.canvas.height - 34);
            if (!this.maxDistanceInfo.endDownTime) {
                this.maxDistanceInfo.radius = (Date.now() - this.maxDistanceInfo.startDownTime) / 5;
                this.ctx.beginPath();
                this.ctx.arc(this.maxDistanceInfo.x, this.maxDistanceInfo.y, this.maxDistanceInfo.radius, 0, 2 * Math.PI);
                this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                this.ctx.fill();
                this.ctx.stroke();
            }
        }
        for (let city of this.cities) {
            const latitude = city.getLatitude();
            const longitude = city.getLongitude();

            // Convert geographical coordinates to canvas coordinates
            const x = (longitude + 180) * (this.canvas.width / 360);
            const y = (90 - latitude) * (this.canvas.height / 180);

            // Draw the city on the canvas
            let color = this.getCityColor(city);
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, 2, 2);

            this.ctx.font = "12px Arial";
            this.ctx.fillStyle = color;
            this.ctx.fillText(city.getName(), x, y);
        }
    }

    getCityColor(city) {
        const red = city.getPopulation() % 256;
        const green = (city.getPopulation() * 3) % 256;
        const blue = (city.getPopulation() * 7) % 256;

        return `rgb(${red}, ${green}, ${blue})`;
    }

    convertPixelsToKilometers(pixels, offsetX, offsetY) {
        let latitude = 90 - (offsetY * 180 / this.canvas.height);
        let distanceLatitude = pixels * 180 / this.canvas.height; // in degrees
        let distanceLongitude = pixels * 360 / this.canvas.width; // in degrees
        return Math.min(
            distanceLatitude * 111, // 1 degree latitude ≈ 111 km
            distanceLongitude * 111 * Math.cos(latitude * Math.PI / 180) // longitude depends on latitude
        );
    }
}