const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");      //require npm install body-parser --save
const cookieParser = require('cookie-parser'); //require npm install cookie-parser --save

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
app.use(cookieParser());

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
  const templateVars = {
    user: users[req.cookies['user_id']],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (users[req.cookies['user_id']]) {

    const templateVars = {
      user: users[req.cookies['user_id']],
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
    user: users[req.cookies['user_id']],
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
    user: users[req.cookies['user_id']],
  };
  res.render("user-registration", templateVars)
  // res.render("user-registration")
})

// Login page
app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies['user_id']],
  };
  res.render("user-login", templateVars);
  // res.render("user-login");
})

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  // console.log(users);
  // res.clearCookie("username");
  res.redirect("/");
})

//
// Posts
//

// Post for adding new urls
app.post("/urls", (req, res) => {
  const userID = users[req.cookies['user_id']];
  if (userID) {
    let shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {};
    urlDatabase[shortUrl].longURL = 'http://' + req.body.longURL;
    urlDatabase[shortUrl].userID = userID.id;
    res.redirect("/urls");
    console.log(urlDatabase);
  } else {
    return res.status(403).send('Please Login first');
  }
});

app.post("/urls/:shortURL", (req, res) => {
  console.log("i am here");
  console.log(users[req.cookies['user_id']]);
  if (users[req.cookies['user_id']]) {
    urlDatabase[req.params.shortURL].longURL = 'http://' + req.body.longURL;
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
})

// Post for delete button redirects the page to /urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  // console.log(urlDatabase);
  res.redirect("/urls");
})

// Post for login
app.post("/login", (req, res) => {
  const user = emailFound(req.body.email, users);
  if (!user) {
    return res.status(403).send('No user with that Email found');
  } else {
    if (user.password !== req.body.password) {
      return res.status(403).send('Password does not match');
    } else {
      res.cookie("user_id", user.id);
      res.redirect("/urls");
    }
  }

});

// Post for logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  // console.log(users);
  // res.clearCookie("username");
  res.redirect("/");
})

// Post for register
app.post("/register", (req, res) => {
  if (req.body.email === '' || req.body.password === '' || emailFound(req.body.email, users)) {
    res.statusCode = 400;
    // console.log("failed");

  } else {
    const newID = generateRandomString();
    const newEmail = req.body.email;
    const newPassword = req.body.password;
    users[newID] = {};
    const newUser = users[newID];
    newUser.id = newID;
    newUser.email = newEmail;
    newUser.password = newPassword;
    res.cookie("user_id", newUser.id);
    res.redirect("/urls");
    // console.log("success");
    // console.log(users);
  }
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const generateRandomString = () => {
  const len = 6;
  const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

  let result = '';
  for (let i = 0; i < len; i++) {
    result += values[Math.floor(Math.random() * values.length)];
  }
  return result;
}

const emailFound = (email, users) => {
  for (const acc in users) {
    if (users[acc].email === email) {
      return users[acc];
    }
  }
  return false;
}