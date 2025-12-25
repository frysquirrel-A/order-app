import express from 'express'
import { query } from '../db.js'

const router = express.Router()

// 모든 옵션 목록 조회
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM options ORDER BY id')
    res.json(result.rows)
  } catch (error) {
    console.error('옵션 목록 조회 오류:', error)
    res.status(500).json({
      error: '옵션 목록을 조회하는 중 오류가 발생했습니다.',
      code: 'OPTION_FETCH_ERROR'
    })
  }
})

// 특정 메뉴에 적용 가능한 옵션 목록 조회
router.get('/menus/:id', async (req, res) => {
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

