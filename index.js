const express = require("express");
const app = express();
const { google } = require("googleapis");
require("dotenv").config();

const scopes = "https://www.googleapis.com/auth/analytics.readonly";
const view_id = process.env.VIEW_ID;

const jwt = new google.auth.JWT(
        process.env.CLIENT_EMAIL,
        null,
        process.env.PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes
);

async function getViews() {
        try {
                await jwt.authorize();

                const response = await google.analytics("v3").data.ga.get({
                        auth: jwt,
                        ids: "ga:" + view_id,
                        "start-date": "2021-01-01",
                        "end-date": "today",
                        metrics: "ga:pageviews",
                        dimensions: "ga:month,ga:pagePath",
                        sort: "-ga:pageviews",
                        "max-results": 100, // Adjust the number of top pages as needed
                });

                response.data.rows.map(row => {
                        console.log(row)
                });

        } catch (err) {
                console.log(err);
        }
};

getViews();

app.listen(3000, () => {
        console.log("Listening of port 3000")
})