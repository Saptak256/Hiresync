import * as React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../lib/firebase';
import { uploadJDFile } from '../lib/firebaseStorage';
import { useAppStore } from '../lib/store';
import toast from 'react-hot-toast';

// Inline SVG Icons
const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const MapPinIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const TagIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
  </svg>
);

const DollarSignIcon = () => (
  <span className="text-lg font-bold text-secondary-600">$</span>
);

const RupeeIcon = () => (
  <span className="text-lg font-bold text-secondary-600">₹</span>
);

const EuroIcon = () => (
  <span className="text-lg font-bold text-secondary-600">€</span>
);

const PoundIcon = () => (
  <span className="text-lg font-bold text-secondary-600">£</span>
);

const YenIcon = () => (
  <span className="text-lg font-bold text-secondary-600">¥</span>
);

const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const UploadIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
  </svg>
);

// Inline UI Components
const Button = ({ children, type = 'button', className = '', disabled = false, onClick }: any) => (
  <button
    type={type}
    className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm ${className}`}
    disabled={disabled}
    onClick={onClick}
  >
    {children}
  </button>
);

const Input = ({ type = 'text', value, onChange, placeholder, className = '', required = false, id }: any) => (
  <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
  />
);

const Textarea = ({ value, onChange, placeholder, className = '', required = false, id, rows = 4 }: any) => (
  <textarea
    id={id}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    required={required}
    rows={rows}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 resize-vertical ${className}`}
  />
);

const Select = ({ value, onChange, options, className = '', required = false, id }: any) => (
  <select
    id={id}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full px-3 py-2 border border-secondary-300 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 focus:border-primary-500 focus:ring-primary-500 ${className}`}
  >
    {options.map((option: any) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white rounded-lg border border-secondary-200 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

export function PostJobPage() {
  const navigate = useNavigate();
  const { userProfile } = useAppStore();
  
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    type: 'full-time',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    },
    minCGPA: '',
    tags: [] as string[],
    jdFile: null as File | null,
    jdFileName: '' as string
  });
  
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [cgpaError, setCgpaError] = useState('');

  // Check if user is a recruiter and has complete company information
  React.useEffect(() => {
    if (userProfile && userProfile.role !== 'recruiter') {
      toast.error('Only recruiters can post jobs');
      navigate('/dashboard');
    } else if (userProfile && userProfile.role === 'recruiter') {
      // Check if company information is complete
      if (!userProfile.companyName || !userProfile.designation) {
        toast.error('Please complete your company information in your profile before posting jobs');
        navigate('/profile');
      }
    }
  }, [userProfile, navigate]);

  const handleInputChange = (field: string, value: any) => {
    // Special handling for CGPA to allow decimals up to 2 places
    if (field === 'minCGPA') {
      // Allow empty value, numbers, and decimals up to 2 places
      if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
        setFormData(prev => ({
          ...prev,
          [field]: value
        }));
        setCgpaError('');
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSalaryChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      salary: {
        ...prev.salary,
        [field]: value
      }
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getCurrencyIcon = (currency: string) => {
    switch (currency) {
      case 'INR':
        return <RupeeIcon />;
      case 'USD':
        return <DollarSignIcon />;
      case 'EUR':
        return <EuroIcon />;
      case 'GBP':
        return <PoundIcon />;
      case 'JPY':
        return <YenIcon />;
      default:
        return <DollarSignIcon />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        setFormData(prev => ({ 
          ...prev, 
          jdFile: file,
          jdFileName: file.name
        }));
        toast.success(`Job Description file uploaded: ${file.name}`);
      } else {
        toast.error('Please upload a PDF file for the Job Description');
        e.target.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title) {
      toast.error('Please enter a job title');
      return;
    }
    
    if (!formData.jdFile) {
      toast.error('Please upload a Job Description PDF file');
      return;
    }

    // Validate CGPA range
    if (formData.minCGPA) {
      const cgpaValue = parseFloat(formData.minCGPA);
      if (isNaN(cgpaValue) || cgpaValue < 0 || cgpaValue > 10) {
        setCgpaError('CGPA must be between 0 and 10');
        toast.error('CGPA must be between 0 and 10');
        return;
      }
      
      // Check if decimal places are more than 2
      const decimalPlaces = formData.minCGPA.split('.')[1]?.length || 0;
      if (decimalPlaces > 2) {
        setCgpaError('CGPA can have maximum 2 decimal places');
        toast.error('CGPA can have maximum 2 decimal places');
        return;
      }
    }

    try {
      setLoading(true);
      
      let jdFileUrl: string | undefined;
      let jdFileName: string | undefined;
      
      if (formData.jdFile) {
        if (!userProfile) {
          toast.error("You must be logged in to post a job.");
          setLoading(false);
          return;
        }
        try {
          // Upload JD file to Firebase Storage
          const downloadURL = await uploadJDFile(formData.jdFile, userProfile.id);
          
          jdFileUrl = downloadURL;
          jdFileName = formData.jdFileName;
        } catch (error) {
          console.error("Error uploading JD file:", error);
          toast.error("Failed to upload Job Description file. Please try again.");
          setLoading(false);
          return;
        }
      }
      
      const jobData = {
        title: formData.title,
        location: formData.location,
        type: formData.type,
        salary: formData.salary.min && formData.salary.max ? {
          min: parseInt(formData.salary.min),
          max: parseInt(formData.salary.max),
          currency: formData.salary.currency
        } : null,
        minCGPA: formData.minCGPA ? parseFloat(formData.minCGPA) : null,
        tags: formData.tags,
        recruiterId: userProfile?.id || '',
        recruiterName: userProfile?.name || '',
        recruiterCompany: userProfile?.companyName || '',
        jdFileUrl,
        jdFileName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await createJob(jobData);
      
      toast.success('Job posted successfully!');
      navigate('/jobs');
      
    } catch (error) {
      console.error('Error posting job:', error);
      toast.error('Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const currencies = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' },
    { value: 'JPY', label: 'JPY (¥)' }
  ];

  if (!userProfile || userProfile.role !== 'recruiter') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-secondary-900 mb-2">Access Denied</h2>
          <p className="text-secondary-600">Only recruiters can post jobs.</p>
        </div>
      </div>
    );
  }

  // Check if company information is complete
  if (!userProfile.companyName || !userProfile.designation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-4">
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">Complete Your Profile</h2>
            <p className="text-yellow-700 mb-4">
              You need to complete your company information before posting jobs.
            </p>
            <div className="text-left text-sm text-yellow-700 mb-4">
              <p className="mb-2">Required information:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Company Name</li>
                <li>Designation</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">Post a New Job</h1>
        <p className="text-secondary-600">Create a job posting to find the perfect candidate</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Title *
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    <BriefcaseIcon />
                  </div>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-secondary-700 mb-1">
                  Location
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    <MapPinIcon />
                  </div>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Bangalore, Noida, Mumbai or Remote"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-secondary-700 mb-1">
                  Job Type
                </label>
                <Select
                  id="type"
                  value={formData.type}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('type', e.target.value)}
                  options={jobTypes}
                />
              </div>

              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-secondary-700 mb-1">
                  Currency
                </label>
                <Select
                  id="currency"
                  value={formData.salary.currency}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSalaryChange('currency', e.target.value)}
                  options={currencies}
                />
              </div>
            </div>
          </div>

          {/* Salary Range */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Salary Range (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="minSalary" className="block text-sm font-medium text-secondary-700 mb-1">
                  Minimum Salary
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    {getCurrencyIcon(formData.salary.currency)}
                  </div>
                  <Input
                    id="minSalary"
                    type="number"
                    value={formData.salary.min}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSalaryChange('min', e.target.value)}
                    placeholder="e.g., 50000"
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maxSalary" className="block text-sm font-medium text-secondary-700 mb-1">
                  Maximum Salary
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    {getCurrencyIcon(formData.salary.currency)}
                  </div>
                  <Input
                    id="maxSalary"
                    type="number"
                    value={formData.salary.max}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSalaryChange('max', e.target.value)}
                    placeholder="e.g., 80000"
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* JD File Upload */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Job Description File (Required)</h3>
            <div>
              <label htmlFor="jdFile" className="block text-sm font-medium text-secondary-700 mb-1">
                Upload JD PDF
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                  <FileTextIcon />
                </div>
                <Input
                  id="jdFile"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="pl-10"
                  required
                />
              </div>
              {formData.jdFile && (
                <p className="mt-2 text-sm text-success-600">
                  ✓ {formData.jdFileName} selected
                </p>
              )}
            </div>
          </div>

          {/* Minimum CGPA */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Minimum CGPA Requirement</h3>
            <div>
              <label htmlFor="minCGPA" className="block text-sm font-medium text-secondary-700 mb-1">
                Minimum CGPA (Optional)
              </label>
              <Input
                id="minCGPA"
                type="text"
                value={formData.minCGPA}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('minCGPA', e.target.value)}
                placeholder="e.g., 7.50 (on a scale of 10)"
                className={`max-w-xs ${cgpaError ? 'border-error-500 focus:border-error-500 focus:ring-error-500' : ''}`}
              />
              {cgpaError && (
                <p className="mt-1 text-sm text-error-600">
                  {cgpaError}
                </p>
              )}
              <p className="mt-1 text-sm text-secondary-600">
                Enter the minimum CGPA required for this position (scale of 10)
              </p>
            </div>
          </div>

          {/* Tags */}
          <div>
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Tags</h3>
            <div className="space-y-3">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400">
                    <TagIcon />
                  </div>
                  <Input
                    value={tagInput}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTagInput(e.target.value)}
                    placeholder="Add tags (e.g., React, Python, Remote)"
                    className="pl-10"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  />
                </div>
                <Button type="button" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-primary-600 hover:text-primary-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-secondary-200">
            <Button
              type="button"
              onClick={() => navigate('/jobs')}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="px-8"
            >
              {loading ? 'Posting Job...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 