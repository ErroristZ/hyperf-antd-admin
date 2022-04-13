<template>
  <div class="table" ref="table">
    <advance-table
      :columns="columns"
      :data-source="dataSource"
      title="菜单管理"
      :loading="loading"
      rowKey="id"
      @search="onSearch"
      @refresh="onRefresh"
      :format-conditions="true"
      @reset="onReset"
      @save="onSave"
      :show-save-columns="true"
      @columnsVisibleChange="onColumnsVisibleChange"
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
          <a-button type="primary" @click="add" v-auth="`SysUserAdd`">新增</a-button>
        </a-space>
      </template>
      <div slot="J_avatar" slot-scope="{text, record, index}">
        <a-avatar :id="'J_avatar_' + index" :src="text" size="small" style="cursor:pointer;" />
      </div>
      <div slot="J_roleIds" slot-scope="{text}">
        <span v-for="(v, i) in text" :key="i">
          <a-tag v-if="v">{{v}}</a-tag>
        </span>
      </div>
      <div slot="J_createTime" slot-scope="{text}">
        <div v-text="dateFormat(text)"></div>
      </div>
      <div slot="J_updateTime" slot-scope="{text}">
        <div v-text="dateFormat(text)"></div>
      </div>
      <div slot="J_lastTime" slot-scope="{text}">
        <div v-text="dateFormat(text)"></div>
      </div>
      <div slot="J_status" slot-scope="{text, record, index}">
        <a-switch
          data-name="status"
          :data-id="record.id"
          :data-index="index"
          checked-children="启用"
          un-checked-children="禁用"
          :checked="text === 1 ? true : false"
          @change="handleSwitch"
        />
      </div>
      <div slot="J_operation" slot-scope="{text, record}">
        <a style="margin-right: 8px" @click="edit(record)" v-auth="`SysUserEdit`">
          <a-icon type="edit" />编辑
        </a>
      </div>
    </advance-table>
    <system-user-add ref="SystemUserAdd"></system-user-add>
    <system-user-edit ref="SystemUserEdit"></system-user-edit>
    <watermark ref="Watermark"></watermark>
  </div>
</template>

<script>
import AdvanceTable from '@/components/table/advance/AdvanceTable'
import SystemUserAdd from './Add'
import SystemUserEdit from './Edit'
import { USER, ROLE } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { dateFormat } from '../../../utils/util'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import Watermark from '../../components/Watermark'

export default {
  name: 'SystemUser',
  components: { AdvanceTable, SystemUserAdd, SystemUserEdit, Watermark },
  data() {
    return {
      loading: false,
      page: 1,
      limit: 10,
      total: 0,
      dataSource: [],
      conditions: {},
      roleData: [],
      roleIdName: {},
      columns: [
        {
          title: '序号',
          dataIndex: 'id'
        },
        {
          title: '头像',
          dataIndex: 'avatar',
          scopedSlots: { customRender: 'J_avatar' },
          allowAddSearch: false
        },
        {
          title: '姓名',
          dataIndex: 'nickname',
          searchAble: true
        },
        {
          title: '手机号',
          dataIndex: 'mobile',
          searchAble: true
        },
        {
          title: '用户名',
          dataIndex: 'username',
          searchAble: true
        },
        {
          title: '角色',
          dataIndex: 'roleIds',
          dataType: 'select',
          searchAble: true,
          scopedSlots: { customRender: 'J_roleIds' }
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          dataType: 'datetime',
          searchAble: true,
          scopedSlots: { customRender: 'J_createTime' }
        },
        {
          title: '更新时间',
          dataIndex: 'updated_at',
          dataType: 'datetime',
          scopedSlots: { customRender: 'J_updateTime' }
        },
        {
          title: '最近登录时间',
          dataIndex: 'last_at',
          dataType: 'datetimeRange',
          scopedSlots: { customRender: 'J_lastTime' }
        },
        {
          title: '最近登录IP',
          dataIndex: 'ip',
          searchAble: false
        },
        {
          title: '状态',
          dataIndex: 'status',
          scopedSlots: { customRender: 'J_status' },
          dataType: 'select',
          searchAble: true,
          search: {
            selectOptions: [
              { title: '启用', value: 1 },
              { title: '禁用', value: 2 }
            ]
          }
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'J_operation' },
          allowAddSearch: false
        }
      ],
      watermarkParams: {
        modalNames: ['SystemUserAdd', 'SystemUserEdit'],
        columnsName: 'columns'
      }
    }
  },
  authorize: {
    //权限校验注入设置
    getList: 'SysUserQuery',
    add: 'SysUserAdd',
    edit: 'SysUserEdit',
    editStatus: 'SysUserEdit'
  },
  created() {
    const that = this
    that.getList()
    that.getColumns()
    that.loadRole()
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
      request(USER + '/list', METHOD.GET, sendData)
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
          that.onColumnsVisibleChange()
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
      const cacheColumns = localStorage.getItem('SystemUserColumns')
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
      localStorage.setItem('SystemUserColumns', JSON.stringify(conditions))
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
     * 处理开关
     * @param checked
     * @param e
     */
    handleSwitch(checked, e) {
      const that = this
      var name = e.currentTarget.dataset.name
      if (name === 'status') {
        that.editStatus(e.currentTarget.dataset.id, e.currentTarget.dataset.index, checked ? 1 : 2)
      }
    },
    /**
     * 格式化时间戳
     * @param timestamp
     */
    dateFormat(timestamp) {
      return dateFormat(timestamp, 'Y-m-d H:i:s')
    },
    /**
     * 列可见改变回调
     */
    onColumnsVisibleChange() {
      const that = this
      if (that.columns[0].visible === false) {
        return false
      }
      that.onViewer(that.dataSource.length)
    },
    /**
     * 渲染图片查看
     */
    onViewer(length) {
      const that = this
      that.$nextTick(function () {
        for (var i = 0; i < length; ++i) {
          new Viewer(document.getElementById('J_avatar_' + i))
        }
      })
    },
    /**
     * 新增
     */
    add() {
      const that = this
      that.$refs.SystemUserAdd.handleVisible()
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
          const objRoleIdName = {}
          const arrSelectOptions = []
          result.data.data.list.forEach(function (v) {
            objRoleIdName[v.id] = v.name
            arrSelectOptions.push({
              title: v.name,
              value: v.id
            })
          })
          that.roleIdName = objRoleIdName
          that.$set(that.columns[5], 'search', {
            selectOptions: arrSelectOptions,
            mode: 'multiple'
          })
          that.roleData = result.data.data.list
        })
        .catch(function () {
          that.loading = false
        })
    },
    /**
     * 编辑
     * @param record
     */
    edit(record) {
      const that = this
      that.$refs.SystemUserEdit.handleVisible(record)
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
      const sendData = {
        id: id,
        status: status
      }
      request(USER + '/status', METHOD.PUT, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
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