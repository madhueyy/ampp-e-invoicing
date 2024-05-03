/* eslint-disable */
import express from 'express'
import http from 'http'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'

import router from './router'

const app = express()

app.use(cors({
  credentials: true
}))

app.use(compression())
app.use(cookieParser())
app.use(bodyParser.json())

const server = http.createServer(app)
const port = process.env.PORT || 8081

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}/`)
})

const MONGO_URL = 'mongodb+srv://madhunsw:madhunsw@cluster0.csijlis.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.Promise = Promise
mongoose.connect(MONGO_URL)
mongoose.connection.on('error', (error) => { console.log(error) })

app.use('/', router())
app.get("/", (req, res) => {
  res.send({ data: "Please visit our documentation to use the API routes: https://app.swaggerhub.com/apis-docs/Z5363700/DAMPP/1.0.0" });
});

export const closeServer = () => {
  server.close()
}

export default app