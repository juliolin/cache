const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const upload = multer();
const uploadDirectory = __dirname + path.sep + 'files';

let caches = {};

function writeFile(name, body) {
    return (new Promise((resolve, reject) => {
        fs.writeFile(uploadDirectory + path.sep + name, body, (err) => {
            if (err) {
                return reject(err);
            }
            resolve(name);
        });
    })).then(readFile);
}

function readFile(file) {
    return (new Promise((resolve, reject) => {
        fs.readFile(uploadDirectory + path.sep + file, (err, body) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            resolve(body);
        });
    }));
}

app.get('/files/:name', (req, res) => {
    if (caches[req.params.name] == null) {
        caches[req.params.name] = readFile(req.params.name);
    }
    caches[req.params.name]
        .then((body) => res.send(body))
        .catch((e) => res.status(500).send(e.message));
});

app.post('/files', upload.single('file'), (req, res) => {
    caches[req.params.name] = writeFile(req.file.originalname, req.file.buffer);
    caches[req.params.name]
        .then(() => res.send('file uploaded'))
        .catch((e) => res.status(500).send(e.message));
});

app.listen(3000, () => console.log('Dropbox with cache listening on port 3000!'));