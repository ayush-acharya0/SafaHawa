const express = require("express");
require('dotenv').config();
const cors = require("cors");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Traffic = require("./models/Traffic");
const Report=require('./models/report')
const User = require("./models/User");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });



const app = express();
const port = process.env.PORT ||3000;
const path = require("path");
app.use(express.urlencoded({ extended: false }));

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../Frontend")));

mongoose.connect(process.env.MONGODB_URL)
.then(()=>console.log("Connected to MongoDB"))
.catch((err)=>console.log("Error connecting to MongoDB:", err));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend", "index.html"));
});

app.get("/report", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend", "login.html"));
});

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await  User.create({ name, email, password: hashedPassword });
    
    res.status(201).send(`<script>alert('User registered successfully');
                        window.location.href = '/login.html';</script>`);
  } catch (error) {
    res.status(500).send(`Error registering user : ${error.message}`);
  }
});

app.post("/login", async (req, res) => {
  try {
    const { name, password } = req.body;
    const user = await User.findOne({name});
    if (user && await bcrypt.compare(password,user.password)){
        res.status(200).redirect('/report.html');  
    }
    else {
        res.status(401).send(`<script>alert('Invalid credentials')
                        window.location.href = '/login.html';</script>`);
  }
 }catch (error) {
    res.status(500).send("Error logging in");
  }});


  app.post("/submit-report", upload.array("image"), async (req, res) => {
  try {
    const { vehicleCategory, vehicleNumber, pollutionType, location, phoneNumber, details } = req.body;

    const images = req.files?.map(file => ({
      data: file.buffer,
      contentType: file.mimetype
    })) || [];
    console.log("Received report:", { vehicleCategory, vehicleNumber, pollutionType, location, phoneNumber, details, imagesCount: images.length });
    const reportData = {
      vehicleCategory,
      vehicleNumber,
      pollutionType,
      location,
      phoneNumber,
      details,
      images     
    };

    await Report.create(reportData);

    res.status(200).send(`<script>alert('Report submitted successfully');
                          window.location.href = '/report.html';</script>`);
  } catch (error) {
    console.error(error);
    res.status(500).send(`Error submitting report ${error.message}`);
  }
});



app.get("/getReport", async (req, res) => {
  try {
    const reports = await Report.find().sort({ createdAt: -1 });
    const reportsJson = reports.map(r => ({
      _id: r._id,
      vehicleCategory: r.vehicleCategory,
      vehicleNumber: r.vehicleNumber,
      pollutionType: r.pollutionType,
      location: r.location,
      phoneNumber: r.phoneNumber,
      details: r.details,
      hasImage: r.images && r.images.length > 0

    }));
    res.status(200).json(reportsJson);
  } catch (error) {
    res.status(500).send("Error fetching reports");
  }
});


app.get("/report-image/:id", async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        const index = parseInt(req.query.index) || 0;

        if (!report || !report.images || !report.images[index]) {
            return res.status(404).send("Image not found");
        }

        res.set("Content-Type", report.images[index].contentType);
        res.send(report.images[index].data);

    } catch (err) {
        res.status(500).send("Error fetching image");
    }
});




   // only for testing purpose   
app.post("/traffic-signup", async (req, res) => {
  try {
    const {  email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    await  Traffic.create({  email, password: hashedPassword });
    
    res.status(201).send(`<script>alert('Traffic registered successfully');
                       </script>`);
  } catch (error) {
    res.status(500).send(`Error registering user : ${error.message}`);
  }
});



 app.post('/traffic-login', async (req, res) => {
  try {
    const {email,password}=req.body;
    const trafficUser=await Traffic.findOne({email});
    if(trafficUser && await bcrypt.compare(password,trafficUser.password)){
        res.status(200).redirect('/trafficDashboard.html');
    } else {
        res.status(401).send("Invalid credentials");
    }

  } catch (error) {
    res.status(500).send("Invalid credentials");
  }
 });

 app.get('/traffic-logout', (req, res) => {
  res.redirect('trafficLogin.html');
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


//username:admin pw:abcd
// email:traffic@gmail.com pw:trafficmama123
