const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing = require("./models/listing.js")
const path = require("path");
const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust"
const methodOverride = require('method-override')
const ejsMate = require ("ejs-mate")
const wrapAsync = require('./utils/wrapAsync.js')
const ExpressError = require('./utils/ExpressError.js')
const {listingSchema }= require("./schema.js")

main()
.then(() => {
    console.log("connection successful!!")
})
.catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(MONGO_URL);
}

app.set("view engine", "ejs");
app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname,"public")))

app.get("/", (req,res) => {
    res.send("working!!!")
})

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg)
    }
    else{
        next();
    }
}

//index route
app.get("/listings", wrapAsync( async (req,res) => {
    let allListing = await Listing.find({})
    res.render("listings/index.ejs", {allListing})
})
)

//new route
app.get("/listings/new", (req,res) => {
    res.render("listings/new.ejs")
})

//show route
app.get("/listings/:id", wrapAsync( async (req,res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", {listing})
})
)

//create route
app.post("/listings", validateListing, wrapAsync( async(req,res) => {
    // let { title, description, image, price, location, country} = req.body;        
    // let listing = req.body.listing;

    const new_listing = new Listing(req.body.listing);
    await new_listing.save();
    res.redirect("/listings")
})
);

//Edit route
app.get("/listings/:id/edit", wrapAsync( async(req,res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing})
})
)

//update route
app.put("/listings/:id", validateListing, wrapAsync( async(req,res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing})
    res.redirect("/listings")
})
)

//delete route
app.delete("/listings/:id", wrapAsync( async(req,res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing)
    res.redirect("/listings")
})
)

// app.get("/testListing", async (req,res) => {
//     let sampleListing = new Listing({
//         title: "My new villa",
//         description: "By the beach",
//         price:1200,
//         location: "calangute, Goa",
//         country: "India"
//     });

//     await sampleListing.save();
//     res.send("successful test")
// })

// app.all("*", (req, res, next) => {
//     next(new ExpressError(404, "Page not found"));
// });

app.use((err, req, res, next) => {
    let {statusCode = 500, message= "something is wrong"} = err;
    res.status(statusCode).render("error.ejs", {err})
})

app.listen(5000, (req,res) => {
    console.log("server is listening!!!!")
});