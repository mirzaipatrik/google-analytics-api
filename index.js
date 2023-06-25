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

function formatDate(date) {
        console.log(date.toISOString().slice(0, 10))
        return date.toISOString().slice(0, 10);
}

const dateRangeGenerator = (startYear, endYear) => {
        let arrayContainingYears = [];
        for (let i = startYear; i < endYear + 1; i++) {
                arrayContainingYears.push(i);
        }
        return arrayContainingYears;
};

const listOfYears = dateRangeGenerator(2006, 2023);

function getDateRange() {
        const dateRange = [];
        const daysPerMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        const today = new Date();

        for (const year of listOfYears) {
                for (const [monthIndex, days] of daysPerMonth.entries()) {
                        const startDate = new Date(Date.UTC(year, monthIndex, 1));
                        const endDate = new Date(Date.UTC(year, monthIndex, days));

                        if (endDate > today) {
                                // Break the loop if endDate is greater than today's date
                                break;
                        }

                        dateRange.push({
                                start: startDate,
                                end: endDate,
                        });
                }
        }

        return dateRange;
}

const dateRange = getDateRange();


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
                                year: Number(row[1]),
                                month: Number(row[0]),
                                page: row[2],
                                views: Number(row[3])
                        })))
                }

                const json = JSON.stringify(obj);
                await fs.writeFile('historica-bahai-org-pageviews.json', json, 'utf8');

                console.log("JSON file written successfully.");
        } catch (err) {
                console.log(err);
        }
}

(async () => {
        await getViews();
})();

app.listen(3000, () => {
        console.log("Listening on port 3000");
});
