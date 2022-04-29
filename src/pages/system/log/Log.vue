<template>
  <div class="table" ref="table">
    <advance-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      rowKey="id"
      @refresh="onRefresh"
      :format-conditions="true"
      @reset="onReset"
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
      <template v-slot:tool></template>
    </advance-table>
    <watermark ref="Watermark"></watermark>
  </div>
</template>

<script>
import AdvanceTable from '@/components/table/advance/AdvanceTable'
import { Log } from '@/services/api'
import { request, METHOD } from '@/utils/request'
import { dateFormat } from '../../../utils/util'
import Watermark from '../../components/Watermark'

export default {
  name: 'SystemLog',
  components: { AdvanceTable, Watermark },
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
          title: '操作人ID',
          dataIndex: 'user_id'
        },
        {
          title: '操作人名称',
          dataIndex: 'user_name'
        },
        {
          title: '请求路径',
          dataIndex: 'url'
        },
        {
          title: '参数',
          dataIndex: 'content'
        },
        {
          title: '操作时间',
          dataIndex: 'created_at'
        }
      ],
      watermarkParams: {
        modalNames: [],
        columnsName: 'columns'
      }
    }
  },
  authorize: {
    //权限校验注入设置
    getList: 'SysLogQuery'
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
     * 获取列表
     */
    getList() {
      const that = this
      that.loading = true
      const sendData = that.conditions
      sendData.page = that.page
      sendData.limit = that.limit
      request(Log + '/list', METHOD.GET, sendData)
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