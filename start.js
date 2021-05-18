const {app,connection} = require('./app')

app.listen(process.env.PORT || 5000, () => connection())