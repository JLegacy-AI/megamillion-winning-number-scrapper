const fs = require("fs");

// Function to parse CSV data
const parseCSVData = (csvData) => {
  const lines = csvData.split("\n");
  const dates = [];
  const numbers = [];
  const totalData = [];
  for (let i = 0; i < lines.length; i++) {
    const [date, ...data] = lines[i].split(",");
    if (i != lines.length - 1) dates.push(date);
    if (i != 0) numbers.push(data);
  }
  console.log(dates.length, numbers.length);

  for (let i = 0; i < dates.length; i++) {
    totalData.push([dates[i], ...numbers[i]]);
  }

  // Write totalData to a new CSV file
  const csvContent = totalData.map((row) => row.join(",")).join("\n");
  fs.writeFileSync("output.csv", csvContent);
  console.log("Data has been saved to output.csv");
};

// Read the CSV file
const filePath = "numbers.csv"; // Replace with the path to your CSV file

const csvData = fs.readFileSync(filePath, "utf-8");

parseCSVData(csvData);
