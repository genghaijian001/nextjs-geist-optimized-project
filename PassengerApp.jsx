import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';

// 导入组件
import SharedMap from './SharedMap';
import OrdersPage from './passenger_function/OrdersPage';
import ProfilePage from './passenger_function/ProfilePage';
import CouponsPage from './passenger_function/CouponsPage';
import BecomeDriverPage from './passenger_function/BecomeDriverPage';
import BottomNav from './passenger_function/BottomNav';
import LocationTracker from './passenger_function/LocationTracker';
import RatingModal from './passenger_function/RatingModal';
import FriendOrderModal from './passenger_function/FriendOrderModal';

// 导入新的模块化组件
import AddressModal from './passenger_function/AddressModal';
import TripPlanningPanel from './passenger_function/TripPlanningPanel';
import QuickCallPanel from './passenger_function/QuickCallPanel';
import RentDriverPanel from './passenger_function/RentDriverPanel';
import {
  ReservationModal,
  NoCycleModal,
  CustomDriveModal,
  LongDistanceModal,
  StationModal,
  FamilyModal,
  CommuteModal
} from './passenger_function/ServiceModals';

// 导入常量和工具函数
import { 
  DEVELOPER_KEY,
  formatPrice,
  formatDistance,
  getAddressTypeIcon,
  addToSearchHistory,
  getSearchHistory,
  clearSearchHistory,
  iconPaths
} from './passenger_function/constants';

import { OrderService } from '../services/orderService';
import { ServiceTypes, OrderStatus } from '../constants/serviceTypes';
import { WebSocketService } from '../services/webSocketService';
import { NotificationService } from '../services/notificationService';

const PassengerApp = () => {
  // 主要状态管理
  const [currentPage, setCurrentPage] = useState('home');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressType, setAddressType] = useState('pickup');
  
  // 地址和位置状态
  const [pickupInfo, setPickupInfo] = useState({
    address: '',
    location: null
  });
  const [destinationInfo, setDestinationInfo] = useState({
    address: '',
    location: null
  });
  
  // 搜索相关状态
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const searchTimeoutRef = useRef(null);
  
  // 地图和位置相关
  const [userLocation, setUserLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ latitude: 39.9042, longitude: 116.4074 });
  const [markers, setMarkers] = useState([]);
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [isInitialLocationReady, setIsInitialLocationReady] = useState(false);
  const [driverLocation, setDriverLocation] = useState(null);

  // 订单相关
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [showLocationTracker, setShowLocationTracker] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [statusPolling, setStatusPolling] = useState(null);

  // 模态框状态管理
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [showNoCycleModal, setShowNoCycleModal] = useState(false);
  const [showCustomDriveModal, setShowCustomDriveModal] = useState(false);
  const [showLongDistanceModal, setShowLongDistanceModal] = useState(false);
  const [showStationModal, setShowStationModal] = useState(false);
  const [showFamilyModal, setShowFamilyModal] = useState(false);
  const [showCommuteModal, setShowCommuteModal] = useState(false);
  const [showFriendOrderModal, setShowFriendOrderModal] = useState(false);

  // 热门地点标签
  const HOT_PLACE_TAGS = [
    { name: '医院', keyword: '医院', icon: '🏥' },
    { name: '机场', keyword: '机场', icon: '✈️' },
    { name: '火车站', keyword: '火车站', icon: '🚄' },
    { name: '饭店', keyword: '餐厅', icon: '🍽️' },
    { name: '商场', keyword: '购物中心', icon: '🛍️' },
    { name: '酒店', keyword: '酒店', icon: '🏨' },
    { name: '学校', keyword: '学校', icon: '🎓' },
    { name: '银行', keyword: '银行', icon: '🏦' }
  ];
  
  const orderService = new OrderService();
  const webSocketService = new WebSocketService();
  const notificationService = new NotificationService();

  // 应用初始化
  useEffect(() => {
    try {
      setSearchHistory(getSearchHistory(Taro));
    } catch (error) {
      console.error('加载搜索历史失败:', error);
      setSearchHistory([]);
    }
    initializeUserLocation();
  }, []);

  // 当起点和终点都设置后，更新地图标记
  useEffect(() => {
    updateMapMarkers();
  }, [pickupInfo.location, destinationInfo.location, userLocation, driverLocation]);

  // 监听上车点变化并更新地图中心
  useEffect(() => {
    if (pickupInfo.location) {
      setMapCenter(pickupInfo.location);
    }
  }, [pickupInfo.location]);

  // 在 useEffect 中设置 WebSocket 事件处理
  useEffect(() => {
    if (currentOrder?.id) {
      // 注册消息处理器
      webSocketService.onMessage('DRIVER_LOCATION', handleDriverLocationUpdate);
      webSocketService.onMessage('ORDER_STATUS', handleOrderStatusChange);
      webSocketService.onMessage('DRIVER_MESSAGE', handleDriverMessage);

      return () => {
        webSocketService.close();
      };
    }
  }, [currentOrder?.id]);
  
  // 更新地图标记
  const updateMapMarkers = () => {
    const newMarkers = [];
    
    if (userLocation) {
      newMarkers.push({
        id: 0,
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        iconPath: iconPaths.locate,
        width: 30,
        height: 30,
        title: '您的位置'
      });
    }
    
    if (pickupInfo?.location?.latitude && pickupInfo?.location?.longitude) {
      newMarkers.push({
        id: 1,
        latitude: pickupInfo.location.latitude,
        longitude: pickupInfo.location.longitude,
        iconPath: iconPaths.pickup,
        width: 35,
        height: 35,
        title: '上车地点'
      });
    }
    
    if (destinationInfo?.location?.latitude && destinationInfo?.location?.longitude) {
      newMarkers.push({
        id: 2,
        latitude: destinationInfo.location.latitude,
        longitude: destinationInfo.location.longitude,
        iconPath: iconPaths.destination,
        width: 35,
        height: 35,
        title: '目的地'
      });
    }

    if (driverLocation) {
      newMarkers.push({
        id: 3,
        latitude: driverLocation.latitude,
        longitude: driverLocation.longitude,
        iconPath: iconPaths.driver,
        width: 35,
        height: 35,
        title: '司机位置'
      });
    }
    
    setMarkers(newMarkers);
  };

  // 初始化用户位置
  const initializeUserLocation = () => {
    setIsLocationLoading(true);
    
    Taro.getLocation({
      type: 'gcj02',
      success: (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        setUserLocation(location);
        setMapCenter(location);
        
        reverseGeocode(location).then(address => {
          setPickupInfo({
            address: address || '当前位置',
            location: location
          });
        });
        
        setIsLocationLoading(false);
        setIsInitialLocationReady(true);
        console.log('用户位置获取成功:', location);
      },
      fail: (error) => {
        setIsLocationLoading(false);
        setIsInitialLocationReady(true);
        console.error('获取用户位置失败:', error);
        
        Taro.showModal({
          title: '位置权限',
          content: '为了提供更好的服务，请允许获取您的位置信息',
          confirmText: '去设置',
          cancelText: '稍后',
          success: (modalRes) => {
            if (modalRes.confirm) {
              Taro.openSetting({
                success: (settingRes) => {
                  if (settingRes.authSetting['scope.userLocation']) {
                    initializeUserLocation();
                  }
                }
              });
            }
          }
        });
      }
    });
  };

  // 腾讯地图API - 反向地理编码
  const reverseGeocode = async (location) => {
    try {
      const response = await Taro.request({
        url: 'https://apis.map.qq.com/ws/geocoder/v1/',
        data: {
          location: `${location.latitude},${location.longitude}`,
          key: DEVELOPER_KEY,
          get_poi: 1
        }
      });
      
      if (response.data.status === 0) {
        return response.data.result.formatted_addresses.recommend;
      }
    } catch (error) {
      console.error('反向地理编码失败:', error);
    }
    return null;
  };

  // 腾讯地图API - 地点搜索
  const searchPlaces = async (keyword, page = 1) => {
    if (!keyword.trim()) return [];
  
    try {
      const response = await Taro.request({
        url: 'https://apis.map.qq.com/ws/place/v1/suggestion',
        data: {
          keyword,
          key: DEVELOPER_KEY,
          location: userLocation
            ? `${userLocation.latitude},${userLocation.longitude}`
            : undefined,
          region: '',
          page_size: 20,
          page_index: page
        }
      });
      
      if (response.data.status === 0 && Array.isArray(response.data.data)) {
        const results = response.data.data.map(item => ({
          id: item.id,
          name: item.title,
          address: item.address,
          location: item.location,
          distance: item.distance || 0,
          type: null
        }));
        
        if (response.data.data.length < 20) {
          setHasMoreResults(false);
        } else {
          setHasMoreResults(true);
        }
        
        return results;
      } else {
        setHasMoreResults(false);
      }
    } catch (error) {
      console.error('地址建议接口失败:', error);
      setHasMoreResults(false);
    }
    return [];
  };

  // 搜索功能
  const handleSearch = (term) => {
    setSearchTerm(term);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!term.trim()) {
      setSearchResults([]);
      setShowResults(false);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowResults(true);
    setSearchPage(1);
    setHasMoreResults(true); 

    searchTimeoutRef.current = setTimeout(async () => {
      const results = await searchPlaces(term, 1);
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  // 点击热门标签
  const handleHotTagClick = async (tag) => {
    setSearchTerm(tag.keyword);
    setIsSearching(true);
    setShowResults(true);
    
    try {
      const results = await searchPlaces(tag.keyword);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 清除搜索
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowResults(false);
    setIsSearching(false);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // 选择地址
  const selectAddress = (address) => {
    const location = {
      latitude: address.location.lat,
      longitude: address.location.lng
    };
    
    if (addressType === 'pickup') {
      setPickupInfo({
        address: address.name,
        location: location
      });
    } else {
      setDestinationInfo({
        address: address.name,
        location: location
      });
    }
    
    try {
      addToSearchHistory(address, Taro);
      setSearchHistory(getSearchHistory(Taro));
    } catch (error) {
      console.error('保存搜索历史失败:', error);
    }
    
    setShowAddressModal(false);
    clearSearch();
    
    if ((addressType === 'pickup' && destinationInfo.location) || 
        (addressType === 'destination' && pickupInfo.location)) {
      calculateEstimatedPrice();
    }
  };

  // 计算预估价格
  const calculateEstimatedPrice = async () => {
    if (!pickupInfo.location || !destinationInfo.location) return;
    
    try {
      const response = await Taro.request({
        url: 'https://apis.map.qq.com/ws/direction/v1/driving/',
        data: {
          from: `${pickupInfo.location.latitude},${pickupInfo.location.longitude}`,
          to: `${destinationInfo.location.latitude},${destinationInfo.location.longitude}`,
          key: DEVELOPER_KEY
        }
      });
      
      if (response.data.status === 0) {
        const route = response.data.result.routes[0];
        const distance = route.distance;
        const duration = route.duration;
        
        const basePrice = 30;
        const pricePerKm = 4;
        const pricePerMinute = 0.5;
        const price = basePrice + (distance / 1000) * pricePerKm + (duration / 60) * pricePerMinute;
        
        setEstimatedPrice(Math.round(price));
      }
    } catch (error) {
      console.error('价格计算失败:', error);
      setEstimatedPrice(Math.round(Math.random() * 100 + 50));
    }
  };

  // 获取用户位置
  const getCurrentLocation = () => {
    Taro.showLoading({ title: '获取位置中...' });
    
    Taro.getLocation({
      type: 'gcj02',
      success: async (res) => {
        const location = {
          latitude: res.latitude,
          longitude: res.longitude
        };
        setUserLocation(location);
        setMapCenter(location);
        
        if (addressType === 'pickup') {
          const address = await reverseGeocode(location);
          setPickupInfo({
            address: address || '当前位置',
            location: location
          });
        }
        
        setShowAddressModal(false);
        Taro.hideLoading();
        
        Taro.showToast({
          title: '位置获取成功',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.hideLoading();
        Taro.showModal({
          title: '位置获取失败',
          content: '请检查位置权限设置，或手动选择地址',
          showCancel: false
        });
      }
    });
  };

  // 在订单确认时请求订阅消息权限
  const handleBookRide = async () => {
    if (!pickupInfo.address || !destinationInfo.address) {
      Taro.showToast({
        title: '请先选择出发地和目的地',
        icon: 'none'
      });
      return;
    }

    // 请求订阅消息权限
    await notificationService.requestNotificationPermissions();

    const newOrder = {
      id: `ORD${Date.now()}`,
      status: 'PENDING',
      pickupAddress: pickupInfo.address,
      destinationAddress: destinationInfo.address,
      orderTime: new Date().toISOString(),
      estimatedPrice,
      canCancel: true
    };

    setCurrentOrder(newOrder);
    setShowLocationTracker(true);
    
    setTimeout(() => {
      setCurrentOrder(prev => ({ 
        ...prev, 
        status: 'ACCEPTED', 
        driverName: '张师傅',
        canCancel: true // 保持可以取消
      }));
    }, 3000);

    Taro.showToast({
      title: '订单已提交',
      icon: 'success'
    });
  };

  // 取消订单
  const handleCancelOrder = () => {
    Taro.showModal({
      title: '取消订单',
      content: '确定要取消当前订单吗？',
      success: (res) => {
        if (res.confirm) {
          setCurrentOrder(null);
          setShowLocationTracker(false);
          setPickupInfo({ address: '', location: null });
          setDestinationInfo({ address: '', location: null });
          setEstimatedPrice(0);
          if (userLocation) {
            setMapCenter(userLocation);
          }
          updateMapMarkers();
          
          Taro.showToast({
            title: '订单已取消',
            icon: 'success'
          });
        }
      }
    });
  };

  // 加载更多搜索结果
  const loadMoreResults = async () => {
    if (isLoadingMore) return;
    
    try {
      setIsLoadingMore(true);
      const newResults = await searchPlaces(searchTerm, searchPage + 1);
      setSearchResults([...searchResults, ...newResults]);
      setSearchPage(searchPage + 1);
    } catch (error) {
      console.error('加载更多结果失败:', error);
      Taro.showToast({
        title: '加载更多失败',
        icon: 'none'
      });
    } finally {
      setIsLoadingMore(false);
    }
  };

  // 地址选择处理
  const handleAddressSelect = (type) => {
    setAddressType(type);
    setShowAddressModal(true);
  };

  // 清除搜索历史
  const handleClearHistory = () => {
    try {
      clearSearchHistory(Taro);
      setSearchHistory([]);
    } catch (error) {
      console.error('清除搜索历史失败:', error);
    }
  };

  // 处理服务确认
  const handleServiceConfirm = async (serviceType, additionalData = {}) => {
    if (!pickupInfo.location || !destinationInfo.location) {
      Taro.showToast({
        title: '请选择上车点和目的地',
        icon: 'none'
      });
      return;
    }

    try {
      // 1. 计算距离和时间
      const routeInfo = await calculateRoute(pickupInfo.location, destinationInfo.location);
      
      // 2. 计算价格
      const price = await orderService.calculatePrice(
        serviceType,
        routeInfo.distance,
        routeInfo.duration,
        additionalData
      );

      // 3. 检查可用司机
      const drivers = await orderService.getAvailableDrivers(pickupInfo.location, serviceType);
      if (drivers.length === 0) {
        throw new Error('当前暂无可用司机');
      }

      // 4. 创建订单
      const result = await orderService.createOrder(serviceType, {
        pickup: pickupInfo,
        destination: destinationInfo,
        estimatedPrice: price,
        distance: routeInfo.distance,
        duration: routeInfo.duration,
        ...additionalData
      });

      if (result.success) {
        setCurrentOrder(result.order);
        setShowLocationTracker(true);
        
        // 5. 启动订单状态监听
        startOrderStatusPolling(result.order.id);

        Taro.showToast({
          title: '订单创建成功',
          icon: 'success'
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      Taro.showToast({
        title: error.message,
        icon: 'none'
      });
    }
  };

  // 启动订单状态轮询
  const startOrderStatusPolling = (orderId) => {
    const pollingInterval = setInterval(async () => {
      try {
        const response = await Taro.request({
          url: `${orderService.baseUrl}/api/orders/${orderId}/status`,
          method: 'GET'
        });

        const newStatus = response.data.status;
        if (newStatus !== currentOrder?.status) {
          handleOrderStatusChange(newStatus, response.data);
        }
      } catch (error) {
        console.error('获取订单状态失败:', error);
      }
    }, 5000); // 每5秒轮询一次

    // 保存轮询间隔ID以便清理
    setStatusPolling(pollingInterval);
  };

  // 处理订单状态变化
  const handleOrderStatusChange = (newStatus, orderData) => {
    setCurrentOrder(prev => ({
      ...prev,
      ...orderData,
      status: newStatus
    }));

    // 根据不同状态显示相应提示
    switch (newStatus) {
      case OrderStatus.DRIVER_ASSIGNED:
        webSocketService.connect(orderData.id);
        Taro.showToast({
          title: `${orderData.driverName}师傅已接单`,
          icon: 'success'
        });
        break;
      case OrderStatus.DRIVER_ARRIVED:
        Taro.showToast({
          title: '司机已到达上车点',
          icon: 'success'
        });
        break;
      case OrderStatus.IN_PROGRESS:
        Taro.showToast({
          title: '行程开始',
          icon: 'success'
        });
        break;
      case OrderStatus.COMPLETED:
        handleOrderCompletion(orderData);
        break;
      case OrderStatus.CANCELLED:
        handleOrderCancellation(orderData);
        break;
    }
  };

  // 处理司机位置更新
  const handleDriverLocationUpdate = (location) => {
    setDriverLocation(location);
    // 更新地图上的司机标记
    updateMapMarkers();
  };

  // 处理司机消息
  const handleDriverMessage = (message) => {
    Taro.showModal({
      title: '司机消息',
      content: message.content,
      showCancel: false
    });
  };

  // 处理订单完成
  const handleOrderCompletion = async (orderData) => {
    // 清理轮询
    if (statusPolling) {
      clearInterval(statusPolling);
    }

    // 显示支付确认
    Taro.showModal({
      title: '行程已完成',
      content: `行程费用：¥${orderData.finalPrice}`,
      confirmText: '立即支付',
      success: async (res) => {
        if (res.confirm) {
          const payResult = await orderService.payOrder(
            orderData.id,
            'WECHAT'
          );

          if (payResult.success) {
            setShowRatingModal(true);
          } else {
            Taro.showToast({
              title: '支付失败',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  // 帮朋友叫车确认
  const handleFriendOrderConfirm = (friendInfo) => {
    Taro.showToast({
      title: `已为${friendInfo.name}叫车`,
      icon: 'success'
    });
    handleBookRide();
  };
  const handleServiceClick = (serviceAction) => {
    if (currentOrder && currentOrder.status !== 'COMPLETED') {
      Taro.showToast({
        title: '当前有进行中的订单',
        icon: 'none'
      });
      return;
    }
    serviceAction();
  };
  // 主页内容
  const HomePage = () => {
    if (!isInitialLocationReady) {
      return (
        <View className="w-full h-full flex flex-col items-center justify-center bg-gray-50">
          <Image src={iconPaths.locate} className="w-12 h-12 animate-pulse" />
          <Text className="text-gray-500 mt-4">正在努力加载地图...</Text>
        </View>
      );
    }

    return (
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        {/* 地图区域 */}
        <View className="h-96 relative overflow-hidden">
          <SharedMap 
            developerKey={DEVELOPER_KEY}
            center={mapCenter}
            markers={markers}
            pickupLocation={pickupInfo.location}
            destinationLocation={destinationInfo.location}
            onMapClick={(e) => console.log('地图点击:', e)}
          />
          
          {isLocationLoading && (
            <View className="absolute top-4 left-4 bg-white rounded-lg px-3 py-2 shadow-md">
              <View className="flex items-center">
                <Text className="text-blue-500 mr-2">📍</Text>
                <Text className="text-sm text-gray-600">定位中...</Text>
              </View>
            </View>
          )}
          
          <View className="absolute top-4 right-4 space-y-2">
            <Button 
              className="w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center p-0 border-none"
              onClick={initializeUserLocation}
            >
              <Text className="text-lg">📍</Text>
            </Button>
          </View>
        </View>

        {/* 行程规划面板 */}
        <TripPlanningPanel
          pickupInfo={pickupInfo}
          destinationInfo={destinationInfo}
          onAddressSelect={handleAddressSelect}
          onReservation={() => handleServiceClick(() => setShowReservationModal(true))}
          onNoCycle={() => handleServiceClick(() => setShowNoCycleModal(true))}
          onRentDriver={handleBookRide} // 叫多名改为直接叫车
          onQuickCall={() => handleServiceClick(() =>  setShowFriendOrderModal(true))} // 帮朋友叫车
        />

        {/* 快速叫车面板 */}
        <QuickCallPanel
          pickupInfo={pickupInfo}
          destinationInfo={destinationInfo}
          estimatedPrice={estimatedPrice}
          onBookRide={handleBookRide}
        />

        {/* 租个司机面板 */}
        <RentDriverPanel
          onCustomDrive={() => handleServiceClick(() =>  setShowCustomDriveModal(true))}
          onLongDistanceDrive={() => handleServiceClick(() =>  setShowLongDistanceModal(true))}
          onStationService={() => handleServiceClick(() =>  setShowStationModal(true))}
          onFamilyService={() => handleServiceClick(() =>  setShowFamilyModal(true))}
          onCommuteService={() => handleServiceClick(() =>  setShowCommuteModal(true))}
        />

        {/* 底部留白 */}
        <View className="h-20"></View>

        {/* 位置追踪器 */}
        {showLocationTracker && currentOrder && (
          <View className="fixed bottom-24 left-4 right-4 z-40">
            <LocationTracker 
              orderStatus={currentOrder.status}
              driverLocation={driverLocation}
              userLocation={userLocation}
              estimatedArrival="5分钟"
              onLocationUpdate={setUserLocation}
              onCancel={handleCancelOrder}
              canCancel={currentOrder.canCancel}
            />
          </View>
        )}
      </View>
    )
  };

  // 渲染当前页面
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'orders':
        return <OrdersPage />;
      case 'coupons':
        return <CouponsPage onBack={() => setCurrentPage('profile')} />;
      case 'profile':
        return <ProfilePage onNavigate={setCurrentPage} />;
      case 'driver':
        return <BecomeDriverPage onBack={() => setCurrentPage('home')} />;
      default:
        return <HomePage />;
    }
  };

  return (
    <View className="min-h-screen bg-gray-50 flex flex-col">
      <View className="flex-1 pb-20">
        {renderCurrentPage()}
      </View>

      <View className="z-50 fixed bottom-0 left-0 right-0">
        <BottomNav 
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </View>

      {/* 地址选择模态框 */}
      <AddressModal
        showAddressModal={showAddressModal}
        addressType={addressType}
        searchTerm={searchTerm}
        searchResults={searchResults}
        showResults={showResults}
        isSearching={isSearching}
        searchHistory={searchHistory}
        isLoadingMore={isLoadingMore}
        hasMoreResults={hasMoreResults}
        HOT_PLACE_TAGS={HOT_PLACE_TAGS}
        onClose={() => setShowAddressModal(false)}
        onSearch={handleSearch}
        onClearSearch={clearSearch}
        onGetCurrentLocation={getCurrentLocation}
        onSelectAddress={selectAddress}
        onHotTagClick={handleHotTagClick}
        onLoadMore={loadMoreResults}
        onClearHistory={handleClearHistory}
      />

      {/* 服务模态框 */}
      <ReservationModal
        showModal={showReservationModal}
        onClose={() => setShowReservationModal(false)}
        onConfirm={() => handleServiceConfirm('预约代驾')}
      />

      <NoCycleModal
        showModal={showNoCycleModal}
        onClose={() => setShowNoCycleModal(false)}
        onConfirm={() => handleServiceConfirm('无代步车')}
      />

      <CustomDriveModal
        showModal={showCustomDriveModal}
        onClose={() => setShowCustomDriveModal(false)}
        onConfirm={() => handleServiceConfirm('代驾定制')}
      />

      <LongDistanceModal
        showModal={showLongDistanceModal}
        onClose={() => setShowLongDistanceModal(false)}
        onConfirm={() => handleServiceConfirm('长途开车')}
      />

      <StationModal
        showModal={showStationModal}
        onClose={() => setShowStationModal(false)}
        onConfirm={() => handleServiceConfirm('场站接送')}
      />

      <FamilyModal
        showModal={showFamilyModal}
        onClose={() => setShowFamilyModal(false)}
        onConfirm={() => handleServiceConfirm('亲友接送')}
      />

      <CommuteModal
        showModal={showCommuteModal}
        onClose={() => setShowCommuteModal(false)}
        onConfirm={() => handleServiceConfirm('通勤接送')}
      />

      <FriendOrderModal
        isVisible={showFriendOrderModal}
        onClose={() => setShowFriendOrderModal(false)}
        onConfirm={handleFriendOrderConfirm}
      />

      <RatingModal 
        visible={showRatingModal}
        orderInfo={currentOrder}
        onClose={() => setShowRatingModal(false)}
        onSubmit={(ratingData) => {
          console.log('评价数据:', ratingData);
          setShowRatingModal(false);
          Taro.showToast({
            title: '评价提交成功',
            icon: 'success'
          });
        }}
      />
    </View>
  );
};

export default PassengerApp;