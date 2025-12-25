import { Settings } from 'lucide-react'
import { useState } from 'react'
import { useMutation, useQueryClient } from 'react-query'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  Users, 
  Save,
  Upload,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/auth'

const SettingsPage = () => {
  const { user, setUser } = useAuthStore()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'security' | 'billing' | 'team'>('profile')

  // Profile update mutation
  const profileMutation = useMutation(
    (data: any) => authService.updateProfile(data),
    {
      onSuccess: (updatedUser) => {
        setUser(updatedUser)
        queryClient.invalidateQueries('user')
        toast.success('Profile updated successfully!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  // Password change mutation
  const passwordMutation = useMutation(
    (data: { currentPassword: string; newPassword: string }) => 
      authService.changePassword(data.currentPassword, data.newPassword),
    {
      onSuccess: () => {
        toast.success('Password changed successfully!')
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to change password')
      }
    }
  )

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'team', name: 'Team', icon: Users },
  ]

  const handleProfileUpdate = (data: any) => {
    profileMutation.mutate(data)
  }

  const handlePasswordChange = (data: { currentPassword: string; newPassword: string }) => {
    passwordMutation.mutate(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-md border border-gray-200/50 p-8 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-md">
                <Settings className="w-6 h-6 text-gray-600" />
              </div>
              <span className="text-sm font-bold uppercase tracking-wider text-gray-700 bg-gray-50/60 px-3 py-1 rounded-md">Account Settings</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4 text-gray-900 leading-tight">
              Account <span className="bg-gradient-to-r from-gray-600 to-gray-800 bg-clip-text text-transparent">Settings</span>
            </h1>
            <p className="text-xl text-gray-700 max-w-2xl leading-relaxed">
              Manage your account preferences, security settings, and team configurations.
            </p>
          </div>
          
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-gray-200/20 to-gray-300/20 rounded-full blur-3xl -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-gray-300/20 to-gray-200/20 rounded-full blur-2xl translate-y-24 -translate-x-24"></div>
        </div>

        <div>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar */}
            <div className="lg:w-64">
              <nav className="space-y-2 bg-white/80 backdrop-blur-sm rounded-md p-4 shadow-xl border border-red-200/50">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-bold rounded-md transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                        : 'text-gray-600 hover:bg-red-50 hover:text-red-700'
                    }`}
                  >
                    <tab.icon className="mr-3 h-5 w-5" />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-md shadow-xl border border-red-200/50 p-8">
                {activeTab === 'profile' && (
                  <ProfileSettings user={user} onUpdate={handleProfileUpdate} isLoading={profileMutation.isLoading} />
                )}
                {activeTab === 'notifications' && <NotificationSettings />}
                {activeTab === 'security' && <SecuritySettings onPasswordChange={handlePasswordChange} isLoading={passwordMutation.isLoading} />}
                {activeTab === 'billing' && <BillingSettings />}
                {activeTab === 'team' && <TeamSettings />}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const ProfileSettings = ({ user, onUpdate, isLoading }: any) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    avatar: user?.avatar || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handleAvatarUpload = () => {
    toast.info('Avatar upload feature coming soon!')
  }

  return (
    <div>
      <h3 className="text-2xl font-black text-gray-900 mb-6">Profile Information</h3>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center space-x-6">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center shadow-lg">
            {formData.avatar ? (
              <img
                src={formData.avatar}
                alt="Profile"
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <User className="w-8 h-8 text-red-600" />
            )}
          </div>
          <div>
            <button 
              type="button" 
              onClick={handleAvatarUpload}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-md font-bold text-sm hover:shadow-lg transition-all duration-300"
            >
              <Upload className="w-4 h-4 mr-2 inline" />
              Change Photo
            </button>
            <p className="text-xs text-gray-500 mt-1">
              JPG, GIF or PNG. 1MB max.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              First Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Last Name
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white/80 backdrop-blur-sm transition-all duration-200"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-6 py-3 rounded-md font-bold hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

const NotificationSettings = () => {
  const [notifications, setNotifications] = useState({
    emailProcessing: true,
    emailTeamJoined: true,
    emailWeeklyReport: false,
    pushProcessing: true,
    pushMentions: false
  })

  const handleSave = () => {
    toast.success('Notification preferences saved!')
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Notification Preferences</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Email Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={notifications.emailProcessing}
                onChange={(e) => setNotifications({...notifications, emailProcessing: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Video processing completed</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={notifications.emailTeamJoined}
                onChange={(e) => setNotifications({...notifications, emailTeamJoined: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">New team member joined</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={notifications.emailWeeklyReport}
                onChange={(e) => setNotifications({...notifications, emailWeeklyReport: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Weekly summary reports</span>
            </label>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Push Notifications</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={notifications.pushProcessing}
                onChange={(e) => setNotifications({...notifications, pushProcessing: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Processing updates</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={notifications.pushMentions}
                onChange={(e) => setNotifications({...notifications, pushMentions: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Team mentions</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button onClick={handleSave} className="btn btn-primary btn-md">
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  )
}

const SecuritySettings = ({ onPasswordChange, isLoading }: any) => {
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long')
      return
    }

    onPasswordChange({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    })
    
    // Reset form on success
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleTwoFactorAuth = () => {
    toast.info('Two-factor authentication setup coming soon!')
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Security Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Change Password</h4>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.current ? 'text' : 'password'} 
                  className="input pr-10" 
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.new ? 'text' : 'password'} 
                  className="input pr-10" 
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input 
                  type={showPasswords.confirm ? 'text' : 'password'} 
                  className="input pr-10" 
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="btn btn-primary btn-md"
            >
              <Shield className="w-4 h-4 mr-2" />
              {isLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
          <p className="text-sm text-gray-600 mb-4">
            Add an extra layer of security to your account.
          </p>
          <button onClick={handleTwoFactorAuth} className="btn btn-outline btn-md">
            <Shield className="w-4 h-4 mr-2" />
            Enable 2FA
          </button>
        </div>
      </div>
    </div>
  )
}

const BillingSettings = () => {
  const handleUpgrade = () => {
    toast.info('Upgrade plans coming soon! Premium features will be available shortly.')
  }

  const handleAddPayment = () => {
    toast.info('Payment method setup coming soon!')
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Billing & Subscription</h3>
      
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-cyan-50 to-pink-50 border border-cyan-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Current Plan</h4>
              <p className="text-sm text-gray-600 mb-1">Free Plan - $0/month</p>
              <p className="text-xs text-gray-500">
                • Up to 5 projects<br/>
                • 1GB storage<br/>
                • Basic AI features
              </p>
            </div>
            <button onClick={handleUpgrade} className="btn btn-primary btn-md">
              <CreditCard className="w-4 h-4 mr-2" />
              Upgrade Plan
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Method</h4>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              No payment method on file.
            </p>
            <p className="text-xs text-gray-500">
              Add a payment method to upgrade your plan and access premium features.
            </p>
          </div>
          <button onClick={handleAddPayment} className="btn btn-outline btn-md">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </button>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Billing History</h4>
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <CreditCard className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              No billing history available.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Your billing history will appear here once you upgrade to a paid plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const TeamSettings = () => {
  const [teamSettings, setTeamSettings] = useState({
    allowInvites: true,
    requireApproval: true
  })

  const handleInviteMember = () => {
    toast.info('Team member invitation feature coming soon!')
  }

  const handleSaveTeamSettings = () => {
    toast.success('Team settings saved successfully!')
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-6">Team Management</h3>
      
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Team Members</h4>
            <button onClick={handleInviteMember} className="btn btn-primary btn-sm">
              <Users className="w-4 h-4 mr-2" />
              Invite Member
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No team members</h3>
            <p className="mt-1 text-sm text-gray-500">
              Invite team members to collaborate on projects.
            </p>
            <button onClick={handleInviteMember} className="mt-3 btn btn-outline btn-sm">
              Send Invitation
            </button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4">Team Settings</h4>
          <div className="space-y-3">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={teamSettings.allowInvites}
                onChange={(e) => setTeamSettings({...teamSettings, allowInvites: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Allow team members to invite others</span>
            </label>
            <label className="flex items-center">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" 
                checked={teamSettings.requireApproval}
                onChange={(e) => setTeamSettings({...teamSettings, requireApproval: e.target.checked})}
              />
              <span className="ml-2 text-sm text-gray-700">Require approval for new projects</span>
            </label>
          </div>
          <div className="mt-4">
            <button onClick={handleSaveTeamSettings} className="btn btn-primary btn-md">
              <Save className="w-4 h-4 mr-2" />
              Save Team Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage