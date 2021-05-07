import express from 'express';

import * as view from './view.js';


const app = express();
const port = 2211, host = "192.168.1.9";
app.set('view engine', 'pug');

app.get('/', (req, res) => {
    let ret = view.main(),
        myList = view.filter(ret[0]),
        myAnal = view.analyze(ret[1]);
    myList.sort((a, b) => a["title"].localeCompare(b["title"]));
    myList.sort((a, b) => {
        if (myAnal[a["token"]].length < myAnal[b["token"]].length) return 1;
        if (myAnal[a["token"]].length > myAnal[b["token"]].length) return -1;
        return 0;
    });
    res.render('index', {
        title: "Divar Jobs",
        list: myList,
        anal: myAnal
    });
});
app.get('/tools/:name', (req, res, _) =>
    res.sendFile(req.params.name, view.options("tools"), (_) => {
    }));
app.get('/media/:name', (req, res, _) =>
    res.sendFile(req.params.name, view.options("media"), (_) => {
    }));

app.listen(port, host, () => {
    // noinspection HttpUrlsUsage
    console.log(`Example app listening at http://${host}:${port}`);
});
