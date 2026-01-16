import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import postApi from '../api/postApi';
import userApi from '../api/userApi';
import followApi from '../api/followApi';
import PostCard from '../components/PostCard';

const ProfilePage = () => {
  const { id } = useParams();
  const currentUserId = parseInt(localStorage.getItem('userId'));
  const profileId = id ? parseInt(id) : currentUserId;
  const isMe = profileId === currentUserId;

  const [user, setUser] = useState(null);
  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // State Follow
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // State Edit Profile Text
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ username: '', bio: '' });
  const [usernameError, setUsernameError] = useState('');

  // State Crop Ảnh
  const fileInputRef = useRef(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropOpen, setIsCropOpen] = useState(false);

  // 👇 STATE MỚI: MENU ADMIN
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const adminMenuRef = useRef(null);

  // Check Admin Role
  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole === 'admin';

  useEffect(() => {
    fetchData();
  }, [profileId, isMe]);

  // 👇 LOGIC ĐÓNG MENU KHI CLICK RA NGOÀI
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
        setShowAdminMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userApi.getById(profileId);
      setUser(res.data);
      if (isMe) {
        setEditForm({ username: res.data.username || '', bio: res.data.bio || '' });
      }
      const postsRes = await postApi.getAll();
      const userPosts = postsRes.data.filter(post => post.user?.id === profileId);
      setMyPosts(userPosts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

      if (!isMe) {
        const followRes = await followApi.checkIsFollowing(profileId);
        setIsFollowing(followRes.data.isFollowing);
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  // --- LOGIC ADMIN ---
  const handleDeleteUser = async () => {
    if (window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa user "${user.username}" vĩnh viễn? Hành động này không thể hoàn tác!`)) {
      try {
        await userApi.delete(profileId);
        alert('Đã xóa user thành công!');
        window.location.href = '/';
      } catch (error) {
        alert('Lỗi khi xóa user');
      }
    }
    setShowAdminMenu(false);
  };

  const handleSetAdmin = async () => {
    if (window.confirm(`Cấp quyền Admin cho ${user.username}?`)) {
      try {
        await userApi.updateRole(profileId, 'admin');
        alert('Đã cấp quyền Admin!');
        window.location.reload();
      } catch (error) {
        alert('Lỗi cấp quyền');
      }
    }
    setShowAdminMenu(false);
  };

  // --- LOGIC CROP & UPLOAD ---
  const onFileChange = async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImageSrc(reader.result);
        setIsCropOpen(true);
      });
      reader.readAsDataURL(file);
      e.target.value = null;
    }
  };

  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleUploadCroppedImage = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const fileToSend = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });
      const formData = new FormData();
      formData.append('avatar', fileToSend);

      await userApi.update(currentUserId, formData);

      const newAvatarUrl = URL.createObjectURL(croppedBlob);
      setUser(prev => ({ ...prev, avatar: newAvatarUrl }));

      setIsCropOpen(false);
      setImageSrc(null);
      alert('Đổi ảnh đại diện thành công!');
    } catch (e) {
      console.error(e);
      alert('Có lỗi khi xử lý ảnh.');
    }
  };

  // --- LOGIC FOLLOW ---
  const handleFollowClick = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    const prevIsFollowing = isFollowing;
    const prevFollowersCount = user.followersCount;
    try {
      if (isFollowing) {
        await followApi.unfollow(profileId);
        setIsFollowing(false);
        setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) - 1 }));
      } else {
        await followApi.follow(profileId);
        setIsFollowing(true);
        setUser(prev => ({ ...prev, followersCount: (prev.followersCount || 0) + 1 }));
      }
    } catch (error) {
      alert('Action failed');
      setIsFollowing(prevIsFollowing);
      setUser(prev => ({ ...prev, followersCount: prevFollowersCount }));
    } finally {
      setFollowLoading(false);
    }
  };

  // --- LOGIC EDIT TEXT ---
  const handleSaveProfile = async () => {
    setUsernameError('');
    try {
      await userApi.update(currentUserId, editForm);
      setUser(prev => ({ ...prev, ...editForm }));
      setIsEditModalOpen(false);
      alert('Cập nhật thành công!');
    } catch (error) {
      if (error.response && error.response.status === 409) {
        setUsernameError('Tên đăng nhập này đã có người sử dụng.');
      } else { alert('Thất bại.'); }
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Delete this post?')) {
      try {
        await postApi.delete(postId);
        setMyPosts(myPosts.filter(p => p.id !== postId));
      } catch (error) { alert('Failed'); }
    }
  };

  if (loading) return <div style={{textAlign: 'center', marginTop: '50px'}}>Loading...</div>;
  if (!user) return <div style={{textAlign: 'center', marginTop: '50px'}}>User not found</div>;

  return (
    <div style={styles.container}>
      {/* HEADER */}
      <div style={styles.header}>
        <div style={styles.leftCol}>
          <div style={styles.avatarWrapper} className="avatar-container">
            {user.avatar ? (
              <img src={user.avatar} style={styles.avatarImg} alt="avatar" />
            ) : (
              <div style={styles.avatarPlaceholder}>{user.username?.charAt(0).toUpperCase()}</div>
            )}
            {isMe && (
              <div
                style={styles.avatarOverlay}
                onClick={() => fileInputRef.current.click()}
                title="Change Avatar"
              >
                <span style={{fontSize: '24px'}}>📷</span>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            style={{display: 'none'}}
            accept="image/*"
            onChange={onFileChange}
          />
        </div>

        <div style={styles.rightCol}>
          <h2 style={styles.username}>{user.username}</h2>
          <ul style={styles.statsList}>
            <li style={styles.statItem}><strong>{myPosts.length}</strong> posts</li>
            <li style={styles.statItem}><strong>{user.followersCount || 0}</strong> followers</li>
            <li style={styles.statItem}><strong>{user.followingCount || 0}</strong> following</li>
          </ul>
          <div style={styles.bioContainer}>{user.bio}</div>

          <div style={styles.actionRow}>
            {isMe ? (
              <button style={styles.btnEdit} onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
            ) : (
              <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                <button
                  onClick={handleFollowClick}
                  disabled={followLoading}
                  style={isFollowing ? styles.btnUnfollow : styles.btnFollow}
                >
                  {followLoading ? '...' : (isFollowing ? 'Following' : 'Follow')}
                </button>

                {/* 👇 MENU 3 CHẤM CHO ADMIN */}
                {isAdmin && (
                  <div style={{position: 'relative'}} ref={adminMenuRef}>
                    <button
                      onClick={() => setShowAdminMenu(!showAdminMenu)}
                      style={styles.btnAdminMenu}
                      title="Admin Options"
                    >
                      •••
                    </button>

                    {/* DROPDOWN MENU */}
                    {showAdminMenu && (
                      <div style={styles.adminDropdown}>
                        <div style={{...styles.adminDropdownItem, color: '#ed4956'}} onClick={handleDeleteUser}>
                          Delete User
                        </div>
                        {user.role !== 'admin' && (
                          <div style={styles.adminDropdownItem} onClick={handleSetAdmin}>
                            Set Admin
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <hr style={{border: '0', borderTop: '1px solid #dbdbdb', margin: '0 0 20px 0'}} />

      <div style={styles.grid}>
        {myPosts.map(post => <PostCard key={post.id} post={post} onDelete={handleDelete} currentUserId={currentUserId} />)}
      </div>

      {/* MODAL CROP */}
      {isCropOpen && (
        <div style={styles.cropModalOverlay}>
          <div style={styles.cropContainer}>
            <div style={styles.cropArea}>
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div style={styles.controls}>
              <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} style={styles.slider} />
              <div style={styles.cropButtons}>
                <button style={styles.btnCancel} onClick={() => { setIsCropOpen(false); setImageSrc(null); }}>Hủy</button>
                <button style={styles.btnSave} onClick={handleUploadCroppedImage}>Lưu Avatar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDIT PROFILE */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay} onClick={() => setIsEditModalOpen(false)}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{marginTop: 0, textAlign: 'center'}}>Edit Profile</h3>
            <div style={{marginBottom: '16px'}}>
              <label style={styles.label}>Username</label>
              <input
                style={usernameError ? styles.inputError : styles.input}
                value={editForm.username}
                onChange={e => { setEditForm({...editForm, username: e.target.value}); setUsernameError(''); }}
              />
              {usernameError && <p style={styles.errorText}>{usernameError}</p>}
            </div>
            <div style={{marginBottom: '16px'}}>
              <label style={styles.label}>Bio</label>
              <textarea
                style={{...styles.input, height: '80px', resize: 'vertical', fontFamily: 'inherit'}}
                value={editForm.bio}
                onChange={e => setEditForm({...editForm, bio: e.target.value})}
              />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.btnCancel} onClick={() => setIsEditModalOpen(false)}>Cancel</button>
              <button style={styles.btnSave} onClick={handleSaveProfile}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { maxWidth: '935px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Roboto', sans-serif" },
  header: { display: 'flex', marginBottom: '44px', alignItems: 'flex-start', gap: '60px', paddingLeft: '20px' },
  leftCol: { width: '160px', display: 'flex', justifyContent: 'center', flexShrink: 0 },
  avatarWrapper: { width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #dbdbdb', cursor: 'pointer', position: 'relative' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  avatarPlaceholder: { width: '100%', height: '100%', backgroundColor: '#fafafa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '60px', color: '#dbdbdb', fontWeight: 'bold' },
  avatarOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' },
  rightCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', paddingTop: '10px' },
  username: { fontSize: '28px', fontWeight: '700', margin: 0 },
  statsList: { display: 'flex', listStyle: 'none', padding: 0, margin: 0, gap: '40px', fontSize: '16px' },
  statItem: { cursor: 'pointer' },
  bioContainer: { fontSize: '14px', whiteSpace: 'pre-wrap', lineHeight: '20px' },
  actionRow: { marginTop: '0px' },

  btnEdit: { backgroundColor: '#efefef', color: '#000', border: 'none', borderRadius: '8px', padding: '7px 16px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnFollow: { backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  btnUnfollow: { backgroundColor: '#efefef', color: '#000', border: '1px solid #dbdbdb', borderRadius: '8px', padding: '7px 24px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },

  // 👇 STYLES MỚI CHO ADMIN MENU
  btnAdminMenu: { backgroundColor: 'transparent', border: '1px solid #dbdbdb', borderRadius: '8px', padding: '0 10px', height: '32px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  adminDropdown: { position: 'absolute', top: '100%', left: 0, marginTop: '5px', backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '150px', padding: '5px 0', overflow: 'hidden' },
  adminDropdownItem: { padding: '10px 16px', fontSize: '14px', cursor: 'pointer', fontWeight: '500', transition: 'background 0.1s', ':hover': { backgroundColor: '#fafafa' } },

  grid: { display: 'flex', flexDirection: 'column', alignItems: 'center' },

  // Styles crop & modal cũ giữ nguyên...
  cropModalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  cropContainer: { width: '90%', maxWidth: '500px', height: '500px', backgroundColor: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative' },
  cropArea: { position: 'relative', flex: 1, backgroundColor: '#333' },
  controls: { padding: '16px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: '10px' },
  slider: { width: '100%', accentColor: '#0095f6', cursor: 'pointer' },
  cropButtons: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },

  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '400px', maxWidth: '90%' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #dbdbdb', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  inputError: { width: '100%', padding: '10px 12px', border: '1px solid #ed4956', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' },
  errorText: { color: '#ed4956', fontSize: '12px', marginTop: '4px', marginBottom: 0 },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' },
  btnCancel: { backgroundColor: 'transparent', border: '1px solid #dbdbdb', padding: '8px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' },
  btnSave: { backgroundColor: '#0095f6', color: '#fff', border: 'none', padding: '8px 24px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }
};

// Hover CSS hack
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  .avatar-container:hover .avatar-overlay { opacity: 1 !important; }
  .reactEasyCrop_CropArea { color: rgba(0, 0, 0, 0.5) !important; border: 1px solid rgba(255, 255, 255, 0.5) !important; }
`;
document.head.appendChild(styleSheet);

export default ProfilePage;