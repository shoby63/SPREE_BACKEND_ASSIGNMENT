// app.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const {rateLimit}= require('express-rate-limit');
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	limit: 100, 
	standardHeaders: 'draft-7', 
	legacyHeaders: false, 
})
// Apply the rate limiting middleware to all requests.

require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(limiter);
const userRoutes=require('./routes/authUser');
const notesRoutes=require('./routes/notes')
const port =7000; 
app.use(userRoutes);
app.use(notesRoutes);

app.get('/', (req, res) => {
    res.send('Hello World!');
}); 
mongoose.connect(process.env.MONGO_DB_URI,{
    useNewUrlParser: true,
}).then(result=>{
    console.log("Connection to Database established")
    app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
});
}).catch(err =>{
   console.log("eror",err);
});