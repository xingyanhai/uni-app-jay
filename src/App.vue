<script>
  export default {
    onLaunch: function() {
      console.log('App Launch')
      wx.cloud.init({
        env: 'test-xyh-jay',
        traceUser: true
      }) //调用前需先调用init
      console.log('wx.cloud.init()')
      this.$store.commit('getConfig')
      // this.$store.commit('getUserPower')
      // this.$store.commit('getUserInfo')
    },
    onShow: function() {
      console.log('App Show')
    },
    onHide: function() {
      console.log('App Hide')
    }
  }
</script>

<style lang="stylus">
    @import "./uni.styl"
    @import './common/common.styl';
    page, view {
        display: flex;
        color $uni-text-color
        box-sizing border-box
    }

    page {
        display: flex;
        min-height: 100%;
        background-color: $uni-bg-color;
    }

    template {
        display: flex;
        flex: 1;
    }
</style>
