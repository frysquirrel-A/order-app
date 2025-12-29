import pool, { query } from './db.js'
import dotenv from 'dotenv'

dotenv.config()

// 데이터베이스 연결 테스트
const testConnection = async () => {
  try {
    console.log('데이터베이스 연결 정보:')
    console.log(`  Host: ${process.env.DB_HOST || 'localhost'}`)
    console.log(`  Port: ${process.env.DB_PORT || 5432}`)
    console.log(`  Database: ${process.env.DB_NAME || 'cozy_order_db'}`)
    console.log(`  User: ${process.env.DB_USER || 'postgres'}`)
    console.log(`  Password: ${process.env.DB_PASSWORD ? '***' : '(없음)'}`)
    console.log('\n데이터베이스 연결 테스트 중...\n')

    // 연결 테스트
    const result = await query('SELECT NOW() as current_time, version() as pg_version')
    console.log('✓ 데이터베이스 연결 성공!')
    console.log(`  현재 시간: ${result.rows[0].current_time}`)
    console.log(`  PostgreSQL 버전: ${result.rows[0].pg_version.split(',')[0]}`)

    // 기존 테이블 확인
    const tablesResult = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    
    if (tablesResult.rows.length > 0) {
      console.log('\n기존 테이블 목록:')
      tablesResult.rows.forEach(row => {
        console.log(`  - ${row.table_name}`)
      })
    } else {
      console.log('\n기존 테이블이 없습니다.')
    }

    console.log('\n연결 테스트 완료!')
  } catch (error) {
    console.error('\n✗ 데이터베이스 연결 실패:')
    console.error(`  오류 코드: ${error.code}`)
    console.error(`  오류 메시지: ${error.message}`)
    
    if (error.code === '28P01') {
      console.error('\n  → 비밀번호 인증 오류입니다.')
      console.error('  → .env 파일의 DB_PASSWORD를 확인하세요.')
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n  → 데이터베이스 서버에 연결할 수 없습니다.')
      console.error('  → DB_HOST와 DB_PORT를 확인하세요.')
    } else if (error.code === '3D000') {
      console.error('\n  → 데이터베이스가 존재하지 않습니다.')
      console.error('  → 데이터베이스를 먼저 생성하세요.')
    }
    
    process.exit(1)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

testConnection()



