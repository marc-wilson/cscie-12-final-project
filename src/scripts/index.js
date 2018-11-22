
class Index {
    constructor() {
        this._httpClient = new HttpClient();
        this.attendenceEl = document.getElementById('attendance');
        this.ballparksEl = document.getElementById('ballparks');
        this.peopleEl = document.getElementById('people');
        this.teamsEl = document.getElementById('teams');
        this.init();
    }
    async init() {
        const loader = new Loader('Fetching data...');
        const counts = await this.getCounts();
        const franchises = await this.getOldestFranchises();
        console.log(franchises);
        this.generateOldestFranchisesCharts(franchises);
        this.attendenceEl.innerText = `Attendance Records: ${counts.attendance}`;
        this.ballparksEl.innerText = `Ballparks: ${counts.ballparks}`;
        this.peopleEl.innerText = `People (Players, Coaches): ${counts.people}`;
        this.teamsEl.innerText = `Teams: ${counts.teams}`;
        loader.destroy();
    }
    async getCounts() {
        return await this._httpClient.get('https://api.marcswilson.com/api/mlb/chadwick/counts');
    }
    async getOldestFranchises() {
        return await this._httpClient.get('https://api.marcswilson.com/api/mlb/chadwick/franchise/oldest');
    }
    generateOldestFranchisesCharts(data) {
        const margin = { top: 20, right: 20, bottom: 30, left: 40 };
        const width = 1200 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
        const svg = d3.select('#oldestFranchisesChart');
        svg.attr('height', height + margin.top + margin.bottom);
        svg.attr('width', width + margin.left + margin.right);
        const g = svg.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);
        const xScale0 = d3.scaleBand()
            .rangeRound([0, width])
            .paddingInner(0.1);
        const xScale1 = d3.scaleBand()
            .padding(0.05);
        const yScale = d3.scaleLinear()
            .rangeRound([height, 0]);
        const zScale = d3.scaleOrdinal()
            .range(['#9E9E9E', '#424242']);
        const keys = ['count', 'winPercentage'];
        xScale0.domain(data.map( d => d.name));
        xScale1.domain(keys).rangeRound([0, xScale0.bandwidth()]);
        yScale.domain([0, d3.max(data, d => d3.max(keys, k => d[k]))]);

        g.append('g')
            .selectAll('g')
            .data(data)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${xScale0(d.name)}, 0)`)
            .selectAll('rect')
            .data(d => keys.map( k => ({key: k, value: d[k]})))
            .enter()
            .append('rect')
            .attr('x', d => xScale1(d.key))
            .attr('y', d => yScale(d.value))
            .attr('width', xScale1.bandwidth())
            .attr('height', d => height - yScale(d.value))
            .attr('fill', d => zScale(d.key));
        g.append('g')
            .attr('class', 'axis')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xScale0));
        g.append('g')
            .attr('class', 'axis')
            .call(d3.axisLeft(yScale).ticks(null, 's'))
            .append('text')
            .attr('x', 2)
            .attr('y', yScale(yScale.ticks().pop()) + 0.5);
        const legend = g.append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 10)
            .attr('text-anchor', 'end')
            .selectAll('g')
            .data(['Total Seasons', 'Win Percentage'])
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(0, ${i * 20})`);
        legend.append('rect')
            .attr('x', width - 19)
            .attr('width', 19)
            .attr('height', 19)
            .attr('fill', zScale);
        legend.append('text')
            .attr('x', width - 24)
            .attr('y', 9.5)
            .attr('dy', '0.32em')
            .text( d => d);

    }
}

document.body.onload = (evt) => {
    new Index();
};