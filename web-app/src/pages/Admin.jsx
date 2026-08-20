import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  getAllTags, removeTag, disableTag, 
  getAllUsers, addUser, 
  getAllBookings, approveBooking, rejectBooking 
} from '../utils/db';
import { Users, Ticket, CalendarCheck, UserPlus, CheckCircle, XCircle } from 'lucide-react';

export default function Admin() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [activeSubTab, setActiveSubTab] = useState('tickets'); // 'tickets' | 'users' | 'bookings'
  
  // States
  const [tags, setTags] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // User tab form
  const [newUsername, setNewUsername] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');

  // Booking tab input tracking (custom/generated code per booking)
  const [bookingCodes, setBookingCodes] = useState({}); // { bookingId: string }

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeSubTab === 'tickets') {
        const data = await getAllTags();
        setTags(data);
      } else if (activeSubTab === 'users') {
        const data = await getAllUsers();
        setUsers(data);
      } else if (activeSubTab === 'bookings') {
        const data = await getAllBookings();
        setBookings(data);
        
        // Pre-fill booking codes
        const codes = {};
        data.forEach(b => {
          if (b.status === 'pending' && !bookingCodes[b.id]) {
            codes[b.id] = 'TKT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
          }
        });
        setBookingCodes(prev => ({ ...prev, ...codes }));
      }
    } catch (err) {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [activeSubTab, currentUser]);

  // Tag Handlers
  const handleRemoveTag = async (code) => {
    if (window.confirm(`Are you sure you want to completely delete tag ${code}?`)) {
      await removeTag(code);
      loadData();
    }
  };

  const handleToggleTagDisable = async (code, currentDisabled) => {
    await disableTag(code, !currentDisabled);
    loadData();
  };

  // User Handlers
  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setGeneratedOtp('');

    if (!newUsername.trim()) {
      setError('Please enter a username.');
      return;
    }

    const res = await addUser(newUsername);
    if (res.success) {
      setSuccess(`User "${newUsername}" added successfully!`);
      setGeneratedOtp(res.otp);
      setNewUsername('');
      loadData();
    } else {
      setError(res.error || 'Failed to add user.');
    }
  };

  // Booking Handlers
  const handleApproveBooking = async (bookingId) => {
    setError('');
    setSuccess('');
    const code = bookingCodes[bookingId];

    if (!code || !code.trim()) {
      setError('Please provide a ticket code to assign.');
      return;
    }

    const res = await approveBooking(bookingId, code);
    if (res.success) {
      setSuccess(`Booking approved successfully. Ticket code ${code} is active.`);
      loadData();
    } else {
      setError(res.error || 'Failed to approve booking.');
    }
  };

  const handleRejectBooking = async (bookingId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      const res = await rejectBooking(bookingId);
      if (res.success) {
        setSuccess('Booking request rejected.');
        loadData();
      } else {
        setError(res.error || 'Failed to reject booking.');
      }
    }
  };

  const formatVisitDates = (start, end) => {
    if (!start) return 'N/A';
    const s = new Date(start).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    if (!end || start === end) return s;
    const e = new Date(end).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    return `${s} to ${e}`;
  };

  if (!currentUser) {
    return (
      <div className="p-6 h-full flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-800">Admin Control Panel</h2>
          <p className="text-gray-500 text-sm mt-1">Manage event tickets, register staff members, and process booking requests.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-8 bg-white p-2 rounded-2xl shadow-sm gap-2">
        <button
          onClick={() => setActiveSubTab('tickets')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeSubTab === 'tickets'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Ticket size={18} />
          <span>Manage Tickets</span>
        </button>
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeSubTab === 'users'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <Users size={18} />
          <span>Manage Users</span>
        </button>
        <button
          onClick={() => setActiveSubTab('bookings')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${
            activeSubTab === 'bookings'
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <CalendarCheck size={18} />
          <span>Manage Bookings</span>
        </button>
      </div>

      {/* Toast status messages */}
      {error && (
        <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 text-green-700 border border-green-200 p-4 rounded-xl mb-6 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <p className="text-gray-500 text-center py-12 font-medium">Loading data...</p>
      )}

      {/* TAB CONTENT: TICKETS */}
      {!loading && activeSubTab === 'tickets' && (
        <div className="grid gap-4">
          {tags.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-250">No tickets or tags registered yet.</p>
          ) : (
            tags.map((tag) => (
              <div key={tag.code} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="font-extrabold text-lg text-gray-800 font-mono tracking-wider">{tag.code}</p>
                  <p className="text-sm font-bold text-gray-600 mb-1">Holder: {tag.name || 'Unknown'}</p>
                  <p className="text-xs text-gray-400 font-medium">
                    Valid: {tag.validFrom ? new Date(tag.validFrom).toLocaleDateString() : 'Always'} to {tag.validUntil ? new Date(tag.validUntil).toLocaleDateString() : 'Never'}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                      {tag.type}
                    </span>
                    {tag.disabled && (
                      <span className="text-xs font-bold bg-red-50 text-red-600 px-2.5 py-1 rounded-lg uppercase tracking-wide">
                        Disabled
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleToggleTagDisable(tag.code, tag.disabled)}
                    className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer ${
                      tag.disabled 
                        ? 'bg-green-50 text-green-700 hover:bg-green-100'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {tag.disabled ? 'Enable' : 'Disable'}
                  </button>
                  <button
                    onClick={() => handleRemoveTag(tag.code)}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-sm bg-red-50 text-red-700 hover:bg-red-100 transition cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB CONTENT: USERS */}
      {!loading && activeSubTab === 'users' && (
        <div className="grid md:grid-cols-3 gap-8">
          {/* Add User Form */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 h-fit">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <UserPlus size={20} className="text-blue-600" /> Add New User
            </h3>
            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Username / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border-2 border-gray-150 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition font-medium"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl hover:bg-blue-700 transition text-sm cursor-pointer"
              >
                Add User
              </button>
            </form>

            {generatedOtp && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-2xl mt-6 text-center">
                <p className="text-xs font-semibold mb-1 uppercase tracking-wide">Generated 1-Time Passcode (OTP)</p>
                <p className="text-2xl font-mono font-black tracking-widest">{generatedOtp}</p>
                <p className="text-xs text-gray-500 mt-2 font-medium">Give this to the user to setup their password on login.</p>
              </div>
            )}
          </div>

          {/* User List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-800">System Users</h3>
            {users.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No users found.</p>
            ) : (
              users.map((u) => (
                <div key={u.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-extrabold text-gray-800 text-base">{u.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 font-medium">
                      Status: {u.isActivated ? 'Active' : 'Pending Activation'}
                    </p>
                  </div>

                  <div className="text-right">
                    {u.otp ? (
                      <div className="bg-amber-50 border border-amber-100 text-amber-800 px-3 py-1.5 rounded-xl text-center">
                        <span className="text-[10px] uppercase font-bold block opacity-75">OTP Passcode</span>
                        <span className="font-mono font-black tracking-wider text-sm">{u.otp}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg flex items-center gap-1">
                        Active Account
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BOOKINGS */}
      {!loading && activeSubTab === 'bookings' && (
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <p className="text-gray-500 text-center py-12 bg-white rounded-2xl border border-dashed border-gray-250">No booking requests found.</p>
          ) : (
            bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <h4 className="font-extrabold text-lg text-gray-800">{booking.name}</h4>
                    {booking.status === 'pending' && (
                      <span className="text-xs font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Pending</span>
                    )}
                    {booking.status === 'accepted' && (
                      <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Accepted</span>
                    )}
                    {booking.status === 'rejected' && (
                      <span className="text-xs font-bold bg-red-50 text-red-700 px-2 py-0.5 rounded-md uppercase tracking-wider">Rejected</span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-gray-500">
                    Email: <span className="text-gray-700">{booking.email}</span> | Phone: <span className="text-gray-700">{booking.phone}</span>
                  </p>

                  <p className="text-sm font-bold text-gray-600 flex items-center gap-1.5">
                    Dates: <span className="text-blue-600 font-extrabold">{formatVisitDates(booking.startDate, booking.endDate)}</span>
                  </p>

                  {booking.ticketCode && (
                    <p className="text-xs font-mono font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded w-fit mt-1">
                      Barcode Code: {booking.ticketCode}
                    </p>
                  )}
                </div>

                {booking.status === 'pending' && (
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {/* Editable barcode/QR code input */}
                    <div className="flex flex-col">
                      <label className="text-[10px] font-bold text-gray-400 uppercase mb-1">Set Barcode / QR Code</label>
                      <input
                        type="text"
                        placeholder="Barcode Code"
                        value={bookingCodes[booking.id] || ''}
                        onChange={(e) => setBookingCodes({ ...bookingCodes, [booking.id]: e.target.value })}
                        className="border-2 border-gray-100 rounded-xl px-3 py-2 text-sm font-mono font-bold tracking-wider uppercase bg-gray-50 focus:bg-white focus:border-blue-500 outline-none w-full sm:w-44"
                      />
                    </div>

                    <div className="flex gap-2 items-end pt-5">
                      <button
                        onClick={() => handleApproveBooking(booking.id)}
                        className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white font-bold p-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Accept & Add to Scannable tags"
                      >
                        <CheckCircle size={18} />
                        <span className="text-sm">Accept</span>
                      </button>
                      <button
                        onClick={() => handleRejectBooking(booking.id)}
                        className="flex-1 sm:flex-none bg-red-50 hover:bg-red-100 text-red-600 font-bold p-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer"
                        title="Reject Booking"
                      >
                        <XCircle size={18} />
                        <span className="text-sm">Reject</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
