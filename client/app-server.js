import express from 'express'
const app = express();

app.set('port', process.env.PORT || 3000);
// Static files
app.use(express.static('public'));
const http = require('http').Server(app);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
});

http.listen(app.get('port'), () => {
  console.log('React Chat App listening on ' + app.get('port'))
});