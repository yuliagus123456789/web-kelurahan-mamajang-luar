import { useState, useEffect, FormEvent, useMemo } from 'react';
import { Link } from '@/lib/router';
import { supabase } from '@/lib/supabase';
import { NewsItem, GalleryItem, UmkmItem, ComplaintItem, SawComplaintItem } from '@/lib/types';
import { KELURAHAN_CONFIG } from '@/lib/config';
import { OFFICIAL_NEWS_DATA, OFFICIAL_GALLERY_DATA } from '@/data/newsAndGalleryData';
import { OFFICIAL_UMKM_DATA } from '@/data/umkmData';
import {
  calculateSawPriorities,
  calculateSawStatistics,
  INITIAL_SAMPLE_COMPLAINTS,
  SAW_CONFIG,
  CATEGORY_OPTIONS,
  IMPACT_OPTIONS,
} from '@/lib/spkSaw';
import {
  ShieldCheck,
  FileSpreadsheet,
  FolderArchive,
  MessageCircle,
  Megaphone,
  Users,
  Send,
  Save,
  RotateCcw,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Phone,
  FileText,
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  KeyRound,
  Newspaper,
  Images,
  Store,
  Plus,
  Search,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  X,
  Check,
  Calendar,
  Layers,
  Inbox,
  Clock,
  Calculator,
  SlidersHorizontal,
  Info,
  Flame,
  Activity,
  Camera,
} from 'lucide-react';

const STATUS_OPTIONS = [
  {
    id: 'ready',
    label: 'Selesai & Siap Diambil di Loket',
    badge: 'bg-emerald-100 text-emerald-800',
    template: (nama: string, jenis: string) =>
      `Yth. Bapak/Ibu ${nama || 'Pemohon'},\n\nKami menginformasikan bahwa permohonan *${jenis}* Anda di Kantor Kelurahan Mamajang Luar telah selesai diproses dan ditandatangani.\n\nSilakan datang ke loket kantor kelurahan pada jam pelayanan (Senin-Jumat 07.30 - 15.30 WITA) untuk mengambil dokumen asli dengan membawa fotokopi berkas pendukung.\n\nTerima kasih.\n*Pemerintah Kelurahan Mamajang Luar*`,
  },
  {
    id: 'incomplete',
    label: 'Berkas Belum Lengkap (Perlu Perbaikan)',
    badge: 'bg-amber-100 text-amber-800',
    template: (nama: string, jenis: string) =>
      `Yth. Bapak/Ibu ${nama || 'Pemohon'},\n\nTerima kasih telah mengajukan permohonan *${jenis}* di Kantor Kelurahan Mamajang Luar.\n\nSetelah kami verifikasi, terdapat beberapa berkas yang belum lengkap atau perlu diperbaiki. Mohon kesediaannya melengkapi berkas tersebut agar dapat segera kami proses lebih lanjut.\n\nTerima kasih.\n*Pemerintah Kelurahan Mamajang Luar*`,
  },
  {
    id: 'process',
    label: 'Sedang Diverifikasi & Diproses',
    badge: 'bg-blue-100 text-blue-800',
    template: (nama: string, jenis: string) =>
      `Yth. Bapak/Ibu ${nama || 'Pemohon'},\n\nPermohonan *${jenis}* Anda telah kami terima dan saat ini *sedang dalam proses verifikasi* oleh staf administrasi Kelurahan Mamajang Luar.\n\nEstimasi waktu penyelesaian adalah 1 hari kerja. Kami akan mengabari Anda kembali setelah dokumen siap diambil.\n\nTerima kasih.\n*Pemerintah Kelurahan Mamajang Luar*`,
  },
];

type AdminTab = 'complaints' | 'news' | 'gallery' | 'umkm' | 'tools';

