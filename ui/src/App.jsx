import { useState } from 'react'
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
  const [cart, setCart] = useState([])

  // 장바구니에 아이템 추가
  const addToCart = (item, options) => {
    const cartItem = {
      id: `${item.id}-${options.shot ? 'shot' : ''}-${options.syrup ? 'syrup' : ''}`,
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
      // 이미 있으면 수량 증가
      const newCart = [...cart]
      newCart[existingItemIndex].quantity += 1
      setCart(newCart)
    } else {
      // 없으면 새로 추가
      setCart([...cart, cartItem])
    }
  }

  // 장바구니 수량 증가
  const increaseQuantity = (itemId) => {
    const newCart = cart.map((item) =>
      item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
    )
    setCart(newCart)
  }

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
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    alert('주문이 완료되었습니다!')
    setCart([])
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <div className="logo">COZY</div>
        <div className="nav-buttons">
          <button className="nav-btn active">주문하기</button>
          <button className="nav-btn">관리자</button>
        </div>
      </header>

      {/* 메뉴 아이템 영역 */}
      <div className="menu-section">
        <div className="menu-grid">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.id}
              item={item}
              onAddToCart={addToCart}
            />
          ))}
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
                총 금액 <strong>{calculateTotal().toLocaleString()}원</strong>
              </div>
              <button className="order-btn" onClick={handleOrder}>
                주문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 메뉴 아이템 카드 컴포넌트
function MenuItemCard({ item, onAddToCart }) {
  const [options, setOptions] = useState({
    shot: false,
    syrup: false
  })

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

  return (
    <div className="menu-card">
      <div className="menu-image">
        <img src={item.image} alt={item.name} className="menu-image-img" />
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
            />
            <span>샷 추가 (+500원)</span>
          </label>
          <label className="option-label">
            <input
              type="checkbox"
              checked={options.syrup}
              onChange={() => handleOptionChange('syrup')}
            />
            <span>시럽 추가 (+0원)</span>
          </label>
        </div>
        <button className="add-to-cart-btn" onClick={handleAddToCart}>
          담기
        </button>
      </div>
    </div>
  )
}

export default App
