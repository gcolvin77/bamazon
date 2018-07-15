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
var departments = [];

connection.query('SELECT * FROM products', function (error, results) {

  if (error) throw error;  
    
     for(var i = 0; i<results.length; i++){
            itemNumbers.push(results[i].itemID);
        }
});

var userInput = function(){
    inquirer.prompt([{
      type: "list",
      message: "What would you like to do?",
      name: "choice",
      choices: ['View Products for Sale', 'Check Low Inventory', 'Add to Inventory', 'Add New Product']
    }]).then(function(answers) {
    
        switch (answers.choice) {
            case 'View Products for Sale' :
                    viewProducts();

                    break;
            case 'Check Low Inventory' :
                    checkLow();

                    break;
            case 'Add to Inventory' :
                    addInventory();

                    break;
            case 'Add New Product' :
                    addProduct();

                    break;
        }
        
    });
    
    }//end function userInput

        var viewProducts = function(){
            connection.query('SELECT * FROM products', function (error, results) {

                if (error) throw error;  
              
                  var tableRow =[];
                  var table = new Table({
                    head: ['Item #', 'Description', 'Category', 'Price', 'QTY in Stock']
                  , colWidths: [8, 30, 18, 10, 15]
                  });
                   for(var i = 0; i<results.length; i++){
                                     
                          tableRow[i] = [results[i].itemID, results[i].product_name, results[i].department, "$" +
                           results[i].price.toFixed(2), results[i].stockQTY]
                          table.push(tableRow[i]);                   
                      }//end for loop                          
                          console.log(table.toString());
                          userInput();              
              });

        } //end function viewProducts

        var checkLow = function(){
            connection.query('SELECT * FROM products WHERE stockQTY<6', function (error, results) {

                if (error) throw error;  
              
                  var tableRow =[];
                  var table = new Table({
                    head: ['Item #', 'Description', 'Category', 'Price', 'QTY in Stock']
                  , colWidths: [8, 30, 18, 10, 15]
                  });
                   for(var i = 0; i<results.length; i++){
                                     
                          tableRow[i] = [results[i].itemID, results[i].product_name, results[i].department, "$" +
                           results[i].price.toFixed(2), results[i].stockQTY]
                          table.push(tableRow[i]);                   
                      }//end for loop                          
                          console.log(table.toString());
                          userInput();              
              });

        } //end function checkLow

        var addInventory = function(){

                inquirer.prompt([{
                type: "input",
                message: "Enter Item # for which you'd like to add stock",
                name: "item"
              }]).then(function(answers) {
                var chosenItem = parseInt(answers.item)
                var addedQTY = 0;
                if(itemNumbers.indexOf(chosenItem) === -1){
                  console.log("Invalid entry, please check list carefully");
                  addInventory();
                }

                else{

                    inquirer.prompt([{
                        type: "input",
                        message: "How many units do you want to add to inventory?",
                        name: "count"
                      }]).then(function(answers) {
                         addedQTY = parseInt(answers.count)
                            if(addedQTY<0 || typeof addedQTY != 'number'){
                                 console.log("Positive numbers only")  
                                 addInventory(); 
                            }

                            else{
                                connection.query('SELECT * FROM products WHERE itemID=' + chosenItem, function (error, results) {

                                    if (error) throw error;  
                                    console.log(results[0]);
                                    console.log(addedQTY);
                                    var newQTY = results[0].stockQTY + addedQTY;                           

                                var query = "UPDATE products SET stockQTY = " + newQTY + " WHERE ?";
                                connection.query(query, { itemID: chosenItem }, function(error, results) {
                                  if (error) throw error;

                                  console.log(addedQTY + " unit(s) added for Item #" +chosenItem);
                                  userInput();

                                });
                             });
                            } // end else 
                        })      
                    }
              });             
        } //end function addInventory                  

            
        var departmentCollect = function(){
            connection.query('SELECT department FROM departments', function (error, results) {

                if (error) throw error; 
                
                for(var i=0; i<results.length; i++){
                        
                     if(departments.indexOf(results[i].department) === -1) {
                        departments.push(results[i].department);
                      }
                }
                userInput();
            })
        }//end departmentCollect


            var addProduct = function(){
            
            inquirer.prompt([{
            type: "list",
            message: "Select existing category or add new category",
            name: "category",
            choices: departments
          }]).then(function itemName (answers1) {
                var chosenCategory = answers1.category;

                inquirer.prompt([{
                    type: "input",
                    message: "Enter item name (50 characters max)",
                    name: "name"
                }]).then(function itemIDPrompt(answers2) {
                    var chosenName = answers2.name;
                        inquirer.prompt([{
                            type: "input",
                            message: "Enter item ID (5 digits)",
                            name: "ID"
                        }]).then(function pricePrompt(answers3) {                      
                            var chosenID = parseInt(answers3.ID);
                            if(chosenID>99999 || chosenID<10000 || isNaN(chosenID)) {
                                console.log("Please enter 5 digit ID between 10000 and 99999");
                                itemIDPrompt(answers2);
                            }
                            if(chosenID<=99999 && chosenID>=10000 && !isNaN(chosenID))
                                inquirer.prompt([{
                                    type: "input",
                                    message: "Enter price",
                                    name: "price"
                                }]).then(function qtyPrompt (answers4) {
                                    var chosenPrice = parseFloat(answers4.price);
                                        if(chosenPrice<=0 || isNaN(chosenPrice)) {
                                            console.log("Please enter number greater than zero");
                                            pricePrompt(answers3);
                                        }

                                        if(chosenPrice>0 && !isNaN(chosenPrice))
                                        inquirer.prompt([{
                                            type: "input",
                                            message: "Enter initial quantity",
                                            name: "qty"
                                        }]).then(function(answers5) {
                                            var chosenQty = parseInt(answers5.qty);
                                            if(chosenQty<=0 || isNaN(chosenQty)) {
                                                console.log("Please enter number greater than zero");
                                                qtyPrompt(answers4);
                                            }

                                            if(chosenQty>0 && !isNaN(chosenQty)){
                                               
                                                var query = "INSERT INTO products VALUES(" + chosenID + ", '" + chosenName + "', '" +
                                                    chosenCategory +"', " + chosenPrice + ", "  + chosenQty + ", " + 0 +")";
                                                 connection.query(query, function(error, results) {
                                                  if (error) throw error;
                
                                                  console.log("\nItem #" + chosenID + " successfully added");
                                                  departmentCollect();

                                                })                                            
                                                
                                            }

                           }) //end QTY prompt
                      }) // end price prompt
                  }) //end item ID prompt
             }) // end item name prompt
          })// end inital prompt 
        
          
    } //end function addProduct




    departmentCollect();
    