import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import {
  Loader2, CheckCircle, XCircle, ExternalLink,
  Instagram, Globe, Music, AlertTriangle
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import toast from 'react-hot-toast';

export default function DJApplicationsReview() {
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStatus, setCurrentStatus] = useState('pending');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  
  const loadApplications = async (status = currentStatus, page = 1) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/dj-applications?status=${status}&page=${page}&limit=10`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load applications');
      }
      
      setApplications(data.applications);
      setPagination(data.pagination);
      setCurrentStatus(status);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load DJ applications');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadApplications();
  }, []);
  
  const handleStatusChange = async (applicationId, newStatus, notes = '') => {
    try {
      const response = await fetch(`/api/admin/dj-applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes: notes
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || `Failed to ${newStatus} application`);
      }
      
      toast.success(`Application ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully`);
      
      // Refresh the current list
      loadApplications(currentStatus, pagination.page);
    } catch (error) {
      console.error('Error updating application:', error);
      toast.error(error.message || 'Failed to update application');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">DJ Applications</h1>
        <p className="text-gray-400">Review and process DJ applications</p>
      </div>
      
      <Tabs value={currentStatus} onValueChange={(value) => loadApplications(value)}>
        <TabsList className="mb-4">
          <TabsTrigger value="pending">
            Pending
            {currentStatus === 'pending' && applications.length > 0 && (
              <Badge variant="destructive" className="ml-2">{pagination.total}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-0">
          <ApplicationList 
            applications={applications} 
            isLoading={isLoading} 
            onAction={handleStatusChange}
            pagination={pagination}
            onPageChange={(page) => loadApplications(currentStatus, page)}
            status="pending"
          />
        </TabsContent>
        
        <TabsContent value="approved" className="mt-0">
          <ApplicationList 
            applications={applications} 
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => loadApplications(currentStatus, page)}
            status="approved"
          />
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-0">
          <ApplicationList 
            applications={applications} 
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => loadApplications(currentStatus, page)}
            status="rejected"
          />
        </TabsContent>
        
        <TabsContent value="all" className="mt-0">
          <ApplicationList 
            applications={applications} 
            isLoading={isLoading}
            pagination={pagination}
            onPageChange={(page) => loadApplications(currentStatus, page)}
            status="all"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ApplicationList({ applications, isLoading, onAction, pagination, onPageChange, status }) {
  const [expandedId, setExpandedId] = useState(null);
  const [notes, setNotes] = useState('');
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (applications.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <Music className="h-12 w-12 mx-auto text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">No applications found</h3>
        <p className="text-gray-400 mt-2">
          {status === 'pending' 
            ? "There are no pending DJ applications at this time"
            : `No ${status === 'all' ? '' : status} applications found`}
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="space-y-4">
        {applications.map((app) => (
          <Card key={app._id} className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-white">{app.userName}</CardTitle>
                  <CardDescription>{app.userEmail}</CardDescription>
                </div>
                <Badge 
                  className={
                    app.status === 'pending' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    app.status === 'approved' ? 'bg-green-600 hover:bg-green-700' :
                    'bg-red-600 hover:bg-red-700'
                  }
                >
                  {app.status}
                </Badge>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Applied: {new Date(app.appliedAt).toLocaleDateString()}
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem label="Experience" content={app.experience} />
                  <InfoItem label="Motivation" content={app.motivation} />
                </div>
                
                {expandedId === app._id && (
                  <div className="mt-4 space-y-4">
                    {app.equipment && (
                      <InfoItem label="Equipment" content={app.equipment} />
                    )}
                    
                    {app.genres && app.genres.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Genres</h4>
                        <div className="flex flex-wrap gap-2">
                          {app.genres.map((genre, idx) => (
                            <Badge key={idx} variant="outline" className="text-gray-300">
                              {genre}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {Object.values(app.socialLinks || {}).some(link => link) && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Social Links</h4>
                        <div className="flex flex-wrap gap-3">
                          {app.socialLinks?.instagram && (
                            <a href={app.socialLinks.instagram} target="_blank" rel="noopener noreferrer" 
                               className="text-purple-400 hover:text-purple-300 flex items-center">
                              <Instagram className="h-4 w-4 mr-1" />
                              <span>Instagram</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          {app.socialLinks?.soundcloud && (
                            <a href={app.socialLinks.soundcloud} target="_blank" rel="noopener noreferrer" 
                               className="text-orange-400 hover:text-orange-300 flex items-center">
                              <Music className="h-4 w-4 mr-1" />
                              <span>SoundCloud</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          {app.socialLinks?.mixcloud && (
                            <a href={app.socialLinks.mixcloud} target="_blank" rel="noopener noreferrer" 
                               className="text-blue-400 hover:text-blue-300 flex items-center">
                              <Music className="h-4 w-4 mr-1" />
                              <span>Mixcloud</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                          {app.socialLinks?.website && (
                            <a href={app.socialLinks.website} target="_blank" rel="noopener noreferrer" 
                               className="text-gray-400 hover:text-gray-300 flex items-center">
                              <Globe className="h-4 w-4 mr-1" />
                              <span>Website</span>
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {app.status === 'pending' && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Admin Notes</h4>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="2"
                          className="w-full px-3 py-2 bg-gray-700 rounded-md border border-gray-600 text-white text-sm focus:outline-none focus:border-blue-500"
                          placeholder="Optional notes about this application..."
                        />
                      </div>
                    )}
                    
                    {app.status !== 'pending' && app.adminNotes && (
                      <InfoItem label="Admin Notes" content={app.adminNotes} />
                    )}
                    
                    {app.status !== 'pending' && app.reviewedAt && (
                      <div className="text-sm text-gray-400">
                        Processed on: {new Date(app.reviewedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button
                variant="ghost"
                onClick={() => {
                  if (expandedId === app._id) {
                    setExpandedId(null);
                  } else {
                    setExpandedId(app._id);
                    setNotes('');
                  }
                }}
              >
                {expandedId === app._id ? 'Show Less' : 'Show More'}
              </Button>
              
              {app.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onAction(app._id, 'rejected', notes)}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => onAction(app._id, 'approved', notes)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center mt-6">
          <div className="join">
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={page === pagination.page ? "default" : "outline"}
                className="mx-1"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function InfoItem({ label, content }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-gray-400 mb-1">{label}</h4>
      <p className="text-gray-300 text-sm whitespace-pre-line">{content}</p>
    </div>
  );
} 