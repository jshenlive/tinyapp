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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "id1" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "id2" }
};

const users = {
  "id1": {
    id: "id1",
    email: "123@123",
    password: "123"
  },
  "id2": {
    id: "id2",
    email: "abc@abc",
    password: "abc"
  }

}

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

// Home page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //prints JSON string representation to client browser
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];
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

app.get("/urls/new", (req, res) => {
  if (users[req.session.user_id]) {

    const templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  // console.log(req.params.shortURL);
  const templateVars = {
    shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = urlDatabase[req.params.shortURL];
  if (!shortURL) {
    return res.status(404).send('Error: Short URL does not exist!');
  } else {
    const longURL = shortURL.longURL;
    res.redirect(longURL);
  }
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("user-registration", templateVars)
  // res.render("user-registration")
})

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("user-login", templateVars);
  // res.render("user-login");
})

app.get("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
})

//
// Posts
//

// Post for adding new urls
app.post("/urls", (req, res) => {
  const userID = users[req.session.user_id];
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
  const user = users[req.session.user_id];
  const urlData = urlDatabase[req.params.shortURL];

  if (user) {
    if (urlData.userID === user.id) {
      urlData.longURL = 'http://' + req.body.longURL;
      res.redirect("/urls");
    } else {
      res.status(403).send("Wrong credentials: This url does not belong to you.")
    }
  } else {
    res.status(403).send("Wrong credentials: Please login first.");
  }
})

// Post for delete button redirects the page to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  const user = users[req.session.user_id];

  if (user) {
    if (urlDatabase[req.params.shortURL].userID === user.id) {
      delete urlDatabase[req.params.shortURL];
      res.redirect("/urls");
    } else {
      res.send("Wrong credentials: This url does not belong to you.")
    }
  } else {
    res.status(403).send("Wrong credentials: Please login first.");
  }

})

// Post for login
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send('No user with that Email found');
  } else {

    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(403).send('Password does not match');
    } else {
      req.session.user_id = user.id;
      res.redirect("/urls");
    }
  }

});

// Post for logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/");
})

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
    req.session.user_id = newUser.id;
    res.redirect("/urls");
    // console.log("success");
    // console.log(users);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

