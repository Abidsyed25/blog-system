const ex = require("express");
const server = ex();
const mongoose = require("mongoose");
var path = require('path');
const bcrypt = require("bcrypt");
var dir = path.join(__dirname, 'public');
const jwt = require("jsonwebtoken");
var cookieParser = require('cookie-parser');
var multer = require("multer");
const filestorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})
const upload = multer({ storage: filestorage });
const port = process.env.PORT || 8000;
const url = "mongodb+srv://Abidsyed25:Ab1d$yed@cluster0.5ditsyk.mongodb.net/blog?retryWrites=true&w=majority";
server.use(cookieParser());
mongoose.connect(url)
    .then(() =>
        console.log("connection successful...")
    )
    .catch((err) =>
        console.log(err)
    );
const document_schema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true
    },
    matter: [
        {
            type: String,
            required: true
        }
    ]
})
const document = new mongoose.model("document", document_schema);
document_schema.methods.addMatter = async function () {
    try {
        let i = 1;
       
        do {
            let str = `matter${i}`;
            let m = eval(str);
            this.matter = this.matter.concat(req.body.m);
            i++;
        } while(req.body.m != null);
    
    } catch (err) {
        console.log(err);
    }
    return true;
}
const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})
const user = new mongoose.model("user", schema);


server.use(ex.static(dir));
server.use(ex.json());
server.use(ex.urlencoded({ extended: false }));
server.set("view engine", "ejs");

server.get("/home", async (req, res) => {
    try {
        const blog = await document.find().sort({ id: -1 }).limit(5);

        res.render('home', {
            b: blog
        });

    } catch (err) {
        console.log(err);
    }

});

server.get("/login", (req, res) => {

    const cook = req.cookies.jwt;
    if (cook) {
        res.redirect("/admin");
    }
    else {
        res.render('login');
    }


})
server.post("/login", async (req, res) => {
    try {

        const doc = await user.findOne({ name: req.body.name });
        console.log(doc);
        const bool = (req.body.password == doc.password);
        if (bool) {
            const token = await jwt.sign({ _id: doc.id }, "Abcdefghijklmnopqrstuvwxyz");

            res.cookie("jwt", token, {
                expires: new Date(Date.now() + 1000000)
            });

            res.redirect("/admin");
        }
        else {
            res.send("Invalid login details");
        }
    } catch (err) {
        console.log(err);
        res.send("Invalid Login Details");
    }

})
server.get("/admin", async (req, res) => {
    try {
        
        const token = req.cookies.jwt;
        
        const bool = jwt.verify(token, "Abcdefghijklmnopqrstuvwxyz");
        
        const doc = await user.findOne({ _id: bool._id });
        var c = 0;
        try{
         const blog = await document.find().sort({ id: -1 });
         
         c = blog[0].id;
         c = parseInt(c);
        }catch(err){
        
                c = 10000;
        }
       
        
        if (doc) {
            res.render('admin',{
                count: c+1
            });
            
        }
        else {
            res.send("no");
        }
    } catch (err) {
         
        res.redirect("/login");
    }
})

server.post("/admin", upload.single("image"), async (req, res) => {
    var dateObj = new Date().toLocaleString('en-us',{month:'long', year:'numeric', day:'numeric'});

    const blog = new document({
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        date: dateObj,
        source: req.file.originalname,
        matter: req.body.matter,
        topic: req.body.topic,
        author: req.body.author
    });
    console.log(req.body.matter);
    m = req.body.matter;
    console.log(m[0]);
    
     
    console.log(req.body);


    blog.save().then(() => {
        console.log("data stored sucessfully");
    })
    res.send(req.body);
})
/** server.get("/technology",async (req,res) => {
    try {
        const blog = await document.find({topic: "technology"}).sort({ id: -1 });

        res.render('technology', {
            b: blog
        });

    } catch (err) {
        console.log(err);
    }
})
server.get("/science",async (req,res) => {
    try {
        const blog = await document.find({topic: "science"}).sort({ id: -1 });
        res.render('education', {
            b: blog
        });
    } catch (err) {
        console.log(err);
    }
})
server.get("/history",async (req,res) => {
    try {
        const blog = await document.find({topic: "history"}).sort({ id: -1 });
        res.render('history', {
            b: blog
        });
    } catch (err) {
        console.log(err);
    }
}) 
**/
server.get("/search",async(req,res) => {
    const blog = await document.find({title: {$regex: req.query.search, $options: 'i'}}).limit(10);
    res.render('search',{
        b:blog
    });
    console.log(blog);
})

server.get("/:id", async (req, res) => {
    try {
        const blog = await document.findOne({ id: req.params.id });
        res.render('blog', {
            b: blog
        });
    } catch (err) {
        console.log(err);
    }
});

server.listen(port, () => {
    console.log("connected ok");
});


