import { useMemo, useState } from 'react'
import './App.css'

const initialEquipments = [
  {
    id: 'EQ-1008',
    name: '小松 PC200 挖掘机',
    type: '工程机械',
    status: '租赁中',
    depot: '上海浦东仓',
    dayRate: 1680,
    health: 92,
    nextService: '2026-05-18',
  },
  {
    id: 'EQ-1021',
    name: '徐工 QY25K 吊车',
    type: '起重设备',
    status: '可出租',
    depot: '苏州园区仓',
    dayRate: 2380,
    health: 88,
    nextService: '2026-05-12',
  },
  {
    id: 'EQ-1034',
    name: '林德 E20 电动叉车',
    type: '仓储设备',
    status: '检修中',
    depot: '杭州萧山仓',
    dayRate: 520,
    health: 67,
    nextService: '2026-05-07',
  },
  {
    id: 'EQ-1042',
    name: '阿特拉斯 空压机',
    type: '动力设备',
    status: '可出租',
    depot: '南京江北仓',
    dayRate: 760,
    health: 95,
    nextService: '2026-06-03',
  },
]

const initialLeases = [
  {
    id: 'LS-24051',
    customer: '中建八局安装公司',
    equipment: '小松 PC200 挖掘机',
    manager: '周敏',
    start: '2026-04-21',
    end: '2026-05-20',
    amount: 50400,
    paid: 36000,
    status: '执行中',
  },
  {
    id: 'LS-24052',
    customer: '杭州冷链物流园',
    equipment: '林德 E20 电动叉车',
    manager: '陈宇',
    start: '2026-05-01',
    end: '2026-05-15',
    amount: 7280,
    paid: 7280,
    status: '待回收',
  },
  {
    id: 'LS-24053',
    customer: '苏州城市更新集团',
    equipment: '徐工 QY25K 吊车',
    manager: '李珊',
    start: '2026-05-08',
    end: '2026-06-01',
    amount: 57120,
    paid: 15000,
    status: '待进场',
  },
]

const statusTone = {
  可出租: 'green',
  租赁中: 'blue',
  检修中: 'amber',
  执行中: 'blue',
  待回收: 'amber',
  待进场: 'green',
}

const currency = new Intl.NumberFormat('zh-CN', {
  style: 'currency',
  currency: 'CNY',
  maximumFractionDigits: 0,
})

function daysBetween(start, end) {
  const diff = new Date(end).getTime() - new Date(start).getTime()
  return Math.max(1, Math.ceil(diff / 86400000) + 1)
}

