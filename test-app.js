'use strict';

let express = require('express');
let app = express();

app.use('/data', express.static('data'));

app.get('/', (req, res) => res.send('Testing App for Gio'));

app.listen(3000);