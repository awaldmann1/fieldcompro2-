import { Routes, Route, Navigate } from 'react-router-dom'
import DailyReport from './pages/DailyReport'
import FieldWalk from './pages/FieldWalk'
import PunchList from './pages/PunchList'
import Reply from './pages/Reply'
import Home from './pages/Home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/daily-report" element={<DailyReport />} />
      <Route path="/field-walk" element={<FieldWalk />} />
      <Route path="/punch-list" element={<PunchList />} />
      <Route path="/reply" element={<Reply />} />
    </Routes>
  )
}

export default App
