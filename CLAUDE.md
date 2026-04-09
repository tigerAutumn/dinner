# 项目说明

「今晚吃什么」- 公司周边餐馆推荐页面，纯前端项目（单个 index.html）。

# 添加餐馆流程

当用户发送 Google Maps 链接时，按以下步骤添加新餐馆：

## 1. 解析链接

- 用 WebFetch 访问短链接，从重定向 URL 中提取店名和地址
- 先用 Grep 检查 index.html 中是否已存在该店铺，避免重复添加

## 2. 获取坐标

- 用国土地理院 GSI API 获取精确经纬度（番地级精度）：
  ```
  curl -s "https://msearch.gsi.go.jp/address-search/AddressSearch?q=大阪府大阪市住吉区{地址}" | python3 -m json.tool
  ```
- 返回的 coordinates 格式为 [经度, 纬度]，注意写入时要转为 lat（纬度）, lng（经度）

## 3. 获取食べログ评分

- 用 WebSearch 在 tabelog.com 搜索店名 + 地区，找到对应页面
- 用 WebFetch 访问食べログ页面，提取：评分、营业时间、定休日、料理类型
- 如果食べログ上没有，评分填 0（显示为「未鉴定」）

## 4. 写入数据

在 index.html 的 `restaurants` 数组末尾（`];` 之前）添加：

```js
{
  name: "店名", category: "分类",
  address: "住吉区xxx",
  description: "日文描述。简短特色介绍。",
  hours: "营业时间", closed: ["定休日"],
  maps: "Google Maps链接（短链接优先）",
  rating: 食べログ评分,
  lat: 纬度, lng: 经度
}
```

### 分类参考

中餐、拉面、烤肉、烤鸡串、意大利料理、印度料理、咖喱、大阪烧、乌冬・荞麦、喫茶店、韩国料理、越南料理、印尼料理、回转寿司、汉堡、炸猪排、快餐

### 定休日格式

`["月", "火", "水", "木", "金", "土", "日"]` 对应周一到周日，无休填 `[]`

## 5. 提交推送

每次添加完后立即 git add + commit + push。
