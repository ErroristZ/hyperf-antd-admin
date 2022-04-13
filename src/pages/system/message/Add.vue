<template>
  <a-modal
    title="新增消息"
    width="600px"
    :maskClosable="false"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :form="form" :label-col="{xs: { span: 24 }, sm: { span: 5 }}" :wrapper-col="{xs: { span: 24 },sm: { span: 17 }}">
      <div class="select-root" ref="selectRoot"></div>
      <a-form-item label="标题">
        <a-input
          autocomplete="off"
          v-decorator="['title', {rules: [{required: true, message: '标题不能为空', whitespace: true}]}]"
          placeholder="请输入标题"
        />
      </a-form-item>
      <a-form-item label="内容">
        <a-input
          autocomplete="off"
          type="textarea"
          v-decorator="['content', {rules: [{required: true, message: '内容不能为空', whitespace: true}]}]"
          placeholder="请输入内容"
        />
      </a-form-item>
      <a-form-item label="人员">
        <a-select
          v-decorator="['userIds', {rules: [{required: true, message: '请选择要通知的人员', type: 'array' }]}]"
          mode="multiple"
          placeholder="请选择要通知的人员"
          :get-popup-container="() => $refs.selectRoot"
          :allow-clear="true"
        >
          <div slot="dropdownRender" slot-scope="menu">
            <v-nodes :vnodes="menu" />
            <a-divider style="margin: 4px 0;" />
            <div style="padding: 4px 8px; cursor: pointer;" @mousedown="e => e.preventDefault()">
              <a-space>
                <a-button type="primary" size="small" @click="userSelected">全选</a-button>
              </a-space>
            </div>
          </div>
          <a-select-option v-for="(v, k) in user" :key="k" :value="v.userId">{{v.username}} - {{v.phone}} - {{v.realName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="类型">
        <a-radio-group v-decorator="['type', {initialValue: '1'}]">
          <a-radio value="1">消息</a-radio>
          <a-radio value="2">通知</a-radio>
          <a-radio value="3">待办</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { USER, MESSAGE } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { delObjEmptyVal } from '../../../utils/util'

export default {
  name: 'SystemMessageAdd',
  components: {
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes
    }
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      user: []
    }
  },
  methods: {
    /**
     * 处理显示
     */
    handleVisible() {
      const that = this
      that.getUser()
      that.visible = true
    },
    /**
     * 处理隐藏
     */
    handleCancel() {
      const that = this
      that.visible = false
      that.confirmLoading = false
      that.resetForm()
    },
    /**
     * 处理确定
     */
    handleOk(e) {
      const that = this
      e.preventDefault()
      that.confirmLoading = true
      that.form.validateFields(err => {
        if (err) {
          that.confirmLoading = false
          return false
        }
        that.handleSend()
      })
    },
    /**
     * 处理提交
     */
    handleSend() {
      const that = this
      const sendData = delObjEmptyVal(that.form.getFieldsValue())
      request(MESSAGE, METHOD.POST, sendData)
        .then(function (result) {
          if (result.data.code !== 0) {
            that.confirmLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          that.$parent.getList()
          const sendSocketData = {
            cmd: 'message.resetNotReadTotal',
            data: {
              userIds: sendData.userIds
            }
          }
          window.socketNotice.send(JSON.stringify(sendSocketData))
          setTimeout(function () {
            that.handleCancel()
          }, 1000)
        })
        .catch(function (error) {
          that.confirmLoading = false
          that.$message.error(error.response.data, 3)
        })
    },
    /**
     * 重置表单数据
     */
    resetForm() {
      const that = this
      that.form.resetFields()
    },
    /**
     * 获取用户
     */
    getUser() {
      const that = this
      const sendData = {
        queryType: 1
      }
      request(USER, METHOD.GET, sendData)
        .then(function (result) {
          if (result.data.code !== 0) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.user = result.data.data
        })
        .catch(function (error) {
          that.$message.error(error.response.data, 3)
        })
    },
    /**
     * 用户全选/反选
     */
    userSelected() {
      const that = this
      that.form.setFieldsValue({
        userIds: that.user.map(v => {
          return v.userId
        })
      })
    }
  }
}
</script>

<style scoped>
.margin3 {
  margin: 3px;
}
</style>