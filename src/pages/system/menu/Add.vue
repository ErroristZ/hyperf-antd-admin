<template>
  <a-modal
    title="新增菜单"
    width="800px"
    :maskClosable="false"
    :visible="visible"
    :confirm-loading="confirmLoading"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <a-form :form="form" class="form">
      <div class="select-root" ref="selectRoot"></div>
      <a-row class="form-row">
        <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="菜单名称">
            <a-input
              autocomplete="off"
              v-decorator="['name', {rules: [{ required: true, message: '菜单名称不能为空', whitespace: true}]}]"
              placeholder="请输入菜单名称"
            />
          </a-form-item>
        </a-col>
        <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="上级菜单">
            <a-tree-select
              :show-search="true"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :tree-data="dataSource"
              :replace-fields="{children:'children', key:'id', value: 'id', title: 'name'}"
              placeholder="顶级菜单"
              :allow-clear="true"
              tree-node-filter-prop="title"
              tree-default-expand-all
              :get-popup-container="() => $refs.selectRoot"
              v-decorator="['parent_id']"
            ></a-tree-select>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row">
        <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="菜单路由">
            <a-input autocomplete="off" v-decorator="['route']" placeholder="请输入菜单路由" />
          </a-form-item>
        </a-col>
        <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="请求地址或页面路径">
            <a-input autocomplete="off" v-decorator="['path']" placeholder="请输入菜单路径" />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row">
        <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="菜单图标">
            <a-input autocomplete="off" v-decorator="['icon']" placeholder="请输入菜单图标" />
          </a-form-item>
        </a-col>
        <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="权限辨别">
            <a-input
              autocomplete="off"
              v-decorator="['description', {rules: [{ required: true, message: '权限辨别不能为空', whitespace: true}]}]"
              placeholder="请输入权限辨别"
            />
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row">
        <a-col :xl="{span: 10}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="排序">
            <a-input autocomplete="autocomplete" v-decorator="['sort']" placeholder="请输入排序" />
          </a-form-item>
        </a-col>
        <a-col :xl="{span: 10, offset: 2}" :lg="{span: 12}" :md="{span: 12}" :sm="24">
          <a-form-item label="类型">
            <a-radio-group name="menuType" v-model="menuType" @change="handleRadio">
              <a-radio :value="1">菜单</a-radio>
              <a-radio :value="2">按钮</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
      <a-row class="form-row">
        <a-col :sm="24">
          <a-form-item label="请求方式">
            <a-radio-group name="method" v-model="method" @change="handleRadio">
              <a-radio value="GET">GET</a-radio>
              <a-radio value="POST">POST</a-radio>
              <a-radio value="PUT">PUT</a-radio>
              <a-radio value="DELETE">DELETE</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script>
import { delObjEmptyVal, isJsonStr } from '../../../utils/util'
import { MENU } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export default {
  name: 'SystemMenuAdd',
  props: {
    dataSource: Array
  },
  data() {
    return {
      visible: false,
      confirmLoading: false,
      form: this.$form.createForm(this),
      menuType: 1, //菜单类型
      method: 'get', //请求方式
      validateRules: {
        // 自定义校验
        urlParams: {
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && isJsonStr(value) === false) {
                  callback('参数不合法，请填写有效的json字符串')
                }
                callback()
              }
            }
          ]
        },
        pathParams: {
          rules: [
            {
              validator: (rule, value, callback) => {
                if (value && isJsonStr(value) === false) {
                  callback('参数不合法，请填写有效的json字符串')
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
     * @param parent_id
     */
    handleVisible(parent_id) {
      const that = this
      that.visible = true
      that.$nextTick(function () {
        that.form.setFieldsValue({
          parent_id: parent_id
        })
      })
    },
    /**
     * 处理隐藏
     */
    handleCancel() {
      const that = this
      that.confirmLoading = false
      that.visible = false
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
     * 处理单选
     * @param e
     */
    handleRadio(e) {
      const that = this
      const name = e.target.name
      if (name === 'menuType') {
        that.menuType = e.target.value
      } else if (name === 'method') {
        that.method = e.target.value
      }
    },
    /**
     * 处理提交
     */
    handleSend() {
      const that = this
      const sendData = delObjEmptyVal(that.form.getFieldsValue())
      if (sendData.urlParams) {
        sendData.urlParams = JSON.parse(sendData.urlParams)
      }
      if (sendData.pathParams) {
        sendData.pathParams = JSON.parse(sendData.pathParams)
      }
      sendData.menuType = that.menuType
      sendData.method = that.method
      request(MENU + '/add', METHOD.POST, sendData)
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
      that.menuType = 1 //菜单类型
      that.method = 'get' //请求方式
      that.form.resetFields()
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