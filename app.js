const sqlite3 = require("sqlite3");
const express = require("express");
const session = require("express-session");
const path = require("path");
const fs = require("fs");
const { request } = require("http");
// adding Helmet to the Node App
const helmet = require("helmet");
// adding Validator to the Node App
const validator = require("express-validator");
// adding Cookie Parser to the Node App
const cookieparser = require("cookie-parser");
// adding CSRF to the Node App
const csurf = require("csurf");
// adding Rate Limit protection
//const rateLimit = require("express-rate-limit").default;
// adding Environment variables secure management package
//const dotenv = require("dotenv");

const db = new sqlite3.Database("./bank_sample.db");

const app = express();
const PORT = 3000;
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "public")));
// use helmet
app.use(helmet());
// use CookieParser
app.use(cookieparser());
// Apply rate limiting to all routes
//app.use(limiter);

// Set up rate limiting using the express-rate-limit middleware
//const limiter = rateLimit({
//  windowMs: 15 * 60 * 1000, // 15 minutes
 // max: 100, // limit each IP to 100 requests per windowMs
  //message: 'Too many requests from this IP, please try again later'
//});

// Apply rate limiting to all routes
//app.use(limiter);

// Setting up CSRF protection
const csrfMiddleware = csurf({
  cookie: {
    sameSite: "none", 
  },
});

// Create a Middleware to add CSRF protection to specific endpoints

app.use((error, request, response, next) => {
  if (error.code === "EBADCSRFTOKEN") {
    response.status(403);
    response.send("The CSRF token is invalid");
  } else {
    next();
  }
});

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      maxAge: 30000,
      secure: true,
      httpOnly: true,
    },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (request, response) {
  response.sendFile(path.join(__dirname + "/html/login.html"));
});

//LOGIN SQL FIXED
app.post("/auth", function (request, response) {
  var username = request.body.username;
  var password = request.body.password;
  if (username && password) {
    db.get(
      `SELECT * FROM users WHERE username = ? AND password = ?`,
      [username, password],
      function (error, results) {
        console.log(error);
        console.log(results);
        if (results) {
          request.session.loggedin = true;
          request.session.username = results["username"];
          request.session.balance = results["balance"];
          request.session.file_history = results["file_history"];
          request.session.account_no = results["account_no"];
          response.redirect("/home");
        } else {
          response.send("Incorrect Username and/or Password!");
        }
        response.end();
      }
    );
  } else {
    response.send("Please enter Username and Password!");
    response.end();
  }
});

//Home Menu No Exploits Here.
app.get("/home", function (request, response) {
  if (request.session.loggedin) {
    username = request.session.username;
    balance = request.session.balance;
    response.render("home_page", { username, balance });
  } else {
    response.redirect("/");
  }
  response.end();
});

//CSRF CODE SECURED. SEE HEADERS SET ABOVE
app.get("/transfer", csrfMiddleware, function (request, response) {
  if (request.session.loggedin) {
    var sent = "";
    response.render("transfer", { sent, csrfToken: request.csrfToken() });
  } else {
    response.redirect("/");
  }
});

//CSRF CODE
app.post("/transfer", csrfMiddleware, function (request, response) {
  if (request.session.loggedin) {
    console.log("Transfer in progress");
    var balance = request.session.balance;
    var account_to = parseInt(request.body.account_to);
    var amount = parseInt(request.body.amount);
    var account_from = request.session.account_no;
    if (account_to && amount) {
      if (balance > amount) {
        db.get(
          `UPDATE users SET balance = balance + ${amount} WHERE account_no = ${account_to}`,
          function (error, results) {
            console.log(error);
            console.log(results);
          }
        );
        db.get(
          `UPDATE users SET balance = balance - ${amount} WHERE account_no = ${account_from}`,
          function (error, results) {
            var sent = "Money Transfered";
            response.render("transfer", { sent });
          }
        );
      } else {
        var sent = "You Don't Have Enough Funds.";
        response.render("transfer", { sent });
      }
    } else {
      var sent = "";
      response.render("transfer", { sent });
    }
  } else {
    response.redirect("/");
  }
});

//PATH TRAVERSAL CODE FIXED
app.get("/download", function (request, response) {
  if (request.session.loggedin) {
    file_name = request.session.file_history;
    response.render("download", { file_name });
  } else {
    response.redirect("/");
  }
  response.end();
});

app.post("/download", function (request, response) {
  if (request.session.loggedin) {
    var file_name = request.body.file;

    // const filePath = "history_files/" + file_name; ----> Vulnerable way to manipulate files in Node Apps

    // Safe way to manipulated files in Node Apps
    const rootDirectory = "history_files\\";
    const filePath = path.join(process.cwd() + '/history_files/', file_name);
    const fileName = path.normalize(filePath);
      

    response.statusCode = 200;
    response.setHeader("Content-Type", "text/html");
    console.log(filePath);

    // Change the filePath to current working directory using the "path" method
  
    try {
      if (fileName.indexOf(rootDirectory) < 0) {
        response.send("File not found!");
      } else {
        content = fs.readFileSync(filePath, "utf8");
        response.end(content);
      }
    } catch (err) {
      console.log(err);
      response.end("File not found");
    }
  } else {
    response.redirect("/");
  }
  response.end();
});

//XSS CODE FIXED
app.get("/public_forum", function (request, response) {
  if (request.session.loggedin) {
    db.all(`SELECT username,message FROM public_forum`, (err, rows) => {
      console.log(rows);
      console.log(err);
      response.render("forum", { rows });
    });
  } else {
    response.redirect("/");
  }
  //response.end();
});

app.post("/public_forum", function (request, response) {
  if (request.session.loggedin) {
    var comment = validator.escape(request.body.comment);
    var username = request.session.username;
    if (comment) {
      db.all(
        `INSERT INTO public_forum (username,message) VALUES (?, ?)`,
        [username, message],
        (err, rows) => {
          console.log(err);
        }
      );
      db.all(`SELECT username,message FROM public_forum`, (err, rows) => {
        console.log(rows);
        console.log(err);
        response.render("forum", { rows });
      });
    } else {
      db.all(`SELECT username,message FROM public_forum`, (err, rows) => {
        console.log(rows);
        console.log(err);
        response.render("forum", { rows });
      });
    }
    comment = "";
  } else {
    response.redirect("/");
  }
  comment = "";
  //response.end();
});

//SQL UNION INJECTION FIXED
app.get("/public_ledger", function (request, response) {
  if (request.session.loggedin) {
    var id = parseInt(request.query.id);
    if (id) {
      db.all(
        `SELECT from_account,to_account,amount FROM public_ledger WHERE from_account = ?`,
        [id],
        (err, rows) => {
          console.log("PROCESSING INPUT");
          console.log(err);
          if (rows) {
            response.render("ledger", { rows });
          } else {
            response.render("ledger", { rows });
          }
        }
      );
    } else {
      db.all(
        `SELECT from_account,to_account,amount FROM public_ledger`,
        (err, rows) => {
          if (rows) {
            response.render("ledger", { rows });
          } else {
            response.render("ledger", { rows });
          }
        }
      );
    }
  } else {
    response.redirect("/");
  }
  //response.end();
});

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
