require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

const password = process.env.MONGODB_PASSWORD;
const uri = `mongodb+srv://Darko:${password}@cluster0.szlmc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Crear un MongoClient con un objeto MongoClientOptions para establecer la versión de la API estable
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.use(bodyParser.json());
app.use(cors());

// Conectar el cliente al servidor una vez y reutilizar la conexión
async function connectToDatabase() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1); // Salir del proceso si no se puede conectar a la base de datos
  }
}

connectToDatabase();

app.get("/users", async (req, res) => {
  try {
    const database = client.db("medicaldb");
    const users = database.collection("users");

    // Obtener todos los usuarios
    const allUsers = await users.find({}).toArray();
    res.status(200).json(allUsers);
  } catch (error) {
    console.error("Error obteniendo usuarios:", error);
    res.status(500).send("Error obteniendo usuarios");
  }
});

app.post("/create/user", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).send("Name, email, and password are required");
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const database = client.db("medicaldb");
    const users = database.collection("users");

    const newUser = { name, email, password: hashedPassword };
    const result = await users.insertOne(newUser);

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creando usuario:", error);
    res.status(500).send("Error creando usuario");
  }
});

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
