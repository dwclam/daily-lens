import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import likeApi from '../api/likeApi';
import commentApi from '../api/commentApi';
import postApi from '../api/postApi';

// --- FORMAT NGÀY THÁNG ---
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

// ==========================================
// --- BỘ ICON SVG CHUẨN FACEBOOK/IG (GRAY) ---
// ==========================================

const grayColor = "#65676b";

const HeartIcon = ({ filled }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={filled ? "#ed4956" : "none"} stroke={filled ? "#ed4956" : "#262626"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const CommentIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#262626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'scaleX(-1)'}}>
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const SendIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{transform: 'rotate(45deg)', marginTop: '-2px'}}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const GlobeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={grayColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const LockIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={grayColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={grayColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={grayColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const PostCard = ({ post, onDelete, currentUserId }) => {
  // --- STATE ---
  const initialIsLiked = post.isLikedByMe !== undefined
    ? post.isLikedByMe
    : post.likes?.some(like => like.user.id === parseInt(currentUserId));

  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [likeCount, setLikeCount] = useState(post.likeCount || post.likes?.length || 0);
  const [isLikeProcessing, setIsLikeProcessing] = useState(false);

  const [comments, setComments] = useState(post.comments || []);
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [imageError, setImageError] = useState(false);

  // State menu & update
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [editIsPublic, setEditIsPublic] = useState(post.isPublic !== undefined ? post.isPublic : true);
  const [displayCaption, setDisplayCaption] = useState(post.caption);
  const [displayIsPublic, setDisplayIsPublic] = useState(post.isPublic);

  // State sửa comment
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editContent, setEditContent] = useState('');

  const menuRef = useRef(null);
  const isOwner = post.user?.id === parseInt(currentUserId);

  // 👇 MỚI: Check quyền Admin
  const currentUserRole = localStorage.getItem('role');
  const isAdmin = currentUserRole === 'admin';
  const canDelete = isOwner || isAdmin;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowActionMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const renderAvatar = (user, size = 40) => {
    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt="avatar"
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '1px solid #dbdbdb'
          }}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      );
    }
    return (
      <div style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        backgroundColor: '#ddd',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: `${size * 0.4}px`,
        color: '#fff',
        flexShrink: 0
      }}>
        {user?.username?.charAt(0).toUpperCase() || 'U'}
      </div>
    );
  };

  const handleUpdatePost = async () => {
    try {
      await postApi.update(post.id, { caption: editCaption, isPublic: editIsPublic });
      setDisplayCaption(editCaption);
      setDisplayIsPublic(editIsPublic);
      setIsEditingPost(false);
      setShowActionMenu(false);
    } catch (error) {
      alert('Lỗi khi cập nhật bài viết');
    }
  };

  const handleLike = async () => {
    if (isLikeProcessing) return;
    setIsLikeProcessing(true);
    const previousIsLiked = isLiked;
    const previousLikeCount = likeCount;

    setIsLiked(!previousIsLiked);
    setLikeCount(prev => previousIsLiked ? prev - 1 : prev + 1);

    try {
      await likeApi.toggleLike(post.id);
    } catch (error) {
      setIsLiked(previousIsLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsLikeProcessing(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await commentApi.create(commentText, post.id);
      const currentUser = {
        id: parseInt(localStorage.getItem('userId')),
        username: localStorage.getItem('username') || 'Me',
        avatar: localStorage.getItem('avatar') || ''
      };
      const newComment = { ...response.data, user: currentUser };
      setComments([newComment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Failed to post comment', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Bạn muốn xóa bình luận này?')) {
      try {
        await commentApi.delete(commentId);
        setComments(comments.filter(c => c.id !== commentId));
      } catch (error) {
        console.error('Lỗi xóa comment', error);
      }
    }
  };

  const startEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  const saveEditComment = async (commentId) => {
    if (!editContent.trim()) return;
    try {
      await commentApi.update(commentId, editContent);
      const updatedComments = comments.map(c =>
        c.id === commentId ? { ...c, content: editContent } : c
      );
      setComments(updatedComments);
      setEditingCommentId(null);
    } catch (error) {
      alert('Lỗi cập nhật bình luận');
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <Link to={`/profile/${post.user?.id}`} style={{textDecoration: 'none', marginRight: '10px'}}>
          {renderAvatar(post.user, 40)}
        </Link>

        <div style={{flex: 1}}>
          <Link to={`/profile/${post.user?.id}`} style={{textDecoration: 'none', color: '#262626'}}>
            <div style={styles.username}>{post.user?.username || 'Unknown User'}</div>
          </Link>

          <div style={styles.date}>
            {formatDate(post.createdAt)}
            <span style={{marginLeft: '6px', display: 'flex', alignItems: 'center'}}>
               <span style={{marginRight: '4px', fontSize: '10px'}}>•</span>
              {displayIsPublic !== false ? <GlobeIcon /> : <LockIcon />}
            </span>
          </div>
        </div>

        {/* 👇 HIỂN THỊ MENU NẾU LÀ OWNER HOẶC ADMIN */}
        {canDelete && (
          <div style={{position: 'relative'}} ref={menuRef}>
            <button onClick={() => setShowActionMenu(!showActionMenu)} style={styles.menuBtn}>•••</button>
            {showActionMenu && (
              <div style={styles.dropdownMenu}>
                {/* Chỉ Owner mới được sửa */}
                {isOwner && (
                  <div style={styles.dropdownItem} onClick={() => { setIsEditingPost(true); setShowActionMenu(false); }}>
                    <EditIcon />
                    <span style={{marginLeft: '10px'}}>Chỉnh sửa bài viết</span>
                  </div>
                )}
                {/* Cả 2 đều được xóa */}
                <div style={styles.dropdownItem} onClick={() => { if(window.confirm('Xóa bài viết này?')) onDelete(post.id); }}>
                  <TrashIcon />
                  <span style={{marginLeft: '10px'}}>Xóa bài viết</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={styles.captionArea}>
        {isEditingPost ? (
          <div style={styles.editPostContainer}>
            <textarea
              value={editCaption}
              onChange={(e) => setEditCaption(e.target.value)}
              style={styles.editPostTextarea}
              rows={3}
            />
            <div style={styles.editPostActions}>
              <label style={{fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#65676b'}}>
                <input type="checkbox" checked={editIsPublic} onChange={(e) => setEditIsPublic(e.target.checked)} style={{marginRight: '5px'}}/>
                Công khai
              </label>
              <div style={{display: 'flex', gap: '8px'}}>
                <button onClick={() => setIsEditingPost(false)} style={styles.cancelBtn}>Hủy</button>
                <button onClick={handleUpdatePost} style={styles.saveBtn}>Lưu</button>
              </div>
            </div>
          </div>
        ) : (
          displayCaption && <div style={styles.captionText}>{displayCaption}</div>
        )}
      </div>

      <div style={styles.imageContainer}>
        {!imageError ? (
          <img src={post.imageUrl} alt="Post" style={styles.image} onError={() => setImageError(true)} loading="lazy" />
        ) : (
          <div style={styles.errorPlaceholder}>
            <span style={{fontSize: '40px', marginBottom: '10px'}}>🖼️</span>
            <span>Ảnh không hiển thị</span>
          </div>
        )}
      </div>

      <div style={styles.footer}>
        <div style={styles.actionsBar}>
          <div style={styles.actionItem}>
            <button onClick={handleLike} style={{...styles.actionBtn, opacity: isLikeProcessing ? 0.6 : 1}} disabled={isLikeProcessing}>
              <HeartIcon filled={isLiked} />
            </button>
            <span style={styles.countText}>{likeCount}</span>
          </div>

          <div style={styles.actionItem}>
            <button onClick={() => document.getElementById(`comment-input-${post.id}`).focus()} style={styles.actionBtn}>
              <CommentIcon />
            </button>
            <span style={styles.countText}>{comments.length}</span>
          </div>
        </div>

        <div style={styles.commentsSection}>
          {comments.length > 0 && (
            <>
              {comments.length > 2 && (
                <div onClick={() => setShowAllComments(!showAllComments)} style={styles.viewAllComments}>
                  {showAllComments ? 'Thu gọn bình luận' : `Xem tất cả ${comments.length} bình luận`}
                </div>
              )}

              {(showAllComments ? comments : comments.slice(0, 2)).map(comment => {
                const isMyComment = comment.user?.id === parseInt(currentUserId);
                const isEditing = editingCommentId === comment.id;

                return (
                  <div key={comment.id} style={styles.commentRowFb}>
                    <Link to={`/profile/${comment.user?.id}`} style={{textDecoration: 'none', marginRight: '8px'}}>
                      {renderAvatar(comment.user, 32)}
                    </Link>

                    <div style={{flex: 1}}>
                      <div style={styles.commentBubble}>
                        <Link to={`/profile/${comment.user?.id}`} style={{textDecoration: 'none', color: '#000'}}>
                          <div style={{fontWeight: 'bold', fontSize: '13px', cursor: 'pointer'}}>
                            {comment.user?.username || 'User'}
                          </div>
                        </Link>

                        {isEditing ? (
                          <input
                            autoFocus
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEditComment(comment.id);
                              if (e.key === 'Escape') setEditingCommentId(null);
                            }}
                            style={styles.editInput}
                          />
                        ) : (
                          <div style={{fontSize: '14px', wordBreak: 'break-word'}}>{comment.content}</div>
                        )}
                      </div>
                      <div style={styles.commentActions}>
                        <span>{formatDate(comment.createdAt)}</span>
                        {(isMyComment || isOwner) && !isEditing && (
                          <>
                            {isMyComment && <span onClick={() => startEditComment(comment)} style={styles.actionLink}>Sửa</span>}
                            <span onClick={() => handleDeleteComment(comment.id)} style={styles.actionLink}>Xóa</span>
                          </>
                        )}
                        {isEditing && <span style={{fontSize: '11px'}}>Enter để lưu</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>

      <form onSubmit={handleCommentSubmit} style={styles.commentForm}>
        <input
          id={`comment-input-${post.id}`}
          type="text"
          placeholder="Viết bình luận..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          style={styles.commentInput}
        />
        <button type="submit" disabled={!commentText.trim()} style={{...styles.postBtn, opacity: commentText.trim() ? 1 : 0.3, color: '#0095f6'}}>
          <SendIcon />
        </button>
      </form>
    </div>
  );
};

const styles = {
  card: { backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', marginBottom: '20px', maxWidth: '470px', width: '100%', margin: '0 auto 20px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' },
  header: { padding: '12px 16px', display: 'flex', alignItems: 'center' },
  username: { fontWeight: '600', fontSize: '15px', lineHeight: '1.2' },
  date: { fontSize: '12px', color: '#65676b', marginTop: '2px', display: 'flex', alignItems: 'center' },
  menuBtn: { border: 'none', background: 'transparent', fontSize: '20px', cursor: 'pointer', color: '#65676b', padding: '0 8px', fontWeight: 'bold' },
  dropdownMenu: { position: 'absolute', top: '100%', right: 0, backgroundColor: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, minWidth: '200px', padding: '8px', display: 'flex', flexDirection: 'column' },
  dropdownItem: { padding: '8px', fontSize: '14px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', borderRadius: '4px', transition: 'background-color 0.1s', ':hover': { backgroundColor: '#f0f2f5' }, color: '#050505', fontWeight: '500' },
  captionArea: { padding: '4px 16px 12px 16px' },
  captionText: { fontSize: '15px', lineHeight: '1.4', color: '#050505' },
  editPostContainer: { display: 'flex', flexDirection: 'column', gap: '10px' },
  editPostTextarea: { width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' },
  editPostActions: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  saveBtn: { backgroundColor: '#0095f6', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  cancelBtn: { backgroundColor: '#e4e6eb', color: '#050505', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' },
  imageContainer: { width: '100%', backgroundColor: '#fafafa', minHeight: '300px' },
  image: { width: '100%', height: 'auto', display: 'block', maxHeight: '600px', objectFit: 'cover' },
  errorPlaceholder: { width: '100%', height: '300px', backgroundColor: '#f0f0f0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8e8e8e' },
  footer: { padding: '12px 16px' },
  actionsBar: { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '10px' },
  actionItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', color: '#262626' },
  countText: { fontSize: '16px', fontWeight: '500', color: '#262626' },
  commentsSection: { marginTop: '10px' },
  viewAllComments: { color: '#65676b', cursor: 'pointer', marginBottom: '10px', fontSize: '14px', fontWeight: '500' },
  commentRowFb: { display: 'flex', marginBottom: '8px' },
  commentBubble: { backgroundColor: '#f0f2f5', borderRadius: '18px', padding: '8px 12px', display: 'inline-block' },
  commentActions: { display: 'flex', gap: '12px', marginLeft: '12px', marginTop: '3px', fontSize: '12px', color: '#65676b' },
  actionLink: { cursor: 'pointer', fontWeight: 'bold', color: '#65676b', ':hover': { textDecoration: 'underline' } },
  editInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', width: '100%', fontStyle: 'italic', minWidth: '200px' },
  commentForm: { borderTop: '1px solid #efefef', display: 'flex', padding: '12px 16px', alignItems: 'center' },
  commentInput: { flex: 1, border: 'none', outline: 'none', fontSize: '14px' },
  postBtn: { border: 'none', background: 'transparent', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};

export default PostCard;