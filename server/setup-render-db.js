import pool, { query } from './db.js'
import dotenv from 'dotenv'

dotenv.config()

// Render 데이터베이스 스키마 생성 및 초기 데이터 삽입
const setupRenderDatabase = async () => {
  try {
    console.log('Render 데이터베이스 설정을 시작합니다...\n')

    // 1. 연결 테스트
    console.log('1. 데이터베이스 연결 테스트...')
    await query('SELECT NOW()')
    console.log('   ✓ 연결 성공\n')

    // 2. 스키마 생성
    console.log('2. 데이터베이스 스키마 생성...')

    // Menus 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image VARCHAR(500),
        stock INTEGER DEFAULT 10,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✓ menus 테이블 생성 완료')

    // Options 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price INTEGER DEFAULT 0,
        menu_id INTEGER REFERENCES menus(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✓ options 테이블 생성 완료')

    // Orders 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(10) UNIQUE NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        total_amount INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✓ orders 테이블 생성 완료')

    // OrderItems 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER REFERENCES menus(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✓ order_items 테이블 생성 완료')

    // OrderItemOptions 테이블
    await query(`
      CREATE TABLE IF NOT EXISTS order_item_options (
        id SERIAL PRIMARY KEY,
        order_item_id INTEGER REFERENCES order_items(id) ON DELETE CASCADE,
        option_id INTEGER REFERENCES options(id) ON DELETE RESTRICT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `)
    console.log('   ✓ order_item_options 테이블 생성 완료')

    // updated_at 자동 업데이트를 위한 트리거 함수 생성
    await query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `)

    // 각 테이블에 트리거 추가
    const tables = ['menus', 'options', 'orders', 'order_items']
    for (const table of tables) {
      await query(`
        DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `)
    }
    console.log('   ✓ updated_at 자동 업데이트 트리거 생성 완료\n')

    // 3. 기존 데이터 확인
    console.log('3. 기존 데이터 확인...')
    const menuCheck = await query('SELECT COUNT(*) as count FROM menus')
    const menuCount = parseInt(menuCheck.rows[0].count)

    if (menuCount > 0) {
      console.log(`   → 기존 메뉴 ${menuCount}개가 있습니다.`)
      const existingMenus = await query('SELECT id, name FROM menus ORDER BY id')
      existingMenus.rows.forEach(menu => {
        console.log(`     - ${menu.name} (ID: ${menu.id})`)
      })
      console.log('   → 초기 데이터 삽입을 건너뜁니다.\n')
    } else {
      // 4. 초기 데이터 삽입
      console.log('4. 초기 데이터 삽입...')

      // 메뉴 데이터 삽입
      await query(`
        INSERT INTO menus (name, description, price, image, stock) VALUES
        ('아메리카노(ICE)', '시원한 아이스 아메리카노', 4000, '/images/americano-ice.jpg', 10),
        ('아메리카노(HOT)', '따뜻한 핫 아메리카노', 4000, '/images/americano-hot.jpg', 10),
        ('카페라떼', '부드러운 카페라떼', 5000, '/images/caffe-latte.jpg', 10)
      `)
      console.log('   ✓ 메뉴 데이터 삽입 완료 (3개)')

      // 옵션 데이터 삽입
      await query(`
        INSERT INTO options (name, price, menu_id) VALUES
        ('샷 추가', 500, NULL),
        ('시럽 추가', 0, NULL)
      `)
      console.log('   ✓ 옵션 데이터 삽입 완료 (2개)\n')
    }

    // 5. 최종 확인
    console.log('5. 최종 확인...')
    const finalCheck = await query(`
      SELECT 
        (SELECT COUNT(*) FROM menus) as menus,
        (SELECT COUNT(*) FROM options) as options,
        (SELECT COUNT(*) FROM orders) as orders
    `)
    const counts = finalCheck.rows[0]
    console.log(`   ✓ 메뉴: ${counts.menus}개`)
    console.log(`   ✓ 옵션: ${counts.options}개`)
    console.log(`   ✓ 주문: ${counts.orders}개\n`)

    console.log('✅ Render 데이터베이스 설정이 완료되었습니다!')
  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message)
    console.error('   오류 코드:', error.code)
    if (error.stack) {
      console.error('\n   스택 트레이스:')
      console.error(error.stack)
    }
    process.exit(1)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

setupRenderDatabase()


