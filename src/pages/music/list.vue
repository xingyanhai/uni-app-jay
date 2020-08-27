

<template>
	<view class="wrap">
		<view class="fix-bg-cover"></view>
		<image class="fix-bg-img" mode="aspectFill" :src="`cloud://test-xyh-jay.7465-test-xyh-jay-1302967778/jay-img/jay${backgroundImgIndex}.jpg`"></image>
		<view class="page-title">
			{{config.pageTitle || '周杰伦的歌曲'}}
		</view>
		<view class="page-tip">
			{{config.pageTip || ''}}
		</view>
		<view class="main-wrap">
			<view class="main-left" v-if="config.showOtherApp">
				<view class="main-left-fixed">
					<view class="other-app-item" @click="toOtherMiniProgram(value)"  v-for="(value, index) in shareList" :key="index" v-if="index%2===0">
						<text class="list-text">{{value.shareText || '更多'}}</text>
					</view>
				</view>
			</view>
			<view class="main-center">
				<view class="list" v-if="dataList && dataList.length">
					<view class="item" v-for="(value, index) in dataList"
						  :key="index"
						  @tap="toDetail(value, index)">
						<view class="content">
							<view class="left">
								<text class="index-text">
									<text class="xyh-icon icon-play" v-if="index===playIndex">&#xe618;</text>
									<text v-else>{{index + 1}}</text>
								</text>
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
			<view class="main-right" v-if="config.showOtherApp">
				<view class="main-right-fixed">
					<view class="other-app-item" @click="toOtherMiniProgram(value)"  v-for="(value, index) in shareList" :key="index" v-if="index%2===1">
						<text class="list-text">{{value.shareText || '更多'}}</text>
					</view>
				</view>
			</view>
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
				playIndex: '',
				backgroundImgIndex: 1
			};
		},
		components: {SearchBtn},
        computed: {
			...mapState(['userInfo','config']),
			shareList () {
				let arr = []
				if(this.config && this.config.shareMiniProgramList) {
					return  this.config.shareMiniProgramList
				}
				return arr
			}
		},
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
			toOtherMiniProgram (item) {
				wx.navigateToMiniProgram({
					appId: item.appId,
					success(res) {
						// 打开成功1
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
			toDetail (data, i) {
				if(!this.config.showAudio) {
					return
				}
				if (this.playIndex === i) {
					return
				}
				this.playIndex = i
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
			this.backgroundAudioManager.onPlay(e => {
				console.log('监听背景音频播放事件', e)
				uni.hideLoading()
			})
			this.backgroundAudioManager.onPause(e => {
				console.log('监听背景音频暂停事件', e)
				uni.hideLoading()
				this.playIndex = ''
			})
			this.backgroundAudioManager.onStop(e => {
				console.log('监听背景音频停止事件', e)
				uni.hideLoading()
				this.playIndex = ''
			})
			this.backgroundAudioManager.onError(e => {
				console.log('监听背景音频播放错误事件', e)
				uni.hideLoading()
				uni.showToast({
					title: '播放失败，请重试！',
					icon: "none"
				})
				this.playIndex = ''
			})



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

			// 换壁纸
			setInterval(() => {
				let index = this.backgroundImgIndex + 1
				if(index === 6) {
					index = 1
				}
				this.backgroundImgIndex = index
			}, 100000)
		}
	}
</script>

<style lang="stylus" scoped>
	@import "../../uni.styl"
.wrap
	display block
	width 100%
.page-title
	display block
	text-align center
	padding-top 50px
	line-height 80px
	font-size 32px
.page-tip
	display block
	text-align center
	color #fff
	font-size 14px
	line-height 24px
.list
	display flex
	flex-direction column
	width 100%
	.item
		display block
		padding 10px 10px 10px 20px
		background-color rgba(255,255,255,0.6)
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
				margin-right 10px
				min-width 20px
			.title
				font-size 16px
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
.icon-play
	color $uni-color-primary
.main-wrap
	display flex
	.main-left
		width 50px
		flex-shrink 1
		.main-left-fixed
			position fixed
			top 0
			left 0
			bottom 0
			width 50px
			display flex
			flex-direction column
			justify-content center
	.main-right
		width 50px
		flex-shrink 1
		.main-right-fixed
			position fixed
			right 0
			top 0
			bottom 0
			width 50px
			display flex
			flex-direction column
			justify-content center
	.main-center
		flex 1
		display block
.other-app-item
	width 100%
	background-color $uni-color-primary
	color #fff
	font-size 12px
	padding 10px
	text-align center
	display block
	&:first-child
		border-radius 10px 10px 0 0
	&:last-child
		border-radius 0 0 10px 10px
.fix-bg-img
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	z-index -10
	width 100%
	height 100%
	filter blur(3px)
	transition .5s ease-in-out
.fix-bg-cover
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	z-index -5
	background-color rgba(255,255,255, 0.5)
</style>
