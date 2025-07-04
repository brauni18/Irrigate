const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
;
const api_gardens = require('./routers/api_gardens');


require('custom-env').env(process.env.NODE_ENV, './config');

mongoose.connect(process.env.CONNECTION_STRING, {  });

var app = express();
app.use(cors());
// app.use(bodyParser.urlencoded({extended : true}));
// app.use(express.json());
// app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/api/gardens', api_gardens);

app.listen(process.env.PORT);