test();

async function test() {
    const http = new HttpClient();
    const result = await http.get('https://api.marcswilson.com/api/mlb/chadwick/counts');
    console.log('the result', result);
}