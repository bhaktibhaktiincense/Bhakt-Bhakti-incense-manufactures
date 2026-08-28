/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Manufacturing from './pages/Manufacturing';
import Quality from './pages/Quality';
import Products from './pages/Products';
import Contact from './pages/Contact';
import Feedback from './pages/Feedback';
import Complaint from './pages/Complaint';
import Admin from './pages/Admin';
import Auth from './pages/auth/Auth';
import Cart from './pages/shop/Cart';
import Checkout from './pages/shop/Checkout';
import OrderConfirmation from './pages/shop/OrderConfirmation';
import InvoiceViewer from './pages/shop/InvoiceViewer';
import Account from './pages/customer/Account';
import Gallery from './pages/Gallery';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="products" element={<Products />} />
          <Route path="manufacturing" element={<Manufacturing />} />
          <Route path="quality" element={<Quality />} />
          <Route path="contact" element={<Contact />} />
          <Route path="feedback" element={<Feedback />} />
          <Route path="complaint" element={<Complaint />} />
          <Route path="admin" element={<Admin />} />
          <Route path="login" element={<Auth type="login" />} />
          <Route path="signup" element={<Auth type="signup" />} />
          <Route path="cart" element={<Cart />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="invoice/:id" element={<InvoiceViewer />} />
          <Route path="account" element={<Account />} />
          <Route path="gallery" element={<Gallery />} />
        </Route>
      </Routes>
    </Router>
  );
}

