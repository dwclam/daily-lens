import React, { useState, useEffect } from 'react';
import postApi from '../api/postApi';
import { useNavigate } from 'react-router-dom';

const CreatePostPage = () => {
  // Thay state imageUrl (text) bằng selectedFile (file object)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [caption, setCaption] = useState('');
  const [isPublic, setIsPublic] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  // Cleanup: Xóa URL ảo khi component unmount để tránh rò rỉ bộ nhớ
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Xử lý khi người dùng chọn file
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Tạo URL ảo để xem trước ảnh ngay lập tức
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    if (!selectedFile) {
      setErrorMsg('Vui lòng chọn ảnh!');
      setLoading(false);
      return;
    }

    try {
      // 👇 TẠO FORM DATA ĐỂ GỬI FILE
      const formData = new FormData();
      formData.append('image', selectedFile); // Key 'image' phải trùng với Backend FileInterceptor('image')
      formData.append('caption', caption);
      formData.append('isPublic', isPublic);

      await postApi.create(formData);

      // Thành công -> Về trang chủ
      navigate('/');
    } catch (error) {
      console.error('Lỗi khi đăng bài:', error);
      const message = error.response?.data?.message;
      if (Array.isArray(message)) {
        setErrorMsg(message[0]);
      } else if (message) {
        setErrorMsg(message);
      } else {
        setErrorMsg('Không thể đăng bài. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Create New Post</h2>

      {errorMsg && (
        <div style={styles.errorBox}>
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>

        {/* 👇 KHU VỰC CHỌN ẢNH */}
        <div style={styles.inputGroup}>
          <label style={styles.uploadLabel}>
            {previewUrl ? 'Đổi ảnh khác' : 'Chọn ảnh từ máy tính'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{display: 'none'}} // Ẩn input xấu xí đi
            />
          </label>

          {/* Preview ảnh */}
          {previewUrl ? (
            <div style={styles.preview}>
              <img src={previewUrl} alt="Preview" style={styles.previewImg} />
            </div>
          ) : (
            <div style={styles.emptyPreview}>
              📷 Chưa có ảnh nào được chọn
            </div>
          )}
        </div>

        <div style={styles.inputGroup}>
          <label>Caption:</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            rows="3"
            style={styles.textarea}
          />
        </div>

        <div style={styles.checkboxGroup}>
          <label style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer'}}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            Public Post (Ai cũng xem được)
          </label>
        </div>

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Posting...' : 'Share'}
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #dbdbdb', borderRadius: '8px', backgroundColor: '#fff' },
  form: { display: 'flex', flexDirection: 'column' },
  errorBox: { backgroundColor: '#fff0f0', color: '#cc0000', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #ffcccc', fontSize: '14px' },
  inputGroup: { marginBottom: '15px' },
  textarea: { width: '100%', padding: '10px', marginTop: '5px', border: '1px solid #dbdbdb', borderRadius: '4px', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' },
  checkboxGroup: { marginBottom: '20px' },
  button: { padding: '10px', backgroundColor: '#0095f6', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },

  // Style mới cho Upload
  uploadLabel: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#efefef',
    color: '#000',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    marginBottom: '10px'
  },
  preview: { marginTop: '10px', textAlign: 'center', backgroundColor: '#000', borderRadius: '4px', overflow: 'hidden' },
  previewImg: { maxWidth: '100%', maxHeight: '400px', display: 'block', margin: '0 auto' },
  emptyPreview: {
    height: '200px',
    backgroundColor: '#fafafa',
    border: '2px dashed #dbdbdb',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#8e8e8e',
    marginTop: '5px'
  }
};

export default CreatePostPage;