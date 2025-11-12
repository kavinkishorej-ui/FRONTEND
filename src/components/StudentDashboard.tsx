import { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { User, BookOpen, Award, LogOut, Download, Edit2, Check, X } from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [marks, setMarks] = useState<any[]>([]);
  const [groupedMarks, setGroupedMarks] = useState<any>({});
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFormData, setEditFormData] = useState({ fullName: '', email: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileData, marksData, summaryData] = await Promise.all([
        apiClient.getStudentProfile(),
        apiClient.getStudentMarks(),
        apiClient.getStudentSummary(),
      ]);
      setProfile(profileData.student);
      setEditFormData({
        fullName: profileData.student.fullName,
        email: profileData.student.email,
      });
      setMarks(marksData.marks);
      setGroupedMarks(marksData.groupedByExam);
      setSummary(summaryData.summary);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditProfile = () => {
    setIsEditingProfile(true);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setIsEditingProfile(false);
    setEditFormData({
      fullName: profile.fullName,
      email: profile.email,
    });
    setEditError('');
  };

  const handleSaveProfile = async () => {
    setEditError('');
    setEditLoading(true);

    try {
      const result = await apiClient.updateStudentProfile(editFormData);
      setProfile(result.student);
      setIsEditingProfile(false);
    } catch (err: any) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const exportToCSV = () => {
    const csv = 'Exam,Subject Code,Subject Name,Marks,Max Marks,Percentage\n' +
      marks.map(m =>
        `${m.examName},${m.subject.code},${m.subject.name},${m.marks},${m.maxMarks},${m.percentage}%`
      ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile?.studentId}_marks.csv`;
    a.click();
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Student Portal</h1>
            <p className="text-slate-600">Welcome, {user?.fullName}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-3 rounded-full">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800">Profile</h2>
              </div>
              {!isEditingProfile && (
                <button
                  onClick={handleEditProfile}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                  title="Edit Profile"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
            {editError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                {editError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <p className="text-sm text-slate-600">Student ID</p>
                <p className="text-base font-medium text-slate-800">{profile?.studentId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Full Name</p>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                ) : (
                  <p className="text-base font-medium text-slate-800">{profile?.fullName}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Email</p>
                {isEditingProfile ? (
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                  />
                ) : (
                  <p className="text-base font-medium text-slate-800">{profile?.email}</p>
                )}
              </div>
              {isEditingProfile && (
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={editLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-slate-400"
                  >
                    <Check className="w-4 h-4" />
                    {editLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    disabled={editLoading}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 disabled:bg-slate-400"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
              <div>
                <p className="text-sm text-slate-600">Department</p>
                <p className="text-base font-medium text-slate-800">{profile?.department?.name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Semester</p>
                  <p className="text-base font-medium text-slate-800">{profile?.semester}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Year</p>
                  <p className="text-base font-medium text-slate-800">{profile?.year}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Batch</p>
                  <p className="text-base font-medium text-slate-800">{profile?.batch}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            {summary && (
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg shadow-sm p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <Award className="w-6 h-6" />
                  <h2 className="text-lg font-semibold">Academic Summary</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Total Exams</p>
                    <p className="text-2xl font-bold">{summary.totalExams}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Total Marks</p>
                    <p className="text-2xl font-bold">{summary.totalMarks}/{summary.totalMaxMarks}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-blue-100 text-sm">Overall Percentage</p>
                    <p className="text-3xl font-bold">{summary.overallPercentage}%</p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                  <h2 className="text-lg font-semibold text-slate-800">Marks Details</h2>
                </div>
                {marks.length > 0 && (
                  <button
                    onClick={exportToCSV}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export CSV
                  </button>
                )}
              </div>

              {Object.keys(groupedMarks).length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No marks available yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(groupedMarks).map(([exam, examMarks]: any) => (
                    <div key={exam} className="border border-slate-200 rounded-lg overflow-hidden">
                      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                        <h3 className="font-semibold text-slate-800">{exam}</h3>
                        {summary?.examWiseSummary && (
                          <p className="text-sm text-slate-600 mt-1">
                            Total: {summary.examWiseSummary.find((s: any) => s.exam === exam)?.percentage}%
                          </p>
                        )}
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Subject Code</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Subject Name</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Marks</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Max Marks</th>
                              <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Percentage</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200">
                            {examMarks.map((mark: any) => (
                              <tr key={mark.id} className="hover:bg-slate-50">
                                <td className="px-4 py-3 text-sm text-slate-800">{mark.subject.code}</td>
                                <td className="px-4 py-3 text-sm text-slate-800">{mark.subject.name}</td>
                                <td className="px-4 py-3 text-sm text-slate-800">{mark.marks}</td>
                                <td className="px-4 py-3 text-sm text-slate-600">{mark.maxMarks}</td>
                                <td className="px-4 py-3 text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    parseFloat(mark.percentage) >= 75 ? 'bg-green-100 text-green-800' :
                                    parseFloat(mark.percentage) >= 60 ? 'bg-blue-100 text-blue-800' :
                                    parseFloat(mark.percentage) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {mark.percentage}%
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
