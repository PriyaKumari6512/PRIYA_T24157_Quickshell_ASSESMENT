import React, { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import './App.css';


function generateCustomers(count) {
  const names=["Rakesh Kumar","Priya Sharma","Arjun Patel","Neha Verma","Vikram Singh","Sonia Das","Aman Joshi","Kavita Nair","Rahul Mehta","Anjali Gupta"],
  emails=["protonmail.com","zoho.com","hotmail.com","icloud.com"];

  
  const avatars = [
    "https://randomuser.me/api/portraits/men/1.jpg", 
    "https://randomuser.me/api/portraits/women/2.jpg",
    "https://randomuser.me/api/portraits/men/3.jpg",
    "https://randomuser.me/api/portraits/women/4.jpg",
    "https://randomuser.me/api/portraits/men/5.jpg",
    "https://randomuser.me/api/portraits/women/6.jpg"
  ];
  const addedByNames = ["Priya Kumari", "Hitesh Mishra", "Priya Sharma", "rohan Kumar", "Anjali Solanki", "rohan patel"]; 
  const customers = [];

  for (let i = 1; i <= count; i++) {
    const name = names[Math.floor(Math.random() * names.length)] + ' ' + i;
    const phone = '+91-' + Math.floor(1000000000 + Math.random() * 9000000000);
    const email = name.replace(/\s/g, '.').toLowerCase() + '@' + emails[Math.floor(Math.random() * emails.length)];
    const score = Math.floor(Math.random() * 100);
    const lastMessageAt = new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().slice(0, 10);
    const addedBy = addedByNames[Math.floor(Math.random() * addedByNames.length)];
    const avatar = avatars[Math.floor(Math.random() * avatars.length)];
    customers.push({ id: i, name, phone, email, score, lastMessageAt, addedBy, avatar });
  }
  return customers;
}

const customersData = (() => {
  let cache = null;
  return () => {
    if (!cache) cache = generateCustomers(1000000);
    return cache;
  };
})();

function App() {
  const customers = useMemo(() => customersData(), []);

  const ROWS_PER_PAGE = 30;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("id");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const containerRef = useRef(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 250);
    return () => clearTimeout(handler);
  }, [search]);

  const filtered = useMemo(() => {
    let data = customers;
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      data = data.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      );
    }
    data = [...data].sort((a, b) => {
      let v1 = a[sortBy], v2 = b[sortBy];
      if (typeof v1 === 'string') v1 = v1.toLowerCase();
      if (typeof v2 === 'string') v2 = v2.toLowerCase();
      if (v1 < v2) return sortDir === 'asc' ? -1 : 1;
      if (v1 > v2) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [customers, debouncedSearch, sortBy, sortDir]);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 100) {
      setPage(p => Math.min(Math.ceil(filtered.length / ROWS_PER_PAGE), p + 1));
    }
  }, [filtered.length]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const visibleRows = filtered.slice(0, page * ROWS_PER_PAGE);

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('asc'); }
  };

  return (
    <div className="customers-app">
      <header className="customers-header">
        <div className="logo">DoubleTick</div>
        <div className="header-actions">
          <span>
            All Customers <span className="count-badge">{filtered.length.toLocaleString()}</span>
          </span>
        </div>
      </header>

      <div className="customers-toolbar">
        <input
          className="search-input"
          type="text"
          placeholder="Search Customers"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <div className="filters-dropdown-wrapper">
          <button className="filters-btn" onClick={() => setShowFilters(f => !f)}>
            Add Filters
          </button>
          {showFilters && (
            <div className="filters-dropdown">
              <div>Filter 1</div>
              <div>Filter 2</div>
              <div>Filter 3</div>
              <div>Filter 4</div>
            </div>
          )}
        </div>
      </div>

      <div className="table-container" ref={containerRef}>
        <table className="customers-table">
          <thead>
            <tr>
              <th></th>
              <th onClick={() => handleSort('name')} className="sortable">
                Customer {sortBy === 'name' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('phone')} className="sortable">
                Phone {sortBy === 'phone' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email {sortBy === 'email' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('score')} className="sortable">
                Score {sortBy === 'score' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('lastMessageAt')} className="sortable">
                Last message sent at {sortBy === 'lastMessageAt' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
              <th onClick={() => handleSort('addedBy')} className="sortable">
                Added by {sortBy === 'addedBy' ? (sortDir === 'asc' ? '▲' : '▼') : ''}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map(c => (
              <tr key={c.id} className="customers-row">
                <td><input type="checkbox" /></td>
                <td>
                  <div className="customer-info">
                    <img src={c.avatar} alt="avatar" className="avatar" />
                    <div>
                      <div className="customer-name">{c.name}</div>
                      <div className="customer-phone">{c.phone}</div>
                    </div>
                  </div>
                </td>
                <td>{c.phone}</td>
                <td>{c.email}</td>
                <td>{c.score}</td>
                <td>{c.lastMessageAt}</td>
                <td><span className="added-by-name">{c.addedBy}</span></td>
              </tr>
            ))}
          </tbody>
        </table>

        {visibleRows.length < filtered.length && (
          <div className="loading-more">Loading more...</div>
        )}
      </div>
    </div>
  );
}

export default App;
