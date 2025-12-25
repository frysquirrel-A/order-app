import express from 'express'
import pool, { query } from '../db.js'

const router = express.Router()

// 주문번호 생성 헬퍼 함수
const generateOrderNumber = async () => {
  const result = await query(
    'SELECT COUNT(*) as count FROM orders'
  )
  const count = parseInt(result.rows[0].count) + 1
  return String(count).padStart(3, '0')
}

// 주문 생성
router.post('/', async (req, res) => {
  const client = await pool.connect()
  
  try {
    await client.query('BEGIN')
    
    const { items, total_amount } = req.body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: '주문 항목이 필요합니다.',
        code: 'INVALID_ORDER_ITEMS'
      })
    }
    
    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({
        error: '유효하지 않은 총 금액입니다.',
        code: 'INVALID_TOTAL_AMOUNT'
      })
    }
    
    // 주문번호 생성
    const orderNumber = await generateOrderNumber()
    
    // 주문 생성
    const orderResult = await client.query(
      `INSERT INTO orders (order_number, total_amount, status)
       VALUES ($1, $2, 'received')
       RETURNING *`,
      [orderNumber, total_amount]
    )
    
    const order = orderResult.rows[0]
    
    // 주문 아이템 및 옵션 저장
    for (const item of items) {
      const { menu_id, quantity, options, unit_price } = item
      
      // 재고 확인 및 차감
      const menuResult = await client.query(
        'SELECT stock FROM menus WHERE id = $1',
        [menu_id]
      )
      
      if (menuResult.rows.length === 0) {
        throw new Error(`메뉴 ID ${menu_id}를 찾을 수 없습니다.`)
      }
      
      const currentStock = menuResult.rows[0].stock
      if (currentStock < quantity) {
        throw new Error(`메뉴 ID ${menu_id}의 재고가 부족합니다.`)
      }
      
      // 재고 차감
      await client.query(
        'UPDATE menus SET stock = stock - $1 WHERE id = $2',
        [quantity, menu_id]
      )
      
      // 주문 아이템 생성
      const itemResult = await client.query(
        `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, status)
         VALUES ($1, $2, $3, $4, 'received')
         RETURNING *`,
        [order.id, menu_id, quantity, unit_price]
      )
      
      const orderItem = itemResult.rows[0]
      
      // 옵션 저장
      if (options && Array.isArray(options) && options.length > 0) {
        for (const optionId of options) {
          await client.query(
            'INSERT INTO order_item_options (order_item_id, option_id) VALUES ($1, $2)',
            [orderItem.id, optionId]
          )
        }
      }
    }
    
    await client.query('COMMIT')
    
    res.status(201).json(order)
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('주문 생성 오류:', error)
    res.status(500).json({
      error: error.message || '주문을 생성하는 중 오류가 발생했습니다.',
      code: 'ORDER_CREATE_ERROR'
    })
  } finally {
    client.release()
  }
})

// 모든 주문 목록 조회
router.get('/', async (req, res) => {
  try {
    const { status } = req.query
    
    let queryText = `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_id', oi.menu_id,
            'menu_name', m.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'status', oi.status,
            'options', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', opt.id,
                    'name', opt.name,
                    'price', opt.price
                  )
                )
                FROM order_item_options oio
                JOIN options opt ON oio.option_id = opt.id
                WHERE oio.order_item_id = oi.id
              ),
              '[]'::json
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
    `
    
    const params = []
    if (status) {
      queryText += ' WHERE o.status = $1'
      params.push(status)
    }
    
    queryText += ' GROUP BY o.id ORDER BY o.order_date DESC'
    
    const result = await query(queryText, params)
    res.json(result.rows)
  } catch (error) {
    console.error('주문 목록 조회 오류:', error)
    res.status(500).json({
      error: '주문 목록을 조회하는 중 오류가 발생했습니다.',
      code: 'ORDER_FETCH_ERROR'
    })
  }
})

// 특정 주문 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    
    const result = await query(
      `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id', oi.id,
            'menu_id', oi.menu_id,
            'menu_name', m.name,
            'quantity', oi.quantity,
            'unit_price', oi.unit_price,
            'status', oi.status,
            'options', COALESCE(
              (
                SELECT json_agg(
                  json_build_object(
                    'id', opt.id,
                    'name', opt.name,
                    'price', opt.price
                  )
                )
                FROM order_item_options oio
                JOIN options opt ON oio.option_id = opt.id
                WHERE oio.order_item_id = oi.id
              ),
              '[]'::json
            )
          )
        ) as items
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      LEFT JOIN menus m ON oi.menu_id = m.id
      WHERE o.id = $1
      GROUP BY o.id
      `,
      [id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '주문을 찾을 수 없습니다.',
        code: 'ORDER_NOT_FOUND'
      })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('주문 조회 오류:', error)
    res.status(500).json({
      error: '주문을 조회하는 중 오류가 발생했습니다.',
      code: 'ORDER_FETCH_ERROR'
    })
  }
})

// 주문 아이템 상태 변경
router.patch('/:orderId/items/:itemId', async (req, res) => {
  try {
    const { orderId, itemId } = req.params
    const { status } = req.body
    
    if (!['received', 'preparing', 'completed'].includes(status)) {
      return res.status(400).json({
        error: '유효하지 않은 상태입니다.',
        code: 'INVALID_STATUS'
      })
    }
    
    const result = await query(
      `UPDATE order_items 
       SET status = $1 
       WHERE id = $2 AND order_id = $3
       RETURNING *`,
      [status, itemId, orderId]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '주문 아이템을 찾을 수 없습니다.',
        code: 'ORDER_ITEM_NOT_FOUND'
      })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('주문 아이템 상태 변경 오류:', error)
    res.status(500).json({
      error: '주문 아이템 상태를 변경하는 중 오류가 발생했습니다.',
      code: 'ORDER_ITEM_UPDATE_ERROR'
    })
  }
})

// 주문 전체 상태 변경
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body
    
    if (!['received', 'preparing', 'completed'].includes(status)) {
      return res.status(400).json({
        error: '유효하지 않은 상태입니다.',
        code: 'INVALID_STATUS'
      })
    }
    
    const result = await query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '주문을 찾을 수 없습니다.',
        code: 'ORDER_NOT_FOUND'
      })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('주문 상태 변경 오류:', error)
    res.status(500).json({
      error: '주문 상태를 변경하는 중 오류가 발생했습니다.',
      code: 'ORDER_UPDATE_ERROR'
    })
  }
})

export default router

