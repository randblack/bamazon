var mysql = require("mysql");
require("dotenv").config();
var { table } = require('table');
var prompt = require('prompt');
let data = [
  ['Item ID', 'Product', 'Department', 'Price (USD)', 'Stock']
];
var schema = {
  properties: {
    menuChoice: {
      message: '\n1. View Products for Sale\n2. View Low Inventory\n3. Add to Inventory\n4. Add New Product\n\nSelection',
      required: true
    }
  }
};

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
  getMenu();
});

function getMenu() {
  prompt.get(schema, function (err, result) {
    if (err) throw err;
    selection = result.menuChoice;
    console.log(selection);
    switch (selection) {
      case '1':
        showProducts();
        break;
      case '2':
        showLowInventory();
        break;
      case '3':
        increaseInventory();
        break;
      case '4':
        addProduct();
        break;
    }
  });
}

function showProducts() {
  data = [
    ['Item ID', 'Product', 'Department', 'Price (USD)', 'Stock']
  ];
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      data.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]);
    }
    let output = table(data);
    console.log('\n\n\nWelcome to Bamazon Manager!\n\n' + output);
    getMenu();
  });
}

function showLowInventory() {
  data = [
    ['Item ID', 'Product', 'Department', 'Price (USD)', 'Stock']
  ];
  connection.query("SELECT * FROM products WHERE stock_quantity BETWEEN 0 and 5", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      data.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]);
    }
    let output = table(data);
    console.log('\n\n\nWelcome to Bamazon Manager!\n\n' + output);
    getMenu();
  });
}

function increaseInventory() {
  connection.query("SELECT * FROM products", function (err, res) {
    if (err) throw err;
    for (i = 0; i < res.length; i++) {
      data.push([res[i].item_id, res[i].product_name, res[i].department_name, '$' + res[i].price, res[i].stock_quantity]);
    }
    console.log('\n\n\nCurrent Inventory:\n\n' + table(data));
    prompt.get(['product_id', 'quantity'], function (err, result) {
      if (err) throw err;
      var productId = result.product_id;
      var product = res[(productId - 1)].stock_quantity;
      var quantity = result.quantity;
      var newStock = (parseInt(quantity) + parseInt(product));
      connection.query('UPDATE products SET stock_quantity = ' + newStock + ' WHERE item_id = ' + productId, function (err, res) {
        if (err) throw err;
        showProducts();
      });
    });
  });
}

function addProduct() {
  prompt.get(['product_name', 'department', 'price', 'stock_quantity'], function (err, result) {
    if (err) throw err;
    var name = result.product_name;
    var department = result.department;
    var price = result.price;
    var stockQuantity = result.stock_quantity;
    console.log(name + department + price + stockQuantity);

    connection.query("INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES ('" + name + "', '" + department + "', '" + price + "', '" + stockQuantity + "')", function (err, res) {
      if (err) throw err;
      showProducts();
    });
  });
}
