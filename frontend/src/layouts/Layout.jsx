import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
    </div>
  );
};

export default Layout;
