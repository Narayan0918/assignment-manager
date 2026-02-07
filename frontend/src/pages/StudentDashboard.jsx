import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Shield, Loader, Calendar, AlertTriangle, Check, X } from 'lucide-react';
import api from '../api/axios';

const StudentDashboard = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [calculatedHash, setCalculatedHash] = useState(null);
  
  // New State for Confirmation Modal
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch Assignments on Load
  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const { data } = await api.get('/assignments');
        setAssignments(data);
      } catch (error) {
        console.error("Failed to load assignments");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const calculateFileHash = async (file) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const processFile = async (fileObject) => {
    setFile(fileObject);
    setCalculatedHash('Calculating integrity hash...');
    const hash = await calculateFileHash(fileObject);
    setCalculatedHash(hash);
  };

  // 1. Initial Trigger: Just opens the modal
  const initiateUpload = () => {
    if (!file || !selectedAssignment) return;
    setShowConfirm(true);
  };

  // 2. Actual API Call (Only triggered by Modal)
  const confirmUpload = async () => {
    setShowConfirm(false); // Close modal
    setUploading(true);

    try {
      const validId = selectedAssignment._id || selectedAssignment.id;
      if (!validId) {
        alert("Error: Invalid Assignment ID. Please refresh.");
        setUploading(false);
        return;
      }

      const formData = new FormData();
      formData.append('assignmentId', validId); 
      formData.append('fileHash', calculatedHash || "no-hash");
      formData.append('file', file); 

      await api.post('/submissions', formData);

      alert(`Success! File uploaded securely.`);
      setFile(null);
      setCalculatedHash(null);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Upload Error:", error);
      alert('Upload Failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

  return (
    <div className="space-y-8 animate-fade-in relative">
       
       {/* --- CONFIRMATION MODAL --- */}
       {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in border border-slate-100">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="bg-amber-100 p-3 rounded-full text-amber-600">
                <AlertTriangle className="w-8 h-8" />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-slate-800">Confirm Submission</h3>
                <p className="text-slate-500 text-sm mt-2">
                  You are about to submit <span className="font-semibold text-slate-800">{file?.name}</span> to the assignment <span className="font-semibold text-indigo-600">{selectedAssignment?.title}</span>.
                </p>
                <p className="text-xs text-slate-400 mt-1">Please ensure this is the correct version.</p>
              </div>

              <div className="flex gap-3 w-full pt-2">
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmUpload}
                  className="flex-1 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Confirm Upload
                </button>
              </div>
            </div>
          </div>
        </div>
       )}
       {/* ------------------------- */}

       <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Assignments</h2>
          <p className="text-slate-500 mt-1">Select an assignment to upload your work securely.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {assignments.length === 0 && (
             <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                No pending assignments.
            </div>
          )}
          {assignments.map(assign => (
            <div 
              key={assign._id} 
              onClick={() => setSelectedAssignment(assign)}
              className={`p-5 rounded-xl border transition-all cursor-pointer ${
                selectedAssignment?._id === assign._id 
                  ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' 
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{assign.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{assign.description}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
                        <Calendar className="w-4 h-4" /> 
                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className={`bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sticky top-24 ${!selectedAssignment ? 'opacity-50 pointer-events-none' : ''}`}>
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-indigo-500" /> Secure Upload
            </h3>
            
            {!selectedAssignment ? (
                <p className="text-sm text-slate-500 text-center py-8">Select an assignment from the list to begin.</p>
            ) : (
                <div className="space-y-4">
                <p className="text-sm text-slate-600 pb-2 border-b border-slate-100">
                    Submitting to: <span className="font-semibold text-indigo-600">{selectedAssignment.title}</span>
                </p>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50 relative">
                    {file ? (
                    <div className="space-y-2">
                        <FileText className="w-8 h-8 text-emerald-500 mx-auto" />
                        <p className="text-sm font-medium">{file.name}</p>
                    </div>
                    ) : (
                    <>
                        <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-sm text-slate-600">Click or Drag file here</p>
                        <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => e.target.files[0] && processFile(e.target.files[0])}
                        />
                    </>
                    )}
                </div>

                {calculatedHash && (
                    <div className="bg-slate-900 rounded-lg p-3 text-xs font-mono text-emerald-400 break-all border border-slate-700">
                    <div className="flex items-center gap-2 mb-1 text-slate-400 uppercase">
                        <Shield className="w-3 h-3" /> Integrity Hash
                    </div>
                    {calculatedHash}
                    </div>
                )}

                <button 
                    onClick={initiateUpload} // Triggers Modal, not direct upload
                    disabled={!file || uploading}
                    className="w-full py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-slate-300 transition-all"
                >
                    {uploading ? 'Uploading...' : 'Secure Submit'}
                </button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;