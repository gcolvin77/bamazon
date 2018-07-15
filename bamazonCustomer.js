var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');


var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "root",
  database: "bamazon"
});

connection.connect();

var itemNumbers = [];

connection.query('SELECT * FROM products', function (error, results) {

  if (error) throw error;  

    var tableRow =[];
    var table = new Table({
      head: ['Item #', 'Description', 'Category', 'Price']
    , colWidths: [8, 30, 18, 10]
    });
     for(var i = 0; i<results.length; i++){
                       
            tableRow[i] = [results[i].itemID, results[i].product_name, results[i].department, "$" + results[i].price.toFixed(2)]
            table.push(tableRow[i]);
            itemNumbers.push(results[i].itemID);
        }//end for loop
            
            console.log(table.toString());

});

var userInput = function(){
inquirer.prompt([{
  type: "input",
  message: "What item # would you like to purchase?",
  name: "item"
}]).then(function(answers) {

    var chosenItem = parseInt(answers.item)
    if(itemNumbers.indexOf(chosenItem) === -1){
      console.log("Invalid entry, please check list carefully");
      userInput();
    }
    else{
      inquirer.prompt([{
        type: "input",
        message: "How many would you like to purchase?",
        name: "count"
      }]).then(function(answers) {
         var qty = parseInt(answers.count); 
         getDB(chosenItem,qty);
      });

    }  
});

}//end function userInput

userInput();

var getDB = function(chosenItem, qty){

      var query = "SELECT * FROM products WHERE ?";
      connection.query(query, { itemID: chosenItem }, function(error, results) {
        if (error) throw error;

        if(qty>results[0].stockQTY){
          console.log("Sorry we only have " + results[0].stockQTY + " of that item in stock")
          userInput();
        }

        else{
        var order = results;
        var newQTY = parseInt(results[0].stockQTY - qty);

        updateDB(chosenItem, newQTY, order, qty);}
      });
}//end getDB
 
var updateDB = function(chosenItem, newQTY, order, qty){

  var query = "UPDATE products SET stockQTY = " + newQTY + " WHERE ?";
  connection.query(query, { itemID: chosenItem }, function(error, results) {
    if (error) throw error;
    
    var tableRow =[];
    var table = new Table({
      head: ['Item #', 'Description','Price', 'Quantity', 'Total'  ]
    , colWidths: [8, 30, 18, 10, 10] 
    });          

            tableRow= [order[0].itemID, order[0].product_name, "$" + order[0].price.toFixed(2), 
            qty, "$" + parseFloat(order[0].price.toFixed(2))* qty];
            
            table.push(tableRow); 
            console.log("Congratulations, order placed. Here's your invoice");
            console.log(table.toString());
            connection.end();
    
  })

  var totalSales = order[0].product_sales + (parseFloat(order[0].price.toFixed(2))* qty);
  var query = "UPDATE products SET product_sales = " + totalSales + " WHERE ?";
  connection.query(query, { itemID: chosenItem }, function(error, results) {
    if (error) throw error;
  
  })

} //end updateDB





 

