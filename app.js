// Importing Dependencies
const axios = require("axios");
const cheerio = require("cheerio");
const converter = require("json-2-csv");
const fs = require("fs");

// Function to convert from JSON to csv and write to file
function writeCsv(data) {
  converter.json2csv(data, function (err, csvData) {
    fs.writeFileSync("data/result.csv", csvData);
  });
}

// Function to fetch data from wikipedia page
function fetchData(url) {
  axios
    .get(url)
    .then(function (response) {
      // Creating Cheerio object from html data
      const $ = cheerio.load(response.data);
      // Fetching the desired table and converting it to JSON
      let result = $(".wikitable.sortable tbody tr")
        .map((i, el) => ({
          country: $(el).find("td:nth-of-type(1)").text().trim(),
          year: 2018,
          area: $(el).find("td:nth-of-type(2)").text().trim(),
          population: $(el).find("td:nth-of-type(3)").text().trim(),
          gdp_per_capita: $(el).find("td:nth-of-type(4)").text().trim(),
          population_density: $(el).find("td:nth-of-type(5)").text().trim(),
          vehicle_ownership: $(el).find("td:nth-of-type(6)").text().trim(),
          total_road_deaths: parseFloat($(el).find("td:nth-of-type(8)").text().trim().replace(/,/g, '')),
          road_deaths_per_million_inhabitants: $(el)
            .find("td:nth-of-type(9)")
            .text()
            .trim(),
        }))
        .get()
        .filter(
          (accidentData) =>
            accidentData.road_deaths_per_million_inhabitants != ""
        )
        .sort(function (v1, v2) {
          return (
            v1.road_deaths_per_million_inhabitants -
            v2.road_deaths_per_million_inhabitants
          );
        });
      // Coverting JSON result into csv
      writeCsv(result);
    })
    // Handling any axios error
    .catch(function (error) {
      console.log(error);
    });
}
// Function call for wikipedia road safety in Europe
fetchData("https://en.wikipedia.org/wiki/Road_safety_in_Europe");
