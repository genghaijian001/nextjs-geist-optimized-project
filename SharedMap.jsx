import React, { useEffect, useState } from 'react';
import { View, Text, Button, Map } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { DEVELOPER_KEY } from './passenger_function/constants';

const SharedMap = ({
  center = { latitude: 39.9042, longitude: 116.4074 },
  markers = [],
  showLocation = true,
  pickupLocation,
  destinationLocation
}) => {
  const [mapError, setMapError] = useState(null);
  const [polyline, setPolyline] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(15);
  const [routeInfo, setRouteInfo] = useState({ distance: 0, duration: 0 });

  // 初始化
  useEffect(() => {
    if (!(typeof wx !== 'undefined' && wx.createMapContext)) {
      setMapError('地图组件不可用');
    }
  }, []);

  // 有起终点时拉取路线
  useEffect(() => {
    const isPickupValid = pickupLocation && typeof pickupLocation.latitude === 'number' && typeof pickupLocation.longitude === 'number';
    const isDestinationValid = destinationLocation && typeof destinationLocation.latitude === 'number' && typeof destinationLocation.longitude === 'number';
  
    if (isPickupValid && isDestinationValid) {
      fetchRoute(pickupLocation, destinationLocation);
    } else {
      setPolyline([]);
      setRouteInfo({ distance: 0, duration: 0 });
    }
  }, [pickupLocation, destinationLocation]);

  // 获取驾驶路线
  const fetchRoute = (start, end) => {
    if (!start?.latitude || !end?.latitude) {
      setPolyline([]);
      setRouteInfo({ distance: 0, duration: 0 });
      return;
    }

    Taro.request({
      url: 'https://apis.map.qq.com/ws/direction/v1/driving/',
      data: {
        from: `${start.latitude},${start.longitude}`,
        to: `${end.latitude},${end.longitude}`,
        key: DEVELOPER_KEY
      },
      success: (res) => {
        const route = res.data.result && res.data.result.routes && res.data.result.routes[0];
        if (!route) {
          Taro.showToast({title: '无法规划路线', icon: 'none'});
          return;
        }

        setRouteInfo({ 
          distance: route.distance, 
          duration: route.duration 
        });

        // 腾讯地图polyline解码算法
        const coords = route.polyline;
        const points = [];
        
        for (let i = 2; i < coords.length; i++) {
          coords[i] = coords[i - 2] + coords[i] / 1000000;
        }
        for (let i = 0; i < coords.length; i += 2) {
          points.push({ 
            latitude: coords[i], 
            longitude: coords[i + 1] 
          });
        }

        setPolyline([{ 
          points, 
          color: '#1890ff', 
          width: 6, 
          arrowLine: true,
          borderWidth: 2,
          borderColor: '#ffffff'
        }]);

        // 调整地图视野
        if (wx && wx.createMapContext) {
          // 【关键修改】只传入起点和终点来适配视野，更稳定
          const validPoints = [
            { latitude: start.latitude, longitude: start.longitude },
            { latitude: end.latitude, longitude: end.longitude }
          ];
          if (validPoints && validPoints.length >= 2) {
            wx.createMapContext('shared-map').includePoints({ 
              points: validPoints, 
              padding: [80, 60, 120, 60]
            });
          }
        }
      },
      fail: () => {
        Taro.showToast({ title: '路线规划请求失败', icon: 'none' });
        setPolyline([]);
        setRouteInfo({ distance: 0, duration: 0 });
      }
    });
  };

  if (mapError) {
    return (
      <View className="w-full h-full flex items-center justify-center">
        <Text className="text-gray-600">{mapError}</Text>
      </View>
    );
  }

  return (
    <View className="relative w-full h-full">
      <Map
        id="shared-map"
        className="w-full h-full"
        latitude={center.latitude}
        longitude={center.longitude}
        scale={zoomLevel}
        markers={markers}
        polyline={Array.isArray(polyline) ? polyline : []}
        show-location={showLocation}
        style="width:100%;height:100%"
      />

      {/* 路线信息 */}
      {pickupLocation && destinationLocation && routeInfo.distance > 0 && (
        <View className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3">
          <Text className="text-sm text-gray-600">
            距离：{(routeInfo.distance/1000).toFixed(1)}km
          </Text>
          <Text className="text-sm text-gray-600">
            预计：{Math.ceil(routeInfo.duration/60)}分钟
          </Text>
        </View>
      )}

      {/* 缩放按钮 */}
      <View className="absolute bottom-4 right-4 space-y-2">
        <Button
          className="w-8 h-8 bg-white rounded-full"
          onClick={() => setZoomLevel(z => Math.min(z+1,20))}
        >+</Button>
        <Button
          className="w-8 h-8 bg-white rounded-full"
          onClick={() => setZoomLevel(z => Math.max(z-1,3))}
        >−</Button>
      </View>
    </View>
  );
};

export default SharedMap;