const express=require('express')
require('dotenv').config()
const mongoose = require('mongoose');
const app = express()
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
const expressLayouts=require("express-ejs-layouts")
const ScheduleCall=require('./models/ScheduleCall');
const bodyParser = require("body-parser");
const addlocation=require('./models/addlocation');
const addagent=require('./models/addagent');
const addamenities=require('./models/addamenities');
const addbank=require('./models/addbank');
const multer=require('multer');


app.use(expressLayouts);
app.set('layout',"layouts/main");
const adminLayout=('layouts/admin-layout');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const dbURI = 'mongodb://127.0.0.1:27017/TEMPLATE';
mongoose.set('strictQuery', true);
mongoose.connect(dbURI).then((result)=>{
    console.log('connection successfull');
    app.listen(3000,()=>{
        console.log("Server running on port 3000")
    
    });
}).catch(err=>console.log(err))

app.set('view engine','ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/',(req,res)=>{
    res.render("index");
})

app.get('/about',(req,res)=>{
    res.render("about");
}); 

app.get('/our-mission',(req,res)=>{
    res.render("our-mission");
}); 

app.get('/browse',(req,res)=>{
    res.render("browse");
});

app.get('/career',(req,res)=>{
    res.render("career");
}); 

app.get('/award',(req,res)=>{
    res.render("award");
}); 

app.get('/testimonials',(req,res)=>{
    res.render("testimonials");
}); 

app.get('/our-services',(req,res)=>{
    res.render("our-services");
}); 

app.get('/terms-and-condition',(req,res)=>{
    res.render("terms-and-condition");
}); 

app.get('/faq',(req,res)=>{
    res.render("faq");
}); 

app.get('/sell',(req,res)=>{
    res.render("contact");
});

app.post("/schedule-call", async (req, res) => {
  try {
    const { name, email, contact } = req.body;
    const newCall = new ScheduleCall({ name, email, contact });
    await newCall.save();
    res.json({ success: true, message: "Call scheduled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
});

app.post("/sell", async (req, res) => {
  try {
    const { name, email, contact , message , address } = req.body;
    const newCall = new ScheduleCall({ name, email, contact , message ,address });
    await newCall.save();
    res.json({ success: true, message: "Call scheduled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
});

app.get('/admin',(req,res)=>{
    res.render("admin/dashboard",{
        layout:adminLayout
    });
});

app.get('/properties',(req,res)=>{
    res.render("admin/properties",{
        layout:adminLayout
    });
});

app.get('/locations',(req,res)=>{
    res.render("admin/location",{
        layout:adminLayout
    });
});

app.get('/agents',(req,res)=>{
    res.render("admin/agent",{
        layout:adminLayout
    });
});

app.get('/leads',(req,res)=>{
    res.render("admin/leads",{
        layout:adminLayout
    });
});

app.get('/amenities', async (req, res) => {
    try {
        const myamenities = await addamenities.find();
        // console.log(myamenities)
        res.render('admin/amenities', { myamenities,
            layout:adminLayout
         });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.get('/banks',(req,res)=>{
    res.render("admin/banks",{
        layout:adminLayout
    });
});

app.get('/customers',(req,res)=>{
    res.render("admin/customer",{
        layout:adminLayout
    });
});

app.get('/open-leads',(req,res)=>{
    res.render("admin/open-leads",{
        layout:adminLayout
    });
});

app.get('/closed-leads',(req,res)=>{
    res.render("admin/closed-leads",{
        layout:adminLayout
    });
});


app.get('/lost-leads',(req,res)=>{
    res.render("admin/lost-leads",{
        layout:adminLayout
    });
});

app.get('/calculator', (req, res) => {
  res.render('calculator');
});

app.get('/addlocation', (req, res) => {
  res.render('admin/addlocation',{
    layout:adminLayout
  });
});

app.post('/addlocation',async (req,res)=>{
    try {
    const { location } = req.body;
    const newlocation = new addlocation({location });
    await newlocation.save();
    res.json({ success: true, message: "Location Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
})

app.get('/addagent', (req, res) => {
  res.render('admin/addagent',{
    layout:adminLayout
  });
});

app.post('/addagent',async (req,res)=>{
    try {
    const { name,email,password,contact, location } = req.body;
    const newagent = new addagent({name,email,password,contact, location });
    await newagent.save();
    res.json({ success: true, message: "Agent Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
})

app.get('/addamenities', (req, res) => {
  res.render('admin/addamenities',{
    layout:adminLayout
  });
});

app.post('/addamenities',async (req,res)=>{
    try {
    const { amenities } = req.body;
    const newamenities = new addamenities({amenities });
    await newamenities.save();
    res.json({ success: true, message: "Amenity Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
})

app.get('/addbank', (req, res) => {
  res.render('admin/addbank',{
    layout:adminLayout
  });
});

app.post('/addbank',upload.single('upload'),async (req,res)=>{
    try {
    const { name,roi } = req.body;
    const filePath = '/uploads/' + req.file.filename;
    const newbank = new addbank({
        name,
        roi,
        upload:filePath,
    });
    await newbank.save();
    res.json({ success: true, message: "Bank Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
}) 
