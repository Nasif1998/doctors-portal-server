const express = require('express')
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tzaf0.mongodb.net/doctorsPortal?retryWrites=true&w=majority`;



const app = express()

app.use(express.static('doctors'));
app.use(fileUpload());
const port = process.env.PORT || 8001;

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentCollection = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");
    console.log('db connected');
    // perform actions on the collection object
    //   client.close();
    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        console.log(appointment);
        appointmentCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/appointmentsByData', (req, res) => {
        const date = req.body;
        // console.log(date.date);
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email;
                }
                appointmentCollection.find(filter)
                    .toArray((err, documents) => {
                        res.send(documents);
                    })


            })


        // appointmentCollection.find({ date: date.date })
        //     .toArray((err, documents) => {
        //         res.send(documents);
        //     })
    })

    app.post('/addADoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        // const filePath = `${__dirname}/doctors/${file.name}`;
        // const newImg = file.data;
        // const encImg = newImg.toString('base64');

        console.log(file, name, email);
        // file.mv(filePath, err => {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).send({ msg: 'Failed to upload Image' });
        //     }
            // var newImg = fs.readFileSync(filePath);
            const newImg = req.files.file.data;
            const encImg = newImg.toString('base64');


            var image = {
                contentType: file.mimetype,
                size: file.size,
                img: Buffer.from(encImg, 'base64')
            };

            doctorCollection.insertOne({ name, email, image })
            .then(result => {
                // fs.remove(filePath, error => {
                //     if(error){console.log(error)}
                //     res.send(result.insertedCount > 0);
                // })
                res.send(result.insertedCount > 0);
                
            })
            // return res.send({ name: file.name, path: `/${file.name}` })
        // })

        
        
        
        // doctorCollection.insertOne({ name, email, img: file.name })
        //     .then(result => {
        //         res.send(result.insertedCount > 0);
        //     })



        // var image = {
        //     contentType: file.mimetype,
        //     size: file.size,
        //     img: Buffer.from(encImg, 'base64')
        // };

        // doctorCollection.insertOne({ name, email, image })
        //     .then(result => {
        //         res.send(result.insertedCount > 0);
        //     })
    })

    app.get('/doctors', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    });

    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })

});