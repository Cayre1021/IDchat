import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useThemeStore } from './stores/themeStore'
import { useApiStore } from './stores/apiStore'
import { useCharStore } from './stores/charStore'
import BottomTabBar from './components/layout/BottomTabBar'
import Toast from './components/shared/Toast'
import ConfirmModal from './components/shared/ConfirmModal'
import ContextMenu from './components/shared/ContextMenu'
import OnboardingOverlay from './components/shared/OnboardingOverlay'
import PageShell from './components/layout/PageShell'
import ChatListPage from './components/chat/ChatListPage'
import ChatDetailPage from './components/chat/ChatDetailPage'
import CharacterListPage from './components/character/CharacterListPage'
import CharacterEditPage from './components/character/CharacterEditPage'
import SettingsPage from './components/settings/SettingsPage'
import ApiListPage from './components/settings/ApiListPage'
import ApiEditPage from './components/settings/ApiEditPage'
import ThemePage from './components/settings/ThemePage'

function P({ children }: { children: React.ReactNode }) {
  return <PageShell>{children}</PageShell>
}

export default function App() {
  const themeInit = useThemeStore((s) => s.init)
  const apiInit = useApiStore((s) => s.init)
  const charInit = useCharStore((s) => s.init)

  useEffect(() => { themeInit(); apiInit(); charInit(); }, [themeInit, apiInit, charInit])

  return (
    <>
      <OnboardingOverlay />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/chat" replace />} />
          <Route path="/chat" element={<P><ChatListPage /></P>} />
          <Route path="/chat/:characterId" element={<P><ChatDetailPage /></P>} />
          <Route path="/characters" element={<P><CharacterListPage /></P>} />
          <Route path="/characters/new" element={<P><CharacterEditPage /></P>} />
          <Route path="/characters/:id/edit" element={<P><CharacterEditPage /></P>} />
          <Route path="/settings" element={<P><SettingsPage /></P>} />
          <Route path="/settings/api" element={<P><ApiListPage /></P>} />
          <Route path="/settings/api/new" element={<P><ApiEditPage /></P>} />
          <Route path="/settings/api/:id/edit" element={<P><ApiEditPage /></P>} />
          <Route path="/settings/theme" element={<P><ThemePage /></P>} />
        </Routes>
      </div>
      <BottomTabBar />
      <Toast />
      <ConfirmModal />
      <ContextMenu />
    </>
  )
}
