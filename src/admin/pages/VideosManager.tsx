import { useState, useEffect, useRef } from "react";
import { Plus, Video, Search, Edit2, Trash2, X, Upload } from "@/src/lib/icons";
import { collection, query, orderBy, onSnapshot, addDoc, deleteDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase";

export function VideosManager() {
  const [videos, setVideos] = useState<any[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVideo, setNewVideo] = useState({
    title: "",
    url: "",
    thumbnail: "",
    category: "",
    duration: ""
  });
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoFileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVideos(data);
    });
    return unsubscribe;
  }, []);

  const handleDeleteVideo = async (id: string) => {
    try {
      await deleteDoc(doc(db, "videos", id));
    } catch (error: any) {
      console.error("Error deleting video:", error);
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handleAddVideo = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUploadProgress(0);
    try {
      let finalVideoUrl = newVideo.url;
      let finalThumbnailUrl = newVideo.thumbnail;

      if (videoFile) {
        finalVideoUrl = await uploadFile(videoFile, `videos/${Date.now()}_${videoFile.name}`);
      }
      if (thumbnailFile) {
        finalThumbnailUrl = await uploadFile(thumbnailFile, `thumbnails/${Date.now()}_${thumbnailFile.name}`);
      }

      await addDoc(collection(db, "videos"), {
        ...newVideo,
        url: finalVideoUrl,
        thumbnail: finalThumbnailUrl,
        views: 0,
        createdAt: Date.now(),
      });
      setIsAddModalOpen(false);
      setNewVideo({ title: "", url: "", thumbnail: "", category: "", duration: "" });
      setVideoFile(null);
      setThumbnailFile(null);
    } catch (error: any) {
      console.error("Error adding video: ", error);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Video Management</h2>
          <p className="text-slate-500">Manage all Islamic videos in the app</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add New Video
        </button>
      </div>

      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Add New Video</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddVideo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                <input 
                  type="text" required
                  value={newVideo.title} onChange={e => setNewVideo({...newVideo, title: e.target.value})}
                  className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Video Source (Upload or URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="Enter video URL"
                    value={newVideo.url} 
                    onChange={e => {
                      setNewVideo({...newVideo, url: e.target.value});
                      if (e.target.value) setVideoFile(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled={!!videoFile}
                    required={!videoFile}
                  />
                  <input 
                    type="file" 
                    accept="video/*" 
                    className="hidden" 
                    ref={videoFileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setVideoFile(e.target.files[0]);
                        setNewVideo({...newVideo, url: ""});
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => videoFileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${videoFile ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Upload className="w-4 h-4" />
                    {videoFile ? 'Selected' : 'Upload'}
                  </button>
                </div>
                {videoFile && <p className="text-xs text-emerald-600 mt-1">File selected: {videoFile.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail Source (Upload or URL)</label>
                <div className="flex gap-2">
                  <input 
                    type="url" 
                    placeholder="Enter thumbnail URL"
                    value={newVideo.thumbnail} 
                    onChange={e => {
                      setNewVideo({...newVideo, thumbnail: e.target.value});
                      if (e.target.value) setThumbnailFile(null);
                    }}
                    className="flex-1 px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    disabled={!!thumbnailFile}
                    required={!thumbnailFile}
                  />
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    ref={thumbnailFileInputRef}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setThumbnailFile(e.target.files[0]);
                        setNewVideo({...newVideo, thumbnail: ""});
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => thumbnailFileInputRef.current?.click()}
                    className={`px-4 py-2 rounded-lg border flex items-center gap-2 transition-colors ${thumbnailFile ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                  >
                    <Upload className="w-4 h-4" />
                    {thumbnailFile ? 'Selected' : 'Upload'}
                  </button>
                </div>
                {thumbnailFile && <p className="text-xs text-emerald-600 mt-1">File selected: {thumbnailFile.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                  <select 
                    required
                    value={newVideo.category} onChange={e => setNewVideo({...newVideo, category: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="">Select Category</option>
                    <option value="Quran">Quran</option>
                    <option value="Hadith">Hadith</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Naat">Naat</option>
                    <option value="Dua">Dua</option>
                    <option value="Kids">Kids</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duration</label>
                  <input 
                    type="text" placeholder="e.g. 5:30" required
                    value={newVideo.duration} onChange={e => setNewVideo({...newVideo, duration: e.target.value})}
                    className="w-full px-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-slate-200 rounded-full h-2.5 mt-4">
                  <div className="bg-emerald-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                </div>
              )}

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 mt-6"
              >
                {isSubmitting ? `Uploading... ${uploadProgress > 0 ? Math.round(uploadProgress) + '%' : ''}` : "Add Video"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text"
              placeholder="Search videos..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 text-slate-900 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700 font-medium">
              <tr>
                <th className="px-6 py-4">Video</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {videos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p>No videos found. Add one to get started.</p>
                  </td>
                </tr>
              ) : (
                videos.map((vid) => (
                  <tr key={vid.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 flex items-center gap-4">
                      <img src={vid.thumbnail} alt="" className="w-16 h-10 object-cover rounded bg-slate-200" />
                      <span className="font-medium text-slate-800 line-clamp-1">{vid.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                        {vid.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{vid.views || 0}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDeleteVideo(vid.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
