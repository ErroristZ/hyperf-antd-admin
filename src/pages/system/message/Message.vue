<template>
        <div class="table" ref="table">
                <advance-table
                        :columns="columns"
                        :data-source="dataSource"
                        :loading="loading"
                        rowKey="messageId"
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
                                        <a-button type="primary" @click="add()" v-auth="`SysMessageAdd`">新增
                                        </a-button>
                                </a-space>
                        </template>
                        <div slot="J_content" slot-scope="{text}">
                                <a-tooltip>
                                        <template v-if="text.length > 19" slot="title">{{text}}</template>
                                        <div :style="{width: '350px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', cursor: 'pointer'}">
                                                {{text}}
                                        </div>
                                </a-tooltip>
                        </div>
                        <div slot="J_createUser" slot-scope="{text}">
                                {{formatUser[text] ? formatUser[text].username : ''}}
                        </div>
                        <div slot="J_messageUser" slot-scope="{text}">
                                <span v-for="(v, k) in text" :key="k">
                                        <a-tag v-if="formatUser[v]">{{formatUser[v].username}}</a-tag>
                                </span>
                        </div>
                        <div slot="J_type" slot-scope="{text}">
                                <template v-if="text === 1">消息</template>
                                <template v-if="text === 2">通知</template>
                                <template v-if="text === 3">待办</template>
                        </div>
                        <div slot="J_createTime" slot-scope="{text}">
                                <div v-text="dateFormat(text)"></div>
                        </div>
                        <div slot="J_updateTime" slot-scope="{text}">
                                <div v-text="dateFormat(text)"></div>
                        </div>
                        <div slot="J_status" slot-scope="{text, record, index}">
                                <a-switch data-name="status" :data-id="record.roleId" :data-index="index"
                                          checked-children="启用" un-checked-children="禁用"
                                          :checked="text === 1 ? true : false" @change="handleSwitch"/>
                        </div>
                        <div slot="J_operation" slot-scope="{text, record}">
                                <a-popconfirm
                                        title="确定要删除吗？"
                                        placement="topRight"
                                        @confirm="del(record)"
                                >
                                        <a v-auth="`SysMessageDelete`">
                                                <a-icon type="delete"/>
                                                删除
                                        </a>
                                </a-popconfirm>
                        </div>
                </advance-table>
                <watermark ref="Watermark"></watermark>
                <system-message-add ref="SystemMessageAdd"></system-message-add>
        </div>
</template>

