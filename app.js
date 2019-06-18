const express = require('express')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const fileUpload = require('express-fileupload');
const cp = require("child_process");
const path = require('path')
const app = express()
const port = process.env.PORT || 5000

// default options
app.use(fileUpload());

//SERVE PUBLIC FOLDER
app.use(express.static('public'))

//MONGODB connection
mongoose.connect('mongodb://localhost/cma_v100', {
    useNewUrlParser: true
}).then(() => console.log(`Successfully Connected to Mongodb`))
    .catch(err => console.log(`Unexpected error while connecting to DB`))


// Load Course model
require('./models/Course');
const Course = mongoose.model('courses');

//middlewares

// HANDLEBARS
app.engine('handlebars', exphbs({}))
app.set('view engine', 'handlebars')

//BODYPARSER
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

//METHODOVERRIDE
app.use(methodOverride('_method'))


//routes=

//HOME
app.get('/', (req, res) => {

    Course.find({})
        .then(courses => {
            res.render('index', {
                courses
            });
        })
})

//Add course
app.get('/course/add', (req, res) => {
    res.render('courses/add')
})

//Process Course
app.post('/', (req, res) => {



    let sampleFile = req.files.torrentFile
    let fileName = sampleFile.name;
    sampleFile.mv('./public/uploads/' + fileName, (err) => {
        if (err) console.log(`ERROR ${err}`)
        else {
            const newCourse = {
                course_name: req.body.course_name,
                torrentUrl: req.body.torrentUrl,
                status: false,
                courseImage: req.body.courseImage,
                torrentFilePath: `./public/uploads/${req.files.torrentFile.name}`
            }
            new Course(newCourse).save()
                .then(courses => {
                    res.redirect('/')
                })

        }
    })

})

//OPEN WITH Utorrent
app.put('/openWithU/:id', (req, res) => {
    Course.findOne({
        _id: req.params.id
    }).then(course => {
        function getCommandLine() {
            switch (process.platform) {
                case 'darwin': return 'open';
                case 'win32': return 'start';
                case 'win64': return 'start';
                default: return 'xdg-open';
            }
        }


        let file = path.join(course.torrentFilePath);
        console.log(file) 
        cp.exec(getCommandLine() + ' ' + file, (err, stdout, stderr) => {
            if (err) console.log(`ERROR ${err}`)
            course.status = true
            course.save()
            res.redirect('/')
        });
    })

})

//FILTERS

//By Downloads
app.post('/filterByDownloaded', (req, res)=>{
    Course.find({
        status: true
    }).then(courses=>{
        res.render('index', {
            courses, 
            text: "Showing All Downloaded Courses"
        })
    })
})

//By Not Downloads
app.post('/filterByNotDownloaded', (req, res)=>{
    Course.find({
        status: false
    }).then(courses=>{
        res.render('index', {
            courses, 
            text: "Showing All Not Downloaded Courses"
        })
    })
})

//DELETE TORRENT
app.delete('/delete/:id', (req, res)=>{
    Course.deleteOne({
        _id: req.params.id
    }).then(course=>{
        res.redirect('/')
    })
})

app.listen(port, () => console.log(`Serving at http://localhost:${port}`))
