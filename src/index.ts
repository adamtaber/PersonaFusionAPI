import express from 'express'

const app = express()
app.get('/', (req, res) => {
  res.send('Hello World')
})

const port = process.env.PORT || 8080

app.listen(3000, () => {
  console.log(`app listening on port 3000`)
  console.log('test test test')
})