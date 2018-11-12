class Player {
    constructor(playerObj) {
        this.fullName = playerObj.fullName;
        this.debut = new Date(playerObj.debut);
        this.bats = playerObj.bats;
        this.throws = playerObj.throws;
        this.fielding = playerObj.fielding;
        this.batting = playerObj.batting;
    }
    getTotalAtBats() {
        if (this.batting) {
            return this.batting.map( b => b.AB).reduce( (acc, b) => acc + b);
        }
        return 0;
    }
    getTotalBattingAverage() {
        if (this.batting) {
            const atbats = this.getTotalAtBats();
            const hits = this.batting.map(b => b.H).reduce( (acc, b) => acc + b);
            return (hits /atbats).toFixed(3);
        }
    }
}
class PlayerInfo {
    constructor() {
        this._apiPrefix = `https://api.marcswilson.com/api/mlb/chadwick`;
        this.playerNameEl = document.getElementById('playerName');
        this.debutEl = document.getElementById('debut');
        this.batsEl = document.getElementById('bats');
        this.throwsEl = document.getElementById('throws');
        this.positionEl = document.getElementById('position');
        this.atbatsEl = document.getElementById('atbats');
        this.battingAverageEl = document.getElementById('battingAverage');
        const params = new URLSearchParams(window.location.search);
        this._httpClient = new HttpClient();
        this.playerID = params.get('playerID');
        this.init();
    }
    async init() {
        const response = await this._httpClient.get(`${this._apiPrefix}/players/${this.playerID}`);
        console.log(response);
        const player = new Player(response);
        if (player) {
            this.playerNameEl.innerText = player.fullName;
            this.debutEl.innerText = player.debut.toDateString();
            this.batsEl.innerText = player.bats;
            this.throwsEl.innerText = player.throws;
            this.positionEl.innerText = player.fielding ? player.fielding[player.fielding.length - 1].POS : 'N/A';
            this.atbatsEl.innerText = player.getTotalAtBats();
            this.battingAverageEl.innerText = player.getTotalBattingAverage();
            this.generateHomerunsChart(player.batting);
        }

    }
    generateHomerunsChart(batting) {
        const margin = {top: 50, right: 50, bottom: 50, left: 50};
        const height = 500 - margin.left - margin.right;
        const width = 500 - margin.top - margin.bottom;
        const xScale = d3.scaleBand().rangeRound([0, width]).padding(.1);
        const yScale = d3.scaleLinear().range([height, 0]);
        const xAxis = d3.axisBottom()
            .scale(xScale);
        const yAxis = d3.axisLeft()
            .scale(yScale);
        const svg = d3.select('#homeruns')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left}, ${margin.top})`);
        xScale.domain(batting.map( d => d.yearID));
        yScale.domain([0, d3.max(batting, b => b.HR)]);
        svg.append('g')
            .attr('class', 'x-axis')
            .attr('transform', `translate(0, ${height})`)
            .call(xAxis)
            .selectAll('text')
            .style('text-anchor', 'end')
            .attr('dx', '-.8em')
            .attr('dy', '-.55em')
            .attr('transform', 'rotate(-90)');
        svg.append('g')
            .attr('class', 'y-axis')
            .call(yAxis)
            .append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 6)
            .attr('dy', '.71em')
            .style('text-anchor', 'end');
        svg.selectAll('bar')
            .data(batting)
            .enter()
            .append('rect')
            .style('fill', 'steelblue')
            .attr('x', d => xScale(d.yearID))
            .attr('width', xScale.bandwidth())
            .attr('y', d => yScale(d.HR))
            .attr('height', d => height - yScale(d.HR));

    }
}

document.body.onload = (evt) => {
    new PlayerInfo();
};