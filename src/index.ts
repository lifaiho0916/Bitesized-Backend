import express from "express"
import mongoose, { ConnectOptions } from "mongoose"
import cors from "cors"
import cron from "node-cron"
import http from "http"
import SocketServer from "./socket"
import { Request, Response } from "express"
import 'dotenv/config'

import Bite from "./models/Bite"
//schedule functions
import { getCurrencyRate } from "./controllers/transactionController"

//Routers
import auth from "./Routes/api/auth"
import bite from "./Routes/api/bite"
import social from "./Routes/api/socialAccounts"
import transaction from "./Routes/api/transaction"
import payment from "./Routes/api/payment"

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const server = http.createServer(app);

const io = SocketServer(server);

app.use((req: Request, res: Response, next) => {
  req.body.io = io
  return next()
});

//DB connection
mongoose.connect(`${process.env.MONGO_URL}`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: false
  } as ConnectOptions)
  .then((res) => {
    console.log("Connected to Mongo DB!!")
  }).catch((err) => console.log(err))

//Routes
app.use("/api/auth", auth)
app.use("/api/bite", bite)
app.use("/api/social-accounts", social)
app.use("/api/transaction", transaction)
app.use("/api/payment", payment)

app.use(express.static("public"))
server.listen(PORT, async () => {
  console.log(`The Server is up and running on PORT ${PORT}`)
  const bites = await Bite.find()
  bites.forEach(async (bite: any) => {
    await Bite.findByIdAndUpdate(bite._id, { comments: [] })
  })
})

// cron.schedule("*/10 * * * * *", () => checkOngoingfundmes(io))
cron.schedule("59 23 * * *", () => getCurrencyRate(), {
  scheduled: true,
  timezone: "Asia/Hong_Kong",
})

cron.schedule("59 11 * * *", () => getCurrencyRate(), {
  scheduled: true,
  timezone: "Asia/Hong_Kong",
})
