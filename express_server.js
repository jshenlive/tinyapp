const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//setting ejs as template engine for Express.app
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase); //prints JSON string representation to client browser
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase};
  res.render("urls_index",templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
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

app.post("/urls", (req, res) => {  
  // console.log(req.body);  // Log the POST request body to the console
  let shortUrl = generateRandomString();
  urlDatabase[shortUrl] = 'http://' + req.body.longURL;

  // console.log(urlDatabase);
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
  // setTimeout(res.redirect("/urls"),1500);
  // res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req,res)=>{
  
  // console.log(req.params.shortURL);
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
  // console.log(urlDatabase);
  
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