require('dotenv').config();
const express = require('express');
const session = require('express-session');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const port = 3000;

// const crypto = require('crypto');
// const secret = crypto.randomBytes(32).toString('hex');
// console.log(secret);

app.use(express.json());
// Enable CORS for all routes and origins
app.use(cors());

// app.use(cors({
//   origin: 'http://localhost:9000',
//   credentials: true // Enable sending of cookies across domains
// }));

const allowedOrigins = ['http://localhost:9000', 'https://food-api-backend.onrender.com']; // Add your allowed origins here

app.use(cors({
  origin: '*',
  credentials: true // Enable sending of cookies across domains
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET, // Load secret from environment variable
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set secure to true if using HTTPS
}));

// Swagger setup
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'My API',
    version: '1.0.0',
    description: 'A simple API',
  },
  servers: [
    {
      url: 'https://food-api-backend.onrender.com',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./index.js'], // Adjusted path to match the current file
};

const swaggerSpec = swaggerJsdoc(options);

const filePath = path.join(__dirname, './DataBase/employee.json');
const foodCategories = path.join(__dirname, './DataBase/food-categories.json');


// Function to read users from login.json file
const getUsers = () => {
  const dataPath = path.join(__dirname, '/DataBase/users.json');
  const jsonData = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(jsonData);
};

/**
 * @openapi
 * /api/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
      req.session.userId = user.id; // Store user ID in session
      res.json({ message: 'Login successful' });
  } else {
      res.status(401).json({ message: 'Invalid email or password' });
  }
});

/**
* @openapi
* /api/session:
*   get:
*     summary: Check if the user is logged in
*     responses:
*       200:
*         description: User session status
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 loggedIn:
*                   type: boolean
*/
app.get('/api/session', (req, res) => {
  if (req.session.userId) {
      res.json({ loggedIn: true });
  } else {
      res.json({ loggedIn: false });
  }
});

/**
* @openapi
* /api/logout:
*   post:
*     summary: Logout a user
*     responses:
*       200:
*         description: Logout successful
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*       500:
*         description: Logout failed
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 message:
*                   type: string
*/
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logout successful' });
  });
});


// Endpoint to get JSON data
/**
 * @openapi
 * /employee:
 *   get:
 *     summary: Retrieve employee data
 *     responses:
 *       200:
 *         description: A list of employees
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   email:
 *                     type: string
 *                     example: john.doe@example.com
 *                   age:
 *                     type: integer
 *                     example: 30
 *                   address:
 *                     type: object
 *                     properties:
 *                       street:
 *                         type: string
 *                         example: 123 Elm Street
 *                       city:
 *                         type: string
 *                         example: Metropolis
 *                       state:
 *                         type: string
 *                         example: NY
 *                       zip:
 *                         type: string
 *                         example: 10001
 */
app.get('/employee', (req, res) => {
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the file');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// Endpoint to add employee data
/**
 * @openapi
 * /employee:
 *   post:
 *     summary: Add a new employee
 *     requestBody:
 *       description: Employee data to add
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Diana Prince
 *               email:
 *                 type: string
 *                 example: diana.prince@example.com
 *               age:
 *                 type: integer
 *                 example: 28
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                     example: 321 Maple Drive
 *                   city:
 *                     type: string
 *                     example: Star City
 *                   state:
 *                     type: string
 *                     example: CA
 *                   zip:
 *                     type: string
 *                     example: 90001
 *     responses:
 *       201:
 *         description: Employee created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Error saving the data
 */
app.post('/employee', (req, res) => {
  const newEmployee = req.body;

  // Read the current employee data
  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the file');
      return;
    }

    let employees = JSON.parse(data);

    // Generate a new ID by finding the highest ID and adding 1
    const newId = employees.length > 0 ? Math.max(...employees.map(emp => emp.id)) + 1 : 1;
    newEmployee.id = newId;

    // Add the new employee to the array
    employees.push(newEmployee);

    // Write the updated employee data back to the file
    fs.writeFile(filePath, JSON.stringify(employees, null, 2), 'utf8', (err) => {
      if (err) {
        res.status(500).send('Error saving the data');
        return;
      }
      res.status(201).send('Employee created successfully');
    });
  });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     FoodCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         category:
 *           type: string
 *           example: Fruits
 *         examples:
 *           type: array
 *           items:
 *             type: string
 *             example: Apple
 *   responses:
 *     400:
 *       description: Invalid input
 *     404:
 *       description: Not Found
 *     201:
 *       description: Created
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FoodCategory'
 * /api/food-categories:
 *   get:
 *     summary: Get all food categories
 *     responses:
 *       200:
 *         description: A list of food categories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FoodCategory'
 *   post:
 *     summary: Add a new food category
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FoodCategory'
 *     responses:
 *       201:
 *         description: Food category created
 *       400:
 *         description: Invalid input
 */

// GET endpoint to retrieve food categories
app.get('/food-categories', (req, res) => {
  fs.readFile(foodCategories, 'utf8', (err, data) => {
    if (err) {
      res.status(500).send('Error reading the file');
      return;
    }
    res.json(JSON.parse(data));
  });
});

// POST endpoint to add a new food category
// app.post('/food-categories', (req, res) => {
//   const newCategory = req.body;
//   if (newCategory && newCategory.category && newCategory.examples) {
//       newCategory.id = foodCategories.length + 1; // Simple ID assignment
//       foodCategories.push(newCategory);

//       // Save the updated food categories to the JSON file
//       fs.writeFileSync(foodCategoriesFilePath, JSON.stringify(foodCategories, null, 2));

//       res.status(201).json(newCategory);
//   } else {
//       res.status(400).json({ message: 'Invalid category data' });
//   }
// });




app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
