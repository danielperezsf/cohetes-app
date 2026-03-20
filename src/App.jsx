import RocketState from './RocketState'

function App() {
  return (
    <div style={{ display: 'flex', gap: 40, padding: 40, background: '#111', minHeight: '100vh', alignItems: 'center' }}>
      <RocketState state="low"  size={100} />
      <RocketState state="mid"  size={100} />
      <RocketState state="high" size={100} />
    </div>
  )
}

export default App
