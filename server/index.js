const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db");

const multer = require("multer");
const upload = multer({ dest: "images/" });

const fs = require("fs");

// middleware
app.use(cors());
app.use(express.json());

//Routes//

// auth a user

app.post("/users/auth", async (req, res) => {
  try {
    const { user_email, user_password } = req.body;
    const checkUser = await pool.query(
      "SELECT admin FROM users WHERE email = $1 AND password = $2",
      [user_email, user_password]
    );
    if (checkUser.rows.length === 0) {
      res.status(404).json({ message: "User not found" });
    } else {
      res.json(checkUser.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
  }
});

//create a user
app.post("/users", async (req, res) => {
  try {
    const { user_email, user_password, admin } = req.body;
    const userUnique = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [user_email]
    );
    if (userUnique.rows.length !== 0) {
      res.status(404).json({ message: "User already exist" });
    } else {
      const newUser = await pool.query(
        "INSERT INTO users(email,password,admin) VALUES ($1,$2,$3) RETURNING *",
        [user_email, user_password, admin]
      );
      res.json(newUser.rows[0]);
    }
  } catch (error) {
    console.error(error.message);
  }
});

//get all users

app.get("/users", async (req, res) => {
  try {
    const allUsers = await pool.query("SELECT * FROM users");
    res.json(allUsers.rows);
  } catch (error) {}
});

//get a user by id

app.get("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    res.json(user.rows[0]);
  } catch (error) {}
});

// delete a user
app.delete("/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletUser = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [id]
    );
    res.json(deletUser.rows[0]);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/images/:imageName", (req, res) => {
  // do a bunch of if statements to make sure the user is
  // authorized to view this image, then
  try {
    const imageName = req.params.imageName;
    const readStream = fs.createReadStream(`images/${imageName}`);
    readStream.pipe(res);
  } catch (error) {
    console.error(error.message);
  }
});

// create a product
app.post("/products", upload.single("product_image"), async (req, res) => {
  try {
    const { product_name, product_price, product_description } = req.body;

    const product_image = req.file.filename;

    const newProduct = await pool.query(
      "INSERT INTO products(product_name,  description, price, img_url) VALUES ($1,$2,$3,$4) RETURNING *",
      [product_name, product_description, product_price, product_image]
    );
    res.json(newProduct.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

//get all products

app.get("/products", async (req, res) => {
  try {
    const allproducts = await pool.query("SELECT * FROM products");

    res.json(allproducts.rows);

    allproducts.rows.map((item) => {
      const product = { ...item };
      console.log(product);
    });

    console.log(allproducts);
  } catch (error) {
    console.error(error.message);
  }
});

// get a product by id
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const product = await pool.query(
      "SELECT * FROM products WHERE product_id = $1",
      [id]
    );
    res.json(product.rows[0]);
  } catch (error) {}
});

// delete a product
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deleteProduct = await pool.query(
      "DELETE FROM products WHERE product_id = $1 RETURNING *",
      [id]
    );
    res.json(deleteProduct.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

// update a product
app.put("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { product_name, product_price, product_description, product_image } =
      req.body;
    const updateProduct = await pool.query(
      "UPDATE products SET product_name = $1, description = $2, price = $3, img_url = $4 WHERE product_id = $5 RETURNING *",
      [product_name, product_description, product_price, product_image, id]
    );
    res.json(updateProduct.rows[0]);
  } catch (error) {
    console.error(error.message);
  }
});

app.listen(5000, () => {
  console.log("listening on port 5000");
});
