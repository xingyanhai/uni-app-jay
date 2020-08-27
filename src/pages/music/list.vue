

<template>
	<view class="wrap">
		<view class="list" v-if="dataList && dataList.length">
			<view class="item" v-for="(value, index) in dataList"
				  :key="index"
				  @tap="toDetail(value)">
				<view class="content">
					<view class="left">
						<text class="index-text">{{index + 1}}</text>
						<text class="title">{{value.name}}</text>
					</view>
					<text @click.stop="downloadClick(value)" class="xyh-icon down-icon">&#xe601;</text>
				</view>
			</view>
		</view>
		<view class="common-no-data-box">
			{{loadMoreText || ''}}
		</view>
	</view>
</template>

<script>
	import SearchBtn from '../components/search-btn'

	import {
		mapState,
		mapMutations
	} from 'vuex'

	export default {
		data() {
			return {
				search: '',
				loadMoreText: '加载中...',
				pageNo:1,
				pageSize: 100,
				dataList: [],
				loading: false,
				backgroundAudioManager: null,
				innerAudioContext: null,
				fileIdPrefix: 'cloud://test-xyh-jay.7465-test-xyh-jay-1302967778/jay',
				poster: 'https://tvax3.sinaimg.cn/crop.0.0.1080.1080.180/6e48db9ely8ghjt7jvbg2j20u00u0god.jpg?KID=imgbed,tva&Expires=1598438463&ssig=%2FUmJE4SGIz',
			};
		},
		components: {SearchBtn},
        computed: mapState(['userInfo']),
		methods: {
			...mapMutations(['getUserInfo','setStateData']),
			copy (item) {
				console.log(item)
				let text = `${item.src}\n${item.text}`
				wx.setClipboardData({
					data: text,
					success (res) {
						wx.getClipboardData({
							success (res) {
								console.log(res.data) // data
							}
						})
					}
				})
			},
			async getData() {
				if(this.loading) {
					return
				}
				this.loading = true
				this.loadMoreText = '加载中...'
				let res = await wx.cloud.callFunction({
					name: 'getDbListData',
					data: {
						dbName: 'musicList',
						pageNo: this.pageNo,
						pageSize: this.pageSize,
						limitType: 3,
						params: {
						},
						orderName: 'answerUpNum',
						orderType: 'desc'
					}
				})
				this.loading = false
				this.totalCount = res.result.totalCount
				const data = res.result.data;
				if(data && data.length) {
					this.pageNo += 1
				}
				let list = [];
				for (var i = 0; i < data.length; i++) {
					let item = data[i];
					list.push({
						...item
					});
				}
				this.dataList = this.dataList.concat(list);
				if(data.length < this.pageSize) {
					this.loadMoreText = '没有更多了'
				}
				if(this.dataList && this.dataList.length<=0) {
					this.loadMoreText = '暂无数据'
					this.dataList = list;
				}
			},
			downloadClick (item) {
				let src = `${this.fileIdPrefix}/${item.fileID}`
				console.log(src)
				uni.showLoading({
					title: '资源加载中...'
				})
				wx.cloud.getTempFileURL({
					fileList: [src],
					success: res => {
						console.log(res)

						wx.downloadFile({
							url: res.fileList[0].tempFileURL, //仅为示例，并非真实的资源
							success (res) {
								console.log(res)
								// 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
								if (res.statusCode === 200) {
									console.log(res.tempFilePath)
									wx.saveFile({
										tempFilePath: res.tempFilePath,
										success (res) {
											uni.hideLoading()
											console.log(res.savedFilePath)
										},
										fail(res) {
											uni.hideLoading()
											uni.showToast({
												title: '文件超过10M，受微信限制，无法下载！',
												icon: "none"
											})
											console.log('file ', res)
										}
									})
								}
							}
						})
					},
					fail: console.error
				})

			},
			toDetail (data) {
				this.play({
					...data,
				})
				// wx.cloud.getTempFileURL({
				// 	fileList: [`${fileIdPrefix}/${data.fileID}`],
				// 	success: res => {
				//
				// 		uni.hideLoading()
				// 	},
				// 	fail: console.error
				// })
			},
			play (item) {
				console.log(item)
				let backgroundAudioManager = this.backgroundAudioManager
				backgroundAudioManager.title = item.name
				backgroundAudioManager.epname = '周杰伦'
				backgroundAudioManager.singer = '周杰伦'
				backgroundAudioManager.coverImgUrl = this.poster
				let fileIdPrefix = this.fileIdPrefix
				// 设置了 src 之后会自动播放
				backgroundAudioManager.src = `${fileIdPrefix}/${item.fileID}`
				backgroundAudioManager.onError(e => {
					console.log('error', e)
				})
				uni.showLoading({
					title: '请稍后...'
				})
				backgroundAudioManager.onPlay(e => {
					console.log('Play', e)
					uni.hideLoading()
				})

				// let innerAudioContext = this.innerAudioContext
				// innerAudioContext.autoplay = true
				// innerAudioContext.obeyMuteSwitch = false
				// innerAudioContext.src = item.tempFileURL
				// innerAudioContext.onPlay(() => {
				// 	console.log('开始播放')
				// })
				// innerAudioContext.onError((res) => {
				// 	console.log(res.errMsg)
				// 	console.log(res.errCode)
				// })
			}
		},
		onReachBottom() {
			if ((this.pageNo -1) *this.pageSize >= this.totalCount || this.dataList.length >= this.totalCount) {
				this.loadMoreText = '没有更多了'
				return;
			}
			this.getData();
		},
		// 加了这个页面才可以被分享
		onShareAppMessage: function (res) {
		},
		async onLoad() {
			this.backgroundAudioManager = wx.getBackgroundAudioManager()
			// this.innerAudioContext = wx.createInnerAudioContext()
			wx.setInnerAudioOption({
				// （仅在 iOS 生效）是否遵循静音开关，设置为 false 之后，即使是在静音模式下，也能播放声音
				obeyMuteSwitch: false,
				// 是否与其他音频混播，设置为 true 之后，不会终止其他应用或微信内的音乐
				mixWithOther: false,
				success () {
					console.log('wx.setInnerAudioOption success')
				},
				fail(e) {
					console.log('wx.setInnerAudioOption fail')
					console.log(e)
				}
			})
			this.getData()
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
.wrap
	display block
	width 100%


.list
	display flex
	flex-direction column
	width 100%
	.item
		display block
		padding 5px 10px 5px 20px
		background-color #fff
		margin-bottom 0.5px
		.content
			display flex
			justify-content space-between
			align-items center
			.left
				display flex
				align-items center
			.index-text
				font-size 12px
				color $uni-text-light-color
				margin-right 15px
			.title
				font-size 18px
				margin 5px 0
			.down-icon
				line-height 24px
				padding 0 10px
				color $uni-color-primary
.center
	text-align center
	margin 20px 0
	color #999
	width 100%
	display block
</style>
