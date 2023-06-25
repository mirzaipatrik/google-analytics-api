const fs = require("fs");
fs.readFile("./historica-bahai-org-pageviews.json", "utf8", (err, jsonString) => {
        if (err) {
                console.log("File read failed:", err);
                return;
        }
        try {
                const data = JSON.parse(jsonString);
                data.data.map((dat) => {
                        if (dat.page === '/ar/') {
                                console.log(dat)
                        }
                })
        } catch {
                (err)
                console.log(err)
        }
});