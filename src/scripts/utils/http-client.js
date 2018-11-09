class HttpClient {
    constructor(){}
    async get(url) {
        return new Promise( (resolve, reject) => {
            const xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = (evt) => {
                if (evt.currentTarget.readyState === 4 && evt.currentTarget.status === 200) {
                    try {
                        const response = JSON.parse(evt.currentTarget.response);
                        resolve(response);
                    } catch (exception) {
                        reject(exception);
                    }
                }
            };
            xhttp.open('GET', url, true);
            xhttp.send();
        });
    }
}