export default function AdminPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('kelurahan_admin_logged_in') === 'true';
  });
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Active Tab: Default to 'complaints' (Pengaduan Warga paling pertama)
  const [activeTab, setActiveTab] = useState<AdminTab>('complaints');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Data States
  const [newsList, setNewsList] = useState<NewsItem[]>(OFFICIAL_NEWS_DATA);
  const [galleryList, setGalleryList] = useState<GalleryItem[]>(OFFICIAL_GALLERY_DATA);
  const [umkmList, setUmkmList] = useState<UmkmItem[]>(OFFICIAL_UMKM_DATA);
  const [complaintList, setComplaintList] = useState<ComplaintItem[]>(INITIAL_SAMPLE_COMPLAINTS);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // SPK SAW States
  const [complaintSortMode, setComplaintSortMode] = useState<'saw' | 'time'>('saw');
  const [complaintPriorityFilter, setComplaintPriorityFilter] = useState<string>('Semua');
  const [sawDetailModal, setSawDetailModal] = useState<SawComplaintItem | null>(null);
  const [sawMatrixModalOpen, setSawMatrixModalOpen] = useState(false);

  // Response Modal State
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [selectedComplaintForResponse, setSelectedComplaintForResponse] = useState<SawComplaintItem | null>(null);
  const [adminResponseText, setAdminResponseText] = useState('');
  const [adminResponseStatus, setAdminResponseStatus] = useState('Diproses');

  // Search & Filter States
  const [newsSearch, setNewsSearch] = useState('');
  const [newsCategoryFilter, setNewsCategoryFilter] = useState('Semua');
  const [gallerySearch, setGallerySearch] = useState('');
  const [umkmSearch, setUmkmSearch] = useState('');
  const [umkmCategoryFilter, setUmkmCategoryFilter] = useState('Semua');
  const [umkmStatusFilter, setUmkmStatusFilter] = useState<'Semua' | 'Menunggu' | 'Disetujui' | 'Ditolak'>('Semua');
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('Semua');

  // Modals States
  const [newsModalOpen, setNewsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsItem | null>(null);
  const [newsForm, setNewsForm] = useState({
    title: '',
    category: 'Pengumuman',
    excerpt: '',
    content: '',
    image_url: '',
    is_published: true,
    published_at: new Date().toISOString().split('T')[0],
  });

  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [editingGallery, setEditingGallery] = useState<GalleryItem | null>(null);
  const [galleryForm, setGalleryForm] = useState({
    title: '',
    description: '',
    image_url: '',
    event_date: new Date().toISOString().split('T')[0],
  });

  const [umkmModalOpen, setUmkmModalOpen] = useState(false);
  const [editingUmkm, setEditingUmkm] = useState<UmkmItem | null>(null);
  const [umkmForm, setUmkmForm] = useState<{
    name: string;
    owner: string;
    category: string;
    description: string;
    contact: string;
    address: string;
    image_url: string;
    status: 'Disetujui' | 'Menunggu' | 'Ditolak';
  }>({
    name: '',
    owner: '',
    category: 'Kuliner',
    description: '',
    contact: '',
    address: '',
    image_url: '',
    status: 'Disetujui',
  });

  // Delete Confirmation Modal
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    title: string;
    targetType: 'news' | 'gallery' | 'umkm' | 'complaint';
    targetId: string;
  }>({ open: false, title: '', targetType: 'news', targetId: '' });

  // Announcement state (Running text)
  const [announcementText, setAnnouncementText] = useState(
    '📢 Maklumat Pelayanan: Seluruh Pengurusan Surat & Administrasi Warga di Kelurahan Mamajang Luar 100% GRATIS (Bebas Pungli). Ajukan secara online via Google Form!'
  );
  const [announcementSaved, setAnnouncementSaved] = useState(false);

  // WhatsApp Generator State
  const [waNama, setWaNama] = useState('');
  const [waNomor, setWaNomor] = useState('');
  const [waJenisSurat, setWaJenisSurat] = useState('Surat Keterangan Usaha (SKU)');
  const [waStatus, setWaStatus] = useState(STATUS_OPTIONS[0].id);
  const [previewText, setPreviewText] = useState('');
  const [previewComplaintPhoto, setPreviewComplaintPhoto] = useState<string | null>(null);

  // Auto toast message helper
  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => {
      setFeedbackMsg((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Fetch all CMS data
  const fetchAllData = async () => {
    setIsLoadingData(true);
    try {
      const [nRes, gRes, uRes, cRes] = await Promise.allSettled([
        supabase.from('news').select('*').order('published_at', { ascending: false }),
        supabase.from('gallery').select('*').order('event_date', { ascending: false }),
        supabase.from('umkm').select('*').order('created_at', { ascending: false }),
        supabase.from('complaints').select('*').order('created_at', { ascending: false }),
      ]);

      const nData = nRes.status === 'fulfilled' ? nRes.value.data : null;
      const gData = gRes.status === 'fulfilled' ? gRes.value.data : null;
      const uData = uRes.status === 'fulfilled' ? uRes.value.data : null;
      const cData = cRes.status === 'fulfilled' ? cRes.value.data : null;

      if (nData && nData.length > 0) setNewsList(nData);
      else setNewsList(OFFICIAL_NEWS_DATA);

      if (gData && gData.length > 0) setGalleryList(gData);
      else setGalleryList(OFFICIAL_GALLERY_DATA);

      // UMKM (Supabase + Pendaftaran Mandiri Warga)
      let localUmkm: UmkmItem[] = [];
      try {
        localUmkm = JSON.parse(localStorage.getItem('mamajang_local_umkm') || '[]');
      } catch {
        // ignore
      }
      const rawUmkmPool: UmkmItem[] = [
        ...localUmkm,
        ...(uData || []),
        ...OFFICIAL_UMKM_DATA,
      ];
      const umkmMap = new Map<string, UmkmItem>();
      for (const item of rawUmkmPool) {
        if (!umkmMap.has(item.id)) {
          umkmMap.set(item.id, {
            ...item,
            status: item.status || 'Disetujui',
          });
        }
      }
      setUmkmList(Array.from(umkmMap.values()));

      // Pengaduan & Aspirasi Warga (Prioritaskan pengaduan lokal baru)
      let localComplaints: ComplaintItem[] = [];
      try {
        localComplaints = JSON.parse(localStorage.getItem('mamajang_local_complaints') || '[]');
      } catch {
        // ignore
      }

      const rawPool: ComplaintItem[] = [
        ...localComplaints,
        ...(cData || []),
        ...INITIAL_SAMPLE_COMPLAINTS,
      ];
      const complaintMap = new Map<string, ComplaintItem>();
      for (const item of rawPool) {
        const key = item.ticket_number || item.id;
        if (!complaintMap.has(key)) {
          complaintMap.set(key, item);
        }
      }
      setComplaintList(Array.from(complaintMap.values()));
    } catch (err) {
      console.warn('Gagal memuat data dari Supabase, menggunakan arsip data resmi dan data lokal:', err);
      setNewsList(OFFICIAL_NEWS_DATA);
      setGalleryList(OFFICIAL_GALLERY_DATA);
      let localUmkm: UmkmItem[] = [];
      try {
        localUmkm = JSON.parse(localStorage.getItem('mamajang_local_umkm') || '[]');
      } catch {
        // ignore
      }
      const rawUmkmPool: UmkmItem[] = [...localUmkm, ...OFFICIAL_UMKM_DATA];
      const umkmMap = new Map<string, UmkmItem>();
      for (const item of rawUmkmPool) {
        if (!umkmMap.has(item.id)) {
          umkmMap.set(item.id, {
            ...item,
            status: item.status || 'Disetujui',
          });
        }
      }
      setUmkmList(Array.from(umkmMap.values()));

      let localComplaints: ComplaintItem[] = [];
      try {
        localComplaints = JSON.parse(localStorage.getItem('mamajang_local_complaints') || '[]');
      } catch {
        // ignore
      }
      const rawPool: ComplaintItem[] = [
        ...localComplaints,
        ...INITIAL_SAMPLE_COMPLAINTS,
      ];
      const complaintMap = new Map<string, ComplaintItem>();
      for (const item of rawPool) {
        const key = item.ticket_number || item.id;
        if (!complaintMap.has(key)) {
          complaintMap.set(key, item);
        }
      }
      setComplaintList(Array.from(complaintMap.values()));
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    const savedAnnouncement = localStorage.getItem('kelurahan_announcement');
    if (savedAnnouncement) setAnnouncementText(savedAnnouncement);

    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  // Update preview when generator inputs change
  useEffect(() => {
    const currentOpt = STATUS_OPTIONS.find((o) => o.id === waStatus) ?? STATUS_OPTIONS[0];
    setPreviewText(currentOpt.template(waNama, waJenisSurat));
  }, [waNama, waJenisSurat, waStatus]);

  // Handle Login
  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const { username, password, kodePemulihan } = KELURAHAN_CONFIG.adminAuth;

    const isValidUser = loginUser.trim().toLowerCase() === username.toLowerCase();
    const isValidPass = loginPass === password || (kodePemulihan && loginPass === kodePemulihan);

    if (isValidUser && isValidPass) {
      sessionStorage.setItem('kelurahan_admin_logged_in', 'true');
      setIsAuthenticated(true);
      setLoginPass('');
      setLoginError(null);
    } else {
      setLoginError('Nama pengguna atau kata sandi tidak valid. Silakan periksa kembali.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('kelurahan_admin_logged_in');
    setIsAuthenticated(false);
  };

  // Handle Save Announcement
  const handleSaveAnnouncement = () => {
    localStorage.setItem('kelurahan_announcement', announcementText);
    window.dispatchEvent(new Event('kelurahan_announcement_updated'));
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  const handleResetAnnouncement = () => {
    const def =
      '📢 Maklumat Pelayanan: Seluruh Pengurusan Surat & Administrasi Warga di Kelurahan Mamajang Luar 100% GRATIS (Bebas Pungli). Ajukan secara online via Google Form!';
    setAnnouncementText(def);
    localStorage.setItem('kelurahan_announcement', def);
    window.dispatchEvent(new Event('kelurahan_announcement_updated'));
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 3000);
  };

  // Handle Send WhatsApp Generator
  const handleSendWa = () => {
    let clean = waNomor.replace(/[^0-9]/g, '');
    if (clean.startsWith('0')) clean = '62' + clean.slice(1);
    else if (!clean.startsWith('62')) clean = '62' + clean;

    const url = `https://wa.me/${clean}?text=${encodeURIComponent(previewText)}`;
    window.open(url, '_blank');
  };

  // ===== CRUD NEWS =====
  const handleOpenAddNews = () => {
    setEditingNews(null);
    setNewsForm({
      title: '',
      category: 'Pengumuman',
      excerpt: '',
      content: '',
      image_url: 'https://images.pexels.com/photos/36596595/pexels-photo-36596595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      is_published: true,
      published_at: new Date().toISOString().split('T')[0],
    });
    setNewsModalOpen(true);
  };

  const handleOpenEditNews = (item: NewsItem) => {
    setEditingNews(item);
    setNewsForm({
      title: item.title,
      category: item.category,
      excerpt: item.excerpt,
      content: item.content,
      image_url: item.image_url || '',
      is_published: item.is_published,
      published_at: item.published_at.split('T')[0],
    });
    setNewsModalOpen(true);
  };

  const handleSaveNews = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingNews) {
        // Update
        const { error } = await supabase
          .from('news')
          .update({
            title: newsForm.title,
            category: newsForm.category,
            excerpt: newsForm.excerpt,
            content: newsForm.content,
            image_url: newsForm.image_url || null,
            is_published: newsForm.is_published,
            published_at: newsForm.published_at,
          })
          .eq('id', editingNews.id);

        if (error) throw error;
        setNewsList((prev) =>
          prev.map((n) =>
            n.id === editingNews.id
              ? {
                  ...n,
                  ...newsForm,
                  image_url: newsForm.image_url || null,
                }
              : n
          )
        );
        showNotification('Berita berhasil diperbarui!');
      } else {
        // Create
        const newRecord = {
          title: newsForm.title,
          category: newsForm.category,
          excerpt: newsForm.excerpt,
          content: newsForm.content,
          image_url: newsForm.image_url || null,
          is_published: newsForm.is_published,
          published_at: newsForm.published_at,
        };

        const { data, error } = await supabase.from('news').insert(newRecord).select();

        if (error) throw error;
        if (data && data[0]) {
          setNewsList((prev) => [data[0] as NewsItem, ...prev]);
        } else {
          // Local fallback
          const optimistic: NewsItem = {
            id: `news-${Date.now()}`,
            ...newRecord,
            created_at: new Date().toISOString(),
          };
          setNewsList((prev) => [optimistic, ...prev]);
        }
        showNotification('Berita baru berhasil ditambahkan!');
      }
      setNewsModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menyimpan berita: ${error.message || 'Periksa koneksi'}`, 'error');
    }
  };

  const handleTogglePublishNews = async (item: NewsItem) => {
    const nextStatus = !item.is_published;
    try {
      const { error } = await supabase.from('news').update({ is_published: nextStatus }).eq('id', item.id);
      if (error) throw error;
      setNewsList((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_published: nextStatus } : n)));
      showNotification(`Status berita diubah menjadi ${nextStatus ? 'Dipublikasikan' : 'Draft'}`);
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal mengubah status berita: ${error.message}`, 'error');
    }
  };

  // ===== CRUD GALLERY =====
  const handleOpenAddGallery = () => {
    setEditingGallery(null);
    setGalleryForm({
      title: '',
      description: '',
      image_url: 'https://images.pexels.com/photos/36596595/pexels-photo-36596595.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      event_date: new Date().toISOString().split('T')[0],
    });
    setGalleryModalOpen(true);
  };

  const handleOpenEditGallery = (item: GalleryItem) => {
    setEditingGallery(item);
    setGalleryForm({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      event_date: item.event_date ? item.event_date.split('T')[0] : new Date().toISOString().split('T')[0],
    });
    setGalleryModalOpen(true);
  };

  const handleSaveGallery = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingGallery) {
        const { error } = await supabase
          .from('gallery')
          .update({
            title: galleryForm.title,
            description: galleryForm.description || null,
            image_url: galleryForm.image_url,
            event_date: galleryForm.event_date,
          })
          .eq('id', editingGallery.id);

        if (error) throw error;
        setGalleryList((prev) =>
          prev.map((g) =>
            g.id === editingGallery.id
              ? {
                  ...g,
                  ...galleryForm,
                  description: galleryForm.description || null,
                }
              : g
          )
        );
        showNotification('Dokumentasi galeri berhasil diperbarui!');
      } else {
        const newRecord = {
          title: galleryForm.title,
          description: galleryForm.description || null,
          image_url: galleryForm.image_url,
          event_date: galleryForm.event_date,
        };
        const { data, error } = await supabase.from('gallery').insert(newRecord).select();
        if (error) throw error;
        if (data && data[0]) {
          setGalleryList((prev) => [data[0] as GalleryItem, ...prev]);
        } else {
          const optimistic: GalleryItem = {
            id: `gal-${Date.now()}`,
            ...newRecord,
            created_at: new Date().toISOString(),
          };
          setGalleryList((prev) => [optimistic, ...prev]);
        }
        showNotification('Foto kegiatan baru berhasil ditambahkan ke galeri!');
      }
      setGalleryModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menyimpan galeri: ${error.message}`, 'error');
    }
  };

  // ===== CRUD & MODERASI UMKM =====
  const handleOpenAddUmkm = () => {
    setEditingUmkm(null);
    setUmkmForm({
      name: '',
      owner: '',
      category: 'Kuliner',
      description: '',
      contact: '',
      address: '',
      image_url: 'https://images.pexels.com/photos/36590872/pexels-photo-36590872.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
      status: 'Disetujui',
    });
    setUmkmModalOpen(true);
  };

  const handleOpenEditUmkm = (item: UmkmItem) => {
    setEditingUmkm(item);
    setUmkmForm({
      name: item.name,
      owner: item.owner,
      category: item.category,
      description: item.description,
      contact: item.contact || '',
      address: item.address || '',
      image_url: item.image_url || '',
      status: item.status || 'Disetujui',
    });
    setUmkmModalOpen(true);
  };

  const handleApproveUmkm = async (id: string) => {
    try {
      const { error } = await supabase
        .from('umkm')
        .update({ status: 'Disetujui' })
        .eq('id', id);

      if (error) {
        console.warn('Supabase update status failed, updating local state:', error);
      }

      setUmkmList((prev) =>
        prev.map((u) => (u.id === id ? { ...u, status: 'Disetujui' } : u))
      );

      try {
        const localCached: UmkmItem[] = JSON.parse(localStorage.getItem('mamajang_local_umkm') || '[]');
        const updated = localCached.map((u) => (u.id === id ? { ...u, status: 'Disetujui' as const } : u));
        localStorage.setItem('mamajang_local_umkm', JSON.stringify(updated));
      } catch {
        // ignore
      }

      showNotification('Pendaftaran UMKM warga berhasil disetujui dan kini aktif di katalog publik!');
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menyetujui UMKM: ${error.message}`, 'error');
    }
  };

  const handleSaveUmkm = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingUmkm) {
        const updatePayload = {
          name: umkmForm.name,
          owner: umkmForm.owner,
          category: umkmForm.category,
          description: umkmForm.description,
          contact: umkmForm.contact || null,
          address: umkmForm.address || null,
          image_url: umkmForm.image_url || null,
          status: umkmForm.status,
        };

        const { error } = await supabase
          .from('umkm')
          .update(updatePayload)
          .eq('id', editingUmkm.id);

        if (error) {
          console.warn('Supabase update failed, continuing with local state:', error);
        }

        setUmkmList((prev) =>
          prev.map((u) =>
            u.id === editingUmkm.id
              ? {
                  ...u,
                  ...umkmForm,
                  contact: umkmForm.contact || null,
                  address: umkmForm.address || null,
                  image_url: umkmForm.image_url || null,
                  status: umkmForm.status,
                }
              : u
          )
        );

        try {
          const localCached: UmkmItem[] = JSON.parse(localStorage.getItem('mamajang_local_umkm') || '[]');
          const updated = localCached.map((u) =>
            u.id === editingUmkm.id
              ? {
                  ...u,
                  ...umkmForm,
                  contact: umkmForm.contact || null,
                  address: umkmForm.address || null,
                  image_url: umkmForm.image_url || null,
                  status: umkmForm.status,
                }
              : u
          );
          localStorage.setItem('mamajang_local_umkm', JSON.stringify(updated));
        } catch {
          // ignore
        }

        showNotification('Data UMKM berhasil diperbarui!');
      } else {
        const newRecord = {
          name: umkmForm.name,
          owner: umkmForm.owner,
          category: umkmForm.category,
          description: umkmForm.description,
          contact: umkmForm.contact || null,
          address: umkmForm.address || null,
          image_url: umkmForm.image_url || null,
          status: umkmForm.status || 'Disetujui',
        };
        const { data, error } = await supabase.from('umkm').insert(newRecord).select();
        if (error) {
          console.warn('Supabase insert failed, continuing with optimistic state:', error);
        }
        if (data && data[0]) {
          setUmkmList((prev) => [data[0] as UmkmItem, ...prev]);
        } else {
          const optimistic: UmkmItem = {
            id: `umkm-${Date.now()}`,
            ...newRecord,
            created_at: new Date().toISOString(),
          };
          setUmkmList((prev) => [optimistic, ...prev]);
        }
        showNotification('UMKM warga berhasil ditambahkan ke katalog!');
      }
      setUmkmModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menyimpan data UMKM: ${error.message}`, 'error');
    }
  };

  // ===== COMPLAINTS (PENGADUAN) =====
  const handleUpdateComplaintStatus = async (id: string, newStatus: string) => {
    // 1. Selalu perbarui state UI secara instan
    setComplaintList((prev) => prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)));

    // 2. Simpan ke local storage
    try {
      const localCached: ComplaintItem[] = JSON.parse(
        localStorage.getItem('mamajang_local_complaints') || '[]'
      );
      const updated = localCached.map((c) => (c.id === id ? { ...c, status: newStatus } : c));
      localStorage.setItem('mamajang_local_complaints', JSON.stringify(updated));
    } catch {
      // ignore
    }

    // 3. Sinkronkan ke Supabase jika terhubung
    try {
      await supabase.from('complaints').update({ status: newStatus }).eq('id', id);
    } catch (err) {
      console.warn('Supabase offline, perubahan status tersimpan di penyimpanan lokal:', err);
    }

    showNotification(`Status pengaduan diubah menjadi: ${newStatus}`);
  };

  const handleOpenResponseModal = (item: SawComplaintItem) => {
    setSelectedComplaintForResponse(item);
    setAdminResponseText(item.admin_response || '');
    setAdminResponseStatus(item.status || 'Diproses');
    setResponseModalOpen(true);
  };

  const handleSaveAdminResponse = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedComplaintForResponse) return;

    const now = new Date().toISOString();
    try {
      // 1. Simpan ke Supabase
      const { error } = await supabase
        .from('complaints')
        .update({
          status: adminResponseStatus,
          admin_response: adminResponseText,
          responded_at: now,
        })
        .eq('id', selectedComplaintForResponse.id);

      if (error) {
        console.warn('Update supabase failed, updating local state:', error);
      }

      // 2. Simpan di local state
      setComplaintList((prev) =>
        prev.map((c) =>
          c.id === selectedComplaintForResponse.id
            ? {
                ...c,
                status: adminResponseStatus,
                admin_response: adminResponseText,
                responded_at: now,
              }
            : c
        )
      );

      // 3. Sinkronkan dengan local storage jika ada
      try {
        const localCached: ComplaintItem[] = JSON.parse(
          localStorage.getItem('mamajang_local_complaints') || '[]'
        );
        const updated = localCached.map((c) =>
          c.id === selectedComplaintForResponse.id
            ? {
                ...c,
                status: adminResponseStatus,
                admin_response: adminResponseText,
                responded_at: now,
              }
            : c
        );
        localStorage.setItem('mamajang_local_complaints', JSON.stringify(updated));
      } catch {
        // ignore
      }

      showNotification('Tanggapan dan status laporan berhasil diperbarui!');
      setResponseModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menyimpan respon: ${error.message}`, 'error');
    }
  };

  // Calculate SAW Priorities & KPI Statistics
  const sawComplaints = useMemo(() => {
    return calculateSawPriorities(complaintList);
  }, [complaintList]);

  const complaintStats = useMemo(() => {
    return calculateSawStatistics(sawComplaints);
  }, [sawComplaints]);

  const handleExportComplaintsCsv = () => {
    if (sawComplaints.length === 0) {
      showNotification('Belum ada data pengaduan untuk diekspor', 'error');
      return;
    }

    const headers = [
      'Peringkat Prioritas',
      'Nomor Tiket',
      'Skor SAW (Vi)',
      'Tingkat Urgensi',
      'Kategori Masalah (C1)',
      'Cakupan Dampak (C2)',
      'Kata Kunci Kedaruratan (C3)',
      'Tanggal Lapor',
      'Nama Pelapor',
      'No. HP',
      'Email',
      'Perihal',
      'Isi Pengaduan',
      'Status',
      'Tanggapan Resmi Kelurahan',
      'Waktu Ditanggapi',
    ];
    const rows = sawComplaints.map((c) => [
      c.saw.rank,
      `"${c.ticket_number || c.id}"`,
      c.saw.finalScore,
      `"${c.saw.priorityLevel}"`,
      `"${(c.category || '-').replace(/"/g, '""')}"`,
      `"${(c.impact_scope || '-').replace(/"/g, '""')}"`,
      `"${c.saw.matchedKeywords.join(', ') || 'Normal'}"`,
      new Date(c.created_at).toLocaleString('id-ID'),
      `"${c.name.replace(/"/g, '""')}"`,
      `"${(c.phone || '-').replace(/"/g, '""')}"`,
      `"${(c.email || '-').replace(/"/g, '""')}"`,
      `"${c.subject.replace(/"/g, '""')}"`,
      `"${c.message.replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${c.status}"`,
      `"${(c.admin_response || '-').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      c.responded_at ? new Date(c.responded_at).toLocaleString('id-ID') : '"-"',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Rekap_SPK_Prioritas_Pengaduan_Mamajang_Luar_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showNotification('Rekap prioritas pengaduan (SAW) berhasil diunduh dalam format CSV!');
  };

  // ===== DELETE EXECUTION =====
  const handleConfirmDelete = async () => {
    const { targetType, targetId } = deleteDialog;
    try {
      if (targetType === 'news') {
        const { error } = await supabase.from('news').delete().eq('id', targetId);
        if (error) throw error;
        setNewsList((prev) => prev.filter((n) => n.id !== targetId));
        showNotification('Berita berhasil dihapus');
      } else if (targetType === 'gallery') {
        const { error } = await supabase.from('gallery').delete().eq('id', targetId);
        if (error) throw error;
        setGalleryList((prev) => prev.filter((g) => g.id !== targetId));
        showNotification('Foto galeri berhasil dihapus');
      } else if (targetType === 'umkm') {
        const { error } = await supabase.from('umkm').delete().eq('id', targetId);
        if (error) throw error;
        setUmkmList((prev) => prev.filter((u) => u.id !== targetId));
        showNotification('Data UMKM berhasil dihapus');
      } else if (targetType === 'complaint') {
        setComplaintList((prev) => prev.filter((c) => c.id !== targetId));
        try {
          const localCached: ComplaintItem[] = JSON.parse(
            localStorage.getItem('mamajang_local_complaints') || '[]'
          );
          const updated = localCached.filter((c) => c.id !== targetId);
          localStorage.setItem('mamajang_local_complaints', JSON.stringify(updated));
        } catch {
          // ignore
        }
        try {
          await supabase.from('complaints').delete().eq('id', targetId);
        } catch (err) {
          console.warn('Supabase offline, data terhapus dari penyimpanan lokal:', err);
        }
        showNotification('Laporan pengaduan berhasil dihapus');
      }
    } catch (err: unknown) {
      const error = err as Error;
      showNotification(`Gagal menghapus data: ${error.message}`, 'error');
    } finally {
      setDeleteDialog({ open: false, title: '', targetType: 'news', targetId: '' });
    }
  };

  // Filtered collections
  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchSearch =
        item.title.toLowerCase().includes(newsSearch.toLowerCase()) ||
        item.excerpt.toLowerCase().includes(newsSearch.toLowerCase());
      const matchCat = newsCategoryFilter === 'Semua' || item.category === newsCategoryFilter;
      return matchSearch && matchCat;
    });
  }, [newsList, newsSearch, newsCategoryFilter]);

  const filteredGallery = useMemo(() => {
    return galleryList.filter((item) => {
      return (
        item.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(gallerySearch.toLowerCase()))
      );
    });
  }, [galleryList, gallerySearch]);

  const pendingUmkmCount = useMemo(() => {
    return umkmList.filter((u) => u.status === 'Menunggu').length;
  }, [umkmList]);

  const filteredUmkm = useMemo(() => {
    return umkmList.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(umkmSearch.toLowerCase()) ||
        item.owner.toLowerCase().includes(umkmSearch.toLowerCase()) ||
        item.description.toLowerCase().includes(umkmSearch.toLowerCase());
      const matchCat = umkmCategoryFilter === 'Semua' || item.category === umkmCategoryFilter;
      const itemStatus = item.status || 'Disetujui';
      const matchStatus = umkmStatusFilter === 'Semua' || itemStatus === umkmStatusFilter;
      return matchSearch && matchCat && matchStatus;
    });
  }, [umkmList, umkmSearch, umkmCategoryFilter, umkmStatusFilter]);

  const filteredComplaints = useMemo(() => {
    const list: SawComplaintItem[] =
      complaintSortMode === 'saw'
        ? sawComplaints
        : [...sawComplaints].sort(
            (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );

    return list.filter((item) => {
      const matchSearch =
        item.name.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        item.subject.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        item.message.toLowerCase().includes(complaintSearch.toLowerCase()) ||
        (item.ticket_number && item.ticket_number.toLowerCase().includes(complaintSearch.toLowerCase())) ||
        (item.category && item.category.toLowerCase().includes(complaintSearch.toLowerCase()));
      const matchStatus = complaintStatusFilter === 'Semua' || item.status === complaintStatusFilter;
      const matchPriority =
        complaintPriorityFilter === 'Semua' || item.saw.priorityLevel === complaintPriorityFilter;
      return matchSearch && matchStatus && matchPriority;
    });
  }, [sawComplaints, complaintSortMode, complaintSearch, complaintStatusFilter, complaintPriorityFilter]);

  // JIKA BELUM LOGIN: GERBANG LOGIN RESMI STAF
  if (!isAuthenticated) {
    return (
      <div className="pt-24 pb-20 bg-stone-100 min-h-screen flex items-center justify-center px-4 sm:px-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden animate-slide-up">
          <div className="bg-gradient-to-br from-stone-900 via-makassar-950 to-stone-900 text-white p-8 text-center relative">
            <div className="flex items-center justify-center mx-auto mb-4">
              <img
                src="/images/logo-pemkot-makassar.png"
                alt="Logo Pemerintah Kota Makassar"
                className="w-16 h-20 object-contain drop-shadow-md"
              />
            </div>
            <span className="inline-block px-3 py-1 rounded-full bg-gold-500/20 text-gold-300 text-[11px] font-bold tracking-wider uppercase border border-gold-500/30 mb-2">
              Akses Terbatas Staf
            </span>
            <h1 className="text-xl font-bold tracking-tight">Portal CMS Staf Kelurahan</h1>
            <p className="text-xs text-stone-300 mt-1">Kelurahan Mamajang Luar, Kota Makassar</p>
          </div>

          <div className="p-8">
            <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
              Silakan masukkan kredensial resmi staf untuk mengelola konten berita, galeri, direktori UMKM, dan respon pengaduan warga.
            </p>

            {loginError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-red-700 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Nama Pengguna (Username)</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="Masukkan username staf"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-800 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1.5">Kata Sandi (Password)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-stone-200 focus:border-makassar-800 focus:ring-2 focus:ring-makassar-100 outline-none text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1"
                    title={showPass ? 'Sembunyikan' : 'Tampilkan'}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-makassar-800 to-makassar-900 hover:from-makassar-700 hover:to-makassar-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Masuk ke Dashboard CMS Staf</span>
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-col items-center gap-3">
              <Link to="/" className="text-xs text-stone-500 hover:text-makassar-800 font-medium transition-colors">
                &larr; Kembali ke Halaman Utama Warga
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // JIKA SUDAH LOGIN: DASHBOARD CMS & OPERASIONAL LENGKAP
  return (
    <div className="pt-24 pb-20 bg-stone-50 min-h-screen">
      {/* Toast Notification */}
      {feedbackMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs sm:text-sm font-medium border animate-slide-up ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-800 text-white border-emerald-700'
              : 'bg-red-800 text-white border-red-700'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-300 shrink-0" />
          )}
          <span className="flex-1">{feedbackMsg.text}</span>
          <button onClick={() => setFeedbackMsg(null)} className="p-1 text-white/70 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Dashboard Staf */}
      <div className="bg-gradient-to-r from-stone-900 via-makassar-950 to-stone-900 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <img
              src="/images/logo-pemkot-makassar.png"
              alt="Logo Pemerintah Kota Makassar"
              className="w-12 h-14 object-contain drop-shadow shrink-0 mt-1"
            />
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                  <ShieldCheck className="w-4 h-4" /> Sesi Staf Aktif
                </span>
                <span className="text-xs text-stone-400">CMS Terpadu &middot; Kelurahan Mamajang Luar</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Pusat Kendali & CMS Konten Staf</h1>
              <p className="text-stone-300 text-xs sm:text-sm mt-1">
                Kelola publikasi berita, galeri kegiatan warga, direktori UMKM binaan, respon pengaduan, dan notifikasi layanan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              disabled={isLoadingData}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/20 flex items-center gap-1.5 disabled:opacity-50"
              title="Perbarui Data dari Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Segarkan Data</span>
            </button>
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors border border-white/20"
            >
              Lihat Web Warga
            </Link>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 rounded-xl bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
              title="Keluar dari sesi staf"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Navigation Tabs */}
        <div className="bg-white p-2 rounded-2xl shadow-sm border border-stone-200 flex items-center gap-1.5 overflow-x-auto scrollbar-none mb-6">
          {[
            { id: 'complaints', label: 'Pengaduan Warga', icon: Inbox, count: complaintList.length },
            { id: 'news', label: 'Berita & Pengumuman', icon: Newspaper, count: newsList.length },
            { id: 'gallery', label: 'Galeri Kegiatan', icon: Images, count: galleryList.length },
            {
              id: 'umkm',
              label: 'Katalog UMKM',
              icon: Store,
              count: umkmList.length,
              pending: pendingUmkmCount,
            },
            { id: 'tools', label: 'Alat Operasional & WA', icon: MessageCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-makassar-800 text-white shadow-sm'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.pending !== undefined && tab.pending > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-stone-950 shadow-sm animate-pulse">
                    {tab.pending} Menunggu
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* TAB 1: CMS BERITA & PENGUMUMAN */}
        {activeTab === 'news' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Newspaper className="w-5 h-5 text-makassar-800" />
                    Manajemen Berita & Pengumuman Kelurahan
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Publikasikan agenda kelurahan, bantuan sosial, maklumat penting, dan kabar kegiatan warga.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddNews}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Berita Baru</span>
                </button>
              </div>

              {/* Filter & Search Bar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={newsSearch}
                    onChange={(e) => setNewsSearch(e.target.value)}
                    placeholder="Cari judul atau isi berita..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800 focus:ring-1 focus:ring-makassar-800"
                  />
                  {newsSearch && (
                    <button
                      onClick={() => setNewsSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {['Semua', 'Pengumuman', 'Kegiatan', 'Pelayanan', 'Pembangunan'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewsCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        newsCategoryFilter === cat
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabel Berita */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Artikel</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Tanggal Terbit</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredNews.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-stone-400 text-xs">
                          Tidak ditemukan data berita yang cocok.
                        </td>
                      </tr>
                    ) : (
                      filteredNews.map((item) => (
                        <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-3.5 px-3 max-w-sm">
                            <div className="flex items-center gap-3">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.title}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0 border border-stone-200"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                  <Newspaper className="w-5 h-5" />
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-stone-900 line-clamp-1">{item.title}</h4>
                                <p className="text-stone-500 text-[11px] line-clamp-1 mt-0.5">{item.excerpt}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-full bg-makassar-50 text-makassar-800 font-semibold text-[11px]">
                              {item.category}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap text-stone-500">
                            {new Date(item.published_at).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <button
                              onClick={() => handleTogglePublishNews(item)}
                              className={`px-2.5 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1 transition-all ${
                                item.is_published
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                              }`}
                              title="Klik untuk ubah status publikasi"
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  item.is_published ? 'bg-emerald-600' : 'bg-stone-400'
                                }`}
                              />
                              <span>{item.is_published ? 'Dipublikasikan' : 'Draft'}</span>
                            </button>
                          </td>
                          <td className="py-3.5 px-3 text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                onClick={() => handleOpenEditNews(item)}
                                className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                title="Edit Berita"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteDialog({
                                    open: true,
                                    title: item.title,
                                    targetType: 'news',
                                    targetId: item.id,
                                  })
                                }
                                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                                title="Hapus Berita"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        )}

        {/* TAB 2: CMS GALERI KEGIATAN */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Images className="w-5 h-5 text-makassar-800" />
                    Manajemen Galeri Dokumentasi Kegiatan Warga
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Dokumentasi foto kerja bakti, festival budaya, pembagian bansos, dan momen kebersamaan warga.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddGallery}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Foto Galeri</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="mt-5 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={gallerySearch}
                    onChange={(e) => setGallerySearch(e.target.value)}
                    placeholder="Cari judul kegiatan..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800 focus:ring-1 focus:ring-makassar-800"
                  />
                </div>
              </div>

              {/* Grid Galeri */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mt-6">
                {filteredGallery.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-stone-400 text-xs">
                    Tidak ada dokumentasi kegiatan yang ditemukan.
                  </div>
                ) : (
                  filteredGallery.map((item) => (
                    <div
                      key={item.id}
                      className="bg-stone-50 rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col group"
                    >
                      <div className="relative aspect-video overflow-hidden bg-stone-200">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {item.event_date && (
                          <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-stone-900/80 backdrop-blur-sm text-white text-[10px] font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.event_date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        )}
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-bold text-stone-900 text-sm">{item.title}</h4>
                          {item.description && (
                            <p className="text-stone-500 text-xs mt-1 line-clamp-2">{item.description}</p>
                          )}
                        </div>
                        <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditGallery(item)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 text-xs font-semibold"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() =>
                              setDeleteDialog({
                                open: true,
                                title: item.title,
                                targetType: 'gallery',
                                targetId: item.id,
                              })
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white text-xs font-semibold transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CMS DIREKTORI UMKM */}
        {activeTab === 'umkm' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                    <Store className="w-5 h-5 text-makassar-800" />
                    Manajemen Direktori UMKM Warga Mamajang Luar
                  </h2>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Katalog usaha mikro warga binaan kelurahan: kuliner khas, kerajinan sutera, toko sembako, & jasa.
                  </p>
                </div>
                <button
                  onClick={handleOpenAddUmkm}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah UMKM Baru</span>
                </button>
              </div>

              {/* Status Counters & Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-5">
                <button
                  type="button"
                  onClick={() => setUmkmStatusFilter('Semua')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    umkmStatusFilter === 'Semua'
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Semua UMKM</p>
                  <p className="text-xl font-black mt-0.5">{umkmList.length}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUmkmStatusFilter('Menunggu')}
                  className={`p-3 rounded-2xl border text-left transition-all relative ${
                    umkmStatusFilter === 'Menunggu'
                      ? 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm font-bold'
                      : 'bg-amber-50/70 border-amber-200 text-amber-900 hover:bg-amber-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold uppercase tracking-wider">Perlu Persetujuan</p>
                    {pendingUmkmCount > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 animate-ping" />
                    )}
                  </div>
                  <p className="text-xl font-black mt-0.5">{pendingUmkmCount}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setUmkmStatusFilter('Disetujui')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    umkmStatusFilter === 'Disetujui'
                      ? 'bg-emerald-700 text-white border-emerald-700 shadow-sm'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-900 hover:bg-emerald-100/70'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Aktif di Website</p>
                  <p className="text-xl font-black mt-0.5">
                    {umkmList.filter((u) => !u.status || u.status === 'Disetujui').length}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setUmkmStatusFilter('Ditolak')}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    umkmStatusFilter === 'Ditolak'
                      ? 'bg-rose-700 text-white border-rose-700 shadow-sm'
                      : 'bg-rose-50/70 border-rose-200 text-rose-900 hover:bg-rose-100/70'
                  }`}
                >
                  <p className="text-[11px] font-bold uppercase tracking-wider opacity-90">Ditolak</p>
                  <p className="text-xl font-black mt-0.5">
                    {umkmList.filter((u) => u.status === 'Ditolak').length}
                  </p>
                </button>
              </div>

              {/* Filter & Search */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={umkmSearch}
                    onChange={(e) => setUmkmSearch(e.target.value)}
                    placeholder="Cari usaha, pemilik, atau produk..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800 focus:ring-1 focus:ring-makassar-800"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                  {['Semua', 'Kuliner', 'Kerajinan', 'Perdagangan', 'Pertanian', 'Jasa'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setUmkmCategoryFilter(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        umkmCategoryFilter === cat
                          ? 'bg-stone-800 text-white'
                          : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tabel UMKM */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[760px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3">Usaha & Pemilik</th>
                      <th className="py-3 px-3">Kategori</th>
                      <th className="py-3 px-3">Status Moderasi</th>
                      <th className="py-3 px-3">Kontak WhatsApp</th>
                      <th className="py-3 px-3">Alamat / Lokasi</th>
                      <th className="py-3 px-3 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredUmkm.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400 text-xs">
                          Tidak ada data UMKM yang cocok dengan filter.
                        </td>
                      </tr>
                    ) : (
                      filteredUmkm.map((item) => {
                        const status = item.status || 'Disetujui';
                        const isPending = status === 'Menunggu';
                        return (
                          <tr
                            key={item.id}
                            className={`transition-colors ${
                              isPending
                                ? 'bg-amber-50/40 hover:bg-amber-50/80 border-l-4 border-amber-500'
                                : 'hover:bg-stone-50/70'
                            }`}
                          >
                            <td className="py-3.5 px-3 max-w-xs">
                              <div className="flex items-center gap-3">
                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.name}
                                    className="w-12 h-12 rounded-xl object-cover shrink-0 border border-stone-200"
                                  />
                                ) : (
                                  <div className="w-12 h-12 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 shrink-0">
                                    <Store className="w-5 h-5" />
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-stone-900 flex items-center gap-1.5">
                                    <span>{item.name}</span>
                                    {isPending && (
                                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black bg-amber-200 text-amber-900">
                                        BARU
                                      </span>
                                    )}
                                  </h4>
                                  <p className="text-stone-500 text-[11px] mt-0.5">Pemilik: {item.owner}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-semibold text-[11px]">
                                {item.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {status === 'Menunggu' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-200">
                                  <Clock className="w-3 h-3 text-amber-700 shrink-0" />
                                  <span>Menunggu Verifikasi</span>
                                </span>
                              )}
                              {status === 'Disetujui' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[11px] border border-emerald-200">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
                                  <span>Disetujui (Publik)</span>
                                </span>
                              )}
                              {status === 'Ditolak' && (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 font-bold text-[11px] border border-rose-200">
                                  <X className="w-3 h-3 text-rose-700 shrink-0" />
                                  <span>Ditolak</span>
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              {item.contact ? (
                                <a
                                  href={`https://wa.me/62${item.contact.replace(/[^0-9]/g, '').replace(/^0/, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 font-semibold text-xs"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                  <span>{item.contact}</span>
                                </a>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 max-w-xs text-stone-600 text-xs truncate">
                              {item.address || '-'}
                            </td>
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                {isPending && (
                                  <button
                                    onClick={() => handleApproveUmkm(item.id)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                                    title="Setujui UMKM ini sekarang"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Setujui</span>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEditUmkm(item)}
                                  className="p-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors"
                                  title="Edit Data / Status UMKM"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      title: item.name,
                                      targetType: 'umkm',
                                      targetId: item.id,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                                  title="Hapus UMKM"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CMS PENGADUAN & ASPIRASI WARGA (SPK METODE SAW) */}
        {activeTab === 'complaints' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-makassar-100 text-makassar-900">
                      <Calculator className="w-5 h-5 text-makassar-800" />
                    </span>
                    <div>
                      <h2 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                        Prioritisasi Pengaduan Warga (SPK Metode SAW)
                      </h2>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Penerapan algoritma <em>Simple Additive Weighting</em> (SAW) untuk menentukan skala prioritas penanganan masalah warga secara objektif & berkeadilan.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setSawMatrixModalOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-makassar-50 hover:bg-makassar-100 text-makassar-900 border border-makassar-200 text-xs font-bold transition-all shadow-sm"
                    title="Buka Penjelasan Rumus & Matriks SAW"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-makassar-800" />
                    <span>Transparansi Rumus & Bobot SAW</span>
                  </button>
                  <button
                    onClick={handleExportComplaintsCsv}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Ekspor Rekap (CSV)</span>
                  </button>
                </div>
              </div>

              {/* 4 Kartu Metrik KPI Statistik Pengaduan (SAW) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Aduan</span>
                    <span className="p-1.5 rounded-lg bg-stone-200/80 text-stone-700">
                      <Inbox className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black text-stone-900 font-mono">{complaintStats.total}</p>
                  <span className="text-[11px] text-stone-500 block mt-0.5">Rata-rata Skor: {complaintStats.averageScore}</span>
                </div>

                <div className="p-4 rounded-2xl bg-red-50/70 border border-red-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-red-700 uppercase tracking-wider">Prioritas Tinggi</span>
                    <span className="p-1.5 rounded-lg bg-red-200 text-red-700">
                      <Flame className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black text-red-800 font-mono">{complaintStats.highPriority}</p>
                  <span className="text-[11px] text-red-600 font-medium block mt-0.5">Perlu Tindakan Segera (&ge; 0.75)</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Sedang Diproses</span>
                    <span className="p-1.5 rounded-lg bg-blue-200 text-blue-700">
                      <Activity className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black text-blue-800 font-mono">{complaintStats.inProgressCount}</p>
                  <span className="text-[11px] text-blue-600 block mt-0.5">Penanganan Tim / Satgas</span>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Selesai Ditangani</span>
                    <span className="p-1.5 rounded-lg bg-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  </div>
                  <p className="text-2xl font-black text-emerald-800 font-mono">{complaintStats.completedCount}</p>
                  <span className="text-[11px] text-emerald-600 block mt-0.5">Tuntas Berespon</span>
                </div>
              </div>

              {/* Banner Info Kriteria & Bobot SAW */}
              <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200/80">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-700 font-semibold">
                    <SlidersHorizontal className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Bobot Kriteria SPK:</span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-600">
                      C1: Kategori (40%)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-600">
                      C2: Cakupan Dampak (30%)
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] text-stone-600">
                      C3: Kedaruratan Teks (30%)
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] font-medium text-stone-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                      Tinggi (&ge; 0.75)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                      Sedang (0.50 - 0.74)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Rendah (&lt; 0.50)
                    </span>
                  </div>
                </div>
              </div>

              {/* Mode Urutan, Pencarian & Multi Filter */}
              <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-3 mt-5">
                {/* Toggle Mode Urutan */}
                <div className="inline-flex p-1 rounded-xl bg-stone-100 border border-stone-200 self-start">
                  <button
                    onClick={() => setComplaintSortMode('saw')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      complaintSortMode === 'saw'
                        ? 'bg-makassar-800 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Prioritas SPK SAW</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 text-white ml-1">
                      Rekomendasi
                    </span>
                  </button>
                  <button
                    onClick={() => setComplaintSortMode('time')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      complaintSortMode === 'time'
                        ? 'bg-stone-800 text-white shadow-sm'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Terbaru</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative w-full sm:w-60">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      value={complaintSearch}
                      onChange={(e) => setComplaintSearch(e.target.value)}
                      placeholder="Cari tiket, nama, perihal..."
                      className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800 focus:ring-1 focus:ring-makassar-800"
                    />
                  </div>

                  {/* Filter Status */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Status:</span>
                    {['Semua', 'Baru', 'Diproses', 'Selesai'].map((status) => (
                      <button
                        key={status}
                        onClick={() => setComplaintStatusFilter(status)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          complaintStatusFilter === status
                            ? 'bg-stone-800 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  {/* Filter Prioritas SAW */}
                  <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
                    <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Prioritas:</span>
                    {['Semua', 'Tinggi', 'Sedang', 'Rendah'].map((prio) => (
                      <button
                        key={prio}
                        onClick={() => setComplaintPriorityFilter(prio)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          complaintPriorityFilter === prio
                            ? prio === 'Tinggi'
                              ? 'bg-red-700 text-white'
                              : prio === 'Sedang'
                              ? 'bg-amber-600 text-white'
                              : prio === 'Rendah'
                              ? 'bg-emerald-700 text-white'
                              : 'bg-stone-800 text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {prio}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tabel Pengaduan Berbasis SPK */}
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[950px]">
                  <thead>
                    <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider">
                      <th className="py-3 px-3 text-center">Prioritas & Skor SAW</th>
                      <th className="py-3 px-3">Tiket & Pelapor</th>
                      <th className="py-3 px-3">Kategori & Dampak</th>
                      <th className="py-3 px-3">Perihal & Respon Kelurahan</th>
                      <th className="py-3 px-3 text-center">Status</th>
                      <th className="py-3 px-3 text-right">Tindak Lanjut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-stone-700">
                    {filteredComplaints.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-stone-400 text-xs">
                          Belum ada laporan pengaduan warga pada kriteria filter ini.
                        </td>
                      </tr>
                    ) : (
                      filteredComplaints.map((item) => {
                        const cleanPhone = item.phone ? item.phone.replace(/[^0-9]/g, '') : '';
                        const waNumber = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
                        const waUrl = cleanPhone
                          ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
                              `Halo Bapak/Ibu ${item.name}, kami dari Kantor Kelurahan Mamajang Luar ingin mengonfirmasi dan menindaklanjuti laporan Anda terkait tiket #${item.ticket_number || item.id}: "${item.subject}".`
                            )}`
                          : null;

                        const badgeStyles =
                          item.saw.priorityLevel === 'Tinggi'
                            ? 'bg-red-100 text-red-800 border-red-200'
                            : item.saw.priorityLevel === 'Sedang'
                            ? 'bg-amber-100 text-amber-800 border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200';

                        return (
                          <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                            {/* Kolom 1: Skor SAW & Prioritas */}
                            <td className="py-3.5 px-3 text-center whitespace-nowrap">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-black text-xs px-1.5 py-0.5 rounded bg-stone-100 text-stone-700">
                                    #{item.saw.rank}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-black border ${badgeStyles}`}
                                  >
                                    V: {item.saw.finalScore}
                                  </span>
                                </div>
                                <span className="text-[10px] font-bold tracking-wide uppercase text-stone-500">
                                  {item.saw.priorityLevel === 'Tinggi' && '🔴 Prioritas Tinggi'}
                                  {item.saw.priorityLevel === 'Sedang' && '🟡 Prioritas Sedang'}
                                  {item.saw.priorityLevel === 'Rendah' && '🟢 Prioritas Rendah'}
                                </span>
                                <button
                                  onClick={() => setSawDetailModal(item)}
                                  className="inline-flex items-center gap-1 text-[10px] text-makassar-800 hover:text-makassar-900 font-semibold underline mt-0.5"
                                >
                                  <Info className="w-3 h-3" />
                                  <span>Rincian Hitungan</span>
                                </button>
                              </div>
                            </td>

                            {/* Kolom 2: Tiket, Waktu & Pelapor */}
                            <td className="py-3.5 px-3 whitespace-nowrap">
                              <span className="inline-block font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-stone-100 text-stone-800 border border-stone-200 mb-1">
                                #{item.ticket_number || item.id.slice(0, 10)}
                              </span>
                              <p className="font-bold text-stone-900">{item.name}</p>
                              <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3" />
                                {new Date(item.created_at).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </p>
                              {item.phone && <p className="text-[11px] text-stone-400 font-mono mt-0.5">{item.phone}</p>}
                            </td>

                            {/* Kolom 3: Kategori & Cakupan Dampak */}
                            <td className="py-3.5 px-3 max-w-[200px]">
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 font-semibold text-[11px] border border-stone-200">
                                  {item.category || 'Kebersihan & Drainase'}
                                </span>
                                <p className="text-[11px] text-stone-500 flex items-center gap-1">
                                  <Users className="w-3 h-3 text-stone-400 shrink-0" />
                                  <span>{item.impact_scope || 'Beberapa Warga (1 RT)'}</span>
                                </p>
                              </div>
                            </td>

                            {/* Kolom 4: Perihal & Respon Kelurahan */}
                            <td className="py-3.5 px-3 max-w-sm text-stone-600 leading-relaxed text-xs">
                              <p className="font-bold text-stone-900 mb-0.5">{item.subject}</p>
                              <p className="line-clamp-2 text-stone-600">{item.message}</p>
                              {item.saw.matchedKeywords.length > 0 && (
                                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                                  <span className="text-[10px] text-stone-400">Kata kedaruratan:</span>
                                  {item.saw.matchedKeywords.map((kw) => (
                                    <span
                                      key={kw}
                                      className="px-1.5 py-0.2 rounded bg-red-50 text-red-700 text-[10px] font-bold border border-red-200"
                                    >
                                      &ldquo;{kw}&rdquo;
                                    </span>
                                  ))}
                                </div>
                              )}

                              {item.image_url && (
                                <div className="mt-1.5">
                                  <button
                                    onClick={() => setPreviewComplaintPhoto(item.image_url!)}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-makassar-50 hover:bg-makassar-100 text-makassar-800 border border-makassar-200 text-[11px] font-bold transition-all shadow-2xs cursor-pointer"
                                    title="Klik untuk melihat foto bukti kejadian"
                                  >
                                    <Camera className="w-3.5 h-3.5 text-makassar-700" />
                                    <span>Lihat Foto Bukti</span>
                                  </button>
                                </div>
                              )}

                              {item.admin_response ? (
                                <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950">
                                  <span className="font-bold text-emerald-800 block text-[10px] flex items-center gap-1">
                                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Catatan Kelurahan:
                                  </span>
                                  <p className="line-clamp-2 italic text-emerald-900 mt-0.5">&ldquo;{item.admin_response}&rdquo;</p>
                                </div>
                              ) : (
                                <div className="mt-1.5">
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                    Menunggu catatan respon
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Kolom 5: Status Laporan */}
                            <td className="py-3.5 px-3 whitespace-nowrap text-center">
                              <select
                                value={item.status}
                                onChange={(e) => handleUpdateComplaintStatus(item.id, e.target.value)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold border outline-none cursor-pointer ${
                                  item.status === 'Selesai'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : item.status === 'Diproses'
                                    ? 'bg-blue-50 text-blue-800 border-blue-200'
                                    : 'bg-amber-50 text-amber-800 border-amber-200'
                                }`}
                              >
                                <option value="Baru">Baru</option>
                                <option value="Diproses">Diproses</option>
                                <option value="Selesai">Selesai</option>
                              </select>
                            </td>

                            {/* Kolom 6: Tindak Lanjut */}
                            <td className="py-3.5 px-3 text-right whitespace-nowrap">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenResponseModal(item)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-makassar-50 text-makassar-800 hover:bg-makassar-800 hover:text-white font-bold text-xs transition-all border border-makassar-200 shadow-sm"
                                  title="Tulis Catatan / Tindak Lanjut Resmi"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>{item.admin_response ? 'Ubah Respon' : 'Beri Respon'}</span>
                                </button>
                                {waUrl ? (
                                  <a
                                    href={waUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all"
                                    title="Hubungi via WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5" />
                                    <span>WA</span>
                                  </a>
                                ) : (
                                  <span className="text-stone-400 text-xs">-</span>
                                )}
                                <button
                                  onClick={() =>
                                    setDeleteDialog({
                                      open: true,
                                      title: `Pengaduan oleh ${item.name}`,
                                      targetType: 'complaint',
                                      targetId: item.id,
                                    })
                                  }
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white transition-colors"
                                  title="Hapus Laporan"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ALAT OPERASIONAL, GOOGLE SHEETS & WA */}
        {activeTab === 'tools' && (
          <div className="space-y-8">
            {/* Ringkasan Pintasan Google Sheets & Drive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  title: 'Rekap Surat Masuk',
                  desc: 'Permohonan SKU, SKTM, Domisili dari warga',
                  url: KELURAHAN_CONFIG.googleSheetsAdmin.rekapSuratMasuk,
                  color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
                  btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white',
                },
                {
                  title: 'Rekap Aspirasi & Pengaduan',
                  desc: 'Laporan masalah kebersihan, jalan, & ketertiban',
                  url: KELURAHAN_CONFIG.googleSheetsAdmin.rekapPengaduan,
                  color: 'text-blue-600 bg-blue-50 border-blue-200/60',
                  btnColor: 'bg-blue-600 hover:bg-blue-700 text-white',
                },
                {
                  title: 'Pendaftaran UMKM Baru',
                  desc: 'Usaha warga yang siap divalidasi ke web',
                  url: KELURAHAN_CONFIG.googleSheetsAdmin.rekapUmkm,
                  color: 'text-amber-600 bg-amber-50 border-amber-200/60',
                  btnColor: 'bg-amber-600 hover:bg-amber-700 text-white',
                },
                {
                  title: 'Google Drive Arsip Berkas',
                  desc: 'Folder foto KTP, KK & lampiran warga',
                  url: KELURAHAN_CONFIG.googleSheetsAdmin.driveArsipBerkas,
                  color: 'text-purple-600 bg-purple-50 border-purple-200/60',
                  btnColor: 'bg-purple-600 hover:bg-purple-700 text-white',
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="bg-white rounded-2xl p-5 border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.color} border`}>
                        {card.title.includes('Drive') ? (
                          <FolderArchive className="w-5 h-5" />
                        ) : (
                          <FileSpreadsheet className="w-5 h-5" />
                        )}
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Google Sheet</span>
                    </div>
                    <h3 className="font-bold text-stone-800 text-sm">{card.title}</h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">{card.desc}</p>
                  </div>

                  <a
                    href={card.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm ${card.btnColor}`}
                  >
                    <span>Buka Dokumen</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>

            {/* Generator Notifikasi WhatsApp & Pengatur Running Text */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Kolom Kiri: Generator Notifikasi WhatsApp ke Warga */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                      <MessageCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-stone-800">Generator Pesan WhatsApp Pemohon Surat</h2>
                      <p className="text-xs text-stone-500">
                        Beri tahu warga status berkasnya secara cepat dengan format resmi kelurahan
                      </p>
                    </div>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Auto-Format
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Nama Pemohon</label>
                    <input
                      type="text"
                      value={waNama}
                      onChange={(e) => setWaNama(e.target.value)}
                      placeholder="Contoh: Ibu Nurhayati"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">No. WhatsApp Pemohon</label>
                    <input
                      type="text"
                      value={waNomor}
                      onChange={(e) => setWaNomor(e.target.value)}
                      placeholder="Contoh: 0812-3456-7890"
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Jenis Surat Yang Diajukan</label>
                    <select
                      value={waJenisSurat}
                      onChange={(e) => setWaJenisSurat(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm bg-white"
                    >
                      <option value="Surat Keterangan Usaha (SKU)">Surat Keterangan Usaha (SKU)</option>
                      <option value="Surat Keterangan Tidak Mampu (SKTM)">Surat Keterangan Tidak Mampu (SKTM)</option>
                      <option value="Surat Keterangan Domisili">Surat Keterangan Domisili</option>
                      <option value="Surat Pengantar Nikah (N-1)">Surat Pengantar Nikah (N-1)</option>
                      <option value="Surat Pengantar KTP-el">Surat Pengantar KTP-el</option>
                      <option value="Surat Pengantar Kartu Keluarga">Surat Pengantar Kartu Keluarga</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Pilih Status Berkas</label>
                    <select
                      value={waStatus}
                      onChange={(e) => setWaStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-stone-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none text-xs sm:text-sm bg-white font-medium"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Preview Pesan WhatsApp */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-stone-400" /> Pratinjau Teks WhatsApp:
                    </span>
                    <span className="text-[11px] text-stone-400">Siap dikirimkan ke warga</span>
                  </div>
                  <textarea
                    rows={6}
                    readOnly
                    value={previewText}
                    className="w-full p-3 rounded-xl bg-stone-100/80 border border-stone-200 text-xs text-stone-800 font-mono leading-relaxed resize-none outline-none"
                  />
                </div>

                {/* Tombol Kirim WA */}
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
                  <p className="text-[11px] text-stone-500">
                    Pesan akan langsung membuka chat WhatsApp dengan format teks di atas.
                  </p>
                  <button
                    onClick={handleSendWa}
                    disabled={!waNomor.trim()}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs shadow-md transition-all"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Kirim ke WhatsApp Warga</span>
                  </button>
                </div>
              </div>

              {/* Kolom Kanan: Pengatur Pengumuman Berjalan Beranda */}
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 pb-4 mb-4 border-b border-stone-100">
                    <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-stone-800">Pengumuman Berjalan Beranda</h2>
                      <p className="text-xs text-stone-500">Ubah teks banner darurat di bagian atas web</p>
                    </div>
                  </div>

                  <label className="block text-xs font-bold text-stone-700 mb-1.5">Teks Maklumat / Pengumuman</label>
                  <textarea
                    rows={5}
                    value={announcementText}
                    onChange={(e) => setAnnouncementText(e.target.value)}
                    placeholder="Tuliskan pengumuman penting di sini..."
                    className="w-full p-3 rounded-xl border border-stone-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 outline-none text-xs sm:text-sm resize-none"
                  />

                  {announcementSaved && (
                    <div className="mt-2.5 flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold animate-slide-down">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Pengumuman berhasil diperbarui di website!</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 flex items-center gap-2">
                  <button
                    onClick={handleSaveAnnouncement}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white font-bold text-xs shadow transition-all"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Simpan Pengumuman</span>
                  </button>
                  <button
                    onClick={handleResetAnnouncement}
                    className="p-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
                    title="Kembalikan ke Teks Bawaan"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Direktori RW & RT Mamajang Luar */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-makassar-50 text-makassar-800 flex items-center justify-center border border-makassar-100">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-stone-800">Direktori Koordinasi Ketua RW & RT Mamajang Luar</h2>
                    <p className="text-xs text-stone-500">Kontak ketua lingkungan untuk koordinasi lapangan dan verifikasi berkas pengantar</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-makassar-800 bg-makassar-50 px-3 py-1 rounded-full border border-makassar-100">
                  Total: {KELURAHAN_CONFIG.daftarRW.length} RW &bull; 16 RT Resmi
                </span>
              </div>

              {/* Tabel RW */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Tingkat Rukun Warga (RW)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs sm:text-sm min-w-[560px]">
                    <thead>
                      <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider whitespace-nowrap">
                        <th className="py-2.5 px-3">Rukun Warga</th>
                        <th className="py-2.5 px-3">Nama Ketua RW</th>
                        <th className="py-2.5 px-3">Jumlah RT & KK</th>
                        <th className="py-2.5 px-3">Cakupan Wilayah</th>
                        <th className="py-2.5 px-3 text-right">Aksi Koordinasi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700 whitespace-nowrap">
                      {KELURAHAN_CONFIG.daftarRW.map((rw) => {
                        const waNumber = rw.kontak.replace(/[^0-9]/g, '');
                        const waUrl = `https://wa.me/62${waNumber.startsWith('0') ? waNumber.slice(1) : waNumber}?text=${encodeURIComponent(
                          `Halo Ketua ${rw.rw} (${rw.ketua}), kami dari Kantor Kelurahan Mamajang Luar ingin mengonfirmasi terkait...`
                        )}`;

                        return (
                          <tr key={rw.rw} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-3 px-3 font-bold text-makassar-900">{rw.rw}</td>
                            <td className="py-3 px-3 font-semibold text-stone-800">{rw.ketua}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-stone-100 font-mono text-xs font-medium">
                                {rw.jumlahRT} RT &bull; {rw.jumlahKK} KK
                              </span>
                            </td>
                            <td className="py-3 px-3 text-stone-500 text-xs">{rw.wilayah}</td>
                            <td className="py-3 px-3 text-right">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-all"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Chat WA ({rw.kontak})</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tabel 16 RT Lengkap */}
              <div className="pt-4 border-t border-stone-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Daftar Lengkap 16 Rukun Tetangga (RT)</h3>
                <div className="overflow-x-auto max-h-96">
                  <table className="w-full text-left text-xs min-w-[620px]">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-stone-200 text-stone-400 text-[11px] uppercase tracking-wider whitespace-nowrap">
                        <th className="py-2.5 px-3">RT / RW</th>
                        <th className="py-2.5 px-3">Nama Ketua RT</th>
                        <th className="py-2.5 px-3">Alamat Domisili</th>
                        <th className="py-2.5 px-3 text-center">Jumlah KK</th>
                        <th className="py-2.5 px-3 text-right">Aksi Cepat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700 whitespace-nowrap">
                      {KELURAHAN_CONFIG.daftarRT.map((rt) => {
                        const cleanNum = rt.kontak.replace(/[^0-9]/g, '');
                        const waUrl = `https://wa.me/62${cleanNum.startsWith('0') ? cleanNum.slice(1) : cleanNum}?text=${encodeURIComponent(
                          `Halo Ketua ${rt.rt} ${rt.rw} (${rt.ketua}), kami dari pelayanan Kantor Kelurahan Mamajang Luar...`
                        )}`;

                        return (
                          <tr key={`${rt.rw}-${rt.rt}`} className="hover:bg-stone-50/70 transition-colors">
                            <td className="py-2.5 px-3 font-bold text-makassar-800">
                              {rt.rw} - {rt.rt}
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-stone-900">{rt.ketua}</td>
                            <td className="py-2.5 px-3 text-stone-500 text-xs">{rt.alamat}</td>
                            <td className="py-2.5 px-3 text-center font-bold text-stone-700">{rt.jumlahKK} KK</td>
                            <td className="py-2.5 px-3 text-right">
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-600 text-stone-600 hover:text-white font-bold text-[11px] transition-all"
                              >
                                <Phone className="w-3 h-3" />
                                <span>WA ({rt.kontak})</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: FORM TAMBAH / EDIT BERITA */}
      {newsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-slide-up">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-makassar-800" />
                <span>{editingNews ? 'Edit Berita & Pengumuman' : 'Tambah Berita / Pengumuman Baru'}</span>
              </h3>
              <button
                onClick={() => setNewsModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Judul Berita</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Contoh: Jadwal Pelayanan Posyandu Balita RW 02"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800 focus:ring-1 focus:ring-makassar-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori</label>
                  <select
                    value={newsForm.category}
                    onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white outline-none focus:border-makassar-800"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Kegiatan">Kegiatan</option>
                    <option value="Pelayanan">Pelayanan</option>
                    <option value="Pembangunan">Pembangunan</option>
                    <option value="Kesehatan">Kesehatan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal Publikasi</label>
                  <input
                    type="date"
                    required
                    value={newsForm.published_at}
                    onChange={(e) => setNewsForm({ ...newsForm, published_at: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Ringkasan Singkat (Excerpt)</label>
                <textarea
                  rows={2}
                  required
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  placeholder="1-2 kalimat pengantar yang menarik..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Konten Lengkap Berita</label>
                <textarea
                  rows={6}
                  required
                  value={newsForm.content}
                  onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                  placeholder="Tuliskan isi berita lengkap di sini..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto Sampul (Image URL)</label>
                <input
                  type="url"
                  value={newsForm.image_url}
                  onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
                {newsForm.image_url && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-stone-200">
                    <img src={newsForm.image_url} alt="Pratinjau" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="newsPublish"
                  checked={newsForm.is_published}
                  onChange={(e) => setNewsForm({ ...newsForm, is_published: e.target.checked })}
                  className="w-4 h-4 text-makassar-800 rounded border-stone-300 focus:ring-makassar-800"
                />
                <label htmlFor="newsPublish" className="text-xs font-bold text-stone-700 cursor-pointer">
                  Langsung Publikasikan di Halaman Berita Warga
                </label>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingNews ? 'Perbarui Berita' : 'Simpan Berita'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TAMBAH / EDIT GALERI */}
      {galleryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-stone-200 animate-slide-up">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <Images className="w-5 h-5 text-makassar-800" />
                <span>{editingGallery ? 'Edit Foto Kegiatan' : 'Tambah Foto Dokumentasi Kegiatan'}</span>
              </h3>
              <button
                onClick={() => setGalleryModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveGallery} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Judul / Nama Kegiatan</label>
                <input
                  type="text"
                  required
                  value={galleryForm.title}
                  onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                  placeholder="Contoh: Kerja Bakti Massal Lorong Wisata RW 01"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Tanggal Kegiatan</label>
                <input
                  type="date"
                  required
                  value={galleryForm.event_date}
                  onChange={(e) => setGalleryForm({ ...galleryForm, event_date: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto (Image URL)</label>
                <input
                  type="url"
                  required
                  value={galleryForm.image_url}
                  onChange={(e) => setGalleryForm({ ...galleryForm, image_url: e.target.value })}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
                {galleryForm.image_url && (
                  <div className="mt-2 relative w-full h-36 rounded-xl overflow-hidden border border-stone-200">
                    <img src={galleryForm.image_url} alt="Pratinjau Foto" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  rows={2}
                  value={galleryForm.description}
                  onChange={(e) => setGalleryForm({ ...galleryForm, description: e.target.value })}
                  placeholder="Keterangan singkat tentang kegiatan warga..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingGallery ? 'Perbarui Foto' : 'Simpan Foto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FORM TAMBAH / EDIT UMKM */}
      {umkmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 animate-slide-up">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="text-base font-bold text-stone-800 flex items-center gap-2">
                <Store className="w-5 h-5 text-makassar-800" />
                <span>{editingUmkm ? 'Edit Data UMKM Warga' : 'Pendaftaran UMKM Binaan Baru'}</span>
              </h3>
              <button
                onClick={() => setUmkmModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUmkm} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Usaha / Produk</label>
                <input
                  type="text"
                  required
                  value={umkmForm.name}
                  onChange={(e) => setUmkmForm({ ...umkmForm, name: e.target.value })}
                  placeholder="Contoh: Jalangkote & Barongko Mama Tenri"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Pemilik Usaha</label>
                  <input
                    type="text"
                    required
                    value={umkmForm.owner}
                    onChange={(e) => setUmkmForm({ ...umkmForm, owner: e.target.value })}
                    placeholder="Contoh: Ibu Tenri"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Kategori Bidang Usaha</label>
                  <select
                    value={umkmForm.category}
                    onChange={(e) => setUmkmForm({ ...umkmForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white outline-none focus:border-makassar-800"
                  >
                    <option value="Kuliner">Kuliner</option>
                    <option value="Kerajinan">Kerajinan</option>
                    <option value="Perdagangan">Perdagangan</option>
                    <option value="Pertanian">Pertanian (Lorong)</option>
                    <option value="Jasa">Jasa</option>
                    <option value="Fashion">Fashion</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">No. WhatsApp Pemilik</label>
                  <input
                    type="text"
                    value={umkmForm.contact}
                    onChange={(e) => setUmkmForm({ ...umkmForm, contact: e.target.value })}
                    placeholder="0812-xxxx-xxxx"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Alamat / Lokasi Usaha</label>
                  <input
                    type="text"
                    value={umkmForm.address}
                    onChange={(e) => setUmkmForm({ ...umkmForm, address: e.target.value })}
                    placeholder="Contoh: Jl. Mamajang Lorong 2 RT 01"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm outline-none focus:border-makassar-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Deskripsi Produk / Keunggulan</label>
                <textarea
                  rows={3}
                  required
                  value={umkmForm.description}
                  onChange={(e) => setUmkmForm({ ...umkmForm, description: e.target.value })}
                  placeholder="Deskripsikan produk, keunggulan rasa, jam buka, atau sistem pemesanan..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">URL Foto Produk (Image URL)</label>
                <input
                  type="url"
                  value={umkmForm.image_url}
                  onChange={(e) => setUmkmForm({ ...umkmForm, image_url: e.target.value })}
                  placeholder="https://images.pexels.com/..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800"
                />
                {umkmForm.image_url && (
                  <div className="mt-2 relative w-32 h-20 rounded-lg overflow-hidden border border-stone-200">
                    <img src={umkmForm.image_url} alt="Pratinjau UMKM" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200">
                <label className="block text-xs font-bold text-stone-800 mb-1">Status Publikasi & Verifikasi</label>
                <select
                  value={umkmForm.status}
                  onChange={(e) =>
                    setUmkmForm({
                      ...umkmForm,
                      status: e.target.value as 'Disetujui' | 'Menunggu' | 'Ditolak',
                    })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white outline-none focus:border-makassar-800 font-semibold cursor-pointer"
                >
                  <option value="Disetujui">🟢 Disetujui (Aktif & Tampil di Website Publik)</option>
                  <option value="Menunggu">🟡 Menunggu Verifikasi Staf</option>
                  <option value="Ditolak">🔴 Ditolak (Tidak Memenuhi Syarat)</option>
                </select>
                <p className="text-[11px] text-stone-500 mt-1.5">
                  Hanya UMKM berstatus &quot;Disetujui&quot; yang muncul di halaman katalog publik untuk warga.
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUmkmModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold shadow-sm"
                >
                  {editingUmkm ? 'Perbarui UMKM' : 'Daftarkan UMKM'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: KONFIRMASI HAPUS DATA */}
      {deleteDialog.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-slide-up text-center">
            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-stone-900 text-base">Konfirmasi Penghapusan</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              Apakah Anda yakin ingin menghapus data <strong className="text-stone-800">"{deleteDialog.title}"</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleteDialog({ open: false, title: '', targetType: 'news', targetId: '' })}
                className="flex-1 py-2.5 px-4 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: DETAIL PERHITUNGAN MATEMATIS SAW UNTUK 1 PENGADUAN */}
      {sawDetailModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-slide-up my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-makassar-100 text-makassar-900">
                  <Calculator className="w-5 h-5 text-makassar-800" />
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Rincian Perhitungan Matematis SAW</h3>
                  <p className="text-xs text-stone-500">Transparansi skor preferensi prioritas untuk pelapor: {sawDetailModal.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSawDetailModal(null)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-5 text-xs text-stone-700">
              {/* Ringkasan Data Laporan */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Perihal Laporan:</span>
                    <strong className="text-stone-900 text-xs">{sawDetailModal.subject}</strong>
                  </div>
                  <div>
                    <span className="text-[11px] text-stone-400 block font-medium">Pelapor & Waktu:</span>
                    <span className="text-stone-800">{sawDetailModal.name} &bull; {new Date(sawDetailModal.created_at).toLocaleDateString('id-ID')}</span>
                  </div>
                </div>
                <div className="mt-2.5 pt-2.5 border-t border-stone-200/70">
                  <span className="text-[11px] text-stone-400 block font-medium mb-0.5">Isi Pesan:</span>
                  <p className="text-stone-600 text-[11px] italic bg-white p-2.5 rounded-xl border border-stone-200/60">
                    &ldquo;{sawDetailModal.message}&rdquo;
                  </p>
                </div>
              </div>

              {/* Langkah 1: Matriks Keputusan (Nilai Mentah) */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-makassar-800 text-white flex items-center justify-center text-[10px]">1</span>
                  Langkah 1: Penilaian Nilai Mentah Alternatif (Matriks X)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">C1: Kategori (40%)</span>
                    <p className="font-black text-base text-makassar-900 mt-1">{sawDetailModal.saw.rawCategory} / 5</p>
                    <span className="text-[11px] text-stone-600 block mt-0.5">{sawDetailModal.category || 'Kebersihan & Drainase'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">C2: Cakupan (30%)</span>
                    <p className="font-black text-base text-makassar-900 mt-1">{sawDetailModal.saw.rawImpact} / 4</p>
                    <span className="text-[11px] text-stone-600 block mt-0.5">{sawDetailModal.impact_scope || 'Beberapa Warga (1 RT)'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-stone-200">
                    <span className="text-[10px] uppercase font-bold text-stone-400 block">C3: Kedaruratan (30%)</span>
                    <p className="font-black text-base text-makassar-900 mt-1">{sawDetailModal.saw.rawUrgency} / 4</p>
                    <span className="text-[11px] text-stone-600 block mt-0.5">
                      {sawDetailModal.saw.matchedKeywords.length > 0
                        ? `Kata: ${sawDetailModal.saw.matchedKeywords.join(', ')}`
                        : 'Normal / Non-kritis'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Langkah 2: Normalisasi Matriks R */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-makassar-800 text-white flex items-center justify-center text-[10px]">2</span>
                  Langkah 2: Normalisasi Matriks (Kriteria Keuntungan / Benefit)
                </h4>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 font-mono text-[11px] space-y-1.5">
                  <p className="text-stone-500 text-[10px] mb-1 font-sans">Rumus: R_ij = X_ij / max(X_j)</p>
                  <p>
                    <strong className="text-stone-800">R1 (Kategori):</strong> {sawDetailModal.saw.rawCategory} &divide; max(C1) ={' '}
                    <span className="text-makassar-800 font-bold">{sawDetailModal.saw.normCategory}</span>
                  </p>
                  <p>
                    <strong className="text-stone-800">R2 (Cakupan):</strong> {sawDetailModal.saw.rawImpact} &divide; max(C2) ={' '}
                    <span className="text-makassar-800 font-bold">{sawDetailModal.saw.normImpact}</span>
                  </p>
                  <p>
                    <strong className="text-stone-800">R3 (Kedaruratan):</strong> {sawDetailModal.saw.rawUrgency} &divide; max(C3) ={' '}
                    <span className="text-makassar-800 font-bold">{sawDetailModal.saw.normUrgency}</span>
                  </p>
                </div>
              </div>

              {/* Langkah 3: Perhitungan Nilai Preferensi V */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-full bg-makassar-800 text-white flex items-center justify-center text-[10px]">3</span>
                  Langkah 3: Perkalian Bobot Preferensi (V = &Sigma; W_j &times; R_ij)
                </h4>
                <div className="p-3.5 rounded-xl bg-makassar-50/70 border border-makassar-200/80 font-mono text-[11px] space-y-1">
                  <p className="font-sans text-xs text-makassar-900 font-semibold mb-1">
                    V = (0.40 &times; {sawDetailModal.saw.normCategory}) + (0.30 &times; {sawDetailModal.saw.normImpact}) + (0.30 &times; {sawDetailModal.saw.normUrgency})
                  </p>
                  <p className="text-xs text-stone-700">
                    V = {(0.40 * sawDetailModal.saw.normCategory).toFixed(3)} + {(0.30 * sawDetailModal.saw.normImpact).toFixed(3)} + {(0.30 * sawDetailModal.saw.normUrgency).toFixed(3)} ={' '}
                    <strong className="text-makassar-900 text-sm font-black">{sawDetailModal.saw.finalScore}</strong>
                  </p>
                </div>
              </div>

              {/* Kesimpulan Status Prioritas */}
              <div className="p-4 rounded-2xl bg-white border-2 border-stone-300 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 block">Hasil Keputusan Sistem</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black text-stone-900">Peringkat Prioritas #{sawDetailModal.saw.rank}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        sawDetailModal.saw.priorityLevel === 'Tinggi'
                          ? 'bg-red-100 text-red-800'
                          : sawDetailModal.saw.priorityLevel === 'Sedang'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Prioritas {sawDetailModal.saw.priorityLevel} (Skor: {sawDetailModal.saw.finalScore})
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSawDetailModal(null)}
                  className="px-4 py-2 rounded-xl bg-stone-900 text-white font-bold text-xs hover:bg-stone-800"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: TRANSPARANSI SELURUH MATRIKS KEPUTUSAN SAW */}
      {sawMatrixModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 animate-slide-up my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-makassar-100 text-makassar-900">
                  <SlidersHorizontal className="w-5 h-5 text-makassar-800" />
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Transparansi Matriks & Formula SAW</h3>
                  <p className="text-xs text-stone-500">
                    Model matematis pengambilan keputusan prioritas aduan masyarakat Kelurahan Mamajang Luar.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSawMatrixModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-6 text-xs text-stone-700">
              {/* Landasan Teori Singkat */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/90 leading-relaxed text-amber-950">
                <p className="font-bold text-xs mb-1 flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-amber-700" />
                  Prinsip Simple Additive Weighting (SAW):
                </p>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Metode SAW mencari penjumlahan berbobot dari rating kinerja pada setiap alternatif pada semua kriteria.
                  Karena semua kriteria dalam aduan ini merupakan <strong>benefit (semakin besar semakin mendesak)</strong>,
                  normalisasi dilakukan dengan membagi nilai mentah dengan nilai tertinggi tiap kriteria:
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-amber-100/90 font-mono font-bold">R_ij = X_ij / max(X_j)</code>.
                  Skor akhir dihitung:
                  <code className="mx-1 px-1.5 py-0.5 rounded bg-amber-100/90 font-mono font-bold">V_i = &Sigma; W_j &times; R_ij</code>.
                </p>
              </div>

              {/* Tabel Matriks Keputusan & Normalisasi Seluruh Aduan */}
              <div>
                <h4 className="font-bold text-stone-800 text-xs mb-2">Matriks Keputusan (X), Normalisasi (R), dan Preferensi (V):</h4>
                <div className="overflow-x-auto border border-stone-200 rounded-2xl">
                  <table className="w-full text-left text-xs min-w-[700px]">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 text-[11px] uppercase tracking-wider">
                      <tr>
                        <th className="py-2.5 px-3 text-center">Rank</th>
                        <th className="py-2.5 px-3">Pelapor & Perihal</th>
                        <th className="py-2.5 px-3 text-center">X1 (Kat)</th>
                        <th className="py-2.5 px-3 text-center">X2 (Damp)</th>
                        <th className="py-2.5 px-3 text-center">X3 (Urg)</th>
                        <th className="py-2.5 px-3 text-center">R1</th>
                        <th className="py-2.5 px-3 text-center">R2</th>
                        <th className="py-2.5 px-3 text-center">R3</th>
                        <th className="py-2.5 px-3 text-center font-bold text-makassar-900">Skor V</th>
                        <th className="py-2.5 px-3 text-center">Prioritas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 text-stone-700">
                      {sawComplaints.map((c) => (
                        <tr key={c.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 px-3 text-center font-bold font-mono">#{c.saw.rank}</td>
                          <td className="py-2.5 px-3">
                            <p className="font-semibold text-stone-900">{c.name}</p>
                            <p className="text-[10px] text-stone-400 truncate max-w-xs">{c.subject}</p>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono">{c.saw.rawCategory}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{c.saw.rawImpact}</td>
                          <td className="py-2.5 px-3 text-center font-mono">{c.saw.rawUrgency}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-stone-500">{c.saw.normCategory}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-stone-500">{c.saw.normImpact}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-stone-500">{c.saw.normUrgency}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-black text-makassar-900 text-xs">
                            {c.saw.finalScore}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                c.saw.priorityLevel === 'Tinggi'
                                  ? 'bg-red-100 text-red-800'
                                  : c.saw.priorityLevel === 'Sedang'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {c.saw.priorityLevel}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rincian Bobot Kriteria */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block text-xs">C1: Kategori (Bobot 40%)</strong>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Mengukur risiko bidang: Keamanan (5), Kesehatan (5), Infrastruktur (4), Kebersihan (3), Sosial (2), Saran (1).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block text-xs">C2: Cakupan (Bobot 30%)</strong>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Mengukur luas dampak warga: Kelurahan (4), 1 RW (3), 1 RT / Lorong (2), Pribadi (1).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
                  <strong className="text-stone-900 block text-xs">C3: Kedaruratan (Bobot 30%)</strong>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Text-mining kata kunci bahaya: Kritis (4: banjir, kebakaran), Mendesak (3: rusak, padam), Perhatian (2: sampah, bau), Normal (1).
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end">
                <button
                  onClick={() => setSawMatrixModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-makassar-800 text-white font-bold text-xs hover:bg-makassar-700 shadow-sm"
                >
                  Selesai Meninjau
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: TINDAK LANJUT & BERIKAN RESPON RESMI STAF KELURAHAN */}
      {responseModalOpen && selectedComplaintForResponse && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-200 animate-slide-up my-8">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-emerald-700" />
                </span>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">Tindak Lanjut & Respon Resmi</h3>
                  <p className="text-xs text-stone-500 font-mono">
                    Tiket: #{selectedComplaintForResponse.ticket_number || selectedComplaintForResponse.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setResponseModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminResponse} className="mt-5 space-y-4">
              {/* Ringkasan Laporan Pelapor */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900">{selectedComplaintForResponse.name}</span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                      selectedComplaintForResponse.saw.priorityLevel === 'Tinggi'
                        ? 'bg-red-100 text-red-800'
                        : selectedComplaintForResponse.saw.priorityLevel === 'Sedang'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Prioritas {selectedComplaintForResponse.saw.priorityLevel} (Skor: {selectedComplaintForResponse.saw.finalScore})
                  </span>
                </div>
                <p className="text-stone-700 font-semibold">{selectedComplaintForResponse.subject}</p>
                <p className="text-stone-500 italic text-[11px] line-clamp-2">
                  &ldquo;{selectedComplaintForResponse.message}&rdquo;
                </p>
              </div>

              {/* Pilihan Status Terkini */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Perbarui Status Penanganan Laporan <span className="text-red-500">*</span>
                </label>
                <select
                  value={adminResponseStatus}
                  onChange={(e) => setAdminResponseStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white outline-none focus:border-makassar-800 font-semibold cursor-pointer"
                >
                  <option value="Baru">Baru (Laporan Diterima & Masuk Antrean)</option>
                  <option value="Diproses">Diproses (Sedang Ditangani Satgas / Petugas Lapangan)</option>
                  <option value="Selesai">Selesai (Penanganan Tuntas & Masalah Teratasi)</option>
                </select>
              </div>

              {/* Catatan / Tanggapan Resmi */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Catatan Tindak Lanjut / Jawaban Resmi Kelurahan <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={adminResponseText}
                  onChange={(e) => setAdminResponseText(e.target.value)}
                  placeholder="Contoh: Laporan telah ditindaklanjuti bersama Satgas Drainase Dinas PU Kota Makassar pada tanggal 15 September. Saluran air lorong 2 sudah dikeruk dan lancar kembali..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs outline-none focus:border-makassar-800 resize-none leading-relaxed"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Catatan ini akan langsung tampil di portal pelacakan tiket warga yang bersangkutan.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setResponseModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-50 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-makassar-800 hover:bg-makassar-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Tanggapan Resmi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pratinjau Foto Bukti Kejadian Lapangan */}
      {previewComplaintPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewComplaintPhoto(null)}
        >
          <div
            className="relative max-w-3xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 border-b border-stone-100">
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs sm:text-sm">
                <Camera className="w-4 h-4 text-makassar-800" />
                <span>Foto Bukti Kejadian dari Pelapor</span>
              </div>
              <button
                onClick={() => setPreviewComplaintPhoto(null)}
                className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 flex items-center justify-center bg-stone-900/5 rounded-xl max-h-[75vh] overflow-hidden">
              <img
                src={previewComplaintPhoto}
                alt="Foto Bukti Kejadian"
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg shadow-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
