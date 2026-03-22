// src/pages/ProfilePage.jsx
import { useState, useEffect } from 'react'
import { User, Mail, Phone, Lock, Save, Loader, AlertTriangle } from 'lucide-react'
import { profileAPI } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState({
    first_name: '', last_name: '', phone: '', avatar: '🧑', email: ''
  })
  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingPwd, setSavingPwd] = useState(false)

  const emojis = ['🧑', '👨', '👩', '👷', '👮', '👨‍💼', '👩‍💼', '👻', '🤖', '👽', '👾', '🚀', '🌟', '💼']

  useEffect(() => {
    profileAPI.get()
      .then(res => setProfile({
        first_name: res.data.first_name || '',
        last_name: res.data.last_name || '',
        phone: res.data.phone || '',
        avatar: res.data.avatar || '🧑',
        email: res.data.email || ''
      }))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false))
  }, [])

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await profileAPI.update({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        avatar: profile.avatar,
      })
      toast.success('Profile updated successfully')
      
      const stored = JSON.parse(localStorage.getItem('user'))
      if (stored) {
        localStorage.setItem('user', JSON.stringify({ ...stored, avatar: profile.avatar }))
      }
      location.reload()
    } catch (err) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwords.new_password !== passwords.confirm_password) {
      return toast.error('Passwords do not match')
    }
    if (passwords.new_password.length < 6) {
      return toast.error('New password must be at least 6 characters')
    }

    setSavingPwd(true)
    try {
      const res = await profileAPI.changePassword({
        old_password: passwords.old_password,
        new_password: passwords.new_password
      })
      toast.success(res.data.message)
      setPasswords({ old_password: '', new_password: '', confirm_password: '' })
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in-up">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-brand-yellow flex items-center justify-center text-4xl shadow-lg border-4 border-white dark:border-gray-800">
          {profile.avatar}
        </div>
        <div>
          <h1 className="page-title text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-sm uppercase font-bold text-brand-yellow mt-1 tracking-wider">{user?.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Profile Info Form */}
        <div className="card p-6 border-t-4 border-t-emerald-500">
          <h2 className="section-title mb-6 flex items-center gap-2">
            <User size={20} className="text-emerald-500" /> Personal Information
          </h2>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="John"
                  value={profile.first_name}
                  onChange={e => setProfile({...profile, first_name: e.target.value})}
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Doe"
                  value={profile.last_name}
                  onChange={e => setProfile({...profile, last_name: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">Email Address (Read-only)</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="email"
                  className="input-field pl-9 bg-gray-50 dark:bg-white/5 opacity-70 cursor-not-allowed"
                  value={profile.email}
                  disabled
                />
              </div>
            </div>

            <div>
              <label className="label">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-secondary)' }} />
                <input
                  type="tel"
                  className="input-field pl-9"
                  placeholder="+91 9876543210"
                  value={profile.phone}
                  onChange={e => setProfile({...profile, phone: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="label">Avatar / Emoji</label>
              <div className="grid flex-wrap grid-cols-7 gap-2">
                {emojis.map(emoji => (
                  <div
                    key={emoji}
                    onClick={() => setProfile({...profile, avatar: emoji})}
                    className={`cursor-pointer w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
                      profile.avatar === emoji 
                        ? 'bg-brand-yellow shadow-md ring-2 ring-brand-yellow ring-offset-2 dark:ring-offset-gray-900 scale-110' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10'
                    }`}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex justify-center items-center gap-2 mt-8"
            >
              {saving ? <Loader size={18} className="animate-spin" /> : <Save size={18} />} Update Profile
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="card p-6 border-t-4 border-t-brand-orange h-fit">
          <h2 className="section-title mb-6 flex items-center gap-2">
            <Lock size={20} className="text-brand-orange" /> Change Password
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="Enter current password"
                value={passwords.old_password}
                onChange={e => setPasswords({...passwords, old_password: e.target.value})}
              />
            </div>
            
            <div className="pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
              <label className="label">New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field mb-4"
                placeholder="At least 6 characters"
                value={passwords.new_password}
                onChange={e => setPasswords({...passwords, new_password: e.target.value})}
              />
              
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                required
                minLength={6}
                className="input-field"
                placeholder="Repeat new password"
                value={passwords.confirm_password}
                onChange={e => setPasswords({...passwords, confirm_password: e.target.value})}
              />
              
              {passwords.new_password && passwords.confirm_password && passwords.new_password !== passwords.confirm_password && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> Passwords do not match
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={savingPwd || (passwords.new_password && passwords.new_password !== passwords.confirm_password)}
              className="w-full btn-primary font-bold py-3 mt-4 flex justify-center items-center gap-2"
            >
              {savingPwd ? <Loader size={18} className="animate-spin" /> : <Lock size={18} />} Secure Account
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
