import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/mongodb.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import reviewRouter from './routes/reviewRoute.js'
import discountRouter from './routes/discountRoute.js'
import galleryRouter from './routes/galleryRoute.js'
import uploadRouter from './routes/uploadRoute.js'
import connectCloudinary from './config/cloudinary.js'

const app = express()
const port = process.env.PORT || 9000
const allowedOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL].filter(Boolean)

connectDB()
connectCloudinary()

app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error('Not allowed by CORS'))
  }
}))

app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/review', reviewRouter)
app.use('/api/discount', discountRouter)
app.use('/api/gallery', galleryRouter)
app.use('/api/upload', uploadRouter)

app.get('/', (req, res) => {
  res.send('API WORKING')
})

app.listen(port)
