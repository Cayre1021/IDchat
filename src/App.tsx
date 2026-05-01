import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from './stores/themeStore'
import { useApiStore } from './stores/apiStore'
import { useCharStore } from './stores/charStore'
import BottomTabBar from './components/layout/BottomTabBar'
import Toast from './components/shared/Toast'
import ConfirmModal from './components/shared/ConfirmModal'
import ContextMenu from './components/shared/ContextMenu'
import ChatListPage from './components/chat/ChatListPage'
import ChatDetailPage from './components/chat/ChatDetailPage'
import CharacterListPage from './components/character/CharacterListPage'
import CharacterEditPage from './components/character/CharacterEditPage'
import SettingsPage from './components/settings/SettingsPage'
import ApiListPage from './components/settings/ApiListPage'
import ApiEditPage from './components/settings/ApiEditPage'
import ThemePage from './components/settings/ThemePage'

export default function App() {
  const themeInit = useThemeStore((s) => s.init)
  const apiInit = useApiStore((s) => s.init)
  const charInit = useCharStore((s) => s.init)

  useEffect(() => { themeInit(); apiInit(); charInit(); }, [themeInit, apiInit, charInit])

  return (
    <div className="phone-frame">
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<ChatListPage />} />
        <Route path="/chat/:characterId" element={<ChatDetailPage />} />
        <Route path="/characters" element={<CharacterListPage />} />
        <Route path="/characters/new" element={<CharacterEditPage />} />
        <Route path="/characters/:id/edit" element={<CharacterEditPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/api" element={<ApiListPage />} />
        <Route path="/settings/api/new" element={<ApiEditPage />} />
        <Route path="/settings/api/:id/edit" element={<ApiEditPage />} />
        <Route path="/settings/theme" element={<ThemePage />} />
      </Routes>
      <BottomTabBar />
      <Toast />
      <ConfirmModal />
      <ContextMenu />
    </div>
  )
}
