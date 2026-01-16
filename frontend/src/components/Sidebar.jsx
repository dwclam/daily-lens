import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import authApi from '../api/authApi';
import userApi from '../api/userApi';

// --- ICON SVG ---

// 👇 1. ICON LOGO MỚI (Hình trái tim nét vẽ)
const LogoIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
  </svg>
);

const HomeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
);

const SearchIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "black" : "currentColor"} strokeWidth={active ? "3" : "2"} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

const CreateIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
);

const ProfileIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
);

const LogoutIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
);

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = () => {
    authApi.logout();
    localStorage.removeItem('username');
    localStorage.removeItem('avatar');
    window.location.href = '/login';
  };

  const handleSearch = async (e) => {
    const keyword = e.target.value;
    setSearchText(keyword);

    if (keyword.trim().length > 0) {
      try {
        const res = await userApi.search(keyword);
        setSearchResults(res.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // 👇 HÀM MỚI: Cuộn lên đầu trang
  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* SIDEBAR CHÍNH */}
      <div
        style={{
          ...styles.sidebar,
          width: isExpanded ? '240px' : '72px',
          zIndex: 1000
        }}
        onMouseEnter={() => !isSearchOpen && setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div style={styles.logoContainer}>
          {isExpanded && !isSearchOpen ? (
            <Link to="/" style={styles.logoText} onClick={handleScrollTop}>Daily Lens</Link>
          ) : (
            <Link to="/" style={{color: 'inherit', display: 'flex'}} onClick={handleScrollTop}><LogoIcon /></Link>
          )}
        </div>

        <div style={styles.menu}>
          {/* 👇 Gắn sự kiện onClick vào đây */}
          <NavItem
            to="/"
            icon={<HomeIcon />}
            label="Home"
            isExpanded={isExpanded && !isSearchOpen}
            isActive={currentPath === '/'}
            onClick={handleScrollTop}
          />

          {/* NÚT SEARCH */}
          <div
            style={{...styles.menuItem, fontWeight: isSearchOpen ? 'bold' : 'normal', border: isSearchOpen ? '1px solid #dbdbdb' : 'none'}}
            onClick={() => { setIsSearchOpen(!isSearchOpen); setIsExpanded(false); }}
          >
            <div style={styles.iconWrapper}><SearchIcon active={isSearchOpen} /></div>
            {(isExpanded && !isSearchOpen) && <span style={styles.label}>Search</span>}
          </div>

          <NavItem to="/create-post" icon={<CreateIcon />} label="Create Post" isExpanded={isExpanded && !isSearchOpen} isActive={currentPath === '/create-post'} />
          <NavItem to="/profile" icon={<ProfileIcon />} label="Profile" isExpanded={isExpanded && !isSearchOpen} isActive={currentPath.includes('/profile')} />
        </div>

        <div style={styles.footer}>
          <div onClick={handleLogout} style={{...styles.menuItem, cursor: 'pointer'}}>
            <div style={styles.iconWrapper}><LogoutIcon /></div>
            {(isExpanded && !isSearchOpen) && <span style={styles.label}>Log out</span>}
          </div>
        </div>
      </div>

      {/* SEARCH DRAWER */}
      <div style={{
        ...styles.searchDrawer,
        transform: isSearchOpen ? 'translateX(72px)' : 'translateX(-100%)',
        opacity: isSearchOpen ? 1 : 0
      }}>
        <h2 style={{margin: '20px 20px 10px', fontSize: '24px'}}>Search</h2>

        <div style={{padding: '0 20px 20px'}}>
          <input
            type="text"
            placeholder="Search"
            value={searchText}
            onChange={handleSearch}
            autoFocus
            style={styles.searchInput}
          />
        </div>

        <hr style={{border: '0', borderTop: '1px solid #dbdbdb'}} />

        <div style={styles.resultList}>
          {searchResults.length === 0 && searchText && <p style={{textAlign: 'center', color: '#8e8e8e', marginTop: '20px'}}>Không tìm thấy kết quả.</p>}

          {searchResults.map(user => (
            <Link
              to={`/profile/${user.id}`}
              key={user.id}
              style={styles.resultItem}
              onClick={() => setIsSearchOpen(false)}
            >
              <div style={styles.avatar}>
                {user.avatar ? <img src={user.avatar} style={{width:'100%', height:'100%', borderRadius:'50%', objectFit: 'cover'}} /> : user.username.charAt(0).toUpperCase()}
              </div>
              <div style={styles.userInfo}>
                <div style={{fontWeight: '600'}}>{user.username}</div>
                <div style={{color: '#8e8e8e', fontSize: '13px'}}>{user.followersCount || 0} followers</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* OVERLAY */}
      {isSearchOpen && (
        <div onClick={() => setIsSearchOpen(false)} style={styles.overlay}></div>
      )}
    </>
  );
};

// 👇 CẬP NHẬT NavItem để nhận props onClick
const NavItem = ({ to, icon, label, isExpanded, isActive, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    style={{...styles.menuItem, fontWeight: isActive ? 'bold' : 'normal'}}
  >
    <div style={styles.iconWrapper}>{icon}</div>
    {isExpanded && <span style={styles.label}>{label}</span>}
  </Link>
);

const styles = {
  sidebar: {
    height: '100vh',
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: '#fff',
    borderRight: '1px solid #dbdbdb',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 12px',
    boxSizing: 'border-box',
    transition: 'width 0.3s ease',
    overflow: 'hidden',
    boxShadow: '2px 0 5px rgba(0,0,0,0.05)'
  },
  logoContainer: { height: '50px', marginBottom: '20px', paddingLeft: '12px', display: 'flex', alignItems: 'center', whiteSpace: 'nowrap' },
  logoText: { fontFamily: 'cursive', fontSize: '28px', textDecoration: 'none', color: '#000', cursor: 'pointer' },
  menu: { flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' },
  menuItem: { display: 'flex', alignItems: 'center', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: '#000', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap', ':hover': { backgroundColor: '#f2f2f2' } },
  iconWrapper: { minWidth: '24px', display: 'flex', justifyContent: 'center' },
  label: { marginLeft: '16px', fontSize: '16px', animation: 'fadeIn 0.3s' },
  footer: { marginTop: 'auto', borderTop: '1px solid #efefef', paddingTop: '10px' },

  searchDrawer: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '350px',
    height: '100vh',
    backgroundColor: '#fff',
    boxShadow: '4px 0 24px rgba(0,0,0,0.15)',
    borderTopRightRadius: '16px',
    borderBottomRightRadius: '16px',
    zIndex: 900,
    transition: 'transform 0.3s ease, opacity 0.3s ease',
    overflowY: 'auto'
  },
  searchInput: {
    width: '100%',
    padding: '10px 12px',
    backgroundColor: '#efefef',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  resultList: {
    padding: '10px 0'
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 20px',
    textDecoration: 'none',
    color: '#000',
    cursor: 'pointer',
    transition: 'background 0.2s',
    ':hover': { backgroundColor: '#fafafa' }
  },
  avatar: {
    width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#dbdbdb',
    display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px', fontWeight: 'bold', color: '#fff', flexShrink: 0
  },
  userInfo: {
    display: 'flex', flexDirection: 'column'
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 800
  }
};

export default Sidebar;