// https://jsfiddle.net/gengns/j1jm2tjx/
class Explore {
    constructor() {
        this._apiPrefix = `https://api.marcswilson.com/api/mlb/chadwick`;
        this._httpClient = new HttpClient();
        this._collectionsListEl = document.getElementById('collections');
        this.init();
    }
    async init() {
        const collections = await this._httpClient.get(`${this._apiPrefix}/collections`);
        this.generateCollectionList(collections);
    }
    generateCollectionList(collections) {
        if (collections) {
            for (const collection of collections) {
                const li = document.createElement('li');
                li.innerText = collection.name;
                li.onclick = this.collectionChanged.bind(this);
                this._collectionsListEl.appendChild(li);
            }
        }
    }
    async collectionChanged(evt) {
        const collectionName = evt.currentTarget.innerText;
        if (collectionName) {
            const data = await this._httpClient.get(`${this._apiPrefix}/collections/${collectionName}`);
            this.generateDataTable(data);
        }
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

}

document.body.onload = (evt) => {
    new Explore();
};