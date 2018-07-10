DROP DATABASE IF EXISTS bamazon;
CREATE database bamazon;

USE bamazon;

CREATE TABLE products (
  itemID INT NOT NULL,
  product_name VARCHAR(50) NULL,
  department VARCHAR(50) NULL,
  price DECIMAL(10,2) NULL,
  stockQTY INTEGER(10) NULL,
  PRIMARY KEY (itemID)
);

SELECT * FROM products;