class Player {
    constructor(playerObj) {
        this.fullName = playerObj.fullName;
        this.debut = new Date(playerObj.debut);
        this.bats = playerObj.bats;
        this.throws = playerObj.throws;
        this.fielding = playerObj.fielding;
        this.batting = playerObj.batting;
        this.pitching = playerObj.pitching;
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
            return (hits / atbats).toFixed(3);
        }
    }
    getTotalHomeruns() {
        if (this.batting) {
            return this.batting.map(b => b.HR).reduce( (acc, b) => acc + b);
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
        this.homerunsEl = document.getElementById('homeruns');
        const params = new URLSearchParams(window.location.search);
        this._httpClient = new HttpClient();
        this.playerID = params.get('playerID');
        this.init();
    }
    async init() {
        const loader = new Loader(`Fetching data for ${this.playerID}...`)
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
            this.homerunsEl.innerText = player.getTotalHomeruns();
            this.generateHomerunsChart(player.batting);
            this.generatePieChart('hittingBreakdownChart', player.batting);
            this.generateEraChart(player.pitching);
            this.generatePieChart('pitchingBreakdownChart', player.pitching);
        }
        loader.destroy();
    }
    generatePieChart(_selector, _data) {
        if (_data && _data.length > 0) {
            const data = [
                {label: 'Hits', value: _data.map(b => b.H).reduce((acc, hits) => acc + hits)},
                {label: 'Strikeouts', value: _data.map(b => b.SO).reduce((acc, so) => acc + so)},
                {label: 'Walks', value: _data.map(b => b.BB).reduce((acc, walks) => acc + walks)},
                {label: 'Doubles', value: _data.map(b => b['2B']).reduce((acc, doubles) => acc + doubles)},
                {label: 'Triples', value: _data.map(b => b['3B']).reduce((acc, triples) => acc + triples)},
                {label: 'Homeruns', value: _data.map(b => b.HR).reduce((acc, homeruns) => acc + homeruns)},
            ];
            console.log(data);
            const height = 500;
            const width = 500;
            const colors = [
                {label: 'Hits', color: '#FFD180'},
                {label: 'Strikeouts', color: '#7986CB'},
                {label: 'Walks', color: '#3F51B5'},
                {label: 'Doubles', color: '#303F9F'},
                {label: 'Triples', color: '#1A237E'},
                {label: 'Homeruns', color: '#536DFE'},
            ];
            const svg = d3.select(`#${_selector}`)
                .attr('height', height)
                .attr('width', width)
                .attr('text-anchor', 'middle');
            const pie = d3.pie()
                .sort(null)
                .value(d => d.value);
            const arcs = pie(data);
            const radius = Math.min(width, height) / 2 * 0.8;
            const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);
            const arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 1);
            const g = svg.append('g')
                .attr('transform', `translate(${width / 2}, ${height / 2})`);
            g.selectAll('path')
                .data(arcs)
                .enter().append('path')
                .attr('fill', d => colors.find(c => c.label === d.data.label).color)
                .attr('stroke', 'white')
                .attr('d', arc)
                .append('title')
                .text(d => `${d.data.label}: ${d.data.value}`);
            const text = g.selectAll('text')
                .data(arcs)
                .enter()
                .append('text')
                .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
                .attr('dy', '0.35em');
            // text.append('tspan')
            //     .attr('x', 0)
            //     .attr('y', '-0.7em')
            //     .attr('font-weight', 'bold')
            //     .text(d => d.data.label);
            text.filter(d => (d.endAngle - d.startAngle) > 0.25).append('tspan')
                .attr('x', 0)
                .attr('y', '0.7em')
                .attr('fill-opacity', 0.7)
                .text(d => d.data.value);
            const legend = svg.selectAll('.legend')
                .data(pie(data))
                .enter()
                .append('g')
                .attr('transform', (d, i) => `translate(${(width - 110)}, ${(i * 15)})`)
                .attr('class', 'legend');
            legend.append('rect')
                .attr('width', 10)
                .attr('height', 10)
                .attr('fill', d => colors.find(c => c.label === d.data.label).color);
            legend.append('text')
                .text(d => d.data.label)
                .style('font-size', 10)
                .attr('y', 10)
                .attr('x', 50);
        }
    }
    generateHomerunsChart(batting) {
        if (batting) {
            const margin = {top: 50, right: 50, bottom: 50, left: 50};
            const height = 500 - margin.left - margin.right;
            const width = 500 - margin.top - margin.bottom;
            const xScale = d3.scaleBand().rangeRound([0, width]).padding(.1);
            const yScale = d3.scaleLinear().range([height, 0]);
            const xAxis = d3.axisBottom()
                .scale(xScale);
            const yAxis = d3.axisLeft()
                .scale(yScale);
            const svg = d3.select('#homerunsChart')
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
    generateEraChart(pitching) {
        if (pitching) {
            const margin = {top: 50, right: 50, bottom: 50, left: 50};
            const height = 500 - margin.left - margin.right;
            const width = 500 - margin.top - margin.bottom;
            const data = pitching.map( p => ({ key: p.yearID, value: +p.ERA}));
            const xScale = d3.scaleLinear()
                .domain(d3.extent(data, (d) => d.key))
                .range([0, width]);
            const yScale = d3.scaleLinear()
                .domain([0, d3.max(data, d => d.value)])
                .range([height, 0]);
            const line = d3.line()
                .x( d => xScale(d.key))
                .y( d => yScale(+d.value))
                .curve(d3.curveMonotoneX);
            const svg = d3.select('#eraChart')
                .attr('height', height + margin.top + margin.bottom)
                .attr('width', width + margin.left + margin.right)
                .append('g')
                .attr('transform', `translate(${margin.left}, ${margin.top})`);

            svg.append('g')
                .attr('class', 'x-axis')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom().scale(xScale).tickFormat(d3.format('d')));
            svg.append('g')
                .attr('class', 'y-axis')
                .call(d3.axisLeft(yScale));
            svg.append('path')
                .datum(data)
                .attr('class', 'line')
                .attr('d', line);
            svg.selectAll('.dot')
                .data(data)
                .enter()
                .append('circle')
                .attr('class', 'dot')
                .attr('cx', d => xScale(d.key))
                .attr('cy', d => yScale(d.value))
                .attr('r', 5);
        }
    }
    generatePitchingBreakdownChart(batting) {
        const data = [
            { label: 'Hits', value: batting.map( b => b.H).reduce( (acc, hits) => acc + hits) },
            { label: 'Strikeouts', value: batting.map( b => b.SO).reduce( (acc, so) => acc + so) },
            { label: 'Walks', value: batting.map( b => b.BB).reduce( (acc, walks) => acc + walks) },
            { label: 'Doubles', value: batting.map( b => b['2B']).reduce( (acc, doubles) => acc + doubles) },
            { label: 'Triples', value: batting.map( b => b['3B']).reduce( (acc, triples) => acc + triples) },
            { label: 'Homeruns', value: batting.map( b => b.HR).reduce( (acc, homeruns) => acc + homeruns) },
        ];
        console.log(data);
        const height = 500;
        const width = 500;
        const colors = [
            { label: 'Hits', color: '#FFD180' },
            { label: 'Strikeouts', color: '#7986CB' },
            { label: 'Walks', color: '#3F51B5' },
            { label: 'Doubles', color: '#303F9F' },
            { label: 'Triples', color: '#1A237E' },
            { label: 'Homeruns', color: '#536DFE' },
        ]
        const svg = d3.select('#pitchingBreakdownChart')
            .attr('height', height)
            .attr('width', width)
            .attr('text-anchor', 'middle');
        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);
        const arcs = pie(data);
        const radius = Math.min(width, height) / 2 * 0.8;
        const arcLabel = d3.arc().innerRadius(radius).outerRadius(radius);
        const arc = d3.arc().innerRadius(0).outerRadius(Math.min(width, height) / 2 - 1);
        const g = svg.append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);
        g.selectAll('path')
            .data(arcs)
            .enter().append('path')
            .attr('fill', d => colors.find( c => c.label === d.data.label).color)
            .attr('stroke', 'white')
            .attr('d', arc)
            .append('title')
            .text(d => `${d.data.label}: ${d.data.value}`);
        const text = g.selectAll('text')
            .data(arcs)
            .enter()
            .append('text')
            .attr('transform', d => `translate(${arcLabel.centroid(d)})`)
            .attr('dy', '0.35em');
        text.append('tspan')
            .attr('x', 0)
            .attr('y', '-0.7em')
            .attr('font-weight', 'bold')
            .text(d => d.data.label);
        text.filter(d => (d.endAngle - d.startAngle) > 0.25).append('tspan')
            .attr('x', 0)
            .attr('y', '0.7em')
            .attr('fill-opacity', 0.7)
            .text(d => d.data.value);
    }
}

document.body.onload = (evt) => {
    new PlayerInfo();
};