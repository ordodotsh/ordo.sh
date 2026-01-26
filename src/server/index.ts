import { Elysia, t } from 'elysia'
import { cors } from '@elysiajs/cors'
import { staticPlugin } from '@elysiajs/static'
import { existsSync, readFileSync, writeFileSync } from 'fs'

const WAITLIST_FILE = './waitlist.json'

// fake agent swarm state
const swarm = {
  agents: [
    { id: 'oracle-1', role: 'oracle', status: 'watching', task: null as string | null },
    { id: 'scribe-1', role: 'scribe', status: 'idle', task: null as string | null },
    { id: 'hand-1', role: 'hand', status: 'idle', task: null as string | null },
    { id: 'herald-1', role: 'herald', status: 'listening', task: null as string | null },
  ],
  memory: {
    entries: 47,
    lastCompressed: Date.now() - 3600000,
  },
  beads: [] as { id: string; task: string; status: string; agent: string | null }[],
}

let beadCounter = 0

// waitlist storage — persisted to JSON file
type WaitlistEntry = { handle: string; joinedAt: string }
const waitlist: WaitlistEntry[] = existsSync(WAITLIST_FILE)
  ? JSON.parse(readFileSync(WAITLIST_FILE, 'utf-8'))
  : []

const saveWaitlist = () => {
  writeFileSync(WAITLIST_FILE, JSON.stringify(waitlist, null, 2))
}

const isProd = process.env.NODE_ENV === 'production'

new Elysia()
  .use(cors())
  .use(isProd ? staticPlugin({ assets: 'dist', prefix: '/' }) : (app) => app)
  
  // get swarm status
  .get('/api/swarm', () => ({
    agents: swarm.agents,
    memory: swarm.memory,
    beads: swarm.beads,
    uptime: process.uptime(),
  }))
  
  // spawn a task - creates a bead, assigns to agent
  .post('/api/task', ({ body }) => {
    const bead = {
      id: `bead-${++beadCounter}`,
      task: body.task,
      status: 'pending',
      agent: null as string | null,
    }
    
    // find idle agent that can handle this
    const roles = ['scribe', 'hand'] // oracle watches, herald speaks
    const available = swarm.agents.find(
      a => roles.includes(a.role) && a.status === 'idle'
    )
    
    if (available) {
      available.status = 'working'
      available.task = body.task
      bead.agent = available.id
      bead.status = 'in_progress'
    }
    
    swarm.beads.push(bead)
    
    // simulate completion after 3s
    if (available) {
      setTimeout(() => {
        available.status = 'idle'
        available.task = null
        bead.status = 'completed'
        swarm.memory.entries++
      }, 3000)
    }
    
    return { bead, assignedTo: available?.id ?? null }
  }, {
    body: t.Object({
      task: t.String()
    })
  })
  
  // get a specific agent
  .get('/api/agent/:id', ({ params }) => {
    const agent = swarm.agents.find(a => a.id === params.id)
    if (!agent) return { error: 'agent not found' }
    return agent
  })

  // join waitlist
  .post('/api/waitlist', ({ body }) => {
    const handle = body.handle.toLowerCase().replace(/^@/, '')

    // check if already on waitlist
    if (waitlist.some(w => w.handle === handle)) {
      return { success: true, message: 'already on waitlist' }
    }

    waitlist.push({ handle, joinedAt: new Date().toISOString() })
    saveWaitlist()
    console.log(`[waitlist] new signup: @${handle} (total: ${waitlist.length})`)

    return { success: true, position: waitlist.length }
  }, {
    body: t.Object({
      handle: t.String()
    })
  })

  // get waitlist count (public)
  .get('/api/waitlist/count', () => ({
    count: waitlist.length
  }))

  .listen(3000)

console.log(`
  ┌─────────────────────────────────┐
  │           O R D O               │
  │   ab chao, ordo                 │
  ├─────────────────────────────────┤
  │   swarm online @ :3000          │
  │   agents: ${swarm.agents.length}                      │
  │   memory: ${swarm.memory.entries} entries             │
  └─────────────────────────────────┘
`)