<script>
        import AdvanceTable from '@/components/table/advance/AdvanceTable';
        import Watermark from '../../components/Watermark';
        import SystemMessageAdd from './Add';
        import {MESSAGE, USER} from '@/services/api';
        import {request, METHOD} from '@/utils/request';
        import {dateFormat} from '../../../utils/util';

        export default {
                name: "SystemMessage",
                components: {AdvanceTable, Watermark, SystemMessageAdd},
                data() {
                        return {
                                loading: false,
                                page: 1,
                                limit: 10,
                                total: 0,
                                dataSource: [],
                                conditions: {},
                                formatUser: {},
                                columns: [
                                        {
                                                title: '标题',
                                                dataIndex: 'title',
                                                searchAble: true
                                        },
                                        {
                                                title: '内容',
                                                dataIndex: 'content',
                                                allowAddSearch: false,
                                                width: '350px',
                                                scopedSlots: {customRender: 'J_content'}
                                        },
                                        {
                                                title: '创建者',
                                                dataIndex: 'userId',
                                                allowAddSearch: false,
                                                scopedSlots: {customRender: 'J_createUser'}
                                        },
                                        {
                                                title: '人员',
                                                dataIndex: 'messageUserId',
                                                allowAddSearch: false,
                                                scopedSlots: {customRender: 'J_messageUser'}
                                        },
                                        {
                                                title: '类型',
                                                dataIndex: 'type',
                                                searchAble: true,
                                                width: '200px',
                                                scopedSlots: {customRender: 'J_type'},
                                                dataType: 'select',
                                                search: {
                                                        selectOptions: [
                                                                {title: '消息', value: 1},
                                                                {title: '通知', value: 2},
                                                                {title: '待办', value: 3}
                                                        ]
                                                }
                                        },
                                        {
                                                title: '创建时间',
                                                dataIndex: 'createTime',
                                                dataType: 'datetimeRange',
                                                searchAble: true,
                                                scopedSlots: {customRender: 'J_createTime'}
                                        },
                                        {
                                                title: '操作',
                                                scopedSlots: {customRender: 'J_operation'},
                                                allowAddSearch: false
                                        }
                                ],
                                watermarkParams: {
                                        modalNames: ['SystemMessageAdd'],
                                        columnsName: 'columns'
                                }
                        }
                },
                authorize: {//权限校验注入设置
                        add: 'SysMessageAdd',
                        del: 'SysMessageDelete',
                },
                created() {
                        const that = this;
                        that.getUser();
                        that.getList();
                        that.getColumns();
                },
                mounted() {
                        const that = this;
                        that.$refs.Watermark.set(null, null, that.$refs.table, that);
                },
                methods: {
                        /**
                         * 获取列表
                         */
                        getList() {
                                const that = this;
                                that.loading = true;
                                const sendData = that.conditions;
                                sendData.page = that.page;
                                sendData.limit = that.limit;
                                request(MESSAGE, METHOD.GET, sendData).then(function (result) {
                                        if (result.data.code !== 0) {
                                                that.loading = false;
                                                that.$message.error(result.data.message, 3);
                                                return false;
                                        }
                                        const {list, page, limit, total} = result.data.data;
                                        that.dataSource = list;
                                        that.page = page;
                                        that.total = total;
                                        that.limit = limit;
                                        that.loading = false;
                                }).catch(function (error) {
                                        that.dataSource = [];
                                        that.total = 0;
                                        that.$message.error(error.response.data, 3);
                                        that.loading = false;
                                });
                        },
                        /**
                         * 获取用户
                         */
                        getUser() {
                                const that = this;
                                const sendData = {
                                        queryType: 1
                                };
                                request(USER, METHOD.GET, sendData).then(function (result) {
                                        if (result.data.code !== 0) {
                                                that.loading = false;
                                                that.$message.error(result.data.message, 3);
                                                return false;
                                        }
                                        const formatUser = {};
                                        result.data.data.forEach((v) => {
                                                formatUser[v.userId] = v;
                                        });
                                        that.formatUser = formatUser;
                                }).catch(function (error) {
                                        that.$message.error(error.response.data, 3);
                                });
                        },
                        /**
                         * 新增
                         */
                        add() {
                                const that = this;
                                that.$refs.SystemMessageAdd.handleVisible();
                        },
                        /**
                         * 分页改变
                         * @param page
                         */
                        onPageChange(page) {
                                const that = this;
                                that.page = page;
                                that.getList();
                        },
                        /**
                         * 每页条数改变
                         * @param current
                         * @param limit
                         */
                        onSizeChange(current, limit) {
                                const that = this;
                                that.page = 1;
                                that.limit = limit;
                                that.getList();
                        },
                        /**
                         * 搜索
                         * @param conditions
                         */
                        onSearch(conditions) {
                                const that = this;
                                that.page = 1
                                that.conditions = conditions;
                                that.getList();
                        },
                        /**
                         * 表格刷新
                         * @param conditions
                         */
                        onRefresh(conditions) {
                                const that = this;
                                that.conditions = conditions;
                                that.getList();
                        },
                        /**
                         * 重置列配置
                         * @param conditions
                         */
                        onReset(conditions) {
                                const that = this;
                                that.conditions = conditions;
                                that.getList();
                        },
                        /**
                         * 保存列配置
                         * @param conditions
                         */
                        onSave(conditions) {
                                const that = this;
                                localStorage.setItem('SystemMessageColumns', JSON.stringify(conditions));
                                that.$message.success('保存成功');
                        },
                        /**
                         * 获取列配置
                         */
                        getColumns() {
                                var that = this;
                                var cacheColumns = localStorage.getItem('SystemMessageColumns');
                                if (cacheColumns) {
                                        that.columns = JSON.parse(cacheColumns);
                                }
                        },
                        /**
                         * 格式化时间戳
                         * @param timestamp
                         */
                        dateFormat(timestamp) {
                                return dateFormat(timestamp, 'Y-m-d H:i:s');
                        },
                        /**
                         * 删除
                         * @param record
                         */
                        del(record) {
                                var that = this;
                                that.loading = true;
                                request(MESSAGE + '/' + record.messageId, METHOD.DELETE).then(function (result) {
                                        if (result.data.code !== 0) {
                                                that.loading = false;
                                                that.$message.error(result.data.message, 3);
                                                return false;
                                        }
                                        that.$message.success(result.data.message, 1);
                                        that.getList();
                                        const sendData = {
                                                cmd: "message.resetNotReadTotal",
                                                data: {
                                                        userIds: record.messageUserId
                                                }
                                        };
                                        window.socketNotice.send(JSON.stringify(sendData));
                                }).catch(function (error) {
                                        that.$message.error(error.response.data, 3);
                                        that.loading = false;
                                });
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