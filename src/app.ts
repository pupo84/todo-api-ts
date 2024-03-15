import cors from "cors"
import * as dotenv from "dotenv"
import express from "express"
import helmet from "helmet"
import { userRouter } from "./users/users.routes"

dotenv.config()

if (!process.env.PORT) {
  console.log("No port value specified!")
}

const PORT = parseInt(process.env.PORT as string, 10)
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())
app.use(helmet())

app.use("/", userRouter)

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
