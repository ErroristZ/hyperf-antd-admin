<template>
  <a-modal
    title="编辑用户"
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
              <a-input v-show="false" autocomplete="off" v-decorator="['id']" />
              <a-input
                autocomplete="off"
                v-decorator="['nickname', {rules: [{ required: true, message: '真实姓名不能为空', whitespace: true}]}]"
                placeholder="请输入真实姓名"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="手机号">
              <a-input
                autocomplete="off"
                v-decorator="['mobile', {rules: [{ required: true, pattern: /^(13|14|15|16|17|18|19)[\d]{9}$/, message: '请输入正确的手机号', whitespace: true}]}]"
                placeholder="请输入手机号"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="用户名">
              <a-input
                autocomplete="off"
                placeholder="请输入用户名"
                v-decorator="['username', {rules: [{ required: true, message: '用户名不能为空', whitespace: true}]}]"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="密码">
              <a-input autocomplete="off" placeholder="不修改密码请留空" type="password" v-decorator="['password']" />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="账号">
              <a-input
                autocomplete="off"
                v-decorator="['name', {rules: [{ required: true, message: '账号不能为空', whitespace: true}]}]"
                placeholder="请输入账号"
              />
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="邮箱">
              <a-input
                autocomplete="off"
                v-decorator="['email', {rules: [{ required: true, pattern: /^(13|14|15|16|17|18|19)[\d]{9}$/, message: '请输入正确的邮箱', whitespace: true}]}]"
                placeholder="请输入邮箱"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 22}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="职业">
              <a-input
                autocomplete="off"
                v-decorator="['position', {rules: [{ required: true, message: '职业不能为空', whitespace: true}]}]"
                placeholder="请输入职业"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="角色">
              <a-select
                v-decorator="['roleIds',{rules: [{ required: true, message: '至少选择一个角色', type: 'array'}]}]"
                mode="multiple"
                placeholder="请选择角色"
                :get-popup-container="() => $refs.selectRoot"
              >
                <a-select-option v-for="v in roleData" :key="v.id" :value="v.id">{{v.name}}</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
            <a-form-item label="状态" :required="true">
              <a-switch
                data-name="status"
                checked-children="启用"
                un-checked-children="禁用"
                :checked="status === 1 ? true : false"
                @change="handleSwitch"
              />
            </a-form-item>
          </a-col>
        </a-row>
        <a-row class="form-row">
          <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
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
import { delObjEmptyVal, fileToBase64 } from '../../../utils/util'
import { USER, ROLE, UPLOAD_PIC } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export default {
  name: 'SystemUserEdit',
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      dataLoading: false,
      id: '',
      roleIds: [],
      avatar: '',
      roleData: [],
      uploadLoading: false,
      status: 1, //状态
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
     * @param record
     */
    handleVisible(record) {
      const that = this
      that.visible = true
      that.id = record.id
      if (that.roleData.length <= 0) {
        that.loadRole()
      }
      that.dataLoading = true
      that.loadData()
    },
    /**
     * 处理隐藏
     */
    handleCancel() {
      const that = this
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
      const that = this
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
      const formData = new FormData()
      formData.append('file', file)
      request(UPLOAD_PIC, METHOD.POST, formData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.uploadLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.form.setFieldsValue({
            avatar: result.data.data.url
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
            avatar: undefined
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
      const that = this
      const name = e.currentTarget.dataset.name
      if (name === 'status') {
        that.status = checked ? 1 : 2
      }
    },
    /**
     * 处理确定
     */
    handleOk(e) {
      const that = this
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
      const that = this
      const sendData = delObjEmptyVal(that.form.getFieldsValue())
      sendData.status = that.status
      sendData.id = that.id
      request(USER + '/update', METHOD.PUT, sendData)
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
      that.status = 1 //状态
      that.avatar = '' //头像
      that.form.resetFields()
    },
    /**
     * 加载角色
     */
    loadRole() {
      const that = this
      const sendData = {
        page: 1,
        limit: 1000
      }
      request(ROLE + '/list', METHOD.GET, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.$message.error(result.data.message, 3)
            return false
          }
          that.roleData = result.data.data.list
        })
        .catch(function (error) {
          that.$message.error(error.response.data, 3)
          that.loading = false
        })
    },
    /**
     * 加载数据
     */
    loadData() {
      const that = this
      request(USER + '/details?id=' + that.id, METHOD.GET, {})
        .then(function (result) {
          if (result.data.code !== 200) {
            that.dataLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.form.setFieldsValue({
            id: result.data.data.id,
            nickname: result.data.data.nickname,
            mobile: result.data.data.mobile,
            username: result.data.data.username,
            roleIds: result.data.data.roleIds,
            avatar: result.data.data.avatar,
            name: result.data.data.name,
            email: result.data.data.email,
            position: result.data.data.position
          })
          that.status = result.data.data.status
          that.avatar = result.data.data.avatar
          that.dataLoading = false
        })
        .catch(function (error) {
          that.dataLoading = false
          that.$message.error(error.response.data, 3)
        })
    }
  }
}
</script>

<style scoped lang="less">
.form {
  .form-row {
    margin: 0 -8px;
  }

  .ant-col-md-12,
  .ant-col-sm-24,
  .ant-col-lg-6,
  .ant-col-lg-8,
  .ant-col-lg-10,
  .ant-col-xl-8,
  .ant-col-xl-6 {
    padding: 0 8px;
  }
}
</style>