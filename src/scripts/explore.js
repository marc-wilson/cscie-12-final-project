class Explore {
    constructor() {
        this._apiPrefix = `https://api.marcswilson.com/api/mlb/chadwick`;
        this._httpClient = new HttpClient();
        this.filterType = 'teams';
        this.teamsFilterTypeEl = document.getElementById('teams');
        this.playersFilterTypeEl = document.getElementById('players');
        this.yearFilterEl = document.getElementById('yearID');
        this.teamFilterEl = document.getElementById('teamID');
        this.init();
    }

    async init() {
        this.bindEvents();
        this.years = await this.getDistinctYears();
        for (const year of this.years) {
            const option = document.createElement('option');
            option.value = year;
            option.innerText = year;
            this.yearFilterEl.appendChild(option);
        }
    }

    async getDistinctYears() {
        return await this._httpClient.get(`${this._apiPrefix}/years`);
    }

    async onYearIdChange(evt) {
        const year = evt.currentTarget.value;
        if (this.filterType === 'teams') {
            const teams = await this._httpClient.get(`${this._apiPrefix}/years/${year}/teams`);
            this.generateDataTable(teams);
            this.teamFilterEl.innerHTML = '';
            for (const team of teams) {
                const option = document.createElement('option');
                option.value = team.teamID;
                option.innerText = team.name;
                this.teamFilterEl.appendChild(option);
            }
        }
    }

    bindEvents() {
        this.teamsFilterTypeEl.onchange = this.onFilterTypeChange.bind(this);
        this.playersFilterTypeEl.onchange = this.onFilterTypeChange.bind(this);
        this.yearFilterEl.onchange = this.onYearIdChange.bind(this);
    }

    generateDataTable(data) {
        const thead = document.querySelector('#datatable thead');
        const theadTr = document.createElement('tr');
        const tbody = document.querySelector('#datatable tbody');
        const columns = data && data.length > 0 ? Object.keys(data[0]) : [];
        thead.innerHTML = '';
        tbody.innerHTML = '';
        for (const column of columns) {
            const th = document.createElement('th');
            th.innerText = column;
            theadTr.appendChild(th);
        }
        thead.appendChild(theadTr);
        for (const row of data) {
            const tr = document.createElement('tr');
            const features = Object.values(row);
            for (const value of features) {
                const td = document.createElement('td');
                td.innerText = value;
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
        console.log(columns);

    }

    onFilterTypeChange(evt) {
        console.log(evt.currentTarget.value);
        this.filterType = evt.currentTarget.value;
    }
}

document.body.onload = (evt) => {
    new Explore();
};