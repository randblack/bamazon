var mysql = require("mysql");
require("dotenv").config();
var { table } = require('table');
var prompt = require('prompt');

let orderId = null;
let amount = null;
let itemCost = null;
let stock = null;

let data = [
  ['Item ID', 'Product', 'Department', 'Price (USD)', 'Stock']
];

prompt.start();

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: process.env.WEBSITE_USER,

  // Your password
  password: process.env.WEBSITE_PASSWORD,
  database: "bamazon"
});

connection.connect(function (err) {
  if (err) throw err;
  showInventory();
});

function showInventory() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      data.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]);
    }
    let output = table(data);
    console.log('\n\n\nWelcome to Bamazon!\n\n' + output);
    getOrder();
  });
}

function getOrder() {
  prompt.get(['ProductID', 'Quantity'], function (err, result) {
    if (err) throw err;
    orderId = result.ProductID;
    amount = result.Quantity;
    checkStock();
  });
}

function checkStock() {
  connection.query("SELECT * FROM products WHERE item_id = " + orderId, function (err, res) {
    if (err) throw err;
    if (amount < res[0].stock_quantity) {
      console.log("Insufficient Quantity");

    } else {
      itemCost = res[0].price;
      stock = res[0].stock_quantity;
      placeOrder();
    }
  });
}

function placeOrder() {
  var query = connection.query(
    "UPDATE products SET ? WHERE ?",
    [
      {
        stock_quantity: JSON.stringify(stock - amount)
      },
      {
        item_id: parseInt(orderId)
      }
    ],
    function (err, res) {
      console.log('Inventory Updated\n');
      console.log("Your total will be " + (itemCost * amount));
      data = [
        ['Item ID', 'Product', 'Department', 'Price (USD)', 'Stock']
      ];
      connection.end();
    }
  );
}