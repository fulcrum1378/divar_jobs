import * as fs from 'fs';

import fetch from 'node-fetch';


var beg = '<div class="kt-container"', begOnFailed = '<body', end = '<footer', endOnFailed = '<script';

// 53mb for 159 pages!!
export class Analyzer {
    constructor(list) {
        this.list = list;
        this.results = {};
        this.exec(0);
    }

    exec(i) {
        console.log("ANALYZING: " + i);
        if (this.list.length <= i) {
            this.finish();
            return;
        }
        fetch(this.list[i]["link"]).then(r => {// YOU COULD USE "async" & "await" INSTEAD OF RECURSION
            if (r.ok) return r.text();// ALWAYS RETURN THE RESULT!!
            else this.results[this.list[i]["token"]] = "!!!";
        }).then(b => {
            if (b === undefined || !(typeof b === 'string' || b instanceof String)) {
                this.results[this.list[i]["token"]] = typeof b;
                this.exec(i + 1);
                return;
            }
            let iBody = b.indexOf(begOnFailed);
            if (iBody === -1) {
                this.results[this.list[i]["token"]] = b + "";
                this.exec(i + 1);
                return;
            }
            let content = b.substring(iBody), iDesc = content.indexOf(beg);
            if (iDesc === -1) {
                this.results[this.list[i]["token"]] = content + "";
                this.exec(i + 1);
                return;
            }
            content = content.substring(iDesc);
            let clip = content.indexOf(end);
            if (clip !== -1) content = content.substring(0, clip);
            let clipOnFailed = content.indexOf(endOnFailed);
            if (clipOnFailed !== -1) content = content.substring(0, clipOnFailed);

            this.results[this.list[i]["token"]] = content;
            this.exec(i + 1);
        });
    }

    finish() {
        fs.writeFile('analytics.json', JSON.stringify(this.results, null, 2), () => {
        });
    }
}
