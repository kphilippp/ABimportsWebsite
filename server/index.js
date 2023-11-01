import express from "express";
import mysql from "mysql";
import cors from "cors";
import dotenv from "dotenv"; // Import dotenv package
dotenv.config(); // Load environment variables from .env file

const app = express();
const PORT = 8800;
const db1 = mysql.createConnection({
  host: `${process.env.REACT_APP_HOST}`,
  user: `${process.env.REACT_APP_USER}`,
  password: `${process.env.REACT_APP_DB_PASS}`,
  database: `${process.env.REACT_APP_DB_NAME}`,
});

app.use(express.json()); //allows us to send json data to backend using a client
app.use(cors());

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

//Public inventory calls
app.get("/inventory", (req, res) => {
  const q = "SELECT * from vehicles";
  db1.query(q, (error, data) => {
    if (error) return res.json("There was an error : " + error);
    return res.json(data);
  });
});

app.get("/inventory/:id", (req, res) => {
  const id = req.params.id;
  const q = "SELECT * from vehicles WHERE id = ?";
  db1.query(q, [id], (error, data) => {
    if (error) return res.json("There was an error : " + error);
    return res.json(data);
  });
});

//Private Inventory Edit Call
app.put("/update-inventory", (req, res) => {
  console.log("updateInv called");
  const { id, fieldName, newValue } = req.body;
  const q = `UPDATE vehicles SET ${fieldName} = ? WHERE id = ?`;

  db1.query(q, [newValue, id], (err, data) => {
    if (err) {
      console.log("UHOH YOU GOTS A PROBLEM UPDATING THE CELL: ", err);
      return res
        .status(500)
        .json({ error: "Internal Server Errorljadfn;vlkahdb" });
    }
    return res.json("yessirrrrrr cell updated");
  });
});

app.put("/addNewVehicle", (req, res) => {
  console.log("addNewVehicle CALLED");
  const {
    year,
    make,
    model,
    color,
    price,
    accidents,
    miles,
    status,
    title,
    description,
  } = req.body;
  const q = `
    INSERT INTO vehicles (year_, make, model, color, price, accidents, miles, status_, title, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db1.query(
    q,
    [
      year,
      make,
      model,
      color,
      price,
      accidents,
      miles,
      status,
      title,
      description,
    ],
    (err, result) => {
      // Change 'error' to 'err' here
      if (err) {
        // Change 'error' to 'err' here
        console.error("Error adding a new vehicle:", err);
        res.status(500).json({ error: "Failed to add a new vehicle" });
      } else {
        console.log("New vehicle added successfully.");
        res.status(201).json({ message: "New vehicle added successfully" });
      }
    }
  );
});

//Login calls
app.post("/register", (req, res) => {
  const q = "INSERT INTO login (`email`,`password`) VALUES (?)";
  const values = [req.body.email, req.body.password];
  db1.query(q, [values], (error, data) => {
    if (error) return res.json("There was an error : " + error);
    return res.json(data);
  });
});

app.post("/login", (req, res) => {
  const q = "SELECT * FROM `login` WHERE `email` = ? AND `password` = ?";
  db1.query(q, [req.body.email, req.body.password], (error, data) => {
    if (error) return res.json("There was an error : " + error);
    if (data.length > 0) {
      return res.json("S");
    } else {
      return res.json("F");
    }
  });
});

app.delete("/deleteItem/:id", (req, res) => {
  const id = req.params.id;

  const deleteQuery = "DELETE FROM vehicles WHERE id = ?";
  const updateQuery = "UPDATE vehicles SET id = id - 1 WHERE id > ?";

  db1.query(deleteQuery, [id], (deleteErr, deleteResult) => {
    if (deleteErr) {
      console.error("Error deleting item:", deleteErr);
      res.status(500).json({ error: "Failed to delete item" });
    } else {
      db1.query(updateQuery, [id], (updateErr, updateResult) => {
        if (updateErr) {
          console.error("Error updating item IDs:", updateErr);
          res.status(500).json({ error: "Failed to update item IDs" });
        } else {
          console.log("Item deleted successfully, and IDs updated.");
          res.status(200).json({ message: "Item deleted successfully" });
        }
      });
    }
  });
});
