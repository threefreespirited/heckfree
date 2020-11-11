//Module Dependences

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const { stringify } = require("querystring");
const session = require("express-session");
var url = require('url');
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

//List of Variables

const app = express();

// Setting up view-engine
app.set("view engine", "ejs");

// Setting up static files directory
app.use(  bodyParser.urlencoded({    extended: true,  }));
app.use(express.static(__dirname + '/public'));

// Mongoose connection

mongoose.connect(
  process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  }
  );
  
  //mongoDB schemas and models
const userSchema = new mongoose.Schema({
  email: String,
  username: String,
  fullname: String,
  title: String,
  newlink: String,
  icon: String,
  writing: String,
  creative: String,
  education: String,
  arts: String,
  brand: String,
  influencer: String,
  fashion: String,
  programming: String,
  webdevelopment: String,
  music: String,
});
const User = new mongoose.model("User", userSchema);

const dataSchema = new mongoose.Schema({
  username: String,
  title: String,
  newlink: String,
  icon: String,
});
const Data = new mongoose.model("Data", dataSchema);

const appearanceSchema = new mongoose.Schema({
  username: String,
  colorName: String,
  colorCode: String
});
const Appearance = new mongoose.model("Appearance", appearanceSchema);

const avatarSchema = new mongoose.Schema({
  username: String,
  userImage: String,
});
const Avatar = new mongoose.model("Avatar", avatarSchema);

const fontSchema = new mongoose.Schema({
  username: String,
  fontFamily: String,
});
const Font = new mongoose.model("Font", fontSchema);

const fontSizeSchema = new mongoose.Schema({
  username: String,
  fontSize: String,
});
const FontSize = new mongoose.model("FontSize", fontSizeSchema);

const registerUserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

// Strict order to be followed
// Plugin for passportLocalMongoose
registerUserSchema.plugin(passportLocalMongoose);
const RegisteredUser = new mongoose.model("RegisteredUser", registerUserSchema);



//mongoDB configuration ends

// Setting up Passport.js

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

// passport local configuration
passport.use(RegisteredUser.createStrategy());
passport.serializeUser(RegisteredUser.serializeUser());
passport.deserializeUser(RegisteredUser.deserializeUser());

// Passport.js configuration ends


//Reset password logic starts

// Firstly the user needs to input emailAddress (already registered),
// then a email containing the link to reset is send, 
// on visiting the link, user can set new password to his/her account

const jwt = require('jwt-simple');
var nodemailer = require('nodemailer');

// password reset code

app.get('/h/forgotpassword', function (req, res) {
  if (req.isAuthenticated()) {
    //user is alreay logged in
    // return res.redirect('/');
    res.redirect(url.format({
      pathname: `/`,
      query: {
        message: "You must be logged out to reset password."
      } 
    }));
  }
  else {
    res.send(`<style>
@import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
</style>
<body>


<div style="font-family: 'Roboto', sans-serif;border: 1px solid black;text-align: center;border-style: ridge;width: fit-content;margin: 7% auto;padding: 30px;-webkit-box-shadow: 0px 0px 8px 0px rgba(0, 0, 2, 0.68);
-moz-box-shadow:    0px 0px 8px 0px rgba(0, 0, 2, 0.68);
box-shadow:         0px 0px 8px 0px rgba(0, 0, 2, 0.68);
border-radius: 6px;">
<a href="/" class="logo" style="padding: 0;">
<img src="../img/logo.png" class="ui mini image" style="width:40px;border-radius:60%;float:left;">
</a>
<h1>Reset Password</h1>
<h3>Don't Worry!</h3>
<p>Just provide your email
and we will do the rest</p>

        <form action="/passwordreset" method="POST">
            <input type="email" name="email" value="" style="margin:20px;padding:10px;width: 90%;max-width: 270px;outline: none;"
                placeholder="Enter your email address" required />
                <br>
            <button style="font-size:1.2rem;cursor:pointer;background-color: #5e81cf;color: white;width:72%;max-width: 180px;padding:10px 5px;border:none;border-radius: 10px;" type="submit">Proceed</button>
            <p>If you are not able to find the mail, check your <span style="color: red;">spam</span> folder.</p>
            <p>The password reset link will expire within 15 minutes.</p>
        </form>

    </div>

</body>
    `);

  }
});

