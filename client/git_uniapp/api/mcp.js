import { request } from "@/utils/request.js"
import mapConfig from "@/config/map.js"

// MCP服务基础配置
const MCP_BASE_URL = mapConfig.mcp.baseUrl
const MCP_API_KEY = mapConfig.mcp.apiKey

/**
 * 调用高德地图MCP服务
 * @param {string} path - API路径
 * @param {Object} data - 请求参数
 * @param {string} method - 请求方法
 * @returns {Promise} - 返回Promise对象
 */
export function callMCP(path, data = {}, method = 'GET') {
  return request({
    url: `${MCP_BASE_URL}${path}`,
    method: method,
    data: {
      key: MCP_API_KEY,
      ...data
    }
  })
}

/**
 * 地理编码服务
 * @param {string} address - 地址
 * @param {string} city - 城市
 * @returns {Promise} - 返回Promise对象
 */
export function geocode(address, city = '') {
  return callMCP('/v1/geocode/geo', {
    address,
    city
  })
}

/**
 * 逆地理编码服务
 * @param {number} longitude - 经度
 * @param {number} latitude - 纬度
 * @returns {Promise} - 返回Promise对象
 */
export function reverseGeocode(longitude, latitude) {
  return callMCP('/v1/geocode/regeo', {
    location: `${longitude},${latitude}`
  })
}

/**
 * 路径规划服务
 * @param {Array} origin - 起点 [longitude, latitude]
 * @param {Array} destination - 终点 [longitude, latitude]
 * @param {string} mode - 出行方式: driving, walking, bicycling, transit
 * @returns {Promise} - 返回Promise对象
 */
export function routePlanning(origin, destination, mode = 'driving') {
  return callMCP('/v1/direction/driving', {
    origin: origin.join(','),
    destination: destination.join(','),
    extensions: 'all'
  })
}

/**
 * 周边搜索服务
 * @param {Array} location - 中心点 [longitude, latitude]
 * @param {string} keywords - 关键词
 * @param {number} radius - 搜索半径
 * @returns {Promise} - 返回Promise对象
 */
export function nearbySearch(location, keywords, radius = 1000) {
  return callMCP('/v1/place/around', {
    location: location.join(','),
    keywords,
    radius
  })
}