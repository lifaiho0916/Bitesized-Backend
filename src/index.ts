import express from "express"
import mongoose, { ConnectOptions } from "mongoose"
import cors from "cors"
import cron from "node-cron"
import http from "http"
// import SocketServer from "./socket"
// import { Request, Response } from "express"
import 'dotenv/config'

//schedule functions
import { getCurrencyRate } from "./controllers/transactionController"

//Routers
import auth from "./Routes/api/auth"
import bite from "./Routes/api/bite"
import social from "./Routes/api/socialAccounts"
import transaction from "./Routes/api/transaction"
import payment from "./Routes/api/payment"
import setting from "./Routes/api/setting"
import subScription from "./Routes/api/subscription"
import search from "./Routes/api/search"

const app = express()
const PORT = process.env.PORT || 5000

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
const server = http.createServer(app);

// const io = SocketServer(server);

// app.use((req: Request, res: Response, next) => {
//   req.body.io = io
//   return next()
// });

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
app.use("/api/setting", setting)
app.use("/api/subscription", subScription)
app.use("/api/search", search)

app.use(express.static("public"))
server.listen(PORT, async () => {
  console.log(`The Server is up and running on PORT ${PORT}`)
})

cron.schedule("0 3 * * *", () => getCurrencyRate(), {
  scheduled: true,
  timezone: "Asia/Hong_Kong",
})
