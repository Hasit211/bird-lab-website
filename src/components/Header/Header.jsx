import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import { mobileMenuOpen, mobileMenuClose } from '../../utils/gsapAnimations';
import './Header.css';

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const toggleMobileMenu = () => {
        const menu = document.querySelector('.mobile-nav');
        if (isMobileMenuOpen) {
            mobileMenuClose(menu);
        } else {
            mobileMenuOpen(menu);
        }
        setIsMobileMenuOpen(prev => !prev);
    };

    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
            document.body.classList.add('menu-open');
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        }
        return () => {
            document.body.style.overflow = '';
            document.body.classList.remove('menu-open');
        };
    }, [isMobileMenuOpen]);

    const isCurrentPage = (item) => {
        const itemPath = item.href === '/' ? '/' : item.href;
        const currentPath = location.pathname === '/' ? '/' : location.pathname;
        return itemPath === currentPath;
    };

    const renderMobileLinks = () => {
        return NAV_ITEMS
            .filter(item => !isCurrentPage(item))
            .map(item => (
                <Link
                    key={item.label}
                    to={item.href}
                    className="nav-item"
                    onClick={() => {
                        toggleMobileMenu();
                    }}
                >
                    {item.label}
                </Link>
            ));
    };

    return (
        <>
            <button
                type="button"
                className={`mobile-menu-toggle ${isMobileMenuOpen ? 'hidden' : ''}`}
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Open navigation menu"
                aria-controls="site-sidebar"
            >
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="#0f172a" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu} />
            <div className="mobile-nav" id="site-sidebar" aria-hidden={!isMobileMenuOpen}>
                <div className="mobile-nav-content">
                    <button
                        type="button"
                        className="mobile-nav-close"
                        onClick={toggleMobileMenu}
                        aria-label="Close navigation menu"
                    >
                        <svg viewBox="0 0 24 24" width="22" height="22" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    {renderMobileLinks()}
                </div>
            </div>
        </>
    );
};

export default Header;