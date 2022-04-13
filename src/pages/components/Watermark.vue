<template>
  <div></div>
</template>

<script>
import App from '@/App'
import store from '@/store'
import Cookie from 'js-cookie'
import { xsrfHeaderName } from '@/utils/request'

export default {
  name: 'Watermark',
  data() {
    return {
      observer: null
    }
  },
  methods: {
    set(text1, text2, parentDom, instance) {
      const that = this
      if (instance) {
        if (!App.pages) {
          App.pages = []
        }
        const pages = App.pages
        pages[that.$route.path] = instance
        App.pages = pages
      }
      if (parentDom.querySelector('.watermark')) {
        parentDom.querySelector('.watermark').remove()
        if (that.observer) {
          that.observer.disconnect()
        }
      }
      if (!text1) {
        text1 = store.getters['account/user'].username
      }
      if (!text2) {
        text2 = store.getters['account/user'].nickname
      }
      if (!parentDom) {
        parentDom = document.body
      }
      const canvas = document.createElement('canvas')
      canvas.width = 150
      canvas.height = 90
      canvas.style.display = 'none'
      const cans = canvas.getContext('2d')
      cans.rotate((-20 * Math.PI) / 180)
      cans.translate(-50, 0)
      cans.fillStyle = 'rgba(169,169,169, 0.40)'
      //cans.font = '16px Vedana';
      cans.font = '16px Microsoft JhengHei'
      // cans.fillText(text1, canvas.width / 3, (canvas.height) / 2);
      // cans.fillText(text2, canvas.width / 3, (canvas.height) / 2 + 20);
      const dom = document.createElement('div')
      const id = 'watermark' + new Date().getTime() + Math.random()
      const styleStr = `max-inline-size:-webkit-fill-available!important;
                                margin-block: 0!important;
                                mix-blend-mode: normal!important;
                                max-width: none!important;
                                margin-top: 0!important;
                                margin-left: 0!important;
                                background:rgba(0,0,0, 0)!important;
                                background-color:rgba(0,0,0, 0)!important;
                                background-size:auto!important;
                                opacity:1!important;
                                visibility:visible!important;
                                position:absolute!important;
                                top:0!important;
                                left:0!important;
                                width:100%!important;
                                min-height: calc(100vh - 120px)!important;
                                z-index:999999999!important;
                                pointer-events:none!important;
                                background-repeat:repeat!important;background-image:url('${canvas.toDataURL('image/png')}')!important;
                                display: inline-block!important;`
      dom.id = id
      dom.setAttribute('style', styleStr)
      dom.classList.add('watermark')
      parentDom.appendChild(dom)
      const observer = new MutationObserver(() => {
        const wmInstance = document.getElementById(id)
        if ((parentDom && wmInstance && wmInstance.getAttribute('style') !== styleStr) || !wmInstance) {
          if (wmInstance) {
            wmInstance.setAttribute('style', styleStr)
          } else {
            if (Cookie.get(xsrfHeaderName)) {
              observer.disconnect()
              that.set(text1, text2, parentDom)
            } else {
              observer.disconnect()
            }
          }
        } else {
          wmInstance.remove()
          observer.disconnect()
          that.set(text1, text2, parentDom)
        }
        return true
      })
      observer.observe(parentDom, {
        attributes: true,
        subtree: true,
        childList: true
      })
      that.observer = observer
      return true
    }
  }
}
</script>

<style scoped>
</style>