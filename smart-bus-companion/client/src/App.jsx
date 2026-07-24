import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/ui/Layout';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import Track from './pages/Track';
import Complaints from './pages/Complaints';
import AdminLogin from './pages/AdminLogin';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="search" element={<SearchResults />} />
          <Route path="track/:routeId" element={<Track />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="admin/login" element={<AdminLogin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