function App() {
  const [equipments] = useState(initialEquipments)
  const [leases, setLeases] = useState(initialLeases)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('全部')
  const [form, setForm] = useState({
    customer: '',
    equipment: initialEquipments[1].name,
    manager: '',
    start: '2026-05-06',
    end: '2026-05-20',
    deposit: 5000,
  })

  const filteredEquipments = useMemo(() => {
    return equipments.filter((item) => {
      const matchesQuery = `${item.name}${item.id}${item.type}${item.depot}`
        .toLowerCase()
        .includes(query.toLowerCase())
      const matchesStatus = status === '全部' || item.status === status
      return matchesQuery && matchesStatus
    })
  }, [equipments, query, status])

  const dashboard = useMemo(() => {
    const revenue = leases.reduce((sum, lease) => sum + lease.amount, 0)
    const paid = leases.reduce((sum, lease) => sum + lease.paid, 0)
    const available = equipments.filter((item) => item.status === '可出租').length
    const utilization = Math.round(
      (equipments.filter((item) => item.status === '租赁中').length /
        equipments.length) *
        100,
    )

    return { revenue, paid, available, utilization }
  }, [equipments, leases])

  const selectedEquipment = equipments.find(
    (item) => item.name === form.equipment,
  )
  const estimatedAmount =
    (selectedEquipment?.dayRate || 0) * daysBetween(form.start, form.end)

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submitLease(event) {
    event.preventDefault()

    if (!form.customer.trim() || !form.manager.trim()) {
      return
    }

    const nextLease = {
      id: `LS-${24054 + leases.length}`,
      customer: form.customer.trim(),
      equipment: form.equipment,
      manager: form.manager.trim(),
      start: form.start,
      end: form.end,
      amount: estimatedAmount,
      paid: Number(form.deposit),
      status: '待进场',
    }

    setLeases((current) => [nextLease, ...current])
    setForm((current) => ({
      ...current,
      customer: '',
      manager: '',
      deposit: 5000,
    }))
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">租</span>
          <div>
            <strong>设备租赁管理</strong>
            <small>Equipment Lease System</small>
          </div>
        </div>
        <nav className="nav-list" aria-label="主导航">
          {['工作台', '设备台账', '租赁订单', '客户档案', '财务收款'].map(
            (item, index) => (
              <button className={index === 0 ? 'active' : ''} key={item}>
                {item}
              </button>
            ),
          )}
        </nav>
        <div className="side-card">
          <span>今日关注</span>
          <strong>3 台设备需要跟进</strong>
          <p>包含 1 台检修、1 笔待回收、1 笔待进场。</p>
        </div>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">2026 年 5 月运营视图</p>
            <h1>租赁业务工作台</h1>
          </div>
          <div className="topbar-actions">
            <button type="button">导出报表</button>
            <button className="primary" type="button">
              新增设备
            </button>
          </div>
        </header>

        <section className="metrics" aria-label="核心指标">
          <Metric label="合同总额" value={currency.format(dashboard.revenue)} />
          <Metric label="已收款" value={currency.format(dashboard.paid)} />
          <Metric label="可出租设备" value={`${dashboard.available} 台`} />
          <Metric label="出租率" value={`${dashboard.utilization}%`} />
        </section>

        <section className="content-grid">
          <div className="panel equipment-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">资产调度</p>
                <h2>设备台账</h2>
              </div>
              <div className="filters">
                <input
                  aria-label="搜索设备"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="搜索设备、编号、仓库"
                  value={query}
                />
                <select
                  aria-label="筛选状态"
                  onChange={(event) => setStatus(event.target.value)}
                  value={status}
                >
                  {['全部', '可出租', '租赁中', '检修中'].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="equipment-list">
              {filteredEquipments.map((item) => (
                <article className="equipment-row" key={item.id}>
                  <div className="machine-visual" aria-hidden="true">
                    <span></span>
                  </div>
                  <div className="equipment-main">
                    <div>
                      <strong>{item.name}</strong>
                      <small>
                        {item.id} · {item.type} · {item.depot}
                      </small>
                    </div>
                    <div className="health">
                      <span style={{ width: `${item.health}%` }}></span>
                    </div>
                  </div>
                  <div className="row-meta">
                    <StatusPill status={item.status} />
                    <strong>{currency.format(item.dayRate)} / 天</strong>
                    <small>保养 {item.nextService}</small>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="panel form-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">快速登记</p>
                <h2>新租赁单</h2>
              </div>
              <span className="amount-chip">{currency.format(estimatedAmount)}</span>
            </div>
            <form onSubmit={submitLease}>
              <label>
                客户名称
                <input
                  onChange={(event) => updateForm('customer', event.target.value)}
                  placeholder="输入承租客户"
                  value={form.customer}
                />
              </label>
              <label>
                租赁设备
                <select
                  onChange={(event) => updateForm('equipment', event.target.value)}
                  value={form.equipment}
                >
                  {equipments
                    .filter((item) => item.status !== '检修中')
                    .map((item) => (
                      <option key={item.id}>{item.name}</option>
                    ))}
                </select>
              </label>
              <div className="form-split">
                <label>
                  开始日期
                  <input
                    onChange={(event) => updateForm('start', event.target.value)}
                    type="date"
                    value={form.start}
                  />
                </label>
                <label>
                  结束日期
                  <input
                    onChange={(event) => updateForm('end', event.target.value)}
                    type="date"
                    value={form.end}
                  />
                </label>
              </div>
              <div className="form-split">
                <label>
                  负责人
                  <input
                    onChange={(event) => updateForm('manager', event.target.value)}
                    placeholder="业务负责人"
                    value={form.manager}
                  />
                </label>
                <label>
                  预收款
                  <input
                    min="0"
                    onChange={(event) => updateForm('deposit', event.target.value)}
                    type="number"
                    value={form.deposit}
                  />
                </label>
              </div>
              <button className="primary submit-button" type="submit">
                保存租赁单
              </button>
            </form>
          </div>

          <div className="panel orders-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">合同履约</p>
                <h2>租赁订单</h2>
              </div>
            </div>
            <div className="order-list">
              {leases.map((lease) => {
                const paidRate = Math.round((lease.paid / lease.amount) * 100)
                return (
                  <article className="order-row" key={lease.id}>
                    <div>
                      <strong>{lease.customer}</strong>
                      <small>
                        {lease.id} · {lease.equipment}
                      </small>
                    </div>
                    <div>
                      <strong>{lease.manager}</strong>
                      <small>
                        {lease.start} 至 {lease.end}
                      </small>
                    </div>
                    <div className="payment">
                      <span>
                        {currency.format(lease.paid)} / {currency.format(lease.amount)}
                      </span>
                      <div>
                        <i style={{ width: `${Math.min(paidRate, 100)}%` }}></i>
                      </div>
                    </div>
                    <StatusPill status={lease.status} />
                  </article>
                )
              })}
            </div>
          </div>

          <div className="panel alerts-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">风险提醒</p>
                <h2>待办事项</h2>
              </div>
            </div>
            {[
              ['回收确认', 'LS-24052 明日到期，需安排物流和验收。'],
              ['保养排期', 'EQ-1034 检修后需复核电池健康度。'],
              ['收款跟进', 'LS-24053 尾款未达约定比例。'],
            ].map(([title, body]) => (
              <article className="alert-item" key={title}>
                <span></span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

function Metric({ label, value }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  )
}

function StatusPill({ status }) {
  return <span className={`status ${statusTone[status] || 'blue'}`}>{status}</span>
}

export default App
