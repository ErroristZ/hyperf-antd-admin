<template>
  <a-modal title="新增角色" :maskClosable="false" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel">
    <a-form :form="form" :label-col="{xs: { span: 24 }, sm: { span: 5 }}" :wrapper-col="{xs: { span: 24 },sm: { span: 12 }}">
      <a-form-item label="角色名称">
        <a-input
          autocomplete="off"
          v-decorator="['name', {rules: [{ required: true, message: '角色名称不能为空', whitespace: true}]}]"
          placeholder="请输入角色名称"
        />
      </a-form-item>
      <a-form-item label="角色描述">
        <a-input
          autocomplete="off"
          v-decorator="['description', {rules: [{ required: false, message: '角色描述不能为空', whitespace: true}]}]"
          placeholder="请输入角色描述"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { delObjEmptyVal } from '../../../utils/util'
import { ROLE } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export default {
  name: 'SystemRoleAdd',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this)
    }
  },
  methods: {
    /**
     * 处理显示
     */
    handleVisible() {
      const that = this
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
      request(ROLE + '/add', METHOD.POST, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.confirmLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          that.$parent.getList()
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
    }
  }
}
</script>

<style scoped lang="less">
</style>