<template>
  <page-layout :avatar="currUser.avatar">
    <div slot="headerContent">
      <div class="title">{{currUser.timeFix}}</div>
      <div>{{currUser.position}}</div>
    </div>
  </page-layout>
</template>

<script>
import PageLayout from '@/layouts/PageLayout'
import { mapState } from 'vuex'

export default {
  name: 'WorkPlace',
  components: { PageLayout },
  i18n: require('./i18n'),
  data() {
    return {
      projects: [],
      loading: true,
      activities: [],
      teams: [],
      welcome: {
        timeFix: '',
        message: ''
      }
    }
  },
  computed: {
    ...mapState('account', { currUser: 'user' }),
    ...mapState('setting', ['lang'])
  },
  created() {}
}
</script>

<style lang="less">
@import 'index';
</style>
