import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import { menuAPI, optionAPI, orderAPI } from './api.js'

function App() {
  // 상태 설정
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [menuItems, setMenuItems] = useState([])
  const [options, setOptions] = useState([])
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [inventory, setInventory] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 메뉴 목록 가져오기
  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const menus = await menuAPI.getAll()
        setMenuItems(menus)
        // 재고 정보 초기화
        const stockMap = {}
        menus.forEach(menu => {
          stockMap[menu.id] = menu.stock || 0
        })
        setInventory(stockMap)
      } catch (err) {
        console.error('메뉴 목록 로드 오류:', err)
        setError('메뉴 목록을 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    fetchMenus()
  }, [])

  // 옵션 목록 가져오기
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await optionAPI.getAll()
        setOptions(opts)
      } catch (err) {
        console.error('옵션 목록 로드 오류:', err)
      }
    }
    fetchOptions()
  }, [])

  // 주문 목록 가져오기
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderList = await orderAPI.getAll()
        // API 응답을 프런트엔드 형식으로 변환
        const formattedOrders = orderList.map(order => ({
          id: order.id,
          orderNumber: order.order_number,
          date: new Date(order.order_date).toLocaleString('ko-KR', {
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }),
          totalAmount: order.total_amount,
          items: order.items.map(item => ({
            id: item.id,
            menu_id: item.menu_id,
            name: item.menu_name,
            quantity: item.quantity,
            price: item.unit_price,
            status: item.status,
            options: item.options || []
          }))
        }))
        setOrders(formattedOrders)
      } catch (err) {
        console.error('주문 목록 로드 오류:', err)
      }
    }
    fetchOrders()
    
    // 주기적으로 주문 목록 갱신 (관리자 화면일 때)
    const interval = setInterval(() => {
      if (currentView === 'admin') {
        fetchOrders()
      }
    }, 5000) // 5초마다 갱신
    
    return () => clearInterval(interval)
  }, [currentView])

  // 장바구니를 localStorage에 저장 (선택사항)
  useEffect(() => {
    try {
      localStorage.setItem('cozy_cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  // 장바구니에 아이템 추가
  const addToCart = useCallback((item, selectedOptions) => {
    // 재고 확인
    const stock = inventory[item.id] || 0
    if (stock === 0) {
      alert('품절된 상품입니다.')
      return
    }

    // 선택된 옵션 ID 배열 생성
    const optionIds = []
    if (selectedOptions.shot) {
      const shotOption = options.find(opt => opt.name === '샷 추가')
      if (shotOption) optionIds.push(shotOption.id)
    }
    if (selectedOptions.syrup) {
      const syrupOption = options.find(opt => opt.name === '시럽 추가')
      if (syrupOption) optionIds.push(syrupOption.id)
    }

    // 옵션에 따른 가격 계산
    let itemPrice = item.price
    optionIds.forEach(optId => {
      const opt = options.find(o => o.id === optId)
      if (opt) itemPrice += opt.price
    })

    const cartItem = {
      id: `${item.id}-${optionIds.join('-')}`,
      menu_id: item.id,
      name: item.name,
      price: itemPrice,
      options: optionIds,
      quantity: 1
    }

    // 동일한 아이템이 장바구니에 있는지 확인
    const existingItemIndex = cart.findIndex(
      (existingItem) => existingItem.id === cartItem.id
    )

    if (existingItemIndex >= 0) {
      // 이미 있으면 수량 증가 (재고 확인)
      const newQuantity = cart[existingItemIndex].quantity + 1
      if (newQuantity > stock) {
        alert(`재고가 부족합니다. (현재 재고: ${stock}개)`)
        return
      }
      const newCart = [...cart]
      newCart[existingItemIndex].quantity = newQuantity
      setCart(newCart)
    } else {
      // 없으면 새로 추가
      setCart([...cart, cartItem])
    }
  }, [cart, inventory, options])

  // 장바구니 수량 증가
  const increaseQuantity = useCallback((itemId) => {
    const cartItem = cart.find(item => item.id === itemId)
    if (!cartItem) return

    const stock = inventory[cartItem.menu_id] || 0
    const newQuantity = cartItem.quantity + 1

    if (newQuantity > stock) {
      alert(`재고가 부족합니다. (현재 재고: ${stock}개)`)
      return
    }

    const newCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
    setCart(newCart)
  }, [cart, inventory])

  // 장바구니 수량 감소
  const decreaseQuantity = (itemId) => {
    const newCart = cart
      .map((item) =>
        item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
      )
      .filter((item) => item.quantity > 0)
    setCart(newCart)
  }

  // 주문하기
  const handleOrder = useCallback(async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 재고 확인
    const stockCheck = cart.every(cartItem => {
      const stock = inventory[cartItem.menu_id] || 0
      return cartItem.quantity <= stock
    })

    if (!stockCheck) {
      alert('일부 상품의 재고가 부족합니다. 장바구니를 확인해주세요.')
      return
    }
    
    try {
      // 주문 데이터 준비
      const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0)
      const orderItems = cart.map(item => ({
        menu_id: item.menu_id,
        quantity: item.quantity,
        options: item.options || [],
        unit_price: item.price
      }))

      // API로 주문 생성
      const newOrder = await orderAPI.create({
        items: orderItems,
        total_amount: totalAmount
      })

      // 메뉴 목록 다시 가져와서 재고 갱신
      const menus = await menuAPI.getAll()
      const stockMap = {}
      menus.forEach(menu => {
        stockMap[menu.id] = menu.stock || 0
      })
      setInventory(stockMap)

      // 주문 목록 갱신
      const orderList = await orderAPI.getAll()
      const formattedOrders = orderList.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: new Date(order.order_date).toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalAmount: order.total_amount,
        items: order.items.map(item => ({
          id: item.id,
          menu_id: item.menu_id,
          name: item.menu_name,
          quantity: item.quantity,
          price: item.unit_price,
          status: item.status,
          options: item.options || []
        }))
      }))
      setOrders(formattedOrders)

      alert('주문이 완료되었습니다!')
      setCart([])
    } catch (error) {
      console.error('주문 생성 오류:', error)
      alert(error.message || '주문 생성 중 오류가 발생했습니다.')
    }
  }, [cart, inventory])

  // 재고 증가
  const increaseInventory = useCallback(async (itemId) => {
    try {
      const currentStock = inventory[itemId] || 0
      const newStock = currentStock + 1
      await menuAPI.updateStock(itemId, newStock)
      setInventory(prev => ({
        ...prev,
        [itemId]: newStock
      }))
    } catch (error) {
      console.error('재고 증가 오류:', error)
      alert('재고를 증가시키는데 실패했습니다.')
    }
  }, [inventory])

  // 재고 감소
  const decreaseInventory = useCallback(async (itemId) => {
    try {
      const currentStock = inventory[itemId] || 0
      const newStock = Math.max(0, currentStock - 1)
      await menuAPI.updateStock(itemId, newStock)
      setInventory(prev => ({
        ...prev,
        [itemId]: newStock
      }))
    } catch (error) {
      console.error('재고 감소 오류:', error)
      alert('재고를 감소시키는데 실패했습니다.')
    }
  }, [inventory])

  // 주문 아이템 상태 변경
  const changeOrderItemStatus = useCallback(async (orderId, itemId, newStatus) => {
    try {
      await orderAPI.updateItemStatus(orderId, itemId, newStatus)
      
      // 주문 목록 갱신
      const orderList = await orderAPI.getAll()
      const formattedOrders = orderList.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: new Date(order.order_date).toLocaleString('ko-KR', {
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        totalAmount: order.total_amount,
        items: order.items.map(item => ({
          id: item.id,
          menu_id: item.menu_id,
          name: item.menu_name,
          quantity: item.quantity,
          price: item.unit_price,
          status: item.status,
          options: item.options || []
        }))
      }))
      setOrders(formattedOrders)
    } catch (error) {
      console.error('주문 상태 변경 오류:', error)
      alert('주문 상태를 변경하는데 실패했습니다.')
    }
  }, [])

  // 재고 상태 확인
  const getInventoryStatus = useCallback((itemId) => {
    const stock = inventory[itemId] || 0
    if (stock === 0) return 'out'
    if (stock < 5) return 'warning'
    return 'normal'
  }, [inventory])

  // 대시보드 통계 계산 (메모이제이션)
  const dashboardStats = useMemo(() => ({
    total: orders.length,
    received: orders.reduce((sum, order) => 
      sum + order.items.filter(item => item.status === 'received').length, 0
    ),
    preparing: orders.reduce((sum, order) => 
      sum + order.items.filter(item => item.status === 'preparing').length, 0
    ),
    completed: orders.reduce((sum, order) => 
      sum + order.items.filter(item => item.status === 'completed').length, 0
    )
  }), [orders])

  // 총 금액 계산 (메모이제이션)
  const calculateTotal = useMemo(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }, [cart])

  if (loading) {
    return (
      <div className="app">
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="app">
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>
      </div>
    )
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <div className="nav-buttons">
          <button 
            className={`nav-btn ${currentView === 'order' ? 'active' : ''}`}
            onClick={() => setCurrentView('order')}
          >
            주문하기
          </button>
          <button 
            className={`nav-btn ${currentView === 'admin' ? 'active' : ''}`}
            onClick={() => setCurrentView('admin')}
          >
            관리자
          </button>
        </div>
      </header>

      {currentView === 'order' ? (
        <>
          {/* 메뉴 아이템 영역 */}
          <div className="menu-section">
            <div className="menu-grid">
              {menuItems.map((item) => {
                const stock = inventory[item.id] || 0
                return (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onAddToCart={addToCart}
                    stock={stock}
                    allOptions={options}
                  />
                )
              })}
            </div>
          </div>

          {/* 장바구니 영역 */}
          <div className="cart-section">
            <h2 className="cart-title">장바구니</h2>
            {cart.length === 0 ? (
              <p className="empty-cart">장바구니가 비어있습니다.</p>
            ) : (
              <div className="cart-content">
                <div className="cart-left">
                  <div className="cart-items">
                    {cart.map((cartItem) => (
                      <div key={cartItem.id} className="cart-item">
                        <div className="cart-item-info">
                          <span className="cart-item-name">
                            {cartItem.name}
                            {cartItem.options && cartItem.options.length > 0 && (
                              ' (' + cartItem.options.map(optId => {
                                const opt = options.find(o => o.id === optId)
                                return opt ? opt.name : ''
                              }).filter(Boolean).join(', ') + ')'
                            )}
                          </span>
                          <span className="cart-item-detail">
                            합계: {cartItem.price.toLocaleString()}원 × {cartItem.quantity}개 = {(cartItem.price * cartItem.quantity).toLocaleString()}원
                          </span>
                        </div>
                        <div className="cart-item-controls">
                          <span className="cart-item-total">
                            {(cartItem.price * cartItem.quantity).toLocaleString()}원
                          </span>
                          <button
                            className="quantity-btn"
                            onClick={() => decreaseQuantity(cartItem.id)}
                          >
                            -
                          </button>
                          <span className="cart-item-quantity">{cartItem.quantity}</span>
                          <button
                            className="quantity-btn"
                            onClick={() => increaseQuantity(cartItem.id)}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cart-right">
                  <div className="cart-total">
                    총 금액 <strong>{calculateTotal.toLocaleString()}원</strong>
                  </div>
                  <button className="order-btn" onClick={handleOrder}>
                    주문하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <AdminView
          dashboardStats={dashboardStats}
          menuItems={menuItems}
          inventory={inventory}
          increaseInventory={increaseInventory}
          decreaseInventory={decreaseInventory}
          orders={orders}
          changeOrderItemStatus={changeOrderItemStatus}
          getInventoryStatus={getInventoryStatus}
        />
      )}
    </div>
  )
}

// 관리자 화면 컴포넌트
function AdminView({
  dashboardStats,
  menuItems,
  inventory,
  increaseInventory,
  decreaseInventory,
  orders,
  changeOrderItemStatus,
  getInventoryStatus
}) {
  return (
    <div className="admin-container">
      {/* 관리자 대시보드 */}
      <div className="admin-dashboard">
        <h2 className="admin-section-title">관리자 대시보드</h2>
        <div className="dashboard-stats">
          <div className="stat-card stat-total">
            <div className="stat-label">총 주문</div>
            <div className="stat-value">{dashboardStats.total}</div>
          </div>
          <div className="stat-card stat-received">
            <div className="stat-label">주문 접수</div>
            <div className="stat-value">{dashboardStats.received}</div>
          </div>
          <div className="stat-card stat-preparing">
            <div className="stat-label">제조 중</div>
            <div className="stat-value">{dashboardStats.preparing}</div>
          </div>
          <div className="stat-card stat-completed">
            <div className="stat-label">제조 완료</div>
            <div className="stat-value">{dashboardStats.completed}</div>
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="admin-inventory">
        <h2 className="admin-section-title">재고 현황</h2>
        <div className="inventory-grid">
          {menuItems.map((item) => {
            const stock = inventory[item.id] || 0
            const status = getInventoryStatus(item.id)
            return (
              <div key={item.id} className="inventory-card">
                <div className="inventory-content">
                  <div className="inventory-left">
                    <div className="inventory-header">
                      <div className="inventory-item-name">{item.name}</div>
                      <div className="inventory-stock">{stock}개</div>
                    </div>
                    <div className="inventory-controls-row">
                      <button
                        className="inventory-btn inventory-decrease"
                        onClick={() => decreaseInventory(item.id)}
                      >
                        -
                      </button>
                      <button
                        className="inventory-btn inventory-increase"
                        onClick={() => increaseInventory(item.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="inventory-right">
                    <div className="inventory-status-badges">
                      <div className={`status-badge ${status === 'normal' ? 'active' : ''} status-normal`}>
                        정상
                      </div>
                      <div className={`status-badge ${status === 'warning' ? 'active' : ''} status-warning`}>
                        주의
                      </div>
                      <div className={`status-badge ${status === 'out' ? 'active' : ''} status-out`}>
                        품절
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 주문 현황 */}
      <div className="admin-orders">
        <h2 className="admin-section-title">주문 현황</h2>
        {orders.length === 0 ? (
          <p className="empty-orders">주문이 없습니다.</p>
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-info">
                  <div className="order-header">
                    <div className="order-date">{order.date}</div>
                    <div className="order-number">주문번호 {order.orderNumber}</div>
                    <div></div>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <div className="order-item-info">
                          <span className="order-item-name">
                            {item.name}
                            {item.options && item.options.length > 0 && (
                              ' (' + item.options.map(opt => opt.name || opt).join(', ') + ')'
                            )}
                            {' '}x {item.quantity}
                          </span>
                          <span className="order-item-price">{item.price.toLocaleString()}원</span>
                        </div>
                        <div className="order-item-actions">
                          {item.status === 'received' && (
                            <button
                              className="order-status-btn status-received"
                              onClick={() => changeOrderItemStatus(order.id, item.id, 'preparing')}
                            >
                              주문 접수
                            </button>
                          )}
                          {item.status === 'preparing' && (
                            <>
                              <button
                                className="order-status-btn status-preparing"
                                onClick={() => changeOrderItemStatus(order.id, item.id, 'completed')}
                              >
                                제조 중
                              </button>
                              <button
                                className="order-back-btn"
                                onClick={() => changeOrderItemStatus(order.id, item.id, 'received')}
                                title="뒤로가기"
                              >
                                ←
                              </button>
                            </>
                          )}
                          {item.status === 'completed' && (
                            <>
                              <div className="order-status-btn status-completed-disabled">
                                제조 완료
                              </div>
                              <button
                                className="order-back-btn"
                                onClick={() => changeOrderItemStatus(order.id, item.id, 'preparing')}
                                title="뒤로가기"
                              >
                                ←
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="order-amount">{order.totalAmount.toLocaleString()}원</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// 메뉴 아이템 카드 컴포넌트
function MenuItemCard({ item, onAddToCart, stock, allOptions = [] }) {
  const [selectedOptions, setSelectedOptions] = useState({
    shot: false,
    syrup: false
  })
  const [imageError, setImageError] = useState(false)

  const handleOptionChange = (optionName) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [optionName]: !prev[optionName]
    }))
  }

  const handleAddToCart = () => {
    onAddToCart(item, selectedOptions)
    // 담기 후 옵션 초기화
    setSelectedOptions({ shot: false, syrup: false })
  }

  const handleImageError = () => {
    setImageError(true)
  }

  const isOutOfStock = stock === 0

  return (
    <div className="menu-card">
      <div className="menu-image">
        {imageError ? (
          <div className="image-placeholder">이미지 없음</div>
        ) : (
          <img 
            src={item.image} 
            alt={item.name} 
            className="menu-image-img"
            onError={handleImageError}
          />
        )}
        {isOutOfStock && <div className="out-of-stock-badge">품절</div>}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{item.name}</h3>
        <p className="menu-price">{item.price.toLocaleString()}원</p>
        <p className="menu-description">{item.description}</p>
        <div className="menu-options">
          {allOptions.map(option => (
            <label key={option.id} className="option-label">
              <input
                type="checkbox"
                checked={selectedOptions[option.name === '샷 추가' ? 'shot' : option.name === '시럽 추가' ? 'syrup' : option.id]}
                onChange={() => handleOptionChange(option.name === '샷 추가' ? 'shot' : option.name === '시럽 추가' ? 'syrup' : option.id)}
                disabled={isOutOfStock}
              />
              <span>{option.name} {option.price > 0 && `(+${option.price.toLocaleString()}원)`}</span>
            </label>
          ))}
        </div>
        <button 
          className="add-to-cart-btn" 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isOutOfStock ? '품절' : '담기'}
        </button>
      </div>
    </div>
  )
}

export default App
