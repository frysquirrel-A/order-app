import { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'

// 메뉴 데이터
const menuItems = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '시원한 아이스 아메리카노',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop'
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '따뜻한 핫 아메리카노',
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop'
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
  },
  {
    id: 4,
    name: '카푸치노',
    price: 5000,
    description: '진한 에스프레소와 우유 거품',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
  },
  {
    id: 5,
    name: '카라멜 마키아토',
    price: 6000,
    description: '달콤한 카라멜과 에스프레소',
    image: 'https://images.unsplash.com/photo-1570968914863-9a1c8df4fd72?w=400&h=300&fit=crop'
  },
  {
    id: 6,
    name: '바닐라 라떼',
    price: 5500,
    description: '바닐라 시럽이 들어간 부드러운 라떼',
    image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
  }
]

function App() {
  // localStorage에서 데이터 로드
  const loadFromStorage = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error)
      return defaultValue
    }
  }

  // 초기 상태 설정 (localStorage에서 로드)
  const [currentView, setCurrentView] = useState('order') // 'order' or 'admin'
  const [cart, setCart] = useState(() => loadFromStorage('cozy_cart', []))
  const [orders, setOrders] = useState(() => loadFromStorage('cozy_orders', []))
  const [orderCounter, setOrderCounter] = useState(() => loadFromStorage('cozy_orderCounter', 1))
  const [inventory, setInventory] = useState(() => {
    const saved = loadFromStorage('cozy_inventory', null)
    if (saved) return saved
    // 초기 재고 설정
    return menuItems.reduce((acc, item) => {
      acc[item.id] = 10 // 초기 재고 10개
      return acc
    }, {})
  })

  // localStorage에 저장
  useEffect(() => {
    try {
      localStorage.setItem('cozy_cart', JSON.stringify(cart))
    } catch (error) {
      console.error('Error saving cart to localStorage:', error)
    }
  }, [cart])

  useEffect(() => {
    try {
      localStorage.setItem('cozy_orders', JSON.stringify(orders))
    } catch (error) {
      console.error('Error saving orders to localStorage:', error)
    }
  }, [orders])

  useEffect(() => {
    try {
      localStorage.setItem('cozy_orderCounter', JSON.stringify(orderCounter))
    } catch (error) {
      console.error('Error saving orderCounter to localStorage:', error)
    }
  }, [orderCounter])

  useEffect(() => {
    try {
      localStorage.setItem('cozy_inventory', JSON.stringify(inventory))
    } catch (error) {
      console.error('Error saving inventory to localStorage:', error)
    }
  }, [inventory])

  // 장바구니에 아이템 추가
  const addToCart = useCallback((item, options) => {
    // 재고 확인
    const stock = inventory[item.id] || 0
    if (stock === 0) {
      alert('품절된 상품입니다.')
      return
    }

    const cartItem = {
      id: `${item.id}-${options.shot ? 'shot' : ''}-${options.syrup ? 'syrup' : ''}`,
      itemId: item.id, // 재고 차감을 위한 아이템 ID
      name: item.name,
      basePrice: item.price,
      options: options,
      quantity: 1
    }

    // 옵션에 따른 가격 계산
    let itemPrice = item.price
    if (options.shot) itemPrice += 500
    if (options.syrup) itemPrice += 0 // 시럽은 무료

    cartItem.price = itemPrice

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
  }, [cart, inventory])

  // 장바구니 수량 증가
  const increaseQuantity = useCallback((itemId) => {
    const cartItem = cart.find(item => item.id === itemId)
    if (!cartItem) return

    const stock = inventory[cartItem.itemId] || 0
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
  const handleOrder = useCallback(() => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    // 재고 확인
    const stockCheck = cart.every(cartItem => {
      const stock = inventory[cartItem.itemId] || 0
      return cartItem.quantity <= stock
    })

    if (!stockCheck) {
      alert('일부 상품의 재고가 부족합니다. 장바구니를 확인해주세요.')
      return
    }
    
    // 주문 생성
    const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0)
    const now = new Date()
    const orderDate = `${now.getMonth() + 1}월 ${now.getDate()}일 ${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
    
    const orderNumber = String(orderCounter).padStart(3, '0')
    
    const newOrder = {
      id: Date.now(),
      orderNumber: orderNumber,
      date: orderDate,
      items: cart.map(item => ({
        itemId: item.itemId, // 재고 차감을 위한 ID 추가
        name: item.name,
        options: item.options,
        quantity: item.quantity,
        price: item.price,
        status: 'received' // 각 아이템별 상태: 'received', 'preparing', 'completed'
      })),
      totalAmount: totalAmount
    }
    
    // 재고 차감
    const newInventory = { ...inventory }
    cart.forEach(cartItem => {
      if (newInventory[cartItem.itemId] !== undefined) {
        newInventory[cartItem.itemId] = Math.max(0, newInventory[cartItem.itemId] - cartItem.quantity)
      }
    })
    setInventory(newInventory)
    
    setOrders([newOrder, ...orders])
    setOrderCounter(prev => prev + 1)
    alert('주문이 완료되었습니다!')
    setCart([])
  }, [cart, inventory, orderCounter, orders])

  // 재고 증가
  const increaseInventory = useCallback((itemId) => {
    setInventory(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }))
  }, [])

  // 재고 감소
  const decreaseInventory = useCallback((itemId) => {
    setInventory(prev => ({
      ...prev,
      [itemId]: Math.max(0, (prev[itemId] || 0) - 1)
    }))
  }, [])

  // 주문 아이템 상태 변경
  const changeOrderItemStatus = useCallback((orderId, itemIndex, newStatus) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? {
            ...order,
            items: order.items.map((item, idx) => 
              idx === itemIndex ? { ...item, status: newStatus } : item
            )
          }
        : order
    ))
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
                            {cartItem.options.shot && ' (샷 추가)'}
                            {cartItem.options.syrup && ' (시럽 추가)'}
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
                            {item.options.shot && ' (샷 추가)'}
                            {item.options.syrup && ' (시럽 추가)'}
                            {' '}x {item.quantity}
                          </span>
                          <span className="order-item-price">{item.price.toLocaleString()}원</span>
                        </div>
                        <div className="order-item-actions">
                          {item.status === 'received' && (
                            <button
                              className="order-status-btn status-received"
                              onClick={() => changeOrderItemStatus(order.id, idx, 'preparing')}
                            >
                              주문 접수
                            </button>
                          )}
                          {item.status === 'preparing' && (
                            <>
                              <button
                                className="order-status-btn status-preparing"
                                onClick={() => changeOrderItemStatus(order.id, idx, 'completed')}
                              >
                                제조 중
                              </button>
                              <button
                                className="order-back-btn"
                                onClick={() => changeOrderItemStatus(order.id, idx, 'received')}
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
                                onClick={() => changeOrderItemStatus(order.id, idx, 'preparing')}
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
function MenuItemCard({ item, onAddToCart, stock }) {
  const [options, setOptions] = useState({
    shot: false,
    syrup: false
  })
  const [imageError, setImageError] = useState(false)

  const handleOptionChange = (optionName) => {
    setOptions((prev) => ({
      ...prev,
      [optionName]: !prev[optionName]
    }))
  }

  const handleAddToCart = () => {
    onAddToCart(item, options)
    // 담기 후 옵션 초기화
    setOptions({ shot: false, syrup: false })
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
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.shot}
              onChange={() => handleOptionChange('shot')}
              disabled={isOutOfStock}
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
              disabled={isOutOfStock}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
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
