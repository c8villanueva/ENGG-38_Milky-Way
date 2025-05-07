const express = require('express')
const app = express()
const path = require('path')
const { logger } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const PORT = process.env.PORT || 3500

// keep before everything else
app.use(logger)

// Cross-Origin Resource Sharing  - for security
// tbh the deployment issue might be coming from here so we'll see
// placing everything in this file for now for easier troubleshooting later
const allowedOrigins = [
  'http://localhost:3000', //for development, where the frontend will be
  //fake urls for now
  'https://www.dandrepairshop.com',
  'https://dandreparishop.com',
]
const corsOptions = {
  origin: (origin, callback) => {
    //only those in the array can access
    //but also block testing apps like postman, so include || !origin
    if(allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 //the default is 204, some devices have a problem with this
}
app.use(cors(corsOptions))

//for the ability to process json
app.use(express.json())

// 3rd party middleware, to parse cookies
app.use(cookieParser())

// to allow access to all files in /public
app.use('/', express.static(path.join(__dirname, '/public')))


//routes
app.use('/', require('./routes/root'))





// shows 404 error page when non-existent routes are requested
app.all(/.*/, (req, res) => {
  res.status(404)
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'))
  } else if (req.accepts('json')) {
    res.json({ message: '404 Not Found' })
  } else {
    res.type('txt').send('404 Not Found')
  }
})


app.use(errorHandler)

//always at the end of server.js
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))