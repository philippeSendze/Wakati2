const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./connect');
const port = 3000;
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
const cookieParser = require('cookie-parser');

// Google Auth
const {OAuth2Client} = require('google-auth-library');
const CLIENT_ID = '421760753813-pkosgbfb6rcgvkrq959du30gqluniopc.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

function checkAuthenticated(req, res, next){

    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
        ;
      }
      verify()
      .then(()=>{
          req.user = user;
          next();
      })
      .catch(err=>{
          res.redirect('/');
      })

}


var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '',
    pass: ''
  }
});

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/views'));
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extented:true}));
app.options('*',cors());


app.get('/', function(req, res){
    if(req.cookies['session-token']) return res.redirect('/home');
    return res.render('index');
});

app.post('/login', (req,res)=>{
    let token = req.body.token;

    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        });
        const payload = ticket.getPayload();
      }
      verify()
      .then(()=>{
          res.cookie('session-token', token);
          res.send('success')
      })
      .catch(console.error);

})

app.get('/logout', (req, res)=>{
    res.clearCookie('session-token');
    res.redirect('/');
});

app.get('/home', checkAuthenticated, function(req, res){
    let user=req.user;
    res.render('home', {user});
});

app.get('/goals', checkAuthenticated, function(req, res){
    res.render('goal_page');
});

app.post('/goals', checkAuthenticated, (req, res) => {
    var email_user = req.user.email;
    var goal = req.body.goal;
    var date_goal = req.body.date_goal;
    var partner = req.body.partner;
    var email_partner = req.body.email_partner;
    const db = connection.getDbServiceInstance();
    
    const result = db.insertNewGoal(email_user,goal,date_goal,partner,email_partner);

    result
    .catch(err => console.log(err));

    letterHTML = `
        <h4>Mes salutations, ${partner} !</h4>
        <p>${req.user.name} a défini un objectif à atteindre : <b>${goal}</b>, à accomplir avant le <b>${date_goal}</b>.</p>
        <p> Le choix s'est porté sur vous pour être cette aide qui lui rappelle continuellement de réussir le but fixé.</p>
        Cordialement,
        <h4>Papy Wakati</h4>
    `;

    var mailOptions = {
        from: 'sendze.philippe@gmail.com',
        to: email_partner,
        subject: 'Papy Wakati a besoin de vous',
        html: letterHTML
      };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
            console.log("Problème au niveau de l'envoi du mail")
        } else {
            console.log('C\'est bon pour le mail');
        }
    });

    return res.redirect('/home');
});

app.get('/friends', checkAuthenticated, (req, res) => {
    res.render('friends');
    
});

app.get('/list/goals_where_partner', checkAuthenticated, (req, res) => {
    const db = connection.getDbServiceInstance();

    const result = db.getGoalsForPartner(req.user.email);
    
    result
    .then(data => res.json({data : data}))
    .catch(err => console.log(err));
});

app.get('/list/goals_non_accomplished', checkAuthenticated, (req, res) => {
    const db = connection.getDbServiceInstance();

    const result = db.getNonAccomplishedGoals(req.user.email);
    
    result
    .then(data => res.json({data : data}))
    .catch(err => console.log(err));
});

app.get('/list/goals_accomplished', checkAuthenticated, (req, res) => {
    const db = connection.getDbServiceInstance();

    const result = db.getAccomplishedGoals(req.user.email);
    
    result
    .then(data => res.json({data : data}))
    .catch(err => console.log(err));
});

app.get('/goals/:id', checkAuthenticated, (req,res) => {
    const {id} = req.params;
    const db = connection.getDbServiceInstance();
    const result = db.getOneGoal(id);
    result
    .then(data => res.json({success : data}))
    .catch(err => console.log(err));
});

app.delete('/delete/:id', checkAuthenticated, (req, res) => {
    const { id } = req.params;
    const db = connection.getDbServiceInstance();
    const result = db.deleteRowById(id);
    result
    .then(data => res.json({success : data}))
    .catch(err => console.log(err));
});

app.patch('/update/accomplished/:id', checkAuthenticated, (req, res) => {
    const { id } = req.params;
    const db = connection.getDbServiceInstance();
    const result = db.updateAccomplishment(id);
    result
    .then(data => res.json({success : data}))
    .catch(err => console.log(err));

});

app.get('/list/citations', checkAuthenticated, (req, res) => {
    const db = connection.getDbServiceInstance();
    const result = db.getCitations();
    result
    .then(data => res.json({data : data}))
    .catch(err => console.log(err));
});

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
    });


module.exports = app;