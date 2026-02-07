import React, { useState, useEffect } from 'react';
import { Search, FileCode, CheckCircle, Download, Loader, Eye, Plus, Trash2, Calendar } from 'lucide-react';
import api from '../api/axios';

const FacultyDashboard = () => {
  const [activeTab, setActiveTab] = useState('submissions'); // 'submissions' or 'assignments'
  const [searchTerm, setSearchTerm] = useState('');
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newAssign, setNewAssign] = useState({ title: '', description: '', dueDate: '' });

  // Fetch Data
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, assignRes] = await Promise.all([
        api.get('/submissions'),
        api.get('/assignments')
      ]);
      setSubmissions(subsRes.data);
      setAssignments(assignRes.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if(!window.confirm("Are you sure? This will not delete collected submissions, but will remove the assignment from student views.")) return;
    try {
      await api.delete(`/assignments/${id}`);
      setAssignments(assignments.filter(a => a._id !== id));
    } catch (error) {
      alert("Failed to delete");
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/assignments', newAssign);
      setAssignments([data, ...assignments]); // Add to top of list
      setNewAssign({ title: '', description: '', dueDate: '' }); // Reset form
      alert("Assignment Created!");
    } catch (error) {
      alert("Error creating assignment");
    }
  };

  const handleDownload = async (submissionId, fileName) => {
    try {
      const response = await api.get(`/submissions/${submissionId}/download`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Error downloading file");
    }
  };

  const filteredSubmissions = submissions.filter(sub => 
    sub.studentId?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.fileName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Faculty Portal</h2>
          <p className="text-slate-500 mt-1">Manage coursework and review submissions.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg self-start md:self-auto">
            <button 
                onClick={() => setActiveTab('submissions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'submissions' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Submissions
            </button>
            <button 
                onClick={() => setActiveTab('assignments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'assignments' ? 'bg-white shadow text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Manage Assignments
            </button>
        </div>
      </div>

      {activeTab === 'submissions' ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-slate-100 bg-slate-50/50">
              <div className="relative max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                  type="text" 
                  placeholder="Search student or file..." 
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
            </div>

            {/* --- FIX: Added overflow-x-auto container --- */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm min-w-200"> {/* min-w-[800px] forces scrolling on small screens */}
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                  <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Student</th>
                  <th className="px-6 py-4 whitespace-nowrap">Assignment</th>
                  <th className="px-6 py-4 whitespace-nowrap">File</th>
                  <th className="px-6 py-4 whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Actions</th>
                  </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                  {filteredSubmissions.length === 0 && <tr><td colSpan="5" className="p-6 text-center text-slate-400">No submissions found.</td></tr>}
                  {filteredSubmissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                          <div className="font-medium text-slate-900">{sub.studentId?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{sub.studentId?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{sub.assignmentId?.title || 'Deleted Assignment'}</td>
                      <td className="px-6 py-4 flex items-center gap-2"><FileCode className="w-4 h-4 text-indigo-400" /> {sub.fileName}</td>
                      <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2 py-1 rounded w-fit">
                          <CheckCircle className="w-3 h-3" /> Validated
                      </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                      <button onClick={() => handleDownload(sub._id, sub.fileName)} className="text-indigo-600 hover:underline flex items-center justify-end gap-1 w-full font-medium whitespace-nowrap">
                          <Download className="w-4 h-4" /> Download
                      </button>
                      </td>
                  </tr>
                  ))}
              </tbody>
              </table>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Form */}
            <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-6">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-indigo-500" /> Create Assignment
                    </h3>
                    <form onSubmit={handleCreateAssignment} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                            <input 
                                required
                                type="text" 
                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newAssign.title}
                                onChange={e => setNewAssign({...newAssign, title: e.target.value})}
                                placeholder="e.g. Web Security Project"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                            <input 
                                required
                                type="date" 
                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={newAssign.dueDate}
                                onChange={e => setNewAssign({...newAssign, dueDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                            <textarea 
                                className="w-full p-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                rows="3"
                                value={newAssign.description}
                                onChange={e => setNewAssign({...newAssign, description: e.target.value})}
                                placeholder="Instructions for students..."
                            ></textarea>
                        </div>
                        <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
                            Publish Assignment
                        </button>
                    </form>
                </div>
            </div>

            {/* List */}
            <div className="lg:col-span-2 space-y-4">
                {assignments.map(assign => (
                    <div key={assign._id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start group hover:border-indigo-300 transition-all gap-4">
                        <div>
                            <h4 className="font-bold text-slate-800 text-lg">{assign.title}</h4>
                            <p className="text-sm text-slate-600 mt-1">{assign.description}</p>
                            <div className="flex items-center gap-2 mt-3 text-xs text-slate-500 font-medium">
                                <Calendar className="w-4 h-4" /> 
                                Due: {new Date(assign.dueDate).toLocaleDateString()}
                                <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 ml-2">ID: {assign._id.slice(-6)}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDeleteAssignment(assign._id)}
                            className="text-slate-400 hover:text-rose-500 p-2 rounded-full hover:bg-rose-50 transition-colors self-end sm:self-start"
                            title="Delete Assignment"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                ))}
                {assignments.length === 0 && (
                    <div className="text-center p-10 bg-slate-50 rounded-xl border border-dashed border-slate-300 text-slate-400">
                        No active assignments. Create one to get started.
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;