app.post('/passwordreset', function (req, res) {

  var emailAddress = req.body.email;

  let myUsername = "";
  // TODO: Using email, find user from your database.

  User.find({ email: emailAddress }, (err, user) => {

    if (err) {
      console.log("Server Error");
      let errName = "Server Error";
      let errCode = "Error 400";
      res.render("error", { errCode: errCode, errName: errName });
    }
    else if (user != "") {
      myUsername = user[0].username;

      var payload = {
        userName: myUsername,        // UserName from database
        email: emailAddress
      };

      var secret = 'ThisisLazyAlleganceEra' + '-' + Math.round(Date.now() / (3600000 * 4));
      console.log(Math.round(Date.now() / (3600000 * 4)));
      // var secret = 'fe1a1915a379f3be5394b64d14794932-1506868106675';

      var token = jwt.encode(payload, secret);

      // Sending email containing link to reset password.

      //nodemailer code starts

      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_ID,
          pass: process.env.EMAIL_PASS
        }
      });

      var mailOptions = {
        from: process.env.EMAIL_ID,
        to: `${emailAddress}`,
        subject: 'Password reset request for Heckfree',
        html: `<center>
  
  <div style="height:100%; width:600px;font-size: 1.2rem;text-align:center;padding:30px;">
  <a href="/" style="padding: 0;">
<img src="https://heckfree.herokuapp.com/img/logo.png" style="width:40px;border-radius:60%;float:left;">
</a>
<br>
<br>
  <p style="text-align:left">Hello,<br><br> We received a request to reset the password for your account for this email address. To initiate the password reset process for your account, click the link below.
  This link will expire within 15 minutes.
  </p>
  <p>
  <a target="_blank" style="text-decoration:none; background-color: black; border: black 1px solid; color: #fff; padding:10px 10px; display:block;" href="https://heckfree.herokuapp.com/resetpassword/${token}">
  <strong>Reset Password</strong></a>
  </p>
  <p style="text-align:left">This link can only be used once. If you need to reset your password again, please visit <a href="https://heckfree.herokuapp.com">heckfree.herokuapp.com</a> and request another reset.<br><br>If you did not make this request, you can simply ignore this email.</p>
  <p style="text-align:left">
  Sincerely,<br>Heckfree Team
  </p>
  </div>
  </center>`
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      //nodemailer code ends

      // In this case, will just return a link to click.
      res.redirect(url.format({
        pathname: `/h/login`,
        query: {
          message: "Password reset email has been sent.<br>Follow the instructions."
        }
      }));

    }
    else if (user == "") {
      console.log("Invalid email address");
      let errName = "Invalid email address! Please provide a registered email address.";
      let errCode = "Error 404";
      res.render("error", { errCode: errCode, errName: errName });
    }

  })

});

app.get('/resetpassword/:token', function (req, res) {
  // TODO: Fetch user from database using
  var secret = 'ThisisLazyAlleganceEra' + '-' + Math.round(Date.now() / (3600000 * 4));
  var payload = jwt.decode(req.params.token, secret);
  console.log(payload);
  let myUsername = payload.userName;
  console.log("myusername", myUsername);

  // Create form to reset password.
  res.send(`<style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
</style>

<body>


    <div style="font-family: 'Roboto', sans-serif;border: 1px solid black;text-align: center;border-style: ridge;width: fit-content;margin: 7% auto;padding: 30px;-webkit-box-shadow: 0px 0px 8px 0px rgba(0, 0, 2, 0.68);
-moz-box-shadow:    0px 0px 8px 0px rgba(0, 0, 2, 0.68);
box-shadow:         0px 0px 8px 0px rgba(0, 0, 2, 0.68);border-radius: 6px;">
<a href="/" class="logo" style="padding: 0;">
<img src="../img/logo.png" class="ui mini image" style="width:40px;border-radius:60%;float:left;">
</a>
<h3 style="margin-bottom: 10px;margin-top:0;color:#5e81cf;">Heckfree</h3>
<h1 style="margin-bottom: 45px;margin-top:0;">Reset Password</h1>



        <form action="/resetPassword" method="POST" style="margin:20px;">

            <div style="text-align: left;">
            <input type="hidden" name="username" value="${myUsername}" >
                <label style="margin-top:10px;" for="">Enter new password</label>
                <input type="password" name="password" minlength="8" value=""
                    style="margin:10px 0;padding:10px;width: 100%;outline: none;"
                    placeholder="Enter password" id="password1" required />
                <br>
                <label style="margin-top:70px;" for="">Confirm Password</label>
                <input type="password" name="confirmpassword" minlength="8" value="" id="password2"
                    style="margin-top:10px;padding:10px;width: 100%;outline: none;"
                    placeholder="Confirm Password" required />
            </div>

            <br>
            <button id="resetPassBtn" style="font-size:1.2rem;cursor:pointer;background-color: #5e81cf;color: white;width:72%;max-width: 180px;padding:10px 5px;border:none;border-radius: 4px;" type="submit">Reset Password</button>

        </form>

    </div>

    <script>
           let password1= document.getElementById("password1");
    let password2 = document.getElementById("password2");
    let resetPassBtn = document.getElementById("resetPassBtn");
    
    password1.addEventListener("keyup",()=>{
        matchPass();
    })
    password2.addEventListener("keyup",()=>{
        matchPass();
    })
    
    function matchPass(){
      if(password1.value != password2.value){
        resetPassBtn.style.opacity = "0.45";
          resetPassBtn.disabled = true;
          
        }
        else if((password1.value == password2.value)){
          resetPassBtn.style.opacity = "1";
          resetPassBtn.disabled = false;
      }
    }

           </script>

</body>
  `);


});

app.post("/resetPassword", (req, res) => {

  // console.log(req.body);

  RegisteredUser.findOne({ username: req.body.username }, (err, user) => {
    if (err) {
      console.log(err);
      let errName = "Server Error";
      let errCode = "Error 400";
      res.render("error", { errCode: errCode, errName: errName });

    }
    else if (user != "") {

      user.setPassword(req.body.password, function (err, data) {
        if (err) {
          console.log(err);
          let errName = "Server Error";
          let errCode = "Error 400";
          res.render("error", { errCode: errCode, errName: errName });

        }
        else if (data != null) {
          console.log(data);
          console.log("new user");

          const mynewuser = new RegisteredUser(data);
          mynewuser.save();

          // res.redirect(`/dashboard/${req.body.username}`);
          res.redirect(url.format({
            pathname: `/h/login`,
            query: {
              message: "Password updated successfully"
            }
          }));
        }
      });
    }
  });

});

// Reset password logic ends

// GET Requests

