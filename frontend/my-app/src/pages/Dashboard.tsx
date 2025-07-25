import * as React from 'react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJobs, getApplications, updateApplication, setShortlistedResetAt, getShortlistedResetAt } from '../lib/firebase';
import { useAppStore } from '../lib/store';

// Inline SVG Icons
const BriefcaseIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const EyeIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ClockIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ArrowRightIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const SearchIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ResetIcon = () => (
  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582M19.418 19A9 9 0 104.582 9M20 20v-5h-.581" />
  </svg>
);

const FileTextIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const MessageIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

// Inline UI Components
const Card = ({ children, className = '' }: any) => (
  <div className={`bg-white dark:bg-secondary-800 rounded-lg border border-secondary-200 dark:border-secondary-700 shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ children, className = '', onClick }: any) => (
  <button
    className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500 px-4 py-2 text-sm ${className}`}
    onClick={onClick}
  >
    {children}
  </button>
);

const Badge = ({ children, variant = 'default', className = '' }: any) => {
  const variants: Record<string, string> = {
    default: 'bg-secondary-100 dark:bg-secondary-700 text-secondary-800 dark:text-secondary-200',
    success: 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200',
    warning: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
    error: 'bg-error-100 dark:bg-error-900 text-error-800 dark:text-error-200',
    primary: 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
};

export function Dashboard() {
  const navigate = useNavigate();
  const { userProfile } = useAppStore();
  const [stats, setStats] = useState({
    totalJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    shortlistedApplications: 0,
    rejectedApplications: 0
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [shortlistedResetAt, setShortlistedResetAtState] = useState<Date | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);

  useEffect(() => {
    if (userProfile) {
      loadDashboardData();
      // Fetch shortlistedResetAt
      (async () => {
        if (userProfile?.id) {
          const resetAt = await getShortlistedResetAt(userProfile.id);
          setShortlistedResetAtState(resetAt);
        }
      })();
    }
  }, [userProfile]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      if (userProfile?.role === 'recruiter') {
        // Load recruiter data
        const jobs = await getJobs({ recruiterId: userProfile?.id });
        const applications = await getApplications({ recruiterId: userProfile?.id });
        setAllJobs(jobs);
        
        // Count shortlisted/hired applications after reset
        const shortlistedCount = applications.filter((app: any) => {
          if (!(app.status === 'shortlisted' || app.status === 'hired')) return false;
          if (shortlistedResetAt && app.updatedAt) {
            const updatedAt = app.updatedAt.seconds ? app.updatedAt.seconds * 1000 : app.updatedAt;
            return updatedAt > shortlistedResetAt.getTime();
          }
          return !shortlistedResetAt;
        }).length;
        setStats({
          totalJobs: jobs.length,
          totalApplications: applications.length,
          pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
          shortlistedApplications: shortlistedCount,
          rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length
        });
        
        setRecentJobs(jobs.slice(0, 3));
        setRecentApplications(applications.slice(0, 5));
      } else if (userProfile?.role === 'candidate') {
        // Load candidate data
        const applications = await getApplications({ candidateId: userProfile?.id });
        // Count unique jobs applied to
        const uniqueJobIds = new Set(applications.map((app: any) => app.jobId));
        const shortlistedJobIds = new Set(applications.filter((app: any) => {
          if (!(app.status === 'shortlisted' || app.status === 'hired')) return false;
          if (shortlistedResetAt && app.updatedAt) {
            const updatedAt = app.updatedAt.seconds ? app.updatedAt.seconds * 1000 : app.updatedAt;
            return updatedAt > shortlistedResetAt.getTime();
          }
          return !shortlistedResetAt;
        }).map((app: any) => app.jobId));
        const allJobs = await getJobs({});
        setAllJobs(allJobs);
        
        setStats({
          totalJobs: uniqueJobIds.size,
          totalApplications: applications.length,
          pendingApplications: applications.filter((app: any) => app.status === 'pending').length,
          shortlistedApplications: shortlistedJobIds.size,
          rejectedApplications: applications.filter((app: any) => app.status === 'rejected').length
        });
        
        setRecentApplications(applications.slice(0, 5));
        // Get recommended jobs based on candidate's skills/tags
        const recommendedJobs = allJobs.filter((job: any) => 
          job.tags?.some((tag: string) => 
            userProfile?.tags?.includes(tag)
          )
        ).slice(0, 3);
        setRecentJobs(recommendedJobs);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Reset shortlisted/hired stat persistently
  const handleResetShortlisted = async () => {
    if (resetting || !userProfile?.id) return;
    setResetting(true);
    try {
      await setShortlistedResetAt(userProfile.id, new Date());
      setShortlistedResetAtState(new Date());
      await loadDashboardData();
    } catch (e) {
      alert('Failed to reset.');
    } finally {
      setResetting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'shortlisted': return 'success';
      case 'rejected': return 'error';
      case 'hired': return 'success';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <ClockIcon />;
      case 'shortlisted': return <CheckCircleIcon />;
      case 'rejected': return <XCircleIcon />;
      case 'hired': return <CheckCircleIcon />;
      default: return <ClockIcon />;
    }
  };

  // Helper to get job title for an application
  const getJobTitle = (application: any) => {
    if (application.jobTitle) return application.jobTitle;
    const job = allJobs.find((j: any) => j.id === application.jobId);
    return job ? job.title : 'Job Title';
  };

  // Helper to get recruiter name for an application
  const getRecruiterName = (application: any) => {
    if (application.recruiterName) return application.recruiterName;
    const job = allJobs.find((j: any) => j.id === application.jobId);
    return job ? job.recruiterName : 'Recruiter';
  };

  // Helper function to validate and fix URLs (Firebase Storage URLs are direct)
  const getValidCvUrl = (url: string): string | null => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    if (url.startsWith('blob:')) return null; // Don't allow blob URLs
    return null;
  };

  const handleOpenCv = (resumeUrl: string, cvFileName?: string) => {
    try {
      const validUrl = getValidCvUrl(resumeUrl);
      if (!validUrl) {
        alert('CV not available or invalid URL');
        return;
      }
      const newWindow = window.open(validUrl, '_blank');
      if (!newWindow) {
        alert('Popup blocked. Please allow popups and try again.');
      }
    } catch (error) {
      console.error('Error opening CV:', error);
      alert('Unable to open CV. Please try again.');
    }
  };

  const handleOpenChat = (recruiterId: string) => {
    if (recruiterId) {
      navigate(`/chat?recipient=${recruiterId}`);
    } else {
      alert('Recruiter information not available');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">Dashboard</h1>
          <p className="text-secondary-600">Welcome back, {userProfile?.name}!</p>
        </div>
        
        <Card>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-2 text-secondary-600">Loading dashboard...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-secondary-900 dark:text-secondary-100">Dashboard</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Welcome back, {userProfile?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BriefcaseIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Jobs</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{stats.totalJobs}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <UsersIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Total Applications</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{stats.totalApplications}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-warning-100 rounded-lg">
              <ClockIcon />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400">Pending</p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{stats.pendingApplications}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircleIcon />
            </div>
            <div className="ml-4 group relative">
              <p className="text-sm font-medium text-secondary-600 dark:text-secondary-400 flex items-center">
                Shortlisted
                <span className="ml-1" title="Shortlisted or Hired">*</span>
                <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleResetShortlisted} title="This resets the value to the number of new shortlists/hirings you have done since last reset, and then rests to 0 if further pressed" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <ResetIcon />
                </span>
              </p>
              <p className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">{stats.shortlistedApplications}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              {userProfile?.role === 'recruiter' ? 'Recent Job Postings' : 'Recommended Jobs'}
            </h3>
            <Link
              to="/jobs"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentJobs.length === 0 ? (
            <div className="text-center py-8">
              <BriefcaseIcon />
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                {userProfile?.role === 'recruiter' 
                  ? 'No jobs posted yet.' 
                  : 'No recommended jobs found.'}
              </p>
              {userProfile?.role === 'recruiter' && (
                <Button className="mt-4" onClick={() => navigate('/post-job')}>
                  <PlusIcon />
                  <span className="ml-2">Post Your First Job</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-secondary-900 dark:text-secondary-100">{job.title}</h4>
                    <p className="text-sm text-secondary-600 dark:text-secondary-400">
                      {job.recruiterCompany || job.recruiterName}
                    </p>
                    <div className="flex items-center mt-2 space-x-2">
                      <Badge variant="default">{job.type}</Badge>
                      {job.location && (
                        <span className="text-xs text-secondary-500 dark:text-secondary-400">{job.location}</span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/jobs/${job.id}`}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRightIcon />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Applications */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              {userProfile?.role === 'recruiter' ? 'Recent Applications' : 'My Applications'}
            </h3>
            <Link
              to="/applications"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View all
            </Link>
          </div>
          
          {recentApplications.length === 0 ? (
            <div className="text-center py-8">
              <UsersIcon />
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                {userProfile?.role === 'recruiter' 
                  ? 'No applications received yet.' 
                  : 'No applications submitted yet.'}
              </p>
              {userProfile?.role === 'candidate' && (
                <Button className="mt-4" onClick={() => navigate('/jobs')}>
                  <EyeIcon />
                  <span className="ml-2">Browse Jobs</span>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentApplications.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border border-secondary-200 dark:border-secondary-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-secondary-100 dark:bg-secondary-700 rounded-lg">
                      {getStatusIcon(application.status)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary-900 dark:text-secondary-100">
                        {userProfile?.role === 'recruiter' 
                          ? application.candidateName 
                          : getJobTitle(application)}
                      </h4>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">
                        {userProfile?.role === 'recruiter' 
                          ? application.candidateEmail 
                          : getRecruiterName(application)}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant={getStatusColor(application.status)}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </Badge>
                        <span className="text-xs text-secondary-500 dark:text-secondary-400 ml-2">
                          {new Date(application.createdAt?.toDate?.() || application.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedApplication(application)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <ArrowRightIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-secondary-900">
                    {userProfile?.role === 'recruiter' 
                      ? selectedApplication.candidateName 
                      : getJobTitle(selectedApplication)}
                  </h2>
                  <p className="text-secondary-600">
                    {userProfile?.role === 'recruiter' 
                      ? selectedApplication.candidateEmail 
                      : getRecruiterName(selectedApplication)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-secondary-400 hover:text-secondary-600"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-secondary-900 mb-2">Application Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-secondary-600">
                        {userProfile?.role === 'recruiter' ? 'Job Title' : 'Applied for'}
                      </p>
                      <p className="font-medium">{getJobTitle(selectedApplication) || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-secondary-600">Applied Date</p>
                      <p className="font-medium">
                        {new Date(selectedApplication.createdAt?.toDate?.() || selectedApplication.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedApplication.score && (
                      <div>
                        <p className="text-secondary-600">Match Score</p>
                        <p className="font-medium text-success-600">
                          {selectedApplication.score}%
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-secondary-600">Status</p>
                      <Badge variant={getStatusColor(selectedApplication.status)}>
                        {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                {selectedApplication.coverLetter && (
                  <div>
                    <h3 className="font-semibold text-secondary-900 mb-2">Cover Letter</h3>
                    <p className="text-sm text-secondary-700 whitespace-pre-wrap">
                      {selectedApplication.coverLetter}
                    </p>
                  </div>
                )}
                
                <div className="flex space-x-3 pt-4 border-t border-secondary-200">
                  {selectedApplication.resumeUrl && (
                    <Button
                      onClick={() => handleOpenCv(selectedApplication.resumeUrl, selectedApplication.cvFileName)}
                      className="flex-1"
                    >
                      <FileTextIcon />
                      <span className="ml-2">
                        View {selectedApplication.cvFileName ? 'CV' : 'Resume'}
                      </span>
                    </Button>
                  )}
                  
                  {userProfile?.role === 'candidate' && selectedApplication.recruiterId && (
                    <Button
                      onClick={() => handleOpenChat(selectedApplication.recruiterId)}
                      className="flex-1"
                    >
                      <MessageIcon />
                      <span className="ml-2">Message Recruiter</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 