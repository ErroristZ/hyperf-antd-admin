<template>
  <a-modal title="分配权限" :maskClosable="false" :visible="visible" :confirm-loading="confirmLoading" @ok="handleOk" @cancel="handleCancel">
    <a-spin :spinning="dataLoading" :delay="500">
      <a-tree
        v-model="checkedKeys"
        :expanded-keys="expandedKeys"
        :auto-expand-parent="false"
        :tree-data="treeData"
        :checkable="true"
        :replace-fields="{children:'children', key:'id', value: 'menuId', title: 'name'}"
        @expand="onExpand"
        @check="onCheck"
      />
    </a-spin>
  </a-modal>
</template>

<script>
import { makeTree } from '../../../utils/util'
import { ROLE } from '@/services/api'
import { request, METHOD } from '@/utils/request'

export default {
  name: 'SystemRoleAllotPermissions',
  data() {
    return {
      visible: false,
      dataLoading: false,
      confirmLoading: false,
      id: '',
      checkedKeys: [],
      halfCheckedKeys: [],
      expandedKeys: [],
      treeData: []
    }
  },
  methods: {
    /**
     * 处理显示
     * @param id
     */
    handleVisible(id) {
      const that = this
      that.visible = true
      that.id = id
      that.dataLoading = true
      that.loadData()
    },
    /**
     * 处理隐藏
     */
    handleCancel() {
      const that = this
      that.visible = false
      that.confirmLoading = false
      that.dataLoading = false
      that.checkedKeys = []
      that.halfCheckedKeys = []
    },
    /**
     * 加载数据
     */
    loadData() {
      const that = this
      request(ROLE + '/allotPermissions?roleId=' + that.id, METHOD.GET)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.dataLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          const expandedKeys = []
          result.data.data.menu.forEach(function (v) {
            expandedKeys.push(v.id)
          })
          that.expandedKeys = expandedKeys
          that.treeData = makeTree(result.data.data.menu, 'id')
          that.dataLoading = false
          const checkedKeys = []
          const halfCheckedKeys = []
          result.data.data.permissions.forEach(function (v) {
            if (v.pseudoChecked === 1) {
              halfCheckedKeys.push(v.menuId)
            } else {
              checkedKeys.push(v.menuId)
            }
          })
          that.checkedKeys = checkedKeys
          that.halfCheckedKeys = halfCheckedKeys
        })
        .catch(function (error) {
          that.$message.error(error.response.data, 3)
          that.dataLoading = false
        })
    },
    /**
     * 处理确定
     */
    handleOk(e) {
      const that = this
      e.preventDefault()
      that.confirmLoading = true
      that.handleSend()
    },
    /**
     * 处理展开收起
     * @param expandedKeys
     */
    onExpand(expandedKeys) {
      const that = this
      that.expandedKeys = expandedKeys
    },
    /**
     * 处理选中
     */
    onCheck(checkedKeys, e) {
      const that = this
      that.halfCheckedKeys = e.halfCheckedKeys
    },
    /**
     * 处理提交
     */
    handleSend() {
      const that = this
      const permissionsData = []
      that.checkedKeys.forEach(function (v) {
        var objPush = {
          menuId: v,
          pseudoChecked: 2
        }
        permissionsData.push(objPush)
      })
      that.halfCheckedKeys.forEach(function (v) {
        var objPush = {
          menuId: v,
          pseudoChecked: 1
        }
        permissionsData.push(objPush)
      })
      const sendData = {
        permissionsData: permissionsData,
        roleId: that.id
      }
      request(ROLE + '/setRolePermissions', METHOD.POST, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.confirmLoading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 3)
          setTimeout(function () {
            that.handleCancel()
          }, 1000)
        })
        .catch(function (error) {
          that.confirmLoading = false
          that.$message.error(error.response.data, 3)
        })
    }
  }
}
</script>

<style scoped lang="less">
</style>