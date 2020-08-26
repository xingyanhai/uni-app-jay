
const env = 'test-xyh-jay'
// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env
})
const db = cloud.database({
  env
})
const fetch = require('./fetch')
const cheerio = require('cheerio');


// 云函数入口函数
exports.main = async (event, context) => {
  let res
  return res
}
