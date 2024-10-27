export default class Graphics {
    canvas = null;
    ctx = null;
    worldMapImage = null;
    cities = [];
    maxDistanceInfo = null

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
        if (this.maxDistanceInfo) {
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
}