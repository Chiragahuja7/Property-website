const express=require('express')
require('dotenv').config()
const mongoose = require('mongoose');
const app = express()
const path = require('path');
app.set('views', path.join(__dirname, 'views'));
const expressLayouts=require("express-ejs-layouts")
const bodyParser = require("body-parser");
const addlocation=require('./models/addlocation');
const addagent=require('./models/addagent');
const addamenities=require('./models/addamenities');
const addbank=require('./models/addbank');
const multer=require('multer');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const cookieParser = require('cookie-parser');
const addproperties=require('./models/addproperty');
const mydata=require("./models/utils");
const leads = require('./models/leads');
const Compare = require('./models/compare');

app.use(expressLayouts);
app.set('layout',"layouts/main");
const adminLayout=('layouts/admin-layout');
const browseLayout=('layouts/browse-layout');

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
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.use((req, res, next) => {
    res.locals.currentPath = req.path;
    next();
});

app.use(async (req, res, next) => {
  try {
    const locations = await addlocation.find();
    res.locals.mylocation = locations;
    const token = req.cookies.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        const user = await addagent.findById(decoded.id);
        res.locals.user = user;
        req.user = user; 
      } catch (err) {
        console.error("Invalid token:", err.message);
        res.locals.user = null;
      }
    } else {
      res.locals.user = null;
    }
  } catch (err) {
    console.error(err);
    res.locals.mylocation = [];
    res.locals.user = null;
  }
  next();
});

app.get('/',async(req,res)=>{
  mylocation=await addlocation.find(req.params.id)
    res.render("index",{
      mylocation
    });
})

app.get('/about',(req,res)=>{
    res.render("about");
}); 

app.get('/our-mission',(req,res)=>{
    res.render("our-mission");
}); 

app.get('/browse', async (req, res) => {
  try {
    const mylocation=await addlocation.find();
    const myamenities = await addamenities.find();
    const myproperties = await addproperties.find();
    res.render('browse', { myproperties,myamenities ,mylocation,layout:browseLayout});
  } catch (err) {
    console.error(err);
    res.render('browse', { myproperties: [] });
  }
});

app.post('/browse', async (req, res) => {
  try {
    const { location, propertyStatus, propertyType ,additionalInfo,amenities , minprice ,maxprice ,area} = req.body;
    let query = {};

    if (location) {
      query.location = location;
    }
    if (propertyStatus) {
      query.propertyStatus = propertyStatus;
    }
    if (propertyType) {
      query.propertyType = propertyType;
    }
    if (additionalInfo) {
      query.additionalInfo = additionalInfo;
    }
    if (amenities) {
      query.amenities = amenities;
    }
    if (minprice || maxprice) {
      query.priceFromInNumber = {};
      if (minprice) query.priceFromInNumber.$gte = Number(minprice);
      if (maxprice) query.priceFromInNumber.$lte = Number(maxprice);
    }
    if (area) {
      const ranges = [].concat(area);
      const areaConditions = ranges.map(r => {
        if (r.includes('+')) {
          return { areaSquareFeetFrom: { $gte: parseInt(r) } };
        }
        const [min, max] = r.split('-').map(Number);
        return { areaSquareFeetFrom: { $gte: min, $lte: max } };
      });
      query = { $and: [ query, { $or: areaConditions } ] };
    }

    const myproperties = await addproperties.find(query);
    const mylocation = await addlocation.find(); 
    const myamenities = await addamenities.find();
    console.log(query);

    res.render('browse', {
      myproperties, 
      myamenities,
      mylocation,
      layout: browseLayout 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error applying filter" });
  }
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

app.get('/sell',async (req,res)=>{
  const mylocation=await addlocation.find();
  const myleads = await leads.find();
    res.render("contact" , {
      myleads,
      mylocation
    });
});

app.post("/schedule-call", async (req, res) => {
  try {
    const { name, email, contact ,type ,location} = req.body;
    const newCall = new leads({ name, email, contact,type ,location });
    await newCall.save();
    res.json({ success: true, message: "Call scheduled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
});

app.post("/sell", async (req, res) => {
  try {
    const { name, email, contact , message , address ,type,location } = req.body;
    const newCall = new leads({ name, email, contact , message ,address,type,location });
    await newCall.save();
    res.json({ success: true, message: "Call scheduled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
});

app.post("/interested", async (req, res) => {
  try {
    const { name, email, contact ,type ,location ,address ,propId} = req.body;
    const newCall = new leads({ name, email, contact,type ,location,address,propId });
    await newCall.save();
    res.json({ success: true, message: "Call scheduled!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving request" });
  }
});

app.get('/admin',adminAuth ,async(req,res)=>{
    res.render("admin/dashboard",{
        layout:adminLayout,
    });
});

app.get('/properties',adminAuth,async(req,res)=>{
    const myproperties = await addproperties.find().sort({ createdAt:-1});
    res.render("admin/properties",{
      myproperties,
      layout:adminLayout
    });
});

app.get('/addproperties',adminAuth,async (req, res) => {
  const mylocation=await addlocation.find();
  res.render('admin/addproperties',{
    layout:adminLayout,
    mydata,
    mylocation
  });
});

app.post("/addproperties", adminAuth, async (req, res) => {
  try {
    const newProperty = new addproperties({
      propertyName: req.body.propertyName,
      builderName: req.body.builderName,
      description: req.body.description,
      propertyType: req.body.propertyType,
      propertyStatus: req.body.propertyStatus,
      location: req.body.location,
      pricePerSquareFeet: req.body.pricePerSquareFeet,
      areaSquareFeetFrom: req.body.areaSquareFeetFrom,
      areaSquareFeetTo: req.body.areaSquareFeetTo,
      priceFromInWords: req.body.priceFromInWords,
      priceToInWords: req.body.priceToInWords,
      priceFromInNumber: req.body.priceFromInNumber,
      priceToInNumber: req.body.priceToInNumber,
      address: req.body.address,
      videoUrl: req.body.videoUrl,
      yearsOfConstruction: req.body.yearsOfConstruction,
      listingStatus: req.body.listingStatus,
    });

    await newProperty.save();

    res.json({ success: true, message: "Property Added!" });
  } catch (err) {
    console.error("Error saving property:", err.message);
    res.status(500).json({ success: false, message: "Error saving property" });
  }
});

app.get('/editproperty/:id',adminAuth, async (req, res) => {
  try {
    const mylocation=await addlocation.find();
    const property = await addproperties.findById(req.params.id);
    const myamenities = await addamenities.find();
    res.render("admin/editproperty", {
      property,
      layout: adminLayout,
      myamenities,
      mylocation,
      mydata
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  } 
});
 
app.post("/editproperty/:id",adminAuth,upload.fields([{name:"mainImage",maxCount:1},{name:"upload",maxCount:5}]),async(req,res)=>{
  try {
    const propertyId = req.params.id;
    let filePath = { ...req.body };
    const property = await addproperties.findById(propertyId);

    if (!Array.isArray(filePath.additionalInfo) && filePath.additionalInfo) {
      filePath.additionalInfo = [filePath.additionalInfo];
    }

    if (req.files["mainImage"]) {
      filePath.mainImage = "/uploads/" + req.files["mainImage"][0].filename;
    } else {
      filePath.mainImage = property.mainImage || null; 
    }

    if (req.files["upload"]) {
      const newUploads = req.files["upload"].map(file => "/uploads/" + file.filename);
      filePath.upload = (property.upload || []).concat(newUploads);
    } else {
      filePath.upload = property.upload || [];
    }

    await addproperties.findByIdAndUpdate(
      propertyId,
      filePath,
      { new: true, runValidators: true }
    );

    res.json({ success: true, message: "Property updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/deleteproperty/:id", adminAuth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    await addproperties.findByIdAndDelete(propertyId);
    res.redirect("/properties");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get('/locations',adminAuth,async (req,res)=>{
      const mylocation=await addlocation.find().sort({ createdAt:-1});
    res.render("admin/location",{
         mylocation,
        layout:adminLayout
    });
});

app.get('/agents',isAdminMiddleware,adminAuth,async(req,res)=>{
    const myagents = await addagent.find().sort({ createdAt:-1});
    res.render("admin/agent",{
      myagents,
      layout:adminLayout
    });
});

app.get('/leads',adminAuth,(req,res)=>{
    res.render("admin/leads",{
        layout:adminLayout
    });
});

app.get('/amenities',adminAuth, async (req, res) => {
    try {
        const myamenities = await addamenities.find().sort({ createdAt:-1});
        res.render('admin/amenities', { myamenities,
            layout:adminLayout
         });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

app.get('/editamenities/:id',adminAuth, async (req, res) => {
  try {
    const amenity = await addamenities.findById(req.params.id);
    if (!amenity) {
      return res.status(404).send("Amenity not found");
    }
    res.render("admin/editamenities", {
      amenity,
      layout: adminLayout,
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/editamenities/:id",adminAuth, async (req, res) => {
  try {
    const { amenities } = req.body;
    const amenityId = req.params.id;

    await addamenities.findByIdAndUpdate(amenityId, { amenities });

    res.json({ success: true, message: "Amenity updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/deleteamenities/:id", adminAuth, async (req, res) => {
  try {
    const amenityId = req.params.id;
    await addamenities.findByIdAndDelete(amenityId);
    res.redirect("/amenities");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get('/banks',adminAuth,async (req,res)=>{
  try{
    const mybanks=await addbank.find().sort({ createdAt:-1});
     res.render("admin/banks",{ mybanks,
        layout:adminLayout
    });
  }catch(err){
    res.status(500).send('Server error')
  }
});

app.get('/appointments',adminAuth,async (req,res)=>{
  try{
     res.render("admin/appointments",{
        layout:adminLayout
    });
  }catch(err){
    res.status(500).send('Server error')
  }
});

app.get('/customers', async (req, res) => {
  try {
    let { from, to } = req.query;
    let filter = {};
    if (from && to) {
      const fromDate = new Date(from);
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999); 
      filter.createdAt = { $gte: fromDate, $lte: toDate };
    } else if (from) {
      const fromDate = new Date(from);
      filter.createdAt = { $gte: fromDate };
    } else if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt = { $lte: toDate };
    }
    const myfiltercalls = await leads.find(filter).sort({ createdAt:-1});
    res.render('admin/customer', { myfiltercalls, from, to,layout:adminLayout });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get('/open-leads',adminAuth,async (req,res)=>{
    const mycalls = await leads.find().sort({ createdAt:-1});
    res.render("admin/open-leads",{
        layout:adminLayout,
        mycalls
    });
});

app.get('/editlead/:id',adminAuth, async (req, res) => {
  try {
    const mylocation=await addlocation.find();
    const agents = await addagent.find();
    const mycalls = await leads.findById(req.params.id);
    res.render("admin/editlead", {
      mycalls,
      layout: adminLayout,
      mylocation,
      mydata,
      agents
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post('/editlead/:id', async (req, res) => {
  try {
    const { name, assignedAgent, leadStatus } = req.body;
    await leads.findByIdAndUpdate(req.params.id, {
      name,
      assignedAgent,
      leadStatus
    });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.post("/editagent/:id",adminAuth, async (req, res) => {
  try {
    const { name , location , email , contact ,status } = req.body;
    const callId = req.params.id;
    await addagent.findByIdAndUpdate(callId, { name, location , email , contact ,status});
    res.json({ success: true, message: "Agent updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get('/closed-leads',adminAuth,async(req,res)=>{
    const mycalls = await leads.find().sort({ createdAt:-1});
    res.render("admin/closed-leads",{
        layout:adminLayout,
        mycalls
    });
});

app.get('/lost-leads',adminAuth,async(req,res)=>{
    const mycalls = await leads.find().sort({ createdAt:-1});
    res.render("admin/lost-leads",{
        layout:adminLayout,
        mycalls
    });
});

app.get('/calculator', (req, res) => {
  res.render('calculator');
});

app.get('/addlocation',adminAuth, (req, res) => {
  res.render('admin/addlocation',{
    layout:adminLayout
  });
});

app.post('/addlocation',adminAuth,async (req,res)=>{
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

app.get("/deletelocation/:id", adminAuth, async (req, res) => {
  try {
    const locationId = req.params.id;
    await addlocation.findByIdAndDelete(locationId);
    res.redirect("/locations");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get('/addagent',adminAuth,async (req, res) => {
  const mylocation=await addlocation.find();
  res.render('admin/addagent',{
    layout:adminLayout,
    mylocation
  });
});

// app.post('/addagent',async (req,res)=>{
//     try {
//     const { name,email,password,contact, location } = req.body;
//     const newagent = new addagent({name,email,password,contact, location });
//     await newagent.save();
//     res.json({ success: true, message: "Agent Added!" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: "Error saving request" });
//   }
// })

app.post("/addagent",adminAuth, async (req, res) => {
  try {
    const { name, email, password, contact, location } = req.body;

    if (!name || !email || !contact || !password || !location) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new addagent({
      name,
      email,
      password: hashedPassword,
      contact,
      location
    });

    await newAgent.save();

    res.json({ success: true, message: "Agent Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving agent" });
  }
});

app.get('/editagent/:id',adminAuth, async (req, res) => {
  try {
    const mylocation=await addlocation.find();
    const agent = await addagent.findById(req.params.id);
    res.render("admin/editagent", {
      agent,
      layout: adminLayout,
      mylocation,
      mydata
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.post("/editagent/:id",adminAuth, async (req, res) => {
  try {
    const { name , location , email , contact ,status } = req.body;
    const agentId = req.params.id;
    await addagent.findByIdAndUpdate(agentId, { name, location , email , contact ,status});
    res.json({ success: true, message: "Agent updated!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

app.get("/deleteagent/:id", adminAuth, async (req, res) => {
  try {
    const agentId = req.params.id;
    await addagent.findByIdAndDelete(agentId);
    res.redirect("/agents");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

app.get('/addamenities',adminAuth, (req, res) => {
  res.render('admin/addamenities',{
    layout:adminLayout
  });
});

app.post('/addamenities',adminAuth,async (req,res)=>{
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

app.get('/addbank',adminAuth, (req, res) => {
  res.render('admin/addbank',{
    layout:adminLayout
  });
});

app.post('/addbank',adminAuth,upload.single('upload'),async (req,res)=>{
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

app.get("/deletebanks/:id", adminAuth, async (req, res) => {
  try {
    const bankId = req.params.id;
    await addbank.findByIdAndDelete(bankId);
    res.redirect("/banks");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

function adminAuth(req, res, next) {
    try {
        const token = req.cookies?.token;
        if (!token) {
            return res.redirect("/login");
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
        req.user = decoded;
        next();
    } catch (err) {
        return res.redirect("/login");
    }
}

function isAdminMiddleware(req, res, next) {
  try {
    if (!req.user) {
      return res.status(403).send("Access denied: Admins only");
    }
    if (!req.user.isAdmin) {
      return res.status(403).send("Access denied: Admins only");
    }
    next();
  } catch (error) {
    console.error("Admin check failed:", error);
    res.status(500).send("Server error while checking admin status");
  }
}

app.get('/login', (req, res) => {
  res.render('login',{ alert: null });
});

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await addagent.findOne({ email });
        if (!user) {
            return res.render("login", { alert: "User not found!" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render("login", { alert: "Invalid credentials!" });
        }
        const token = jwt.sign(
            { id: user._id, isAdmin: user.isAdmin },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "10h" }
        );
        res.cookie("token", token, { httpOnly: true });
        if (user.isAdmin) {
            res.redirect("/admin");
        } else {
            res.redirect("/admin");
        }
    } catch (error) {
        console.error(error);
        res.render("login", { alert: "Server error, please try again" });
    }
});

app.get('/signup', (req, res) => {
  res.render('signup',{
  });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });

    await newUser.save();

    res.json({ success: true, message: "User Added!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error saving agent" });
  }
});

app.get('/search', async (req, res) => {
    const { type, query } = req.query;

    if (!type || !query) return res.send("Invalid search.");

    let results = [];

    if (type === "location") {
        results = await addlocation.find({
            location: { $regex: query, $options: "i" }
        });
        return res.render('admin/location', { mylocation: results,
          layout:adminLayout
         });
    }
    if (type === "banks") {
        results = await addbank.find({
            name: { $regex: query, $options: "i" }
        });
        return res.render('admin/banks', { mybanks: results,
            layout:adminLayout
         });
    }

    if (type === "properties") {
        results = await addproperties.find({
            propertyName: { $regex: query, $options: "i" }
        });
        return res.render('admin/properties', { myproperties: results,
            layout:adminLayout
         });
    }
    if (type === "amenities") {
        results = await addamenities.find({
            amenities: { $regex: query, $options: "i" }
        });
        return res.render('admin/amenities', { myamenities: results,
            layout:adminLayout
         });
    }
    if (type === "agent") {
        results = await addagent.find({
            name: { $regex: query, $options: "i" }
        });
        return res.render('admin/agent', { myagents: results ,
            layout:adminLayout
        });
    }
    if (type === "open-leads") {
        results = await leads.find({
            name: { $regex: query, $options: "i" }
        });
        return res.render('admin/open-leads', { mycalls: results ,
            layout:adminLayout
        });
    }
    if (type === "closed-leads") {
        results = await leads.find({
            name: { $regex: query, $options: "i" }
        });
        return res.render('admin/closed-leads', { mycalls: results ,
            layout:adminLayout
        });
    }
    if (type === "lost-leads") {
        results = await leads.find({
            name: { $regex: query, $options: "i" }
        });
        return res.render('admin/lost-leads', { mycalls: results ,
            layout:adminLayout
        });
    }

    res.send("No results found.");
});

app.get('/property/:id',async (req, res) => {
  const mylocation=await addlocation.find();
  const property = await addproperties.findById(req.params.id);
  const mybanks=await addbank.find();
  res.render('interestedproperty',{
    mylocation,
    property,
    mybanks
  });
});

app.get("/logout", (req, res) => {
    res.clearCookie("token", {
        httpOnly: true,
    });
    res.redirect("/login");
});

app.get('/compare', async (req, res) => {
  const compare = await Compare.findOne().populate('properties');
  res.render('compare', { compare });
});

app.post('/delete-image/:id', async (req, res) => {
  const property = await addproperties.findById(req.params.id);
  const index = req.query.index;
  if (property && property.upload[index]) {
    property.upload.splice(index, 1);
    await property.save();
  }
  res.redirect(`/editproperty/${req.params.id}`);
});

app.post('/compare', async (req, res) => {
  try {
    const { properties } = req.body;
    await Compare.create({ properties });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});