
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
        const counts = await this.getCounts();
        this.attendenceEl.innerText = `Attendance Records: ${counts.attendance}`;
        this.ballparksEl.innerText = `Ballparks: ${counts.ballparks}`;
        this.peopleEl.innerText = `People (Players, Coaches): ${counts.people}`;
        this.teamsEl.innerText = `Teams: ${counts.teams}`;
        console.log(counts);
    }
    async getCounts() {
        return await this._httpClient.get('https://api.marcswilson.com/api/mlb/chadwick/counts');
    }
}

document.body.onload = (evt) => {
    new Index();
};