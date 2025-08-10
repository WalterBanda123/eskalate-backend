const express = require('express');
const mongoose = require('mongoose');
const { StatusCodes } = require('http-status-codes');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const mongoURI = process.env.MONGODB_CONNECTION_STRING || 'mongodb://localhost:27017/eskalate_meals';
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

app.use('/api/version-01', routes);

app.get('/', (req, res) => {
    res.status(StatusCodes.OK).json({ message: 'Server is running and DB connected!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});