const express = require('express')
const app = express()
const path = require('path')
const PORT = process.env.PORT || 3500

// to allow access to all files in /public
app.use('/', express.static(path.join(__dirname, '/public')))


//routes
app.use('/', require('./routes/root'))





// errors 404
// new regex syntax
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




//always at the end of server.js
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))