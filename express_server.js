const express = require("express");
const bodyParser = require("body-parser");      //require npm install body-parser --save
const cookieSession = require('cookie-session'); //require npm install cookie-session --save
const bcrypt = require('bcryptjs');
const { generateRandomString, getUserByEmail, urlsForUser } = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080



//setting ejs as template engine for Express.app
app.set("view engine", "ejs");

//
// DATABASES
//
const urlDatabase = {};
const users = {};

//
// Middleware
//
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "tiny",
  keys: ["urlapps"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//
// Routes
//
//Get home page
app.get("/", (req, res) => {
  if (users[req.session.userId]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//Get main URL page
app.get("/urls", (req, res) => {
  const user = users[req.session.userId];
  let userData = {};

  //if user logged in then filter out URLs created by user
  if (user) {
    userData = urlsForUser(user.id, urlDatabase);
  }
  const templateVars = {
    user: user,
    urls: userData
  };
  res.render("urls_index", templateVars);
});

//Get new URL page
app.get("/urls/new", (req, res) => {
  if (users[req.session.userId]) {

    const templateVars = {
      user: users[req.session.userId],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

//Get shortURL page
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send("This page does not exist");
  } else if (!users[req.session.userId]) {
    return res.status(400).send("Please Login first");
  } else if (users[req.session.userId].id !== urlDatabase[req.params.shortURL].userID) {
    return res.status(400).send("You do not own this short URL");
  }

  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.userId],
  };
  res.render("urls_show", templateVars);
});

// Get link to longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    return res.status(404).send('Error: Short URL does not exist!');
  } else {
    const longURL = shortURL.longURL;
    res.redirect(longURL);
  }
});

// Get Register
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render("user-registration", templateVars);
});

// Get Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.userId],
  };
  res.render("user-login", templateVars);
});

// Get Logout
app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});
//
// POSTs
//
// Post for adding new urls
app.post("/urls", (req, res) => {
  const userID = users[req.session.userId];
  if (userID) {
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {};
    urlDatabase[shortUrl].longURL = 'http://' + req.body.longURL;
    urlDatabase[shortUrl].userID = userID.id;
    res.redirect("/urls");
  } else {
    return res.status(403).send('Please Login first');
  }
});

// Post for edits
app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session.userId];
  const urlData = urlDatabase[req.params.shortURL];

  if (user) {
    if (urlData.userID === user.id) {
      urlData.longURL = 'http://' + req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong credentials: This url does not belong to you.");
    }
  } else {
    res.status(403).send("Wrong credentials: Please login first.");
  }
});

// Post for delete button redirects the page to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.userId];

  if (user) {
    if (urlDatabase[req.params.shortURL].userID === user.id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.send("Wrong credentials: This url does not belong to you.");
    }
  } else {
    res.status(403).send("Wrong credentials: Please login first.");
  }
});

// Post for login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send('No user with that Email found');
  } else {

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(403).send('Password does not match');
    } else {
      req.session.userId = user.id;
      res.redirect("/urls");
    }
  }
});

// Post for logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Post for register
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Input fields cannot be empty');
  } else if (getUserByEmail(req.body.email, users)) {
    res.status(400).send('Email account already exist');
  } else {
    const newID = generateRandomString();
    const newEmail = req.body.email;
    const password = req.body.password;
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[newID] = {};
    const newUser = users[newID];
    newUser.id = newID;
    newUser.email = newEmail;
    newUser.password = hashedPassword;
    req.session.userId = newUser.id;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

