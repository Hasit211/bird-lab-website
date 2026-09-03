import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NAV_ITEMS } from '../../utils/constants';
import { mobileMenuOpen, mobileMenuClose } from '../../utils/gsapAnimations';
import hamburgerIcon from '../../assets/align-left-svgrepo-com.svg';
import closeIcon from '../../assets/design-svgrepo-com.svg';
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
            // Hide the page the user is currently on from the sidebar.
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
                className={`mobile-menu-toggle ${isMobileMenuOpen ? 'hidden' : ''}`}
                onClick={toggleMobileMenu}
                aria-expanded={isMobileMenuOpen}
                aria-label="Open menu"
                aria-controls="site-sidebar"
            >
                <img className="menu-icon" src={hamburgerIcon} alt="" aria-hidden="true" />
            </button>

            <div className={`mobile-nav-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu} />
            <div className="mobile-nav" id="site-sidebar" aria-hidden={!isMobileMenuOpen}>
                <div className="mobile-nav-content">
                    <button
                        className="mobile-nav-close"
                        onClick={toggleMobileMenu}
                        aria-label="Close menu"
                    >
                        <img className="close-icon" src={closeIcon} alt="" aria-hidden="true" />
                    </button>
                    {renderMobileLinks()}
                </div>
            </div>
        </>
    );
};

export default Header;