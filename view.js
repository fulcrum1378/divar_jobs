import * as fs from 'fs';

var removeWheneverSaw = ["اینستاگرام", "اینستگرام", "تایپ", "تولید محتوا", "ASP.NET", "Asp",
    "برقکار", "تعمیرکار", "شبکه اجتماعی", "تلگرام", "محتوای ", "نصاب دوربین", "بازاریاب", "تولیدکننده محتوا",
    "اینستا", ".NET", "پیج", "ادمین", "میلیونی", "نویسنده", "پول ساز", "asp .net", "پولساز", "سخت افزار",
    "در منزل", "درمنزل", "کار با گوشی", "کاربا گوشی", "کار باگوشی", "در خانه", "درخانه", "با گوشی", "باگوشی"];
var graphics = ["فتوشاپ", "ایلوستراتور", "کورل", "گرافیست", "گرافیک"];
var seo = ["SEO", "سئو"];

export function main() {
    try {
        var list = JSON.parse(fs.readFileSync('widget_list.json', 'utf8'));
        var anal = JSON.parse(fs.readFileSync('analytics.json', 'utf8'));
    } catch (err) {
        console.log("Please load the jobs, first!");
        process.exit(1);
    }
    return [list, anal];
}

function hasAny(str, list = removeWheneverSaw) {
    let b = false;
    for (const i of list) if (str.includes(i)) b = true;
    return b;
}

export function filter(list) {
    let filtered = [];
    for (const i of list) {
        if (hasAny(i["title"])) continue;
        if (hasAny(i["title"], graphics)) continue;
        if (hasAny(i["title"], seo)) continue;
        filtered.push(i);
    }
    return filtered;
}

export function options(folder = "") {
    return {
        root: './' + folder,
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    };
}

function filterByWord(dict, word, pre_filtered = null) {
    let filtered = {};
    for (const i in dict) {
        let anal = (pre_filtered == null) ? "" : pre_filtered[i], sub = dict[i];
        for (let f = 0; f < 100; f++) {
            let found = sub.indexOf(word);
            if (found === -1) break;
            anal += "...." + sub.substring(found - 5, found + 60).replace(/\n/g, "")
                + ".....\n";
            sub = sub.substring(found + word.length);
        }
        filtered[i] = anal;
    }
    return filtered;
}

export function analyze(dict) {
    let filtered = filterByWord(dict, "حقوق");
    filtered = filterByWord(dict, "میلیون", filtered);
    filtered = filterByWord(dict, "تومان", filtered);
    return filtered;
}
