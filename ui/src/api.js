// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// API 호출 헬퍼 함수
async function apiCall(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: '알 수 없는 오류가 발생했습니다.' }))
      throw new Error(error.error || `HTTP error! status: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API 호출 오류:', error)
    throw error
  }
}

// 메뉴 API
export const menuAPI = {
  // 모든 메뉴 목록 조회
  getAll: () => apiCall('/menus'),
  
  // 특정 메뉴 조회
  getById: (id) => apiCall(`/menus/${id}`),
  
  // 재고 수정
  updateStock: (id, stock) => apiCall(`/menus/${id}/stock`, {
    method: 'PATCH',
    body: JSON.stringify({ stock }),
  }),
}

// 옵션 API
export const optionAPI = {
  // 모든 옵션 목록 조회
  getAll: () => apiCall('/options'),
  
  // 특정 메뉴의 옵션 목록 조회
  getByMenuId: (menuId) => apiCall(`/options/menus/${menuId}`),
}

// 주문 API
export const orderAPI = {
  // 주문 생성
  create: (orderData) => apiCall('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  }),
  
  // 모든 주문 목록 조회
  getAll: (status) => {
    const query = status ? `?status=${status}` : ''
    return apiCall(`/orders${query}`)
  },
  
  // 특정 주문 조회
  getById: (id) => apiCall(`/orders/${id}`),
  
  // 주문 아이템 상태 변경
  updateItemStatus: (orderId, itemId, status) => apiCall(`/orders/${orderId}/items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
  
  // 주문 전체 상태 변경
  updateStatus: (id, status) => apiCall(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  }),
}

