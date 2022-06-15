const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");      //require npm install body-parser --save
const cookieParser = require('cookie-parser'); //require npm install cookie-parser --save

//setting ejs as template engine for Express.app
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//
// Middleware
//
app.use(bodyParser.urlencoded({extended: true}));
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
    username: req.cookies['username'],
    urls: urlDatabase
  };
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies['username'],
  };
  res.render("urls_new",templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL],
    username: req.cookies['username']
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:id", (req,res)=>{
  res.redirect("/urls/"+ req.params.shortURL)
})

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = 'http://' + req.body.longURL;
})

// Post for adding new urls
app.post("/urls", (req, res) => {  
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = 'http://' + req.body.longURL;
  res.redirect("/urls");
});

// Post for delete button redirects the page to /urls
app.post("/urls/:shortURL/delete", (req,res)=>{
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");  
})

// Post for login
app.post("/login", (req,res)=>{
  res.cookie("username", req.body.username);
  res.redirect("/urls");
});

// Post for logout
app.post("/logout", (req,res)=>{

  res.clearCookie("username");
  res.redirect("/");
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString(){
  const len = 6;
  const values = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];

  let result = '';
  for (let i = 0; i<len;i++){
    result += values[Math.floor(Math.random()*values.length)];
  }
  return result;
}