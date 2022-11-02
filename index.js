//requiring the express 
const express = require('express');
const cookieParser = require("cookie-parser");
const swaggerUI = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json')
const logger = require('./utils/winston');
const morgan = require("morgan");

//initializing the express 
const app = express();
const PORT = process.env.PORT || 4000;
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument))

const multer  = require('multer')

//This package loads environmental variables from .env  file into Node’s process.env object
require('dotenv').config();
//to provide access to other origins accessing this from other address
const cors = require('cors')
// Db connection
require('./config/db.js')
// product routes
const projectsRoute = require('./routes/project.route')
// user Routes
const userRoutes = require('./routes/users')
//managers route
const manager = require('./routes/managers')
//TeamLead route
const lead = require('./routes/teamLead.routes')
//team member routes
const member = require('./routes/teamMember')
const newLogo = require('./routes/logo')
const forgot = require('./routes/forgotPassword')

// cors middleware
app.use(cors())
// body parser middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//to parse the incoming json object
app.use(express.json())
//to serve the static images and files
app.use(express.static('public'));
app.use('/images', express.static(__dirname + '/images'));
app.use('/',express.static(__dirname+'/uploads'))
// route middleware
app.use('/projects', projectsRoute)
app.use('/users', userRoutes)
app.use('/managers', manager)
app.use('/teamLead', lead)
app.use('/teamMember', member)
app.use('/logo', newLogo)
app.use('/password',forgot)


app.get('/test', (req, res) => {
    res.json({ 'test': 'test the rest service' })
})


// Loggers 
app.use(morgan('combined', { stream: logger.stream }));

// Error handling middleware
app.use((err, req, res, next) => {

    // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // include winston logging
  logger.error(
    `${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );


    res.status(500).json({
        error: true,
        message: err.message,
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
})
