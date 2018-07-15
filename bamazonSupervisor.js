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

var userInput = function(){
            
    inquirer.prompt([{
    type: "list",
    message: "What would you like to do?",
    name: "choice",
    choices: ['View Product Sales By Department', 'Create New Department']
  }]).then(function (answers) {
        switch (answers.choice){
            case 'View Product Sales By Department':
            viewProducts();
            break

            case 'Create New Department':
            createDepartment();
            break

        }
  })



}// end userInput


        var viewProducts = function() {

            var query = "SELECT departments.department_id, departments.department, departments.overhead_costs," 
            query += " SUM(products.product_sales) AS total_sales FROM departments LEFT JOIN products ON departments.department = products.department"
            query += " GROUP BY department;";

            connection.query(query, function (error, results) {
                

                var tableRow =[];
                var table = new Table({
                head: ['Department ID', 'Department Name', 'Overhead Costs', 'Product Sales', 'Total Sales']
                        , colWidths: [16, 30, 16, 16, 16]
                        });                            

                    for(var i = 0; i<results.length; i++){
                        if (results[i].total_sales == null) {
                            results[i].total_sales = 0;
                        }


                        var totalProfit = results[i].total_sales - results[i].overhead_costs;
                                
                        tableRow[i] = [results[i].department_id, results[i].department, "$" +
                        results[i].overhead_costs.toFixed(2), "$" + results[i].total_sales.toFixed(2), "$" + totalProfit.toFixed(2)]
                        table.push(tableRow[i]);                   
                        }//end for loop                          
                        console.log(table.toString());
                        userInput();   

                    })

}//end viewProducts

            var createDepartment = function(){

                inquirer.prompt([{
                    type: "Input",
                    message: "Enter the name of the new department",
                    name: "dept"
                }]).then(function departmentID (answers) {

                            var chosenDeptName = answers.dept;

                            inquirer.prompt([{
                            type: "input",
                            message: "Enter Department ID",
                            name: "ID"
                        }]).then(function deptOverhead (answers2) {

                            var deptID = parseInt(answers2.ID);
                            if(deptID>999 || deptID<100 || isNaN(deptID)) {
                                console.log("Please enter 3 digit ID between 100 and 999");
                                departmentID(answers);
                            }

                            if(deptID<=999 && deptID>=100 && !isNaN(deptID))
                                    inquirer.prompt([{
                                        type: "input",
                                        message: "Enter Overhead Cost",
                                        name: "overhead"
                                    }]).then(function  (answers3) {
                                        var chosenOverhead = parseInt(answers3.overhead);

                                        if(chosenOverhead<0 || isNaN(chosenOverhead)) {
                                            console.log("Please enter a valid number greater than zero");
                                            deptOverhead (answers2);
                                        }

                                       if(chosenOverhead>0 && !isNaN(chosenOverhead)){
                                          var query = "INSERT INTO departments VALUES(" + deptID + ", '" + chosenDeptName + "', " + chosenOverhead + ")";
                                          connection.query(query, function(error, results) {
                                             if (error) throw error;
                                             console.log("\nDepartment '" + chosenDeptName + "' successfully added");
                                               userInput();
                                             

                                           })                                  
                                         }   

                                       /*   if(chosenOverhead>0 && !isNaN(chosenOverhead)){
                                            var query = "UPDATE products SET product_sales = 0 WHERE department= " + chosenDeptName;
                                            console.log(query);
                                            connection.query(query, function(error, results) {
                                               if (error) throw error;
                  
                                               console.log("\nDepartment '" + chosenDeptName + "' successfully added");
                                               userInput();
  
                                             })                                  
                                           }   */
                                        
                                        })         
                                })  //end deptOverhead       
                            }) //end deptID
                        } //end createDepartment

        userInput();