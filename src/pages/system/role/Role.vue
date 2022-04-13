<template>
  <div class="table" ref="table">
    <advance-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      rowKey="id"
      @search="onSearch"
      @refresh="onRefresh"
      :format-conditions="true"
      @reset="onReset"
      @save="onSave"
      :show-save-columns="true"
      :pagination="{
                                current: page,
                                pageSize: limit,
                                total: total,
                                showSizeChanger: true,
                                showLessItems: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，总计 ${total} 条`,
                                onChange: onPageChange,
                                onShowSizeChange: onSizeChange,
                        }"
      :scroll="{ x: 'max-content'}"
    >
      <template v-slot:tool>
        <a-space>
          <a-button type="primary" @click="add()" v-auth="`SysRoleAdd`">新增</a-button>
        </a-space>
      </template>
      <div slot="J_operation" slot-scope="{text, record}">
        <a style="margin-right: 8px" @click="edit(record)" v-auth="`SysRoleEdit`">
          <a-icon type="edit" />编辑
        </a>
        <a style="margin-right: 8px" @click="allotPermissions(record)" v-auth="`SysRoleAllotPermissions`">
          <a-icon type="key" />分配权限
        </a>
        <a-popconfirm title="确定要删除吗？" placement="topRight" @confirm="del(record)">
          <a v-auth="`SysRoleDelete`">
            <a-icon type="delete" />删除
          </a>
        </a-popconfirm>
      </div>
    </advance-table>
    <system-role-add ref="SystemRoleAdd"></system-role-add>
    <system-role-edit ref="SystemRoleEdit"></system-role-edit>
    <system-role-allot-permissions ref="SystemRoleAllotPermissions"></system-role-allot-permissions>
    <watermark ref="Watermark"></watermark>
  </div>
</template>

<script>
import AdvanceTable from '@/components/table/advance/AdvanceTable'
import SystemRoleAdd from './Add'
import SystemRoleEdit from './Edit'
import SystemRoleAllotPermissions from './AllotPermissions'
import { ROLE } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { dateFormat } from '../../../utils/util'
import Watermark from '../../components/Watermark'

export default {
  name: 'SystemRole',
  components: { AdvanceTable, SystemRoleAdd, SystemRoleEdit, SystemRoleAllotPermissions, Watermark },
  data() {
    return {
      loading: false,
      page: 1,
      limit: 10,
      total: 0,
      dataSource: [],
      conditions: {},
      columns: [
        {
          title: '序号',
          dataIndex: 'id'
        },
        {
          title: '角色名称',
          dataIndex: 'name',
          searchAble: true
        },
        {
          title: '描述',
          dataIndex: 'description'
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'J_operation' },
          allowAddSearch: false
        }
      ],
      watermarkParams: {
        modalNames: ['SystemRoleAdd', 'SystemRoleEdit'],
        columnsName: 'columns'
      }
    }
  },
  authorize: {
    //权限校验注入设置
    add: 'SysRoleAdd',
    edit: 'SysRoleEdit',
    del: 'SysRoleDelete',
    editStatus: 'SysRoleEdit',
    allotPermissions: 'SysRoleAllotPermissions'
  },
  created() {
    const that = this
    that.getList()
    that.getColumns()
  },
  mounted() {
    const that = this
    that.$refs.Watermark.set(null, null, that.$refs.table, that)
  },
  methods: {
    /**
     * 获取列表
     */
    getList() {
      const that = this
      that.loading = true
      const sendData = that.conditions
      sendData.page = that.page
      sendData.limit = that.limit
      request(ROLE + '/list', METHOD.GET, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          const { list, currentPage, perPage, total } = result.data.data
          that.dataSource = list
          that.page = currentPage
          that.total = total
          that.limit = perPage
          that.loading = false
        })
        .catch(function () {
          that.dataSource = []
          that.total = 0
          that.loading = false
        })
    },
    /**
     * 获取列配置
     */
    getColumns() {
      const that = this
      const cacheColumns = localStorage.getItem('SystemRoleColumns')
      if (cacheColumns) {
        that.columns = JSON.parse(cacheColumns)
      }
    },
    /**
     * 表格刷新
     * @param conditions
     */
    onRefresh(conditions) {
      const that = this
      that.conditions = conditions
      that.getList()
    },
    /**
     * 重置列配置
     * @param conditions
     */
    onReset(conditions) {
      const that = this
      that.conditions = conditions
      that.getList()
    },
    /**
     * 保存列配置
     * @param conditions
     */
    onSave(conditions) {
      const that = this
      localStorage.setItem('SystemRoleColumns', JSON.stringify(conditions))
      that.$message.success('保存成功')
    },
    /**
     * 搜索
     * @param conditions
     */
    onSearch(conditions) {
      const that = this
      that.page = 1
      that.conditions = conditions
      that.getList()
    },
    /**
     * 分页改变
     * @param page
     */
    onPageChange(page) {
      const that = this
      that.page = page
      that.getList()
    },
    /**
     * 每页条数改变
     * @param current
     * @param limit
     */
    onSizeChange(current, limit) {
      const that = this
      that.page = 1
      that.limit = limit
      that.getList()
    },
    /**
     * 格式化时间戳
     * @param timestamp
     */
    dateFormat(timestamp) {
      return dateFormat(timestamp, 'Y-m-d H:i:s')
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
        that.editStatus(e.currentTarget.dataset.id, e.currentTarget.dataset.index, checked ? 1 : 2)
      }
    },
    /**
     * 新增
     */
    add() {
      const that = this
      that.$refs.SystemRoleAdd.handleVisible()
    },
    /**
     * 编辑
     * @param record
     */
    edit(record) {
      const that = this
      that.$refs.SystemRoleEdit.handleVisible(record)
    },
    /**
     * 编辑状态
     * @param id
     * @param index
     * @param status
     */
    editStatus(id, index, status) {
      const that = this
      that.loading = true
      const sendData = { status: status }
      request(ROLE + '/' + id + '/status', METHOD.PUT, sendData)
        .then(function (result) {
          if (result.data.code !== 0) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          that.$set(that.dataSource[index], 'status', status)
          if (that.conditions.status) {
            that.getList()
          } else {
            setTimeout(function () {
              that.loading = false
            }, 300)
          }
        })
        .catch(function (error) {
          that.$message.error(error.response.data, 3)
          that.loading = false
        })
    },
    /**
     * 分配权限
     * @param record
     */
    allotPermissions(record) {
      const that = this
      that.$refs.SystemRoleAllotPermissions.handleVisible(record.id)
    },
    /**
     * 删除
     * @param record
     */
    del(record) {
      const that = this
      that.loading = true
      request(ROLE + '/delete?id=' + record.id, METHOD.DELETE)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          that.getList()
        })
        .catch(function (error) {
          that.$message.error(error.response.data, 3)
          that.loading = false
        })
    }
  }
}
</script>

<style scoped lang="less">
.table {
  background-color: @base-bg-color;
  padding: 24px;
}

.table::-webkit-scrollbar {
  display: none;
}
</style>