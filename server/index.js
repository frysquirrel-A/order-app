import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

// 환경 변수 로드
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// 데이터베이스 연결 테스트
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('데이터베이스 연결 실패:', err)
  } else {
    console.log('데이터베이스 연결 성공:', res.rows[0].now)
  }
})

// 미들웨어 설정
// CORS 설정 (프런트엔드와 통신을 위해)
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://cozy-order-ui.onrender.com'] // 프로덕션 기본값
    : ['http://localhost:5173', 'http://localhost:3000'] // 개발 환경

app.use(cors({
  origin: (origin, callback) => {
    // origin이 없거나 (같은 도메인 요청) 허용된 origin이면 통과
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(null, true) // 개발 중에는 모든 origin 허용
    }
  },
  credentials: true,
}))
app.use(express.json()) // JSON 요청 본문 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 요청 본문 파싱

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '커피 주문 앱 백엔드 서버가 실행 중입니다.' })
})

// API 라우트
import menuRoutes from './routes/menus.js'
import optionRoutes from './routes/options.js'
import orderRoutes from './routes/orders.js'

app.use('/api/menus', menuRoutes)
app.use('/api/options', optionRoutes)
app.use('/api/orders', orderRoutes)

// 에러 핸들링 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    error: '서버 내부 오류가 발생했습니다.',
    code: 'INTERNAL_SERVER_ERROR'
  })
})

// 404 핸들링
app.use((req, res) => {
  res.status(404).json({
    error: '요청한 리소스를 찾을 수 없습니다.',
    code: 'NOT_FOUND'
  })
})

// 서버 시작
app.listen(PORT, () => {
  console.log(`서버가 포트 ${PORT}에서 실행 중입니다.`)
  console.log(`http://localhost:${PORT}`)
})



