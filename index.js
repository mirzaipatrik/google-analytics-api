const express = require("express");
const app = express();
const { google } = require("googleapis");
const dotenv = require("dotenv");
const fs = require('fs').promises;

dotenv.config();

const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const view_id = process.env.VIEW_ID;

const jwt = new google.auth.JWT(
        process.env.CLIENT_EMAIL,
        null,
        process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes
);

const startDate = new Date("2023-01-01");
const endDate = new Date("2023-06-01");
const dateRange = getDateRange(startDate, endDate, 30); // Assuming 30-day intervals

async function getViews() {
        try {
                const obj = { data: [] };

                for (const range of dateRange) {
                        const formattedStartDate = formatDate(range.start);
                        const formattedEndDate = formatDate(range.end);

                        const response = await google.analytics("v3").data.ga.get({
                                auth: jwt,
                                ids: "ga:" + view_id,
                                "start-date": formattedStartDate,
                                "end-date": formattedEndDate,
                                metrics: "ga:pageviews",
                                dimensions: "ga:month, ga:year, ga:pagePath",
                                sort: "ga:year, ga:month, -ga:pageviews",
                                "max-results": 10000, // Adjust as needed (maximum value: 10000)
                        });
                        response.data.rows.map(row => obj.data.push(({
                                year: row[1],
                                month: row[0],
                                page: row[2],
                                views: row[3]
                        })))
                }

                const json = JSON.stringify(obj);
                await fs.writeFile('historica-bahai-org-pageviews.json', json, 'utf8');

                console.log("JSON file written successfully.");
        } catch (err) {
                console.log(err);
        }
}

function getDateRange(startDate, endDate, intervalDays) {
        const dateRange = [];
        let currentDate = new Date(startDate);

        while (currentDate <= endDate) {
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + intervalDays);
                dateRange.push({ start: new Date(currentDate), end: new Date(nextDate) });
                currentDate = nextDate;
        }

        return dateRange;
}

function formatDate(date) {
        return date.toISOString().slice(0, 10);
}

(async () => {
        await getViews();
})();

app.listen(3000, () => {
        console.log("Listening on port 3000");
});
