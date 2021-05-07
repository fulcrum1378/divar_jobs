import * as fs from 'fs';

import fetch from 'node-fetch'

import {Analyzer} from "./analyze.js";
import * as view from './view.js';


const doNothing = () => {
};
const prettify = (j) => JSON.stringify(j, null, 2);
const instillDict = (theList) => {
    for (const i of theList) {
        let data = i["data"], token = i["data"]["token"];
        delete data["index"];
        //delete data["token"];
        delete data["category"];
        data["link"] = encodeURI("https://divar.ir/v/" + data["title"].replace(/ /g, "-") + "/" + token);
        dict[token] = data;
    }
};
const getSince = () => {
    if (task.length === 0) return;
    fetch("https://api.divar.ir/v8/search/8/computer-and-it", {
        "body": "{\"json_schema\":{\"category\":{\"value\":\"computer-and-it\"}},\"last-post-date\":"
            + task[0] + "}",
        "method": "POST",
    }).then(r => r.json())
        .then((json) => { // list = list.concat();
            if (json === undefined) return finish(json);
            if (json["widget_list"] === undefined) return finish(json);
            if (json["widget_list"].length === 0) return finish(json);
            instillDict(json["widget_list"]);
            task.shift();
            task.push(json["last_post_date"]);
            getSince();
        });
    // widget_list == web_widgets.post_list (BOTH CONTAIN 24 ITEMS), first_post_date, last_post_date
};
const finish = (ending = null) => {
    let list = [];
    for (const i in dict) // noinspection JSUnfilteredForInLoop
        list.push(dict[i]);
    fs.writeFile('widget_list.json', prettify(list), doNothing);
    let a = preload["browse"]["items"].length, b = list.length;
    if (a === b) {
        fs.writeFile('last_response.json', prettify(ending), doNothing);
        console.log("PRELOAD: " + a);
        console.log("TOTAL:   " + b);
    } else console.log("RECEIVED " + b + " JOBS!!");
    new Analyzer(view.filter(list));
};

let dict = {}, task = [], preload = null;
fetch("https://divar.ir/s/qom/it-computer-jobs")
    .then(r => r.text())
    .then(b => {
        let j = b.substring(b.indexOf("window.__PRELOADED_STATE__"), b.indexOf("window.env"));
        j = j.substring(j.indexOf("\"") + 1, j.lastIndexOf("\""));
        preload = JSON.parse(j.replace(/\\"/g, "\""));
        fs.writeFile('preload_state.json', prettify(preload), doNothing);
        instillDict(preload["browse"]["items"]);
        task.push(preload["browse"]["lastPostDate"]);
        getSince();
    });
