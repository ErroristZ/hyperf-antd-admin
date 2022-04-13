<template>
  <div class="table" ref="table">
    <advance-table
      :columns="columns"
      :data-source="dataSource"
      title="菜单管理"
      :loading="loading"
      rowKey="id"
      @refresh="onRefresh"
      :format-conditions="true"
      @reset="onReset"
      :scroll="{ x: 'max-content'}"
    >
      <template v-slot:tool>
        <a-space>
          <a-button type="primary" @click="add()" v-auth="`SysMenuAdd`">新增</a-button>
        </a-space>
      </template>
      <div slot="J_icon" slot-scope="{text}">
        <a-icon v-if="text" :type="text" />
      </div>
      <div slot="J_menuType" slot-scope="{text}">
        <a-tag v-if="text === 1" color="blue">菜单</a-tag>
        <a-tag v-if="text === 2">按钮</a-tag>
      </div>
      <div slot="J_icon" slot-scope="{text}">
        <a-icon v-if="text" :type="text" />
      </div>
      <div slot="J_menuType" slot-scope="{text}">
        <a-tag v-if="text === 1" color="blue">菜单</a-tag>
        <a-tag v-if="text === 2">按钮</a-tag>
      </div>
      <div slot="J_is_display" slot-scope="{text, record}">
        <a-switch
          data-name="status"
          :data-id="record.id"
          checked-children="启用"
          un-checked-children="禁用"
          :checked="text === 0 ? true : false"
          @change="handleSwitch"
        />
      </div>
      <div slot="J_operation" slot-scope="{text, record}">
        <a style="margin-right: 8px" @click="add(record.id)" v-auth="`SysMenuAdd`">
          <a-icon type="plus" />新增
        </a>
        <a style="margin-right: 8px" @click="edit(record.id)" v-auth="`SysMenuEdit`">
          <a-icon type="edit" />编辑
        </a>
        <a-popconfirm title="确定要删除吗？" placement="topRight" @confirm="del(record.id)">
          <a v-auth="`SysMenuDelete`">
            <a-icon type="delete" />删除
          </a>
        </a-popconfirm>
      </div>
    </advance-table>
    <system-menu-add ref="SystemMenuAdd" :data-source="dataSource"></system-menu-add>
    <system-menu-edit ref="SystemMenuEdit" :data-source="dataSource"></system-menu-edit>
    <watermark ref="Watermark"></watermark>
  </div>
</template>

<script>
import AdvanceTable from '@/components/table/advance/AdvanceTable'
import { MENU } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { makeTree } from '../../../utils/util'
import SystemMenuAdd from './Add'
import SystemMenuEdit from './Edit'
import Watermark from '../../components/Watermark'

export default {
  name: 'SystemMenu',
  components: { SystemMenuAdd, SystemMenuEdit, AdvanceTable, Watermark },
  data() {
    return {
      loading: false,
      columns: [
        {
          title: '菜单名称',
          dataIndex: 'name',
          allowAddSearch: false
        },
        {
          title: '路由',
          dataIndex: 'route',
          allowAddSearch: false
        },
        {
          title: '路径',
          dataIndex: 'path',
          allowAddSearch: false
        },
        {
          title: '权限辨别',
          dataIndex: 'description',
          allowAddSearch: false
        },
        {
          title: '请求方式',
          dataIndex: 'method',
          allowAddSearch: false
        },
        {
          title: '是否显示在菜单',
          dataIndex: 'is_display',
          scopedSlots: { customRender: 'J_is_display' },
          allowAddSearch: false
        },
        {
          title: '类型',
          dataIndex: 'menuType',
          scopedSlots: { customRender: 'J_menuType' },
          allowAddSearch: false
        },
        {
          title: '排序',
          dataIndex: 'sort',
          allowAddSearch: false
        },
        {
          title: '图标',
          dataIndex: 'icon',
          scopedSlots: { customRender: 'J_icon' },
          allowAddSearch: false
        },
        {
          title: '操作',
          scopedSlots: { customRender: 'J_operation' },
          allowAddSearch: false
        }
      ],
      watermarkParams: {
        modalNames: ['SystemMenuAdd', 'SystemMenuEdit'],
        columnsName: 'columns'
      },
      dataSource: [],
      conditions: {}
    }
  },
  authorize: {
    //权限校验注入设置
    add: 'SysMenuAdd',
    edit: 'SysMenuEdit',
    del: 'SysMenuDelete',
    editStatus: 'SysMenuEdit'
  },
  created() {
    const that = this
    that.getList()
  },
  mounted() {
    const that = this
    that.$refs.Watermark.set(null, null, that.$refs.table, that)
  },
  methods: {
    /**
     * 新增
     */
    add(id) {
      const that = this
      that.$refs.SystemMenuAdd.handleVisible(id)
    },
    /**
     * 编辑
     */
    edit(id) {
      const that = this
      that.$refs.SystemMenuEdit.handleVisible(id)
    },
    /**
     * 删除
     */
    del(id) {
      const that = this
      that.loading = true
      request(MENU + '/delete?id=' + id, METHOD.DELETE)
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
    },
    /**
     * 获取列表
     */
    getList() {
      const that = this
      that.loading = true
      request(MENU + '/list', METHOD.GET)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.dataSource = makeTree(result.data.data, 'id')
          that.loading = false
        })
        .catch(function () {
          that.dataSource = []
          that.total = 0
          that.loading = false
        })
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
        that.editStatus(e.currentTarget.dataset.id, checked ? 0 : 1)
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
     * 编辑状态
     * @param id
     * @param status
     */
    editStatus(id, is_display) {
      const that = this
      that.loading = true
      const sendData = { is_display: is_display, id: id }
      request(MENU + '/update', METHOD.PUT, sendData)
        .then(function (result) {
          if (result.data.code !== 200) {
            that.loading = false
            that.$message.error(result.data.message, 3)
            return false
          }
          that.$message.success(result.data.message, 1)
          setTimeout(function () {
            that.getList()
          }, 400)
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
</style>