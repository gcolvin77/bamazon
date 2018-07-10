var mysql = require("mysql");
var inquirer = require("inquirer");
var boxWidth = "-------------------------------------------------------------------------"
// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "root",
  database: "bamazon"
});

connection.connect();
 
connection.query('SELECT * FROM products', function (error, results) {
  if (error) throw error;
  console.log(results.length);
  console.log(boxWidth);
  console.log("|    Item ID    |    Item Description    |    Category    |    Price    |")
  console.log(boxWidth);

  for(var i = 0; i<results.length; i++){
  console.log("|    " + results[i].itemID + "      |   "+ results[i].product_name + "               "+
               results[i].department + "      "  +  results[i].price);
  }
  console.log(boxWidth);

});
 
connection.end();



