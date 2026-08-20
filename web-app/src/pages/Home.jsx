import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { addBooking } from '../utils/db';
import { Scan, UserPlus, Settings, LogOut, Ticket, Calendar, Phone, Mail, User, ShieldCheck } from 'lucide-react';

export default function Home() {
  const { currentUser, logout, changePasscode } = useAuth();
  const navigate = useNavigate();

  // Booking Form State
  const [bookingName, setBookingName] = useState('');
  const [bookingEmail, setBookingEmail] = useState('');
  const [bookingPhone, setBookingPhone] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookedStatus, setBookedStatus] = useState(false); // true if booked
  const [bookingError, setBookingError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Custom Passcode settings
  const [newPasscode, setNewPasscode] = useState('');
  const [passcodeSuccess, setPasscodeSuccess] = useState('');
  const [passcodeError, setPasscodeError] = useState('');

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    
    if (!bookingName.trim() || !bookingEmail.trim() || !bookingPhone.trim() || !startDate || !endDate) {
      setBookingError('Please fill out all required fields.');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setBookingError('Start date must be on or before the end date.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await addBooking({
        name: bookingName,
        email: bookingEmail,
        phone: bookingPhone,
        startDate,
        endDate
      });

      if (res.success) {
        setBookedStatus(true);
        // Reset form
        setBookingName('');
        setBookingEmail('');
        setBookingPhone('');
        setStartDate('');
        setEndDate('');
      } else {
        setBookingError(res.error || 'Failed to submit booking request.');
      }
    } catch (err) {
      setBookingError('An error occurred during booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handlePasscodeUpdate = async (e) => {
    e.preventDefault();
    setPasscodeError('');
    setPasscodeSuccess('');

    if (newPasscode.length < 4) {
      setPasscodeError('Passcode must be at least 4 characters/numbers.');
      return;
    }

    const res = await changePasscode(newPasscode);
    if (res.success) {
      setPasscodeSuccess('Passcode updated successfully!');
      setNewPasscode('');
    } else {
      setPasscodeError(res.error || 'Failed to update passcode.');
    }
  };

  // 1. CONFIRMATION VIEW (AFTER BOOKING)
  if (bookedStatus) {
    return (
      <div className="p-6 min-h-[85vh] flex flex-col items-center justify-center bg-gray-50 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-xl border border-gray-100 max-w-md w-full flex flex-col items-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-200">
            <Ticket size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 mb-4">Booked!</h2>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            You will receive an email from us shortly.
          </p>
          <button
            onClick={() => setBookedStatus(false)}
            className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition shadow-md shadow-blue-100 cursor-pointer"
          >
            Book Another Ticket
          </button>
        </div>
      </div>
    );
  }

  // 2. PUBLIC VIEW (BOOKING & LOG IN ACCESS)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Navigation Bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <Ticket className="text-blue-600" size={28} />
            <span className="font-extrabold text-xl text-gray-800 tracking-tight">TagScanner</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm shadow-sm cursor-pointer"
          >
            Log In / Sign In
          </button>
        </header>

        {/* Hero Section & Booking Form */}
        <main className="flex-1 max-w-4xl mx-auto px-6 py-12 w-full grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight mb-6">
              Book Your Visit <span className="text-blue-600">Instantly</span>.
            </h1>
            <p className="text-gray-600 text-lg mb-8 leading-relaxed">
              Register your visit details, book your ticket for single or multiple days, and instantly receive your scannable verification barcode upon approval.
            </p>
            <div className="space-y-4 text-gray-700 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">1</div>
                <span>Enter details & date range</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">2</div>
                <span>Admin generates & registers scannable code</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">3</div>
                <span>Scan and gain entry seamlessly</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Book Ticket</h2>

            {bookingError && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-xl mb-6 text-sm font-medium">
                {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={bookingName}
                    onChange={(e) => setBookingName(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    required
                    placeholder="johndoe@example.com"
                    value={bookingEmail}
                    onChange={(e) => setBookingEmail(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition font-medium text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +44 7123 456789"
                    value={bookingPhone}
                    onChange={(e) => setBookingPhone(e.target.value)}
                    className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 transition font-medium text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2 font-sans">Start Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 transition font-medium text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-600 uppercase mb-2">End Date</label>
                  <div className="relative">
                    <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      required
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border-2 border-gray-100 rounded-xl py-2.5 pl-10 pr-3 outline-none focus:border-blue-500 transition font-medium text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition duration-200 mt-6 shadow-md shadow-blue-150 cursor-pointer text-sm"
              >
                {bookingLoading ? 'Submitting...' : 'Book Ticket'}
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  // 3. DASHBOARD VIEW (LOGGED-IN MEMBER OR ADMIN)
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Welcome banner */}
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider">
            Staff Panel
          </span>
          <h2 className="text-3xl font-extrabold text-gray-800 mt-2">
            Welcome, {currentUser.name}!
          </h2>
          <p className="text-gray-500 text-sm mt-1">You are logged into the Event Entry Scanner dashboard.</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-red-600 font-bold border-2 border-red-100 hover:bg-red-50 px-4 py-2 rounded-xl transition cursor-pointer"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>

      {/* Main Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/scanning')}
          className="bg-white border border-gray-150 hover:border-blue-500 text-blue-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="bg-blue-50 p-4 rounded-full">
            <Scan size={36} />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800 block">Scanning</span>
            <span className="text-xs text-gray-500 mt-1 block font-medium">Verify Entry Barcodes</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/registering')}
          className="bg-white border border-gray-150 hover:border-green-500 text-green-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="bg-green-50 p-4 rounded-full">
            <UserPlus size={36} />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800 block">Registering</span>
            <span className="text-xs text-gray-500 mt-1 block font-medium">Add New Visitor Tags</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/admin')}
          className="bg-white border border-gray-150 hover:border-purple-500 text-purple-600 rounded-2xl p-8 flex flex-col items-center gap-4 transition-all shadow-sm hover:shadow-md cursor-pointer"
        >
          <div className="bg-purple-50 p-4 rounded-full">
            <Settings size={36} />
          </div>
          <div className="text-center">
            <span className="text-lg font-bold text-gray-800 block">Admin Panel</span>
            <span className="text-xs text-gray-500 mt-1 block font-medium">Manage Users & Bookings</span>
          </div>
        </button>
      </div>

      {/* Set/Change Passcode PIN widget (Satisfies: when I log in for the first time make it so I can set a new passcode) */}
      <div className="bg-white border border-gray-100 p-8 rounded-3xl shadow-sm max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
          <ShieldCheck className="text-blue-600" size={20} /> Change Scanner PIN / Passcode
        </h3>
        <p className="text-gray-500 text-xs mb-6">
          Set or update your scanning passcode. This PIN code can be used for verification options.
        </p>

        {passcodeError && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 text-xs font-semibold">
            {passcodeError}
          </div>
        )}
        {passcodeSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4 text-xs font-semibold">
            {passcodeSuccess}
          </div>
        )}

        <form onSubmit={handlePasscodeUpdate} className="flex gap-4">
          <input
            type="password"
            placeholder="Min 4 digits (e.g. 4321)"
            value={newPasscode}
            onChange={(e) => setNewPasscode(e.target.value)}
            className="flex-1 border-2 border-gray-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition font-medium"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition text-sm cursor-pointer"
          >
            Update PIN
          </button>
        </form>
      </div>
    </div>
  );
}
