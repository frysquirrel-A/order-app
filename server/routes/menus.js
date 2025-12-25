import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 모든 메뉴 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM menus ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('메뉴 목록 조회 오류:', error)
    res.status(500).json({
      error: '메뉴 목록을 조회하는 중 오류가 발생했습니다.',
      code: 'MENU_FETCH_ERROR'
    })
  }
})

// 특정 메뉴 상세 정보 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const result = await query('SELECT * FROM menus WHERE id = $1', [id])
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '메뉴를 찾을 수 없습니다.',
        code: 'MENU_NOT_FOUND'
      })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('메뉴 조회 오류:', error)
    res.status(500).json({
      error: '메뉴를 조회하는 중 오류가 발생했습니다.',
      code: 'MENU_FETCH_ERROR'
    })
  }
})

// 메뉴 재고 수정
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params
    const { stock } = req.body
    
    if (stock === undefined || stock < 0) {
      return res.status(400).json({
        error: '유효하지 않은 재고 수량입니다.',
        code: 'INVALID_STOCK'
      })
    }
    
    const result = await query(
      'UPDATE menus SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, id]
    )
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: '메뉴를 찾을 수 없습니다.',
        code: 'MENU_NOT_FOUND'
      })
    }
    
    res.json(result.rows[0])
  } catch (error) {
    console.error('재고 수정 오류:', error)
    res.status(500).json({
      error: '재고를 수정하는 중 오류가 발생했습니다.',
      code: 'STOCK_UPDATE_ERROR'
    })
  }
})

// 특정 메뉴에 적용 가능한 옵션 목록 조회
router.get('/:id/options', async (req, res) => {
  try {
    const { id } = req.params
    // menu_id가 null이거나 해당 메뉴 ID와 일치하는 옵션 조회
    const result = await query(
      'SELECT * FROM options WHERE menu_id IS NULL OR menu_id = $1 ORDER BY id',
      [id]
    )
    res.json(result.rows)
  } catch (error) {
    console.error('메뉴 옵션 조회 오류:', error)
    res.status(500).json({
      error: '메뉴 옵션을 조회하는 중 오류가 발생했습니다.',
      code: 'MENU_OPTION_FETCH_ERROR'
    })
  }
})

export default router

