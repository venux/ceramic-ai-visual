<template>
  <div class="user-list">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-input
            v-model="keyword"
            placeholder="搜索手机号/昵称"
            style="width: 280px"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
            <template #append>
              <el-button @click="handleSearch">搜索</el-button>
            </template>
          </el-input>
        </div>
      </template>

      <el-table :data="userList" stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="180" show-overflow-tooltip />
        <el-table-column prop="nickname" label="昵称" width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="plan" label="套餐" width="100">
          <template #default="{ row }">
            <el-tag :type="row.plan === 'premium' ? 'warning' : 'info'">
              {{ planLabel(row.plan) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="credits" label="额度" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '正常' : '已禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="注册时间" min-width="160">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditCredits(row)">编辑额度</el-button>
            <el-button size="small" @click="handleChangePlan(row)">切换套餐</el-button>
            <el-button
              size="small"
              :type="row.status === 'active' ? 'danger' : 'success'"
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="fetchData"
          @current-change="fetchData"
        />
      </div>
    </el-card>

    <!-- 编辑额度弹窗 -->
    <el-dialog v-model="creditsDialogVisible" title="编辑额度" width="400px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ editingUser?.nickname }}</span>
        </el-form-item>
        <el-form-item label="额度">
          <el-input-number v-model="editCredits" :min="0" :max="99999" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="creditsDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmEditCredits">确定</el-button>
      </template>
    </el-dialog>

    <!-- 切换套餐弹窗 -->
    <el-dialog v-model="planDialogVisible" title="切换套餐" width="400px">
      <el-form label-width="80px">
        <el-form-item label="用户">
          <span>{{ editingUser?.nickname }}</span>
        </el-form-item>
        <el-form-item label="套餐">
          <el-select v-model="editPlan" style="width: 100%">
            <el-option label="免费版" value="free" />
            <el-option label="基础版" value="basic" />
            <el-option label="高级版" value="premium" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="planDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="confirmChangePlan">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { AdminUser } from '@/api/modules/admin'
import {
  getUserList,
  updateUserCredits,
  updateUserPlan,
  toggleUserStatus,
} from '@/api/modules/admin'

const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const userList = ref<AdminUser[]>([])

const creditsDialogVisible = ref(false)
const planDialogVisible = ref(false)
const editingUser = ref<AdminUser | null>(null)
const editCredits = ref(0)
const editPlan = ref('free')

const planLabel = (plan: string) => {
  const map: Record<string, string> = { free: '免费版', basic: '基础版', premium: '高级版' }
  return map[plan] || plan
}

const formatTime = (t: string) => {
  if (!t) return '-'
  return new Date(t).toLocaleString('zh-CN')
}

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getUserList({ page: page.value, pageSize: pageSize.value, keyword: keyword.value })
    userList.value = res.list
    total.value = res.total
  } catch {
    userList.value = Array.from({ length: 10 }, (_, i) => ({
      id: `user_${String(i + 1).padStart(4, '0')}`,
      nickname: `用户${i + 1}`,
      phone: `138${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      plan: (['free', 'basic', 'premium'] as const)[i % 3],
      credits: Math.floor(Math.random() * 100),
      status: i === 7 ? 'disabled' as const : 'active' as const,
      createdAt: new Date(Date.now() - i * 86400000 * 3).toISOString(),
    }))
    total.value = 50
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  page.value = 1
  fetchData()
}

const handleEditCredits = (row: AdminUser) => {
  editingUser.value = row
  editCredits.value = row.credits
  creditsDialogVisible.value = true
}

const confirmEditCredits = async () => {
  if (!editingUser.value) return
  try {
    await updateUserCredits(editingUser.value.id, editCredits.value)
    ElMessage.success('额度更新成功')
    creditsDialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.success('额度更新成功（mock）')
    creditsDialogVisible.value = false
    fetchData()
  }
}

const handleChangePlan = (row: AdminUser) => {
  editingUser.value = row
  editPlan.value = row.plan
  planDialogVisible.value = true
}

const confirmChangePlan = async () => {
  if (!editingUser.value) return
  try {
    await updateUserPlan(editingUser.value.id, editPlan.value)
    ElMessage.success('套餐更新成功')
    planDialogVisible.value = false
    fetchData()
  } catch {
    ElMessage.success('套餐更新成功（mock）')
    planDialogVisible.value = false
    fetchData()
  }
}

const handleToggleStatus = async (row: AdminUser) => {
  const newStatus = row.status === 'active' ? 'disabled' : 'active'
  const action = newStatus === 'disabled' ? '禁用' : '启用'
  try {
    await ElMessageBox.confirm(`确认${action}用户 ${row.nickname}？`, '提示', { type: 'warning' })
    await toggleUserStatus(row.id, newStatus)
    ElMessage.success(`${action}成功`)
    fetchData()
  } catch {
    // 取消或失败
  }
}

onMounted(fetchData)
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
