import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);
    const user = await register(formData);
    setLoading(false);
    
    if (user) {
      navigate('/farmer');
    } else {
      // Alert is already handled in register function
    }
  };  return (
    <div className="min-h-screen bg-primary-green flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-lg text-center">
        <div className="mb-6">
          <i className="fas fa-leaf text-dark-green text-5xl mb-2"></i>
          <h2 className="text-2xl font-bold text-gray-800">Farmer Registration</h2>
          <p className="text-gray-600">Join Smart Farm to sell your products</p>
        </div>
        <form className="space-y-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Phone Number (WhatsApp)</label>
            <input 
              type="text" 
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder="e.g. +250 788 123 456" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Location (District/Sector)</label>
            <input 
              type="text" 
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder="e.g. Musanze, Muhoza" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder="Create a password" 
              required
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-green" 
              placeholder="Confirm your password" 
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="terms" className="rounded text-primary-green focus:ring-primary-green" required />
            <label htmlFor="terms" className="text-sm text-gray-700">I agree to the Terms and Conditions</label>
          </div>
                    <button 
            type="submit" 
            className={`w-full bg-primary-green text-white py-2 rounded font-bold hover:bg-dark-green transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 text-sm">
          <p>Already have an account?</p>
          <Link to="/login" className="text-primary-green font-bold hover:underline">Login here</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;