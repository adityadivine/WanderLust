const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Listing=require("./models/listing.js");
const path=require("path");
//to convert post to put in edit route
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");



const MONGO_URL="mongodb://127.0.0.1:27017/WanderLust";

//calling the main function, we are also doing error handling here
main().then(()=>{
    console.log("connected to mongodb database!")
})
.catch((err)=>{
    console.log(err);
}) ;

//connecting to our mongodb database
 async function main(){
    await mongoose.connect(MONGO_URL);
 } 

 app.set("view engine","ejs");
 //so that it doesn't give error because of location
 app.set("views",path.join(__dirname,"views"));
//to parse all the data that is coming from the params as id
 app.use(express.urlencoded({extended:true}));
 //to convert post to put in edit route
app.use(methodOverride("_method"));
//for creating templates like we did with "includes".
app.engine('ejs',ejsMate);
//to use our style.css file
app.use(express.static(path.join(__dirname,"/public")));


//our root route (like default one)
app.get("/", (req,res) =>{
    res.send("Hi, I am root");
});

//index route to show all listings
// whenever we are doing any operations in the database,
//we use async and await.
app.get("/listings",async (req,res)=>{
    const allListings= await Listing.find({});
    res.render("listings/index.ejs",{allListings});
});



//New Route to add new listings(showing the form), 
// write this before the /listings/:id because otherwise 
// it will think that new is also an id and will give errors!
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
});


//show route to show individual listing details
app.get("/listings/:id",async (req,res)=>{
    let{id}=req.params; 
   const listing=await Listing.findById(id) ;
   res.render("listings/show.ejs",{listing});
});

//Create Route
app.post("/listings",async(req,res)=>{
    //one method -> extracting all variables (below commenyted line)
    //let {title,description,image,price,country,location}=req.body;

    //second method is to make these variables as the key of an object,
    //here listing for example listing[title]
    //we are going to do this in new.ejs
    //if we follow the first method we don't need to do name="listing[title]"
    //just name ="title" is required !!!
    //let listing=req.body.listing;
    //shortcut
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    // console.log(listing);

});

//Edit Route
app.get("/listings/:id/edit",async (req,res)=>{
    // extracting id from parameter and then using it to find the listing!
    let{id}=req.params; 
    const listing=await Listing.findById(id) ;
    res.render("listings/edit.ejs",{listing});
});



//Update route
app.put("/listings/:id",async (req,res)=>{
    let{id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
});

//Delete route
// app.delete("/listings/:id",async (req,res)=>{
//     let{id}=req.params;
//     let deletedListing=await Listing.findByIdAndDelete(id);
//     console.log(deletedListing);
//     res.redirect("/listings");
// });
// Delete route

app.delete("/listings/:id",async (req,res)=>{
    let{id}=req.params;
    let deletedListing=await Listing.findByIdAndDelete(id);
    console.log("Deleted Listing:", deletedListing); // Add this line
    res.redirect("/listings");
});


app.listen(8080,()=>{
    console.log("Server is listening on port 8080");
});

// app.get("/testListing", async (req,res) =>{
//     let sampleListing=new Listing({
//         title:"My new Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Calangute, Goa",
//         country: "India",
//     }); 
//     await sampleListing.save();
//     console.log("Sample was saved"); 
//     res.send("successful testing");
// });