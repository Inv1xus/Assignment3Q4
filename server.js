const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
const loginFile = path.join(__dirname, 'data', 'login.txt');
const petFile = path.join(__dirname, 'data', 'petData.txt');
const fs = require('fs');
const bcrypt = require('bcrypt');


const app = express();
const PORT = process.env.PORT || 3000;
let newUserB=true;

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'ratemyta-secret',
    resave: false,
    saveUninitialized: true
}));


//function that injects footer and header in all files
function renderPage(res, view, data) {
    ejs.renderFile(path.join(__dirname, 'views', 'partials', 'header.ejs'), data, (err, header) => {
        if (err) return res.status(500).send('Error loading header');
        
        ejs.renderFile(path.join(__dirname, `views/${view}.ejs`), data, (err, content) => {
            if (err) return res.status(500).send('Error loading content');
            
            ejs.renderFile(path.join(__dirname, 'views', 'partials', 'footer.ejs'), data, (err, footer) => {
                if (err) return res.status(500).send('Error loading footer');
                
                res.send(header + content + footer);
            });
        });
    });
}

// Utility function to read data from text files
function readData(filePath, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) return callback(err);
        const parsedData = data.trim().split('\n').map(line => line.split(':'));
        callback(null, parsedData);
    });
}

// Utility function to write data to text files
function writeData(filePath, data, callback) {
    const content = data.map(item => item.join(':')).join('\n');
    fs.writeFile(filePath, content, 'utf8', callback);
}

//for pet ID counter
function initializePetIdCounter() {
    fs.readFile(petFile, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading pet data file:', err);
            return;
        }
        const lines = data.trim().split('\n');
        if (lines.length > 0) {
            const lastLine = lines[lines.length - 1];
            const lastId = parseInt(lastLine.split(':')[0], 10);
            petIdCounter = isNaN(lastId) ? 0 : lastId;
        } else {
            petIdCounter = 0;
        }
    });
}

// Call this function when your server starts
initializePetIdCounter();

// Routes
app.get('/', (req, res) => {
    renderPage(res, 'home', { user: req.session.user });
});
app.get('/home', (req, res) => {
    renderPage(res, 'home', { user: req.session.user });
});

app.get('/privacy', (req, res) => {
    renderPage(res, 'privacy', { user: req.session.user });
});

app.get("/catCare", (req, res) => {
    renderPage(res, 'catCare', { user: req.session.user });
});

app.get("/dogCare", (req, res) => {
    renderPage(res, 'dogCare', { user: req.session.user });
});

app.get("/petGiveaway", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    renderPage(res, 'petGiveaway', { user: req.session.user });
});

app.post("/petGiveaway", (req, res) => {
    const { PetType, breed, age, gender, petFriendly, childFriendly, brag } = req.body;

    if (!PetType || !age || !gender) {
        return res.redirect('/petGiveaway');
    }

    // Ensure the user is logged in
    if (!req.session.user) {
        return res.redirect('/login');
    }

    petIdCounter++;
    
    const petEntry = `${petIdCounter}:${req.session.user}:${PetType}:${breed}:${age}:${gender}:${petFriendly}:${childFriendly}:${brag}\n`;

    //writes to the pet file
    fs.appendFile(petFile, petEntry, 'utf8', (err) => {
        if (err) return res.status(500).send('Server error.');

        return res.redirect('/successPet');
    });
});

app.get("/successPet", (req, res) => {
    renderPage(res, 'successPet', { user: req.session.user });
});
app.get("/find", (req, res) => {
    renderPage(res, 'find', { user: req.session.user });
});


app.post('/find', (req, res) => {
    const { PetType, breed, age, gender, sociable } = req.body;

    // Read pet data from the file
    fs.readFile(petFile, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server error.');

        // Parse pet data
        const petRecords = data.trim().split('\n').map(line => line.split(':'));
        
        // Filter pet records based on the search criteria
        const filteredPets = petRecords.filter(([id, username, petType, petBreed, petAge, petGender, petFriendly, childFriendly, brag]) => {
            return (
                (!PetType || petType === PetType) &&
                (!breed || breed === 'No Preference' || petBreed === breed) &&
                (!age || age === 'No preference' || petAge === age) &&
                (!gender || gender === 'No preference' || petGender === gender) &&
                (!sociable || sociable === 'No preference' || petFriendly === sociable)
            );
        });

        // Render the search results page
        renderPage(res, 'searchResults', { pets: filteredPets, user: req.session.user });
    });
});

app.get("/contact", (req, res) => {
    renderPage(res, 'contact', { user: req.session.user });
});


// app.get("/browse", (req, res) => {
//     renderPage(res, 'browse', { user: req.session.user });
// });


//check if username exists
app.post('/check-username', (req, res) => {
    const { username } = req.body;

    fs.readFile(loginFile, 'utf8', (err, data) => {
        if (err) return res.status(500).json({ exists: false, error: 'Server error.' });
        const usernameExists = data.split('\n').some(line => line.split(':')[0] === username);
        if (usernameExists) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    });
});


app.get("/register", (req, res) => {
    renderPage(res, 'register', { user: req.session.user });
});

//register
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);

    fs.readFile(loginFile, 'utf8', (err, data) => {
        if (err) return res.status(500).send('Server error.');
        if (data.split('\n').some(line => line.split(':')[0] === username)) {
            return res.json({ success: false, message: 'Username already exists.' });
        }

        // Append the new user to the login file
        fs.appendFile(loginFile, `${username}:${hashedPassword}\n`, (err) => {
            if (err) return res.status(500).send('Server error.');

            // Automatically log the user in
            req.session.user = username;

            // Redirect to the success page with newUser set to true
            res.json({ success: true });
        });
    });
});

//success page
app.get('/success', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }

    // Extract newUser from query parameters if needed
    const newUser = req.query.newUser === 'true';

    renderPage(res, 'success', { newUser: newUser, user: req.session.user });
});


app.get("/login", (req, res) => {
    renderPage(res, 'login', { user: req.session.user });
});
//loging in and checking password
app.post('/login', (req, res) => {
    const { username, password } = req.body;
//checking password and username
    readData(loginFile, (err, userData) => {
        if (err) return res.status(500).send('Server error.');
        const user = userData.find(u => u[0] === username);
        if (user && bcrypt.compareSync(password, user[1])) {
            req.session.user = username;
            
            // Redirect to the success page with newUser set to false
            res.redirect('/success?newUser=false');
        } else {
            res.redirect('/login');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
