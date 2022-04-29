<template>
  <a-modal
    title="个人设置"
    width="800px"
    :maskClosable="false"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-spin :spinning="dataLoading" :delay="100">
      <a-form :form="form" class="form">
        <div class="select-root" ref="selectRoot"></div>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="真实姓名">
              <a-input
                autocomplete="off"
                v-decorator="['realName', {rules: [{ required: true, message: '真实姓名不能为空', whitespace: true}]}]"
                placeholder="请输入真实姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="手机号">
              <a-input
                autocomplete="off"
                v-decorator="['phone', {rules: [{ required: true, pattern: /^(13|14|15|16|17|18|19)[\d]{9}$/, message: '请输入正确的手机号', whitespace: true}]}]"
                placeholder="请输入手机号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="密码">
              <a-input autocomplete="off" placeholder="不修改密码请留空" type="password" v-decorator="['password']" />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="头像" style="margin-bottom: 0;" :required="true">
              <a-upload
                name="file"
                list-type="picture-card"
                class="avatar-uploader"
                :show-upload-list="false"
                :before-upload="beforeUpload"
                v-decorator="['avatar', validateRules.avatar]"
                :disabled="uploadLoading"
              >
                <img v-if="avatar" :src="avatar" alt="avatar" width="80" height="80" />
                <div v-else>
                  <a-icon :type="uploadLoading ? 'loading' : 'plus'" />
                  <div class="ant-upload-text">Upload</div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
  </a-modal>
</template>

<script>
import { delObjEmptyVal, fileToBase64 } from '../utils/util'
import { PERSONAL_SETTING, UPLOAD_PIC } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { logout } from '@/services/user'

export default {
  name: 'PersonalSetting',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      dataLoading: false,
      avatar: '',
      uploadLoading: false,
      validateRules: {
        // 自定义校验
        avatar: {
          rules: [
            {
              validator: (rule, value, callback) => {
                if (!value) {
                  callback('请上传头像')
                }
                callback()
              }
            }
          ]
        }
      }
    }
  },
  methods: {
    /**
     * 处理显示
     */
    handleVisible() {
      var that = this
      that.visible = true
      that.dataLoading = true
      that.loadData()
    },
    /**
     * 处理隐藏
     */
    handleCancel() {
      var that = this
      that.confirmLoading = false
      that.uploadLoading = false
      that.visible = false
      that.resetForm()
    },
    /**
     * 上传前验证
     * @param file
     */
    beforeUpload(file) {
      var that = this
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
      if (!isJpgOrPng) {
        that.$message.error('只能上传JPG格式的文件')
        return false
      }
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        that.$message.error('图片必须小于2MB')
        return false
      }
      if (that.uploadLoading) {
        return false
      }
      that.uploadLoading = true
      var formData = new FormData()
      formData.append('file', file)
      request(UPLOAD_PIC, METHOD.POST, formData)
        .then(function (result) {
          if (result.data.code !== 0) {
            that.uploadLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.form.setFieldsValue({
            avatar: result.data.data.filePath
          })
          fileToBase64(file, function (imgBase64) {
            that.avatar = imgBase64
            that.uploadLoading = false
          })
        })
        .catch(function (error) {
          that.uploadLoading = false
          that.avatar = ''
          that.form.setFieldsValue({
            avatar: ''
          })
          that.$message.error(error.response.data, 3)
        })
      return false
    },
    /**
     * 处理开关
     * @param checked
     * @param e
     */
    handleSwitch(checked, e) {
      var that = this
      var name = e.currentTarget.dataset.name
      if (name === 'status') {
        that.status = checked ? 1 : 2
      }
    },
    /**
     * 处理确定
     */
    handleOk(e) {
      var that = this
      e.preventDefault()
      if (that.uploadLoading) {
        return false
      }
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
      var that = this
      var sendData = delObjEmptyVal(that.form.getFieldsValue())
      request(PERSONAL_SETTING, METHOD.PUT, sendData)
        .then(function (result) {
          if (result.data.code !== 0) {
            that.confirmLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          setTimeout(function () {
            that.handleCancel()
            logout()
            that.$router.push('/login')
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
      var that = this
      that.avatar = '' //头像
      that.form.resetFields()
    },
    /**
     * 加载数据
     */
    loadData() {
      var that = this
      request(PERSONAL_SETTING, METHOD.GET, {})
        .then(function (result) {
          if (result.data.code !== 0) {
            that.dataLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.dataLoading = false
          that.form.setFieldsValue({
            realName: result.data.data.realName,
            phone: result.data.data.phone,
            avatar: result.data.data.avatar
          })
          that.avatar = result.data.data.avatar
        })
        .catch(function (error) {
          that.dataLoading = false
          that.$message.error(error.response.data, 3)
        })
    }
  }
}
</script>

<style scoped>
</style>