import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingUserMenu from '../components/FloatingUserMenu';

const Layout = () => {
  const { pathname } = useLocation();
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <div className="app-wrapper">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      {!isAdminPage && <Footer />}
      <FloatingUserMenu />
    </div>
  );
};

export default Layout;
