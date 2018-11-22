class SearchResult {
    constructor(result) {
        this.playerID = result.playerID;
        this.name = result.name;
        this.teams = result.teams;
        this.birthState = result.birthState;
        this.birthCountry = result.birthCountry;
        this.debut = this.getFriendlyDate(result.debut);
        this.finalGame = this.getFriendlyDate(result.finalGame);
    }
    getFriendlyDate(date) {
        console.log(date);
        if (date) {
            date = new Date(date);
            return `${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()}`;
        }
    }
}

class Search {
    constructor() {
        this._apiPrefix = `https://api.marcswilson.com/api/mlb/chadwick`;
        this._httpClient = new HttpClient();
        this.searchBox = document.getElementById('searchBox');
        this.resultsContainer = document.getElementById('resultsContainer');
        this.bindEvents();
        this.setInitialSearchResults();
    }
    bindEvents() {
        this.searchBox.onkeypress = this.searchPlayers.bind(this);
        this.searchBox.onfocus = this.searchBoxFocus.bind(this);
    }
    searchBoxFocus(evt) {
        this.searchBox.value = '';
    }
    setInitialSearchResults() {
        const json = localStorage.getItem('search_results');
        if (json) {
            this.searchBox.blur();
            const resultsObj = JSON.parse(json);
            this.searchBox.value = resultsObj.term;
            this.generateResultsHtml(resultsObj.results);
        }
    }
    async searchPlayers(evt) {
        const term = evt.currentTarget.value;
        if (evt.key === 'Enter' && term && term.length > 3) {
            const loader = new Loader(`Searching for ${term}...`);
            const response = await this._httpClient.get(`${this._apiPrefix}/players/search/${term}`);
            if (response) {
                const results = response.map( r => new SearchResult(r) );
                localStorage.setItem('search_results', JSON.stringify({ term: term, results: results }));
                this.generateResultsHtml(results);
            }
            loader.destroy();
        }
    }

    generateResultsHtml(results) {
        if (results && Array.isArray(results)) {
            this.resultsContainer.innerHTML = '';
            for (const result of results) {
                const container = document.createElement('div');
                container.innerHTML = `
                <div class="result">
                    <div class="result-header">
                        <h4><a href="../views/player-info.html?playerID=${result.playerID}">${result.name}</a></h4> <span class="divider">|</span> <small>${result.teams.join(', ')}</small>
                    </div>
                    <div class="result-body">
                        ${result.name} played for ${result.teams.length} different teams (${result.teams.join(', ')}).
                        ${result.name} was born in ${result.birthState}, ${result.birthCountry} and had his first
                        debut in Major League Baseball on ${result.debut}. ${result.name}'s last game was ${result.finalGame}
                    </div>
                </div>
            `;
                this.resultsContainer.appendChild(container);
            }
        }
    }
}

document.body.onload = (evt) => {
    new Search();
};