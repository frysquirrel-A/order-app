import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

// 데이터베이스 연결 풀 생성
// 비밀번호에서 따옴표 제거 (dotenv는 따옴표를 값의 일부로 포함시킴)
const dbPassword = process.env.DB_PASSWORD?.replace(/^['"]|['"]$/g, '') || ''

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cozy_order_db',
  user: process.env.DB_USER || 'postgres',
  password: dbPassword,
})

// 연결 테스트
pool.on('connect', () => {
  console.log('데이터베이스에 연결되었습니다.')
})

pool.on('error', (err) => {
  console.error('데이터베이스 연결 오류:', err)
})

// 쿼리 실행 헬퍼 함수
export const query = async (text, params) => {
  const start = Date.now()
  try {
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('쿼리 실행:', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('쿼리 실행 오류:', error)
    throw error
  }
}

// 연결 종료
export const closePool = async () => {
  await pool.end()
  console.log('데이터베이스 연결 풀이 종료되었습니다.')
}

export default pool