app.get("/", function (req, res) {
  let message = "";
  let myUsername = "";
  let myAvatar = "";
  let pageTitle = "Share one and connect with many";

  if (req.query.message != "") {
    message = req.query.message;
  }
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    console.log(myUsername, "this works too");
    Avatar.find({ username: myUsername }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        console.log(avatar);
        myAvatar = avatar;
        res.render("index", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("index", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("index", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
  }
});

app.get("/h/about", (req, res) => {
  let message = "";
  let myUsername = "";
  let myAvatar = "";
  let pageTitle = "About";

  if (req.query.message != "") {
    message = req.query.message;
  }
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    console.log(req.user, "yeah this one");
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        myAvatar = avatar;
        console.log(avatar);
        res.render("about", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("about", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      }
    });
  } else { 
    console.log("not authenticated");
    res.render("about", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
  }
});

app.get("/h/login", (req, res) => {
  let message = "";
  if (req.query.message != "") {
    message = req.query.message;
  }
  let myUsername = "";
  let myAvatar = "";
  let pageTitle = "Login";
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        myAvatar = avatar;
        console.log(avatar);
        res.render("login", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("login", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("login", { updateMessage: message, username: myUsername, useravatar: myAvatar , pageTitle});
  }
});

app.get("/h/register", (req, res) => {
  let message = "";
  let customLink = "";
  let myUsername = "";
  let myAvatar = "";
  let pageTitle = "Register";
  if (req.query.message != "") {
    message = req.query.message;
  }
  if (req.query.customLink != "") {
    customLink = req.query.customLink;
  }
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        console.log(avatar);
        myAvatar = avatar;
        res.render("register", { updateMessage: message, username: myUsername, useravatar: myAvatar, customLink: customLink ,pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("register", { updateMessage: message, username: myUsername, useravatar: myAvatar, customLink: customLink ,pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("register", { updateMessage: message, username: myUsername, useravatar: myAvatar, customLink: customLink ,pageTitle});
  }
});


app.get("/:myToken", (req, res) => {

  let paramToken = req.params.myToken;
  
  let pageTitle = `${ paramToken }`;

  let linksData = "";
  let appearanceData = "";
  let avatarData = "";
  let fontSize = "";
  let depend = 0;
  User.find({ username: paramToken }, (err, user) => {
    if (user != "") {
      depend = 1;
      // console.log(depend);
    }
    else {
      depend = 0;
      // console.log(depend);
    }
  })
  Data.find({ username: paramToken }, (err, data) => {
    linksData = data;

    // console.log(linksData);
    Appearance.find({ username: paramToken }, (err, data) => {
      appearanceData = data;
      // console.log(appearanceData);
      Avatar.find({ username: paramToken }, (err, data) => {
        avatarData = data;
        // console.log(avatarData);
        Font.find({ username: paramToken }, (err, data) => {
          fontData = data;
          // console.log(fontData);
          FontSize.find({ username: paramToken }, (err, data) => {
            fontSize = data;
            // console.log(fontSize, "fS");

            // console.log("data is good");
            if (depend == 1) {
              res.render("profile", { name: paramToken, linksData: linksData, appearanceData: appearanceData, avatarData: avatarData, fontData: fontData, fontSize: fontSize , pageTitle});
            } else {
              let errName = "User not Found";
              let errCode = "Error 404";
              res.render("error", { errCode: errCode, errName: errName });

            }
          });
        });
      });
    });
  });
});

app.get("/h/logout", function (req, res) {
  req.logOut();
  res.redirect("/");
});

app.get("/h/dashboard/:myToken", function (req, res) {
  let message = "";
  let pageTitle = "मेरा डैशबोर्ड";
  if (req.query.message != "") {
    message = req.query.message;
  }

  let paramToken = req.params.myToken;
  console.log(paramToken);

  let linksData = "";
  let appearanceData = "";
  let avatarData = "";
  let fontSize = "";
  let depend = 0;
  User.find({ username: paramToken }, (err, user) => {

    if (user != "") {
      depend = 1;
      // console.log(depend);
    }
    else {
      depend = 0;
      // console.log(depend);
    }
  })
  Data.find({ username: paramToken }, (err, data) => {
    linksData = data;

    // console.log(linksData);
    Appearance.find({ username: paramToken }, (err, data) => {
      appearanceData = data;
      // console.log(appearanceData);
      Avatar.find({ username: paramToken }, (err, data) => {
        avatarData = data;
        // console.log(avatarData);
        Font.find({ username: paramToken }, (err, data) => {
          fontData = data;
          // console.log(fontData);

          FontSize.find({ username: paramToken }, (err, data) => {
            fontSize = data;
            // console.log(fontSize, "fS");

            if (depend == 1) {
              if (req.isAuthenticated() && req.user.username == paramToken) {
                res.render("dashboard", { name: paramToken, linksData: linksData, appearanceData: appearanceData, avatarData: avatarData, fontData: fontData, updateMessage: message, fontSize: fontSize , pageTitle});
              }
              else {
                let errName = "You are not allowed to visit here";
                let errCode = "<p>Bad Request</p> <br> <p style='margin-top:0;font-size:1.5rem;'>If you are admin then please <a style='color: gold;' href='/h/login'>Login</a> to visit this.</p>";
                res.render("error", { errCode: errCode, errName: errName });
              }
            } else {
              let errName = "Page not Found";
              let errCode = "Error 404";
              res.render("error", { errCode: errCode, errName: errName });

            }
          });
        });
      });
    });
  })


});


app.get(`/username/:token`, (req, res) => {
  const token1 = req.params.token;
  // console.log("token1");
  // console.log(token1);

  RegisteredUser.find({ username: token1 }, (err, user) => {
    if (err) {
      console.log(err);
    } else {
      // console.log(user);
      res.send(user);
    }
  });
});

app.get("/h/policy", (req, res) => {
  let myUsername = "";
  let pageTitle = "Policy";
  let myAvatar = "";
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        myAvatar = avatar;
        res.render("policy", { username: myUsername, useravatar: myAvatar ,pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("policy", { username: myUsername, useravatar: myAvatar ,pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("policy", { username: myUsername, useravatar: myAvatar ,pageTitle});
  }
})

app.get("/h/terms", (req, res) => {
  let myUsername = "";
  let myAvatar = "";
  let pageTitle = "Terms";
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        myAvatar = avatar;
        res.render("terms", {username: myUsername, useravatar: myAvatar , pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("terms", {username: myUsername, useravatar: myAvatar , pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("terms", {username: myUsername, useravatar: myAvatar , pageTitle});
  }
})

app.get("/h/faq", (req, res) => {
 let myUsername = "";
  let myAvatar = "";
  let pageTitle = "FAQ";
  if (req.isAuthenticated()) {
    myUsername = req.user.username;
    Avatar.find({ username: req.user.username }, (err, avatar) => {
      if (err) console.log(err);
      else if (avatar != "") {
        myAvatar = avatar;
        res.render("login", { username: myUsername, useravatar: myAvatar ,pageTitle});
      } else if (avatar == "") {
        myAvatar = "";
        res.render("login", { username: myUsername, useravatar: myAvatar ,pageTitle});
      }
    });
  } else {
    console.log("not authenticated");
    res.render("faq", {username: myUsername, useravatar: myAvatar ,pageTitle});
  }
});


// POST requests

app.post("/registerIndex", (req, res) => {

  let indexUsername = req.body.customLink;
  // console.log(indexUsername);
  res.redirect(url.format({
    pathname: `/h/register`,
    query: {
      customLink: indexUsername
    }
  }));
  // res.render("register", { customLink: indexUsername });

});

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  console.log("updated", password);

  const user = new RegisteredUser({
    username: req.body.username,
    password: req.body.password,
  });
  if (req.isAuthenticated()) {
    res.redirect(url.format({
      pathname: `/`,
      query: {
        message: "You are already logged in."
      }
    }));
  }
  else {
    
    passport.authenticate("local")(req, res, function (err) {
      if (err) {
        console.log(err);
        let errName = "Invalid Username / Password";
        let errCode = "Error 400";
        res.render("error", { errCode: errCode, errName: errName });
      }
      else {
        res.redirect(`/h/dashboard/${username}`);
      }
    });
  }

});


app.post("/register", function (req, res) {
  RegisteredUser.register({ username: req.body.username }, req.body.password, function (err, data) {

    const user = new User(req.body);
    if (err) {
      console.log(err);
      res.redirect("/h/register");
    }
    else {
      const user = new User(req.body);
      let myUsername = req.body.username;
      user.save((err, user) => {
        if (err) {
          console.log(err);

          let errName = "Not Saved.";
          let errCode = "Error 400";
          res.render("error", { errCode: errCode, errName: errName });

        }
        else console.log("succesfully saved");
      });
      passport.authenticate("local")(req, res, function () {
        //  console.log(req,res);
        res.redirect(`/h/dashboard/${myUsername}`);
      });

    }
  });
});

app.post("/appearance", (req, res) => {
  // console.log(req.body);

  const appearance = new Appearance(req.body);
  // console.log(Appearance);
  // console.log("Appearance");
  Appearance.findOne({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
      // console.log("err");
    } else if (data != null) {
      // console.log("foundOne");
      console.log(data);
      // Appearance.findOneAndUpdate({ username: req.body.username }, appearance ,(err,docs) => {
      Appearance.findOneAndUpdate({ username: req.body.username }, req.body, (err, docs) => {
        if (!err) {
          // console.log("done update");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else {
          console.log(err);
          // console.log("error Updating");
          res.send("Server Error!!!")
        }
      });
    } else if (data == null) {
      // console.log(data);
      appearance.save((err) => {
        if (!err) {
          // console.log("done save");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else
          res.send("Server Error!!!")
      });
    }
  });
});

app.post("/addNewLink", (req, res) => {
  // console.log("data");  
  // console.log(req.body);
  const data = new Data(req.body);
  data.save((err) => {
    if (!err)
      res.redirect(`/h/dashboard/${req.body.username}`);
    else res.send("Not Successfully Added,Please Try Again!!!")
  })

});

app.post("/removeLink", (req, res) => {

  // console.log(req.body.removeThis);
  const removeThisID = req.body.removeThis;

  Data.findByIdAndDelete(removeThisID, (err) => {
    if (!err) {
      // console.log("item Delete");
      res.redirect(`/h/dashboard/${req.body.username}`);
    }
    else res.send("Not Successfully Added,Please Try Again!!!")
  });

});

app.post("/addAvatar", (req, res) => {

  const avatar = new Avatar(req.body);

  Avatar.findOne({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
      // console.log("err avatar");
    } else if (data != null) {
      // console.log("foundOne");
      console.log(data);
      Avatar.findOneAndUpdate({ username: req.body.username }, req.body, (err, docs) => {
        if (!err) {
          // console.log("done update avatar");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else {
          console.log(err);
          // console.log("error Updating avatar");
          res.send("Server Error!!!")
        }
      });
    } else if (data == null) {
      console.log(data);
      avatar.save((err) => {
        if (!err) {
          // console.log("done save avatar");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else
          res.send("Server Error!!!")
      });
    }
  });
});

app.post("/addFont", (req, res) => {

  const font = new Font(req.body);

  Font.findOne({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
      // console.log("err font");
    } else if (data != null) {
      // console.log("foundOne");
      console.log(data);
      Font.findOneAndUpdate({ username: req.body.username }, req.body, (err, docs) => {
        if (!err) {
          // console.log("done update font");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else {
          console.log(err);
          // console.log("error Updating font");
          res.send("Server Error!!!")
        }
      });
    } else if (data == null) {
      console.log(data);
      font.save((err) => {
        if (!err) {
          // console.log("done save font");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else
          res.send("Server Error!!!");
      });
    }
  });

});

app.post("/changeFontSize", (req, res) => {

  const fontsize = new FontSize(req.body);

  FontSize.findOne({ username: req.body.username }, (err, data) => {
    if (err) {
      console.log(err);
      // console.log("err font");
    } else if (data != null) {
      // console.log("foundOne");
      console.log(data);
      FontSize.findOneAndUpdate({ username: req.body.username }, req.body, (err, docs) => {
        if (!err) {
          // console.log("done update font");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else {
          console.log(err);
          // console.log("error Updating font");
          res.send("Server Error!!!")
        }
      });
    } else if (data == null) {
      console.log(data);
      fontsize.save((err) => {
        if (!err) {
          // console.log("done save font");
          res.redirect(`/h/dashboard/${req.body.username}`);
        } else
          res.send("Server Error!!!");
      });
    }
  });

});



app.post("/updatePassword", (req, res) => {

  let myUsername = req.body.username;

  RegisteredUser.findOne({ username: req.body.username }, (err, user) => {
    // Check if error connecting
    if (err) {
      console.log(err);
      let errName = "Connection error";
      let errCode = "Error 400";
      res.render("error", { errCode: errCode, errName: errName });
    } else {
      // Check if user was found in database
      if (user) {
        user.changePassword(req.body.password, req.body.cpassword, function (err) {
          if (err) {
            let errName = "Invalid Current Password";
            let errCode = "Error 400";
            res.render("error", { errCode: errCode, errName: errName });
          } else {
            console.log("Password Changed successfully");
            res.redirect(url.format({
              pathname: `/h/dashboard/${myUsername}`,
              query: {
                message: "Password updated successfully"
              }
            }));
          }
        })
      }
    }
  });



});






// Port
app.listen((process.env.PORT || 3000), function () {
  console.log("Server started on port 3000");
});







