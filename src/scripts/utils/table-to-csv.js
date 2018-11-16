// Solution borrowed and modified from https://jsfiddle.net/gengns/j1jm2tjx/

class HtmlTableToCsv {
    constructor(tableElement) {
        if (tableElement instanceof Element) {
            this.tableElement = tableElement;
            this.fileName = 'exported_data.csv';
        } else {
            throw new Error('paramter tableElement must be an HTML Element');
        }
    }
    export() {
        if (this.tableElement instanceof Element) {
            const rows = this.tableElement.querySelectorAll('tr');
            const csvData = [];
            for (const row of rows) {
                const parentTagName = row.parentElement.tagName;
                const rowElements = parentTagName === 'THEAD' ? row.querySelectorAll('th') : row.querySelectorAll('td');
                let rowData = [];
                for (const el of rowElements) {
                    rowData.push(el.innerText);
                }
                csvData.push(rowData.join(','));
                rowData = [];
            }
            if (csvData && Array.isArray(csvData)) {
                return csvData.join('\n');
            }
            throw new Error('Error while exporting data from table');
        } else {
            throw new Error('Invalid tableElement');
        }
    }
    download() {
        const data = this.export();
        const csv = new Blob([data], { type: 'text/csv '});
        const anchor = document.createElement('a');
        anchor.download = this.fileName;
        anchor.href = window.URL.createObjectURL(csv);
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        console.log(data);
    }
}