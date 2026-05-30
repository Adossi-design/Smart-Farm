import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProfileAvatarPicker from '../components/ProfileAvatarPicker';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    profession: '',
    organization: '',
    specialization: ''
  });
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    if (!user?.token) {
      navigate('/login');
      return;
    }

    const loadProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        if (response.ok) {
          const profile = await response.json();
          setFormData({
            name: profile.name || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
            password: '',
            profession: profile.profession || '',
            organization: profile.organization || '',
            specialization: profile.specialization || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      payload.append('name', formData.name || '');
      payload.append('email', formData.email || '');
      payload.append('phone', formData.phone || '');
      payload.append('location', formData.location || '');
      payload.append('profession', formData.profession || '');
      payload.append('organization', formData.organization || '');
      payload.append('specialization', formData.specialization || '');
      if (formData.password) payload.append('password', formData.password);
      if (avatarFile) payload.append('avatar', avatarFile);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`
        },
        body: payload
      });

      const data = await response.json();

      if (response.ok) {
        updateUser({
          ...user,
          ...data,
          token: data.token || user.token
        });
        setEditMode(false);
        setAvatarFile(null);
        setFormData((current) => ({ ...current, password: '' }));
        success(t('profile.profileUpdated'));
      } else {
        toastError(data.message || t('profile.profileUpdateFailed'));
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toastError(t('profile.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-emerald-600 dark:text-emerald-400 mb-3"></i>
          <p className="text-slate-500 dark:text-slate-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold">
                {user?.profileImage ? (
                  <img src={user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage} alt={user?.name || 'Profile'} className="h-16 w-16 rounded-2xl object-cover" />
                ) : (user?.name?.charAt(0)?.toUpperCase() || 'U')}
              </div>
              <div>
                <h1 className="text-3xl font-bold">{t('buyer.myProfile')}</h1>
                <p className="text-emerald-50 mt-1">{t('profile.editInfo')}</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-4">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.accountType')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{user?.role}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('buyer.profession')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white capitalize">{user?.profession || formData.profession || t('profile.notSet')}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">{t('profile.contact')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{formData.phone || t('profile.noPhone')}</p>
                </div>
              </div>

              <div className="lg:col-span-2">
                <form onSubmit={handleSave} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('buyer.name')}</span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('buyer.email')}</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  {editMode && (
                    <ProfileAvatarPicker
                      title={t('profile.profilePicture')}
                      imageUrl={user?.profileImage ? (user.profileImage.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL}${user.profileImage}` : user.profileImage) : ''}
                      fallbackText={user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      file={avatarFile}
                      onFileChange={setAvatarFile}
                      fileLabel={t('profile.uploadImage') || t('buyer.uploadImage')}
                      hint={t('buyer.selectImage')}
                      compact
                    />
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('buyer.phone')}</span>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('profile.location')}</span>
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  {user?.role === 'farmer' && (
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('buyer.profession')}</span>
                      <input
                        type="text"
                        name="profession"
                        value={formData.profession}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 capitalize"
                      />
                    </label>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('profile.organization')}</span>
                      <input
                        type="text"
                        name="organization"
                        value={formData.organization}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('profile.specialization')}</span>
                      <input
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={!editMode}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-900 disabled:text-slate-500 dark:disabled:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                    </label>
                  </div>

                  {editMode && (
                    <label className="block">
                      <span className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{t('profile.newPassword')}</span>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder={t('profile.passwordHint')}
                      />
                    </label>
                  )}

                  <div className="flex flex-wrap gap-3 pt-2">
                    {!editMode ? (
                      <button
                        type="button"
                        onClick={() => setEditMode(true)}
                        className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
                      >
                        {t('profile.editProfile')}
                      </button>
                    ) : (
                      <>
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition disabled:opacity-60"
                        >
                          {saving ? t('profile.saving') : t('profile.saveChanges')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditMode(false)}
                          className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                        >
                          {t('common.cancel')}
                        </button>
                      </>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
