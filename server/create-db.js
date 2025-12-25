import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Client } = pg

// postgres 데이터베이스에 연결하여 새 데이터베이스 생성
const createDatabase = async () => {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // 기본 postgres 데이터베이스에 연결
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  })

  try {
    await client.connect()
    console.log('PostgreSQL에 연결되었습니다.')

    // 데이터베이스 존재 여부 확인
    const dbName = process.env.DB_NAME || 'cozy_order_db'
    const checkDb = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    )

    if (checkDb.rows.length > 0) {
      console.log(`데이터베이스 '${dbName}'가 이미 존재합니다.`)
    } else {
      // 데이터베이스 생성
      await client.query(`CREATE DATABASE ${dbName}`)
      console.log(`데이터베이스 '${dbName}'가 생성되었습니다.`)
    }

    await client.end()
  } catch (error) {
    console.error('데이터베이스 생성 중 오류 발생:', error.message)
    if (error.code === '28P01') {
      console.error('\n비밀번호 인증 오류입니다.')
      console.error('.env 파일의 DB_PASSWORD가 PostgreSQL 비밀번호와 일치하는지 확인하세요.')
    }
    await client.end()
    process.exit(1)
  }
}

createDatabase()

