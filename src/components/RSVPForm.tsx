import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { RSVPData, UniformData } from '../types';
import { 
  initAuth, googleSignIn, logout, getAccessToken 
} from '../googleAuth';
import { 
  searchSpreadsheets, createEventSpreadsheet, appendSheetRow, readSheetValues, GoogleSpreadsheetMeta 
} from '../lib/googleSheetsService';
import { 
  UserCheck, Heart, Search, CheckCircle2, AlertCircle, Users, Sparkles, 
  MessageSquare, ChevronDown, Shirt, FileSpreadsheet, Download, Link2, 
  HelpCircle, Eye, RefreshCw, Layers, Check, Copy, CheckSquare, Info,
  LogOut, ExternalLink, Lock, Plus, CloudLightning, CloudCheck, CheckCircle, Gift
} from 'lucide-react';

export default function RSVPForm() {
  const [activeTab, setActiveTab] = useState<'rsvp' | 'uniform' | 'sheet'>('rsvp');
  
  // Real-time Data States (Firestore)
  const [attendees, setAttendees] = useState<RSVPData[]>([]);
  const [uniformOrders, setUniformOrders] = useState<UniformData[]>([]);
  
  // Google OAuth & Sheets States
  const [googleUser, setGoogleUser] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheetMeta[]>([]);
  const [isSearchingSheets, setIsSearchingSheets] = useState(false);
  const [connectedSpreadsheet, setConnectedSpreadsheet] = useState<GoogleSpreadsheetMeta | null>(() => {
    const saved = localStorage.getItem('ham_rong_connected_spreadsheet');
    return saved ? JSON.parse(saved) : null;
  });
  const [customSheetId, setCustomSheetId] = useState('');
  const [isConnectingCustom, setIsConnectingCustom] = useState(false);
  const [isCreatingSheet, setIsCreatingSheet] = useState(false);
  const [showGoogleConfig, setShowGoogleConfig] = useState(false);
  
  // Sync Status States
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState({ current: 0, total: 100, message: '' });
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [syncErrorMsg, setSyncErrorMsg] = useState<string | null>(null);

  // Live Sheet Reading States
  const [dataSource, setDataSource] = useState<'firestore' | 'google-sheets'>('firestore');
  const [isReadingSheet, setIsReadingSheet] = useState(false);
  const [sheetValues, setSheetValues] = useState<any[][]>([]);
  const [sheetReadError, setSheetReadError] = useState<string | null>(null);

  // RSVP Form States
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpPhone, setRsvpPhone] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpAttendance, setRsvpAttendance] = useState<'yes' | 'no' | 'maybe'>('yes');
  const [rsvpGuestCount, setRsvpGuestCount] = useState<number>(0);
  const [rsvpClass, setRsvpClass] = useState('12C8');
  const [rsvpMessage, setRsvpMessage] = useState('');
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState(false);
  const [rsvpError, setRsvpError] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  // Uniform Form States
  const [uniName, setUniName] = useState('');
  const [uniPhone, setUniPhone] = useState('');
  const [uniEmail, setUniEmail] = useState('');
  const [uniClass, setUniClass] = useState('12C8');
  const [uniSize, setUniSize] = useState('L');
  const [uniQty, setUniQty] = useState<number>(1);
  const [uniDelivery, setUniDelivery] = useState<'event' | 'shipping'>('event');
  const [uniAddress, setUniAddress] = useState('');
  const [uniNotes, setUniNotes] = useState('');
  const [isUniSubmitting, setIsUniSubmitting] = useState(false);
  const [uniError, setUniError] = useState('');
  const [uniSuccess, setUniSuccess] = useState(false);

  // Google Sheet Webhook States (Backup support)
  const [webhookUrl, setWebhookUrl] = useState(() => {
    return localStorage.getItem('ham_rong_sheets_webhook') || '';
  });
  const [isSavingWebhook, setIsSavingWebhook] = useState(false);
  const [showWebhookGuide, setShowWebhookGuide] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Search filter for Sheet Tab grid
  const [sheetSearch, setSheetSearch] = useState('');
  const [currentSheetTab, setCurrentSheetTab] = useState<'rsvp' | 'uniform'>('rsvp');

  // Load RSVPs (registrations) from Firestore
  useEffect(() => {
    const q = query(collection(db, 'registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: RSVPData[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as RSVPData);
      });
      setAttendees(list);
    }, (err) => {
      console.error('Lỗi khi lấy dữ liệu đăng ký tham dự:', err);
    });
    return () => unsubscribe();
  }, []);

  // Load Uniform Orders (uniform_registrations) from Firestore
  useEffect(() => {
    const q = query(collection(db, 'uniform_registrations'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: UniformData[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as UniformData);
      });
      setUniformOrders(list);
    }, (err) => {
      console.error('Lỗi khi lấy dữ liệu đăng ký đồng phục:', err);
    });
    return () => unsubscribe();
  }, []);

  // Listen to Google OAuth State in-memory
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setGoogleUser(user);
        setAccessToken(token);
        fetchSpreadsheets(token);
      },
      () => {
        setGoogleUser(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Trigger loading values from Google Sheets when active tab, source or connection change
  useEffect(() => {
    if (activeTab === 'sheet' && dataSource === 'google-sheets' && connectedSpreadsheet && accessToken) {
      loadGoogleSheetValues();
    }
  }, [activeTab, dataSource, connectedSpreadsheet, currentSheetTab, accessToken]);

  // Fetch spreadsheets matching "Hàm Rồng" or general sheets from Google Drive
  const fetchSpreadsheets = async (token: string) => {
    setIsSearchingSheets(true);
    try {
      const results = await searchSpreadsheets(token, "Hàm Rồng");
      setSpreadsheets(results);
    } catch (err) {
      console.error('Error fetching spreadsheets:', err);
    } finally {
      setIsSearchingSheets(false);
    }
  };

  // Google Sign-In trigger
  const handleGoogleSignIn = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setGoogleUser(result.user);
        setAccessToken(result.accessToken);
        fetchSpreadsheets(result.accessToken);
      }
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      alert('Đăng nhập Google thất bại: ' + (err.message || 'Vui lòng xác nhận cấp quyền Sheets API'));
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogout = async () => {
    await logout();
    setGoogleUser(null);
    setAccessToken(null);
    setDataSource('firestore');
  };

  // Connect a specific spreadsheet selected from the list
  const connectSpreadsheetFile = (sheet: GoogleSpreadsheetMeta) => {
    setConnectedSpreadsheet(sheet);
    localStorage.setItem('ham_rong_connected_spreadsheet', JSON.stringify(sheet));
  };

  // Create a brand new formatted spreadsheet via API
  const handleCreateNewSpreadsheet = async () => {
    if (!accessToken) return;
    setIsCreatingSheet(true);
    try {
      const newSheet = await createEventSpreadsheet(accessToken);
      setConnectedSpreadsheet(newSheet);
      localStorage.setItem('ham_rong_connected_spreadsheet', JSON.stringify(newSheet));
      fetchSpreadsheets(accessToken);
    } catch (err: any) {
      console.error('Failed to create sheet:', err);
      alert('Không thể tạo Bảng tính mới: ' + (err.message || err));
    } finally {
      setIsCreatingSheet(false);
    }
  };

  // Connect Spreadsheet manually by ID or URL
  const handleConnectCustomSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSheetId.trim() || !accessToken) return;
    setIsConnectingCustom(true);
    try {
      let sheetId = customSheetId.trim();
      // Extract ID if a full URL was pasted
      if (sheetId.includes('/d/')) {
        const matches = sheetId.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (matches && matches[1]) {
          sheetId = matches[1];
        }
      }

      // Read meta or trigger a small test to verify it exists
      const testFetch = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=properties(title)`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });

      if (!testFetch.ok) {
        throw new Error('Không thể tìm thấy tệp Google Sheet với ID này. Hãy chắc chắn bạn là chủ sở hữu hoặc có quyền chỉnh sửa.');
      }

      const meta = await testFetch.json();
      const connectedMeta: GoogleSpreadsheetMeta = {
        id: sheetId,
        name: meta.properties.title || 'Bảng tính liên kết thủ công',
        url: `https://docs.google.com/spreadsheets/d/${sheetId}/edit`
      };

      setConnectedSpreadsheet(connectedMeta);
      localStorage.setItem('ham_rong_connected_spreadsheet', JSON.stringify(connectedMeta));
      setCustomSheetId('');
    } catch (err: any) {
      console.error(err);
      alert('Lỗi liên kết tệp: ' + err.message);
    } finally {
      setIsConnectingCustom(false);
    }
  };

  const disconnectSpreadsheet = () => {
    setConnectedSpreadsheet(null);
    localStorage.removeItem('ham_rong_connected_spreadsheet');
    setDataSource('firestore');
  };

  // Read actual values from Google Sheets tab
  const loadGoogleSheetValues = async () => {
    if (!accessToken || !connectedSpreadsheet) return;
    setIsReadingSheet(true);
    setSheetReadError(null);
    try {
      const sheetName = currentSheetTab === 'rsvp' ? 'Đăng Ký Tham Dự (RSVP)' : 'Đăng Ký Đồng Phục';
      const range = `${sheetName}!A1:J2000`;
      const values = await readSheetValues(accessToken, connectedSpreadsheet.id, range);
      if (values) {
        setSheetValues(values);
      } else {
        setSheetValues([]);
        setSheetReadError(`Không tìm thấy dữ liệu trong trang "${sheetName}". Hãy đảm bảo đã bấm đồng bộ hóa dữ liệu để khởi tạo trang.`);
      }
    } catch (err: any) {
      console.error(err);
      setSheetReadError('Lỗi tải dữ liệu trực tiếp: ' + (err.message || 'Hãy kiểm tra quyền truy cập tệp'));
    } finally {
      setIsReadingSheet(false);
    }
  };

  // Sync all Firestore data into Google Sheets
  const syncAllFirestoreDataToSheets = async () => {
    if (!accessToken || !connectedSpreadsheet) return;
    setIsSyncing(true);
    setSyncSuccessMsg(null);
    setSyncErrorMsg(null);
    setSyncProgress({ current: 0, total: 100, message: 'Khởi động quá trình đồng bộ hóa...' });

    try {
      // 1. Fetch RSVPs from Firestore
      setSyncProgress({ current: 15, total: 100, message: 'Đang đọc danh sách RSVP đăng ký tham dự...' });
      const rsvpsQuery = await getDocs(query(collection(db, 'registrations'), orderBy('createdAt', 'asc')));
      const rsvpsList: any[] = [];
      rsvpsQuery.forEach((doc) => {
        const d = doc.data();
        const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : '—';
        rsvpsList.push([
          dateStr,
          d.name,
          d.phone,
          d.email,
          d.classGroup || '12C8',
          d.attendance === 'yes' ? 'Chắc chắn đi' : d.attendance === 'maybe' ? 'Có thể đi' : 'Bận tiếc quá',
          d.guestCount || 0,
          d.message || ''
        ]);
      });

      // 2. Fetch Uniform Orders
      setSyncProgress({ current: 35, total: 100, message: 'Đang đọc danh sách Đăng ký Đồng phục...' });
      const uniformsQuery = await getDocs(query(collection(db, 'uniform_registrations'), orderBy('createdAt', 'asc')));
      const uniformsList: any[] = [];
      uniformsQuery.forEach((doc) => {
        const d = doc.data();
        const dateStr = d.createdAt ? new Date(d.createdAt).toLocaleString('vi-VN') : '—';
        uniformsList.push([
          dateStr,
          d.name,
          d.phone,
          d.email,
          d.classGroup || '12C8',
          d.size || 'L',
          d.quantity || 1,
          d.deliveryMethod === 'event' ? 'Nhận tại hội khóa' : 'Gửi tận nhà (Ship COD)',
          d.address || '—',
          d.notes || ''
        ]);
      });

      // 3. Fetch Guestbook Messages
      setSyncProgress({ current: 55, total: 100, message: 'Đang đọc danh sách Lưu bút & Lời nhắn kỷ niệm...' });
      const guestbookQuery = await getDocs(query(collection(db, 'guestbook'), orderBy('createdAt', 'asc')));
      const guestbookList: any[] = [];
      guestbookQuery.forEach((doc) => {
        const d = doc.data();
        const dateStr = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleString('vi-VN') : '—';
        guestbookList.push([
          dateStr,
          d.name,
          d.message
        ]);
      });

      // 4. Fetch Donations
      setSyncProgress({ current: 70, total: 100, message: 'Đang đọc danh sách Quỹ lớp & Tài trợ đóng góp...' });
      const donationsQuery = await getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'asc')));
      const donationsList: any[] = [];
      donationsQuery.forEach((doc) => {
        const d = doc.data();
        const dateStr = d.createdAt ? new Date(d.createdAt.seconds * 1000).toLocaleString('vi-VN') : '—';
        const numVal = d.amount ? Number(String(d.amount).replace(/[^0-9]/g, '')) : 0;
        const amountStr = numVal ? numVal.toLocaleString('vi-VN') + ' đ' : '0 đ';
        donationsList.push([
          dateStr,
          d.name,
          d.classGroup || '12C8',
          amountStr,
          d.message || '',
          d.isAnonymous ? 'Ẩn danh' : 'Công khai'
        ]);
      });

      // 5. Overwrite cells in Google Sheets
      setSyncProgress({ current: 85, total: 100, message: 'Đang đồng bộ dữ liệu RSVP lên Google Sheets...' });
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${connectedSpreadsheet.id}/values/${encodeURIComponent('Đăng Ký Tham Dự (RSVP)!A2:H2000')}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: rsvpsList }),
      });

      setSyncProgress({ current: 90, total: 100, message: 'Đang đồng bộ dữ liệu Đồng Phục lên Google Sheets...' });
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${connectedSpreadsheet.id}/values/${encodeURIComponent('Đăng Ký Đồng Phục!A2:J2000')}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: uniformsList }),
      });

      setSyncProgress({ current: 95, total: 100, message: 'Đang đồng bộ dữ liệu Lưu bút & Lời nhắn kỷ niệm...' });
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${connectedSpreadsheet.id}/values/${encodeURIComponent('Lời Nhắn & Lưu Bút!A2:C2000')}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: guestbookList }),
      });

      setSyncProgress({ current: 98, total: 100, message: 'Đang đồng bộ dữ liệu Quỹ đóng góp lớp...' });
      await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${connectedSpreadsheet.id}/values/${encodeURIComponent('Quỹ Đóng Góp!A2:F2000')}?valueInputOption=USER_ENTERED`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: donationsList }),
      });

      setSyncProgress({ current: 100, total: 100, message: 'Đồng bộ hóa 1-Click thành công rực rỡ!' });
      setSyncSuccessMsg(`Đã đồng bộ hóa thành công: ${rsvpsList.length} lượt đăng ký RSVP, ${uniformsList.length} đơn đồng phục, ${guestbookList.length} lời lưu bút và ${donationsList.length} khoản quỹ lớp vào Google Sheet!`);
      
      // Refresh sheet view if currently looking at live sheets
      if (dataSource === 'google-sheets') {
        loadGoogleSheetValues();
      }
    } catch (err: any) {
      console.error(err);
      setSyncErrorMsg('Lỗi đồng bộ hóa: ' + (err.message || err));
    } finally {
      setIsSyncing(false);
    }
  };

  // Direct append Row to connected Google Sheet (Real-time sync on submit)
  const appendRowToConnectedSheet = async (sheetName: string, row: any[]) => {
    if (!accessToken || !connectedSpreadsheet) return;
    try {
      await appendSheetRow(accessToken, connectedSpreadsheet.id, sheetName, row);
      console.log(`[Google Sheets API] Đã đồng bộ trực tiếp dòng vào sheet: ${sheetName}`);
    } catch (err) {
      console.error(`[Google Sheets API Error] Không thể đồng bộ trực tiếp dòng vào sheet:`, err);
    }
  };

  // Save webhook URL for backup
  const handleSaveWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingWebhook(true);
    localStorage.setItem('ham_rong_sheets_webhook', webhookUrl);
    setTimeout(() => {
      setIsSavingWebhook(false);
      alert('Đã lưu cấu hình Google Sheet Webhook thành công!');
    }, 600);
  };

  // Google Apps Script template for backup usage
  const appsScriptCode = `function doPost(e) {
  try {
    var sheetName = "";
    var data = JSON.parse(e.postData.contents);
    
    // Xác định sheet cần ghi dựa trên loại dữ liệu
    if (data.formType === "rsvp") {
      sheetName = "Đăng Ký Tham Dự (RSVP)";
    } else {
      sheetName = "Đăng Ký Quà Lưu Niệm";
    }
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(sheetName);
    
    // Tạo sheet nếu chưa tồn tại
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (data.formType === "rsvp") {
        sheet.appendRow(["Thời Gian Đăng Ký", "Họ & Tên", "Số Điện Thoại", "Email", "Lớp Học Cũ", "Tham Dự?", "Người Đi Cùng", "Lời Nhắn"]);
      } else {
        sheet.appendRow(["Thời Gian Đăng Ký", "Họ & Tên", "Số Điện Thoại", "Email", "Lớp Học Cũ", "Loại Quà / Kích Cỡ", "Số Lượng", "Hình Thức Nhận", "Địa Chỉ Nhận", "Ghi Chú"]);
      }
    }
    
    // Ghi dữ liệu mới vào hàng cuối cùng
    var timestamp = new Date();
    if (data.formType === "rsvp") {
      sheet.appendRow([timestamp, data.name, data.phone, data.email, data.classGroup, data.attendance, data.guestCount, data.message]);
    } else {
      sheet.appendRow([timestamp, data.name, data.phone, data.email, data.classGroup, data.size, data.quantity, data.deliveryMethod, data.address || "", data.notes || ""]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Ghi dữ liệu thành công!" }))
                         .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // Direct trigger webhook function
  const triggerGoogleSheetWebhook = async (payload: any) => {
    if (!webhookUrl) return;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
      console.log('Đã gửi yêu cầu đồng bộ Google Sheet Webhook!');
    } catch (err) {
      console.error('Lỗi đồng bộ Google Sheet Webhook:', err);
    }
  };

  // Handle RSVP Submit
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim() || !rsvpMessage.trim()) {
      setRsvpError('Vui lòng điền đầy đủ thông tin bắt buộc (Họ và tên, Lời nhắn gửi)!');
      return;
    }

    setIsRsvpSubmitting(true);
    setRsvpError('');

    try {
      const dataPayload = {
        name: rsvpName,
        phone: rsvpPhone,
        email: rsvpEmail,
        attendance: rsvpAttendance,
        guestCount: Number(rsvpGuestCount),
        classGroup: rsvpClass,
        message: rsvpMessage,
        createdAt: new Date().toISOString()
      };

      // Add to firestore
      await addDoc(collection(db, 'registrations'), {
        ...dataPayload,
        createdAt: serverTimestamp()
      });

      // Direct sync via OAuth Google Sheets API if logged in and connected
      if (accessToken && connectedSpreadsheet) {
        const timeFormatted = new Date().toLocaleString('vi-VN');
        const rsvpRow = [
          timeFormatted,
          rsvpName,
          rsvpPhone,
          rsvpEmail,
          rsvpClass,
          rsvpAttendance === 'yes' ? 'Chắc chắn đi' : rsvpAttendance === 'maybe' ? 'Có thể đi' : 'Bận tiếc quá',
          rsvpGuestCount,
          rsvpMessage
        ];
        await appendRowToConnectedSheet('Đăng Ký Tham Dự (RSVP)', rsvpRow);
      }

      // Send to backup webhook if configured
      await triggerGoogleSheetWebhook({
        formType: 'rsvp',
        ...dataPayload
      });

      setRsvpSuccess(true);
      // Reset form fields
      setRsvpName('');
      setRsvpPhone('');
      setRsvpEmail('');
      setRsvpGuestCount(0);
      setRsvpMessage('');
    } catch (err: any) {
      console.error(err);
      setRsvpError('Có lỗi xảy ra khi gửi đăng ký: ' + (err.message || err.toString()));
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  // Handle Uniform Submit
  const handleUniformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uniName.trim() || !uniPhone.trim() || !uniEmail.trim()) {
      setUniError('Vui lòng điền đầy đủ thông tin liên hệ bắt buộc (Họ tên, SĐT, Email)!');
      return;
    }

    if (uniDelivery === 'shipping' && !uniAddress.trim()) {
      setUniError('Vui lòng điền địa chỉ giao hàng của bạn!');
      return;
    }

    setIsUniSubmitting(true);
    setUniError('');

    try {
      const dataPayload = {
        name: uniName,
        phone: uniPhone,
        email: uniEmail,
        classGroup: uniClass,
        size: uniSize,
        quantity: Number(uniQty),
        deliveryMethod: uniDelivery,
        address: uniAddress,
        notes: uniNotes,
        createdAt: new Date().toISOString()
      };

      // Add to firestore
      await addDoc(collection(db, 'uniform_registrations'), {
        ...dataPayload,
        createdAt: serverTimestamp()
      });

      // Direct sync via OAuth Google Sheets API if logged in and connected
      if (accessToken && connectedSpreadsheet) {
        const timeFormatted = new Date().toLocaleString('vi-VN');
        const uniRow = [
          timeFormatted,
          uniName,
          uniPhone,
          uniEmail,
          uniClass,
          uniSize,
          uniQty,
          uniDelivery === 'event' ? 'Nhận tại hội khóa' : 'Gửi tận nhà (Ship COD)',
          uniAddress || '—',
          uniNotes || ''
        ];
        await appendRowToConnectedSheet('Đăng Ký Đồng Phục', uniRow);
      }

      // Send to backup Webhook if configured
      await triggerGoogleSheetWebhook({
        formType: 'uniform',
        ...dataPayload
      });

      setUniSuccess(true);
      // Reset form fields
      setUniName('');
      setUniPhone('');
      setUniEmail('');
      setUniAddress('');
      setUniNotes('');
      setUniQty(1);
    } catch (err: any) {
      console.error(err);
      setUniError('Có lỗi xảy ra khi gửi đăng ký đồng phục: ' + (err.message || err.toString()));
    } finally {
      setIsUniSubmitting(false);
    }
  };

  // Export Sheet to CSV function
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    
    if (currentSheetTab === 'rsvp') {
      csvContent += "Họ & Tên,Số Điện Thoại,Email,Lớp Học Cũ,Tham Dự,Người Đi Cùng,Lời Nhắn\n";
      attendees.forEach(row => {
        const attStr = row.attendance === 'yes' ? 'Chắc chắn đi' : row.attendance === 'maybe' ? 'Có thể đi' : 'Bận tiếc quá';
        csvContent += `"${row.name}","${row.phone}","${row.email}","${row.classGroup || ''}","${attStr}","${row.guestCount}","${(row.message || '').replace(/"/g, '""')}"\n`;
      });
    } else {
      csvContent += "Họ & Tên,Số Điện Thoại,Email,Lớp Học Cũ,Quà / Kích Cỡ,Số Lượng,Phương Thức Nhận,Địa Chỉ,Ghi Chú\n";
      uniformOrders.forEach(row => {
        const delStr = row.deliveryMethod === 'event' ? 'Nhận tại hội khóa' : 'Ship tận nhà';
        csvContent += `"${row.name}","${row.phone}","${row.email}","${row.classGroup || ''}","${row.size}","${row.quantity}","${delStr}","${(row.address || '').replace(/"/g, '""')}","${(row.notes || '').replace(/"/g, '""')}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const fileName = currentSheetTab === 'rsvp' ? "Danh_Sach_Tham_Du_12C8_HamRong.csv" : "Danh_Sach_Dong_Phuc_12C8_HamRong.csv";
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy code helper
  const handleCopyScript = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  const schoolClasses = [
    '12C8 (Lớp cũ của mình)', '10A8', '11B8', 'Thầy Cô THPT Hàm Rồng', 'Khác'
  ];

  // Filtering local Firestore rows
  const filteredAttendees = attendees.filter(p => {
    const s = sheetSearch.toLowerCase();
    return p.name.toLowerCase().includes(s) || (p.classGroup && p.classGroup.toLowerCase().includes(s));
  });

  const filteredUniforms = uniformOrders.filter(u => {
    const s = sheetSearch.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.classGroup.toLowerCase().includes(s);
  });

  // Filtering Google Sheet cells
  const filteredSheetRows = sheetValues.slice(1).filter(row => {
    if (!row || row.length === 0) return false;
    const s = sheetSearch.toLowerCase();
    // Search name (col 1) or class (col 4)
    const nameVal = row[1] ? String(row[1]).toLowerCase() : '';
    const classVal = row[4] ? String(row[4]).toLowerCase() : '';
    return nameVal.includes(s) || classVal.includes(s);
  });

  return (
    <section id="rsvp" className="py-24 px-4 bg-gradient-to-b from-[#fdfcf7] to-[#f5f2eb]">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <span className="font-sans text-[11px] tracking-widest text-amber-800 uppercase font-bold bg-amber-800/10 px-3 py-1 rounded-full inline-block">
            XÁC NHẬN SỰ HIỆN DIỆN & QUÀ LƯU NIỆM
          </span>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-stone-900">
            Cổng Đăng Ký Hội Khóa Lớp 12C8
          </h2>
          <p className="font-sans text-stone-600 text-sm max-w-xl mx-auto leading-relaxed">
            Trường THPT Hàm Rồng • Niên khóa 2008 - 2011 • Giáo viên chủ nhiệm: Thầy Nguyễn Thanh Hải
          </p>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex justify-center mb-10">
          <div className="bg-stone-200/60 p-1 rounded-2xl flex gap-1 border border-stone-200 max-w-lg w-full">
            <button
              onClick={() => setActiveTab('rsvp')}
              className={`flex-1 py-3 rounded-xl font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'rsvp'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100/50'
              }`}
            >
              <UserCheck className="w-4 h-4" /> Đăng ký tham dự
            </button>
            <button
              onClick={() => setActiveTab('uniform')}
              className={`flex-1 py-3 rounded-xl font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'uniform'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100/50'
              }`}
            >
              <Gift className="w-4 h-4" /> Đăng ký quà lưu niệm
            </button>
            <button
              onClick={() => setActiveTab('sheet')}
              className={`flex-1 py-3 rounded-xl font-sans text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                activeTab === 'sheet'
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'text-stone-600 hover:text-stone-800 hover:bg-stone-100/50'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" /> Bảng Google Sheet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Interactive Work Area */}
          <div className="lg:col-span-8">
            
            <AnimatePresence mode="wait">
              {/* TAB 1: RSVP Form */}
              {activeTab === 'rsvp' && (
                <motion.div
                  key="rsvp-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white border border-stone-200 rounded-3xl shadow-lg p-6 sm:p-8 relative"
                >
                  <div className="absolute top-0 left-12 w-16 h-4 bg-amber-800/20 transform -translate-y-2 rounded-sm" />

                  {rsvpSuccess ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-bold text-stone-900">Đăng Ký Thành Công!</h3>
                        <p className="font-sans text-stone-600 text-sm max-w-md mx-auto">
                          Thông tin đăng ký hội khóa 15 năm lớp 12C8 Hàm Rồng của bạn đã được ghi nhận trực tiếp vào <strong>hệ thống Google Sheet của lớp</strong>!
                        </p>
                      </div>

                      <button
                        onClick={() => setRsvpSuccess(false)}
                        className="bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs font-semibold uppercase px-6 py-2.5 rounded-full shadow transition-all cursor-pointer"
                      >
                        Đăng ký thêm thành viên khác
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-amber-800" /> Bản Đăng Ký Tham Dự Hội Khóa
                      </h3>

                      <form onSubmit={handleRsvpSubmit} className="space-y-5">
                        {rsvpError && (
                          <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-sans flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{rsvpError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Họ và tên *</label>
                            <input
                              type="text"
                              placeholder="Nguyễn Văn A"
                              value={rsvpName}
                              onChange={(e) => setRsvpName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Số điện thoại</label>
                            <input
                              type="tel"
                              placeholder="09xx.xxx.xxx"
                              value={rsvpPhone}
                              onChange={(e) => setRsvpPhone(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Địa chỉ Email</label>
                            <input
                              type="email"
                              placeholder="tenban@gmail.com"
                              value={rsvpEmail}
                              onChange={(e) => setRsvpEmail(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Danh nghĩa lớp xưa</label>
                            <div className="relative">
                              <select
                                value={rsvpClass}
                                onChange={(e) => setRsvpClass(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 appearance-none"
                              >
                                {schoolClasses.map((item) => (
                                  <option key={item} value={item}>{item}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Mức độ tham dự *</label>
                            <div className="flex gap-2">
                              {[
                                { value: 'yes', label: 'Chắc chắn đi' },
                                { value: 'maybe', label: 'Có thể đi' },
                                { value: 'no', label: 'Bận tiếc quá' }
                              ].map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() => setRsvpAttendance(option.value as any)}
                                  className={`flex-1 py-2 rounded-xl text-xs font-semibold font-sans border transition ${
                                    rsvpAttendance === option.value
                                      ? 'bg-amber-800 text-white border-amber-800 shadow-sm'
                                      : 'bg-stone-50 text-stone-600 border-stone-300 hover:bg-stone-100'
                                  }`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Số người đi cùng (gia đình, con cái)</label>
                            <select
                              value={rsvpGuestCount}
                              onChange={(e) => setRsvpGuestCount(Number(e.target.value))}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              disabled={rsvpAttendance === 'no'}
                            >
                              <option value={0}>Đi một mình</option>
                              <option value={1}>Đi cùng 1 người thân</option>
                              <option value={2}>Đi cùng 2 người thân</option>
                              <option value={3}>Cả gia đình (3+ người)</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Lời nhắn gửi đến tập thể & Thầy Hải *</label>
                          <textarea
                            rows={3}
                            placeholder="Gửi lời nhắn thân thương hoặc cập nhật trạng thái hoạt động hiện tại..."
                            value={rsvpMessage}
                            onChange={(e) => setRsvpMessage(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 resize-none"
                            required
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isRsvpSubmitting}
                          className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-sans font-bold text-sm uppercase py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                          {isRsvpSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Đang ghi nhận vào Google Sheet...
                            </>
                          ) : (
                            'Xác nhận Đăng Ký Tham Dự'
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 2: Uniform (Quà Lưu Niệm) Registration Form */}
              {activeTab === 'uniform' && (
                <motion.div
                  key="uniform-form"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-white border border-stone-200 rounded-3xl shadow-lg p-6 sm:p-8 relative"
                >
                  <div className="absolute top-0 left-12 w-16 h-4 bg-amber-800/20 transform -translate-y-2 rounded-sm" />

                  {uniSuccess ? (
                    <div className="text-center py-10 space-y-6">
                      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
                        <CheckSquare className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-serif text-2xl font-bold text-stone-900">Đăng Ký Quà Lưu Niệm Thành Công!</h3>
                        <p className="font-sans text-stone-600 text-sm max-w-md mx-auto">
                          Đăng ký nhận quà lưu niệm kỷ niệm lớp 12C8 trường Hàm Rồng của bạn đã được cập nhật lập tức vào <strong>Bảng Google Sheet</strong> chung của lớp!
                        </p>
                      </div>
                      <button
                        onClick={() => setUniSuccess(false)}
                        className="bg-amber-800 hover:bg-amber-900 text-white font-sans text-xs font-semibold uppercase px-6 py-2.5 rounded-full shadow transition-all cursor-pointer"
                      >
                        Đăng ký thêm quà khác
                      </button>
                    </div>
                  ) : (
                    <div>
                      <h3 className="font-serif text-xl font-bold text-stone-900 mb-6 flex items-center gap-2">
                        <Gift className="w-5 h-5 text-amber-800" /> Bản Đăng Ký Nhận Quà Lưu Niệm Lớp
                      </h3>

                      <form onSubmit={handleUniformSubmit} className="space-y-5">
                        {uniError && (
                          <div className="bg-red-50 text-red-700 p-3 rounded-xl border border-red-100 text-xs font-sans flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{uniError}</span>
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Họ và tên người nhận *</label>
                            <input
                              type="text"
                              placeholder="Họ tên của bạn"
                              value={uniName}
                              onChange={(e) => setUniName(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Số điện thoại liên hệ *</label>
                            <input
                              type="tel"
                              placeholder="09xx.xxx.xxx"
                              value={uniPhone}
                              onChange={(e) => setUniPhone(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Địa chỉ Email *</label>
                            <input
                              type="email"
                              placeholder="tenban@gmail.com"
                              value={uniEmail}
                              onChange={(e) => setUniEmail(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Lớp thời cấp 3</label>
                            <div className="relative">
                              <select
                                value={uniClass}
                                onChange={(e) => setUniClass(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 appearance-none"
                              >
                                {schoolClasses.map((item) => (
                                  <option key={item} value={item}>{item}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Quà lưu niệm / Kích cỡ *</label>
                            <div className="relative">
                              <select
                                value={uniSize}
                                onChange={(e) => setUniSize(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 appearance-none font-bold"
                              >
                                {[
                                  'Quà tiêu chuẩn (Hộp quà kỷ niệm chung)',
                                  'Áo phông kỷ niệm Size S (Nữ < 48kg)',
                                  'Áo phông kỷ niệm Size M (Nam < 58kg, Nữ < 54kg)',
                                  'Áo phông kỷ niệm Size L (Nam < 67kg, Nữ < 60kg)',
                                  'Áo phông kỷ niệm Size XL (Nam < 75kg)',
                                  'Áo phông kỷ niệm Size XXL (Nam < 83kg)',
                                  'Móc khóa pha lê Hàm Rồng đặc biệt',
                                  'Sổ tay ghi bút lưu niệm cao cấp'
                                ].map((sizeOpt) => (
                                  <option key={sizeOpt} value={sizeOpt}>{sizeOpt}</option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Số lượng đăng ký *</label>
                            <input
                              type="number"
                              min={1}
                              max={10}
                              value={uniQty}
                              onChange={(e) => setUniQty(Number(e.target.value))}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Hình thức nhận *</label>
                            <div className="relative">
                              <select
                                value={uniDelivery}
                                onChange={(e) => setUniDelivery(e.target.value as any)}
                                className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 appearance-none"
                              >
                                <option value="event">Nhận tại hội khóa trường Hàm Rồng</option>
                                <option value="shipping">Gửi bưu điện tận nhà (Ship COD)</option>
                              </select>
                              <ChevronDown className="w-4 h-4 text-stone-400 absolute right-3.5 top-3.5 pointer-events-none" />
                            </div>
                          </div>
                        </div>

                        {uniDelivery === 'shipping' && (
                          <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Địa chỉ giao hàng đầy đủ *</label>
                            <input
                              type="text"
                              placeholder="Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh thành..."
                              value={uniAddress}
                              onChange={(e) => setUniAddress(e.target.value)}
                              className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50"
                              required
                            />
                          </div>
                        )}

                        <div className="space-y-1.5">
                          <label className="block text-xs font-bold text-stone-700 uppercase tracking-wide">Ghi chú bổ sung (Kích thước riêng, sđt phụ...)</label>
                          <textarea
                            rows={2.5}
                            placeholder="Ghi chú thêm thông tin cho ban liên lạc sắp xếp..."
                            value={uniNotes}
                            onChange={(e) => setUniNotes(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:border-amber-800 font-sans text-sm bg-stone-50 resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isUniSubmitting}
                          className="w-full bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-sans font-bold text-sm uppercase py-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
                        >
                          {isUniSubmitting ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" />
                              Đang gửi đăng ký lên Google Sheet...
                            </>
                          ) : (
                            'Xác nhận nhận Quà Lưu Niệm'
                          )}
                        </button>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 3: Google Sheets Live Sync Representation */}
              {activeTab === 'sheet' && (
                <motion.div
                  key="google-sheets-panel"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  
                  {/* Subtle Toggle for Google Sheets Connection Config */}
                  <div className="flex justify-end pr-1">
                    <button
                      type="button"
                      onClick={() => setShowGoogleConfig(!showGoogleConfig)}
                      className="text-[11px] font-sans text-stone-400 hover:text-amber-800 transition flex items-center gap-1.5 cursor-pointer hover:underline bg-transparent border-none"
                    >
                      <Lock className="w-3 h-3" />
                      {showGoogleConfig ? 'Ẩn cấu hình kết nối Google Sheet' : 'Hiển thị cấu hình kết nối Google Sheet'}
                    </button>
                  </div>

                  {showGoogleConfig && (
                    /* Google OAuth & Connection Bento Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Block A: Authentication Status */}
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 font-sans">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <Lock className="w-4 h-4 text-amber-800" /> Tài Khoản Google Tài Trợ
                          </h4>
                          {googleUser ? (
                            <span className="bg-emerald-50 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Đã kết nối
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-500 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                              Chưa đăng nhập
                            </span>
                          )}
                        </div>

                        {googleUser ? (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              {googleUser.photoURL ? (
                                <img src={googleUser.photoURL} alt="Google Avatar" className="w-10 h-10 rounded-full border border-stone-200" referrerpolicy="no-referrer" />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-amber-800 text-white font-bold flex items-center justify-center text-sm uppercase">
                                  {googleUser.displayName?.charAt(0) || 'G'}
                                </div>
                              )}
                              <div>
                                <p className="font-bold text-xs text-stone-800 leading-tight">{googleUser.displayName}</p>
                                <p className="text-[10px] text-stone-500 mt-0.5 leading-none">{googleUser.email}</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={handleGoogleLogout}
                              className="text-stone-400 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition"
                              title="Đăng xuất tài khoản Google"
                            >
                              <LogOut className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 py-1">
                            <p className="text-stone-600 text-[11px] leading-relaxed">
                              Hãy liên kết trực tiếp tài khoản Google của Ban Liên Lạc lớp để quản trị, tạo tệp, và kích hoạt tính năng đồng bộ hóa 1-Click tự động vào Google Sheets thật.
                            </p>
                            <button
                              onClick={handleGoogleSignIn}
                              disabled={isLoggingIn}
                              className="w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-300 font-bold text-xs py-3 rounded-xl shadow-sm transition flex items-center justify-center gap-2 cursor-pointer"
                            >
                              {isLoggingIn ? (
                                <>
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                  Đang mở cửa sổ Google OAuth...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.245-3.125C18.29 1.97 15.42.79 12.24.79 6.006.79.95 5.845.95 12.08s5.056 11.29 11.29 11.29c6.51 0 10.835-4.58 10.835-11.05 0-.745-.08-1.32-.175-2.035z"/>
                                  </svg>
                                  Kết nối Google Account
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Block B: Connected Spreadsheet details */}
                      <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-sm space-y-4 font-sans">
                        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-amber-800" /> Tệp Google Sheet Đồng Bộ
                          </h4>
                          {connectedSpreadsheet ? (
                            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full font-bold border border-amber-250">
                              Đã liên kết
                            </span>
                          ) : (
                            <span className="bg-stone-100 text-stone-500 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                              Chưa cấu hình
                            </span>
                          )}
                        </div>

                        {connectedSpreadsheet ? (
                          <div className="space-y-3">
                            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 flex items-start justify-between gap-3">
                              <div className="space-y-1 overflow-hidden">
                                <p className="font-bold text-xs text-stone-800 truncate" title={connectedSpreadsheet.name}>
                                  {connectedSpreadsheet.name}
                                </p>
                                <p className="font-mono text-[9px] text-stone-400 truncate">ID: {connectedSpreadsheet.id}</p>
                              </div>
                              <div className="flex gap-1">
                                <a
                                  href={connectedSpreadsheet.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-amber-800 hover:bg-amber-50 p-1.5 rounded-lg transition"
                                  title="Mở trong Google Sheets mới"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                            
                            <button
                              onClick={disconnectSpreadsheet}
                              className="w-full bg-stone-100 hover:bg-red-50 hover:text-red-700 text-stone-600 font-bold text-[10px] py-2 rounded-lg transition border-none cursor-pointer"
                            >
                              Hủy liên kết tệp
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {googleUser ? (
                              <div className="space-y-2">
                                {/* Search & dropdown option */}
                                {spreadsheets.length > 0 ? (
                                  <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wide">Tìm thấy tệp phù hợp trong Drive:</label>
                                    <div className="max-h-[100px] overflow-y-auto border border-stone-200 rounded-xl divide-y divide-stone-100 text-xs bg-stone-50/50">
                                      {spreadsheets.map((sheet) => (
                                        <div key={sheet.id} className="p-2.5 flex items-center justify-between hover:bg-white gap-3">
                                          <span className="font-medium text-stone-700 truncate block text-[11px]">{sheet.name}</span>
                                          <button
                                            onClick={() => connectSpreadsheetFile(sheet)}
                                            className="bg-amber-800 text-white font-bold text-[9px] px-2.5 py-1 rounded-md transition cursor-pointer border-none"
                                          >
                                            Chọn
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[10px] text-stone-500 italic">Không tìm thấy tệp "Hàm Rồng" nào sẵn có trong Drive của bạn.</p>
                                )}

                                <div className="flex flex-wrap gap-2 pt-1">
                                  <button
                                    onClick={handleCreateNewSpreadsheet}
                                    disabled={isCreatingSheet}
                                    className="flex-1 bg-amber-800 hover:bg-amber-900 disabled:bg-stone-300 text-white font-bold text-xs py-2.5 rounded-xl transition flex items-center justify-center gap-1.5 border-none cursor-pointer"
                                  >
                                    {isCreatingSheet ? (
                                      <>
                                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                        Đang tạo trang...
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3.5 h-3.5" />
                                        Tạo tệp Google Sheet Mới tự động
                                      </>
                                    )}
                                  </button>
                                </div>
                                
                                {/* Manual form */}
                                <form onSubmit={handleConnectCustomSheet} className="flex gap-1.5 pt-2 border-t border-stone-100">
                                  <input
                                    type="text"
                                    placeholder="Nhập ID tệp Google Sheet thủ công..."
                                    value={customSheetId}
                                    onChange={(e) => setCustomSheetId(e.target.value)}
                                    className="flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-stone-300 focus:outline-none focus:border-amber-800 text-[11px] bg-stone-50"
                                  />
                                  <button
                                    type="submit"
                                    disabled={isConnectingCustom}
                                    className="bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-[10px] px-3 py-1.5 rounded-lg transition border-none cursor-pointer"
                                  >
                                    {isConnectingCustom ? '...' : 'Liên kết'}
                                  </button>
                                </form>
                              </div>
                            ) : (
                              <p className="text-[11px] text-stone-400 italic leading-relaxed py-1">
                                Hãy đăng nhập tài khoản Google ở thẻ bên cạnh để mở khóa bảng chọn liên kết Drive tệp của bạn hoặc tạo trang tính cấu trúc lớp tự động.
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1-Click Sync Status Section */}
                  {connectedSpreadsheet && accessToken && (
                    <div className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm space-y-4 font-sans">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div>
                          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-1.5">
                            <CloudLightning className="w-4 h-4 text-amber-800 animate-pulse" /> Đồng bộ hóa 1-Click (Tất Cả Thẻ)
                          </h4>
                          <p className="text-[10px] text-stone-500 mt-0.5">Xuất đè tất cả cơ sở dữ liệu Firestore hiện hữu của app vào Google Sheet</p>
                        </div>
                        <button
                          onClick={syncAllFirestoreDataToSheets}
                          disabled={isSyncing}
                          className="bg-amber-800 hover:bg-amber-900 disabled:bg-amber-800/50 text-white font-bold text-xs px-5 py-3 rounded-xl shadow-md transition flex items-center gap-2 border-none cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                          {isSyncing ? 'Đang đồng bộ...' : 'Đồng bộ hóa Ngay lập tức'}
                        </button>
                      </div>

                      {/* Sync progress bar */}
                      {isSyncing && (
                        <div className="space-y-1.5 bg-stone-50 p-3.5 rounded-xl border border-stone-200">
                          <div className="flex justify-between text-[11px] font-bold text-stone-700">
                            <span>{syncProgress.message}</span>
                            <span>{syncProgress.current}%</span>
                          </div>
                          <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-800 transition-all duration-300"
                              style={{ width: `${syncProgress.current}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {syncSuccessMsg && (
                        <div className="bg-[#f0fdf4] text-emerald-800 p-3.5 rounded-xl border border-emerald-200 text-xs flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <span>{syncSuccessMsg}</span>
                        </div>
                      )}

                      {syncErrorMsg && (
                        <div className="bg-red-50 text-red-800 p-3.5 rounded-xl border border-red-200 text-xs flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
                          <span>{syncErrorMsg}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Main Grid View Container */}
                  <div className="bg-white border border-stone-300 rounded-3xl shadow-xl overflow-hidden flex flex-col">
                    
                    {/* Header bar */}
                    <div className="bg-[#107c41] text-white px-5 py-4 flex flex-wrap justify-between items-center gap-4 border-b border-[#0d6937] shrink-0">
                      <div className="flex items-center gap-2.5">
                        <FileSpreadsheet className="w-6 h-6 text-emerald-100" />
                        <div>
                          <h4 className="font-sans font-bold text-sm leading-tight text-white flex items-center gap-2">
                            Google Sheets: {connectedSpreadsheet ? connectedSpreadsheet.name : 'hamrong12c8_tong_hop.xlsx'}
                            <span className="bg-emerald-800 text-emerald-100 text-[10px] px-2 py-0.5 rounded font-mono border border-emerald-700 uppercase">
                              {dataSource === 'google-sheets' ? 'LIVE SHEETS' : 'FIRESTORE MEMORY'}
                            </span>
                          </h4>
                          <p className="text-[10px] text-emerald-100 font-sans mt-0.5">Tự động tổng hợp thời gian thực từ Cổng đăng ký của Lớp</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {connectedSpreadsheet && accessToken && (
                          <div className="bg-[#0b542c] p-0.5 rounded-xl border border-emerald-700 flex gap-0.5">
                            <button
                              onClick={() => setDataSource('firestore')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none ${
                                dataSource === 'firestore'
                                  ? 'bg-[#107c41] text-white shadow-sm'
                                  : 'text-emerald-100 hover:text-white'
                              }`}
                            >
                              Firestore
                            </button>
                            <button
                              onClick={() => setDataSource('google-sheets')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer border-none ${
                                dataSource === 'google-sheets'
                                  ? 'bg-[#107c41] text-white shadow-sm'
                                  : 'text-emerald-100 hover:text-white'
                              }`}
                            >
                              Live Sheet Cells
                            </button>
                          </div>
                        )}

                        <button
                          onClick={exportToCSV}
                          className="flex items-center gap-1.5 bg-[#0f703b] hover:bg-[#0c592f] border border-emerald-600 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold font-sans shadow transition cursor-pointer"
                          title="Tải xuống dữ liệu hiện tại làm file CSV"
                        >
                          <Download className="w-3.5 h-3.5" /> Xuất CSV
                        </button>
                        <button
                          onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                          className="flex items-center gap-1.5 bg-amber-800 hover:bg-amber-900 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold font-sans shadow transition cursor-pointer border-none"
                          title="Liên kết phụ với tệp Google Sheet qua Webhook"
                        >
                          <Link2 className="w-3.5 h-3.5" /> Cấu hình Webhop / Webhook
                        </button>
                      </div>
                    </div>

                    {/* Webhook guide fallback section */}
                    {showWebhookGuide && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="bg-stone-50 border-b border-stone-200 p-5 font-sans space-y-4 text-stone-700 text-xs"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-1">
                            <h5 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                              <Info className="w-4 h-4 text-amber-800" /> Webhook Google Apps Script (Phương pháp dự phòng):
                            </h5>
                            <p className="text-xs text-stone-500">Giúp đồng bộ hóa biểu mẫu đăng ký lên Google Sheet ngay cả đối với khách vãng lai không đăng nhập.</p>
                          </div>
                          <button
                            onClick={() => setShowWebhookGuide(false)}
                            className="text-stone-400 hover:text-stone-600 text-xs font-bold border-none bg-transparent cursor-pointer"
                          >
                            Đóng
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          <div className="bg-white border border-stone-200 p-4 rounded-xl space-y-2.5">
                            <p className="font-semibold text-stone-800">Cấu hình Script dự phòng:</p>
                            <ol className="list-decimal pl-4 space-y-1.5 text-stone-600">
                              <li>Mở tệp Google Sheet của bạn.</li>
                              <li>Mở <strong>Extensions</strong> &gt; <strong>Apps Script</strong>.</li>
                              <li>Dán mã bên phải vào và nhấp <strong>Deploy</strong> làm <strong>Web app</strong>.</li>
                              <li>Chọn quyền truy cập cho <strong>Anyone</strong>, Triển khai và copy Web URL.</li>
                            </ol>
                          </div>

                          <div className="bg-white border border-stone-200 p-4 rounded-xl flex flex-col justify-between gap-3">
                            <div className="space-y-2">
                              <p className="font-semibold text-stone-800 flex items-center justify-between">
                                <span>Mã nguồn Google Apps Script:</span>
                                <button
                                  onClick={handleCopyScript}
                                  className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer"
                                >
                                  {copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}
                                </button>
                              </p>
                              <pre className="bg-stone-950 text-emerald-400 p-2.5 rounded font-mono text-[9px] max-h-[110px] overflow-y-auto">
                                {appsScriptCode}
                              </pre>
                            </div>
                          </div>
                        </div>

                        <form onSubmit={handleSaveWebhook} className="bg-[#f0fdf4] border border-emerald-200 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
                          <div className="flex-1 min-w-[280px] space-y-1">
                            <label className="block text-xs font-bold text-emerald-950 uppercase tracking-wide">Nhập Link Web App của bạn:</label>
                            <input
                              type="url"
                              placeholder="https://script.google.com/macros/s/.../exec"
                              value={webhookUrl}
                              onChange={(e) => setWebhookUrl(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-emerald-300 focus:outline-none focus:border-emerald-600 text-xs font-mono bg-white text-stone-800"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSavingWebhook}
                            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer border-none"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSavingWebhook ? 'animate-spin' : ''}`} />
                            {isSavingWebhook ? 'Đang lưu...' : 'Lưu & Kích Hoạt'}
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {/* Sheet Selection Tab bar */}
                    <div className="bg-[#f3f2f1] border-b border-stone-200 px-4 pt-2.5 flex items-end gap-1.5 justify-between shrink-0 flex-wrap sm:flex-nowrap">
                      <div className="flex gap-1 overflow-x-auto pb-0.5">
                        <button
                          onClick={() => setCurrentSheetTab('rsvp')}
                          className={`px-4 py-2 font-sans font-bold text-xs rounded-t-lg border-t border-x transition flex items-center gap-1.5 cursor-pointer border-stone-300 ${
                            currentSheetTab === 'rsvp'
                              ? 'bg-white text-stone-950 font-extrabold border-stone-300'
                              : 'bg-stone-100 border-transparent text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <UserCheck className="w-3.5 h-3.5 text-stone-500" />
                          <span>Trang 1: Đăng Ký Tham Dự (RSVP)</span>
                          <span className="bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium">
                            {dataSource === 'google-sheets' ? filteredSheetRows.length : attendees.length} hàng
                          </span>
                        </button>
                        <button
                          onClick={() => setCurrentSheetTab('uniform')}
                          className={`px-4 py-2 font-sans font-bold text-xs rounded-t-lg border-t border-x transition flex items-center gap-1.5 cursor-pointer border-stone-300 ${
                            currentSheetTab === 'uniform'
                              ? 'bg-white text-stone-950 font-extrabold border-stone-300'
                              : 'bg-stone-100 border-transparent text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          <Gift className="w-3.5 h-3.5 text-stone-500" />
                          <span>Trang 2: Đăng Ký Quà Lưu Niệm</span>
                          <span className="bg-stone-200 text-stone-600 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-medium">
                            {dataSource === 'google-sheets' ? filteredSheetRows.length : uniformOrders.length} hàng
                          </span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        {dataSource === 'google-sheets' && connectedSpreadsheet && (
                          <button
                            onClick={loadGoogleSheetValues}
                            disabled={isReadingSheet}
                            className="p-1 text-stone-500 hover:text-emerald-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition cursor-pointer"
                            title="Tải lại ô từ Google Sheets"
                          >
                            <RefreshCw className={`w-3 h-3 ${isReadingSheet ? 'animate-spin' : ''}`} />
                          </button>
                        )}
                        <div className="relative w-[180px]">
                          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
                          <input
                            type="text"
                            placeholder="Tìm kiếm..."
                            value={sheetSearch}
                            onChange={(e) => setSheetSearch(e.target.value)}
                            className="w-full pl-8 pr-3 py-1 rounded-md border border-stone-300 focus:outline-none focus:border-emerald-600 font-sans text-[11px] bg-white text-stone-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Grid view area */}
                    <div className="overflow-auto max-h-[380px] bg-stone-100 min-h-[280px]">
                      
                      {isReadingSheet ? (
                        <div className="p-12 text-center text-stone-500 flex flex-col items-center justify-center gap-2.5">
                          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                          <p className="text-xs font-semibold">Đang truy vấn các ô thời gian thực từ Google Sheets API...</p>
                        </div>
                      ) : sheetReadError ? (
                        <div className="p-10 text-center text-red-700 bg-red-50 border-b border-red-100 space-y-2 text-xs">
                          <AlertCircle className="w-7 h-7 mx-auto text-red-500" />
                          <p className="font-semibold">{sheetReadError}</p>
                          <button
                            onClick={() => setDataSource('firestore')}
                            className="mt-2 bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold px-3 py-1.5 rounded transition text-[10px] border-none cursor-pointer"
                          >
                            Quay lại Dữ liệu Firestore
                          </button>
                        </div>
                      ) : dataSource === 'google-sheets' ? (
                        /* Google Sheets Live Cell Grid Rendering */
                        <table className="w-full text-left border-collapse text-[11px] font-sans">
                          <thead className="bg-[#f3f2f1] text-stone-600 sticky top-0 z-10 border-b border-stone-300">
                            <tr>
                              <th className="p-2 border-r border-stone-300 w-10 text-center select-none bg-stone-200">#</th>
                              {(sheetValues[0] || []).map((header, idx) => (
                                <th key={idx} className="p-2 border-r border-stone-300 font-semibold">{header}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-stone-200 text-stone-800">
                            {filteredSheetRows.length > 0 ? (
                              filteredSheetRows.map((row, idx) => (
                                <tr key={idx} className="hover:bg-amber-50/40">
                                  <td className="p-2 border-r border-stone-200 text-center font-mono text-stone-400 bg-stone-50 select-none">{idx + 1}</td>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-2 border-r border-stone-200 truncate max-w-[200px]">
                                      {cell}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={10} className="p-10 text-center text-stone-400 italic">Không có hàng dữ liệu Google Sheet nào khớp hoặc tệp hiện đang trống.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      ) : (
                        /* Standard Firestore Local Grid Rendering (Tab 1: RSVPs) */
                        currentSheetTab === 'rsvp' ? (
                          <table className="w-full text-left border-collapse text-[11px] font-sans">
                            <thead className="bg-[#f3f2f1] text-stone-600 sticky top-0 z-10 border-b border-stone-300">
                              <tr>
                                <th className="p-2 border-r border-stone-300 w-10 text-center select-none bg-stone-200">#</th>
                                <th className="p-2 border-r border-stone-300 min-w-[120px]">Họ & Tên</th>
                                <th className="p-2 border-r border-stone-300 min-w-[100px]">Số Điện Thoại</th>
                                <th className="p-2 border-r border-stone-300 min-w-[140px]">Email</th>
                                <th className="p-2 border-r border-stone-300 min-w-[100px]">Lớp Cũ</th>
                                <th className="p-2 border-r border-stone-300 min-w-[100px]">Mức Độ Đi</th>
                                <th className="p-2 border-r border-stone-300 min-w-[80px]">Đi Kèm</th>
                                <th className="p-2 min-w-[180px]">Lời Nhắn Kỷ Niệm</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-stone-200 text-stone-800">
                              {filteredAttendees.length > 0 ? (
                                filteredAttendees.map((row, idx) => (
                                  <tr key={row.id || idx} className="hover:bg-amber-50/40">
                                    <td className="p-2 border-r border-stone-200 text-center font-mono text-stone-400 bg-stone-50 select-none">{idx + 1}</td>
                                    <td className="p-2 border-r border-stone-200 font-bold text-stone-900">{row.name}</td>
                                    <td className="p-2 border-r border-stone-200 font-mono text-stone-600">{row.phone}</td>
                                    <td className="p-2 border-r border-stone-200 text-stone-600">{row.email}</td>
                                    <td className="p-2 border-r border-stone-200 font-semibold">{row.classGroup || '12C8'}</td>
                                    <td className="p-2 border-r border-stone-200">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        row.attendance === 'yes' ? 'bg-emerald-50 text-emerald-700' : row.attendance === 'maybe' ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-500'
                                      }`}>
                                        {row.attendance === 'yes' ? 'Chắc chắn đi' : row.attendance === 'maybe' ? 'Có thể' : 'Bận tiếc quá'}
                                      </span>
                                    </td>
                                    <td className="p-2 border-r border-stone-200 text-center font-mono font-medium">{row.guestCount} người</td>
                                    <td className="p-2 truncate max-w-[220px] text-stone-500 italic" title={row.message}>{row.message || '—'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={8} className="p-10 text-center text-stone-400 italic">Không có dòng dữ liệu nào khớp với từ khóa tìm kiếm.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        ) : (
                          /* Standard Firestore Local Grid Rendering (Tab 2: Uniforms) */
                          <table className="w-full text-left border-collapse text-[11px] font-sans">
                            <thead className="bg-[#f3f2f1] text-stone-600 sticky top-0 z-10 border-b border-stone-300">
                              <tr>
                                <th className="p-2 border-r border-stone-300 w-10 text-center select-none bg-stone-200">#</th>
                                <th className="p-2 border-r border-stone-300 min-w-[120px]">Họ & Tên Nhận</th>
                                <th className="p-2 border-r border-stone-300 min-w-[100px]">Số Điện Thoại</th>
                                <th className="p-2 border-r border-stone-300 min-w-[140px]">Email</th>
                                <th className="p-2 border-r border-stone-300 min-w-[90px]">Lớp Cũ</th>
                                <th className="p-2 border-r border-stone-300 min-w-[120px]">Quà/Kích cỡ</th>
                                <th className="p-2 border-r border-stone-300 min-w-[80px]">Số Lượng</th>
                                <th className="p-2 border-r border-stone-300 min-w-[120px]">Nhận Hàng</th>
                                <th className="p-2 border-r border-stone-300 min-w-[140px]">Địa Chỉ</th>
                                <th className="p-2 min-w-[120px]">Ghi Chú</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-stone-200 text-stone-800">
                              {filteredUniforms.length > 0 ? (
                                filteredUniforms.map((row, idx) => (
                                  <tr key={row.id || idx} className="hover:bg-amber-50/40">
                                    <td className="p-2 border-r border-stone-200 text-center font-mono text-stone-400 bg-stone-50 select-none">{idx + 1}</td>
                                    <td className="p-2 border-r border-stone-200 font-bold text-stone-900">{row.name}</td>
                                    <td className="p-2 border-r border-stone-200 font-mono text-stone-600">{row.phone}</td>
                                    <td className="p-2 border-r border-stone-200 text-stone-600">{row.email}</td>
                                    <td className="p-2 border-r border-stone-200 font-semibold">{row.classGroup}</td>
                                    <td className="p-2 border-r border-stone-200 font-semibold text-amber-800">{row.size}</td>
                                    <td className="p-2 border-r border-stone-200 text-center font-bold font-mono">{row.quantity} phần</td>
                                    <td className="p-2 border-r border-stone-200">
                                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                        row.deliveryMethod === 'event' ? 'bg-amber-50 text-amber-700' : 'bg-purple-50 text-purple-700'
                                      }`}>
                                        {row.deliveryMethod === 'event' ? 'Nhận tại hội khóa' : 'Gửi bưu điện'}
                                      </span>
                                    </td>
                                    <td className="p-2 border-r border-stone-200 truncate max-w-[150px] text-stone-500" title={row.address}>{row.address || '—'}</td>
                                    <td className="p-2 truncate max-w-[120px] text-stone-500 italic" title={row.notes}>{row.notes || '—'}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={10} className="p-10 text-center text-stone-400 italic">Không có dòng dữ liệu đăng ký quà lưu niệm nào khớp với từ khóa tìm kiếm.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        )
                      )}

                    </div>

                    {/* Google Sheets Bottom Summary Bar */}
                    <div className="bg-[#f3f2f1] border-t border-stone-300 px-5 py-2.5 flex justify-between items-center text-[10px] text-stone-500 shrink-0 font-sans">
                      <span className="flex items-center gap-3">
                        <span>Tổng số RSVP: <strong>{attendees.length} thành viên</strong></span>
                        <span>•</span>
                        <span>Tổng số quà lưu niệm: <strong>{uniformOrders.reduce((a, b) => a + (b.quantity || 0), 0)} phần</strong></span>
                      </span>
                      <span>Dữ liệu được cập nhật tự động trực tiếp</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Sidebar: Quick Stats and Live Registry Stream */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Real-time Quick Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-amber-800/10 text-amber-800">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-stone-500 text-[10px] font-sans font-bold uppercase tracking-wider">Tổng số tham dự</p>
                  <p className="font-display font-bold text-lg sm:text-xl text-stone-900 mt-0.5">
                    {attendees.filter(a => a.attendance === 'yes').reduce((acc, curr) => acc + 1 + (curr.guestCount || 0), 0)} / 50 <span className="text-[10px] text-stone-500 font-normal font-sans">Sĩ số</span>
                  </p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center gap-4">
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-stone-500 text-[10px] font-sans font-bold uppercase tracking-wider">Đã đăng ký quà lưu niệm</p>
                  <p className="font-display font-bold text-lg sm:text-xl text-stone-900 mt-0.5">
                    {uniformOrders.reduce((acc, curr) => acc + (curr.quantity || 0), 0)} <span className="text-[10px] text-stone-500 font-normal font-sans">phần quà</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Live Registry Stream */}
            <div className="bg-white border border-stone-200 rounded-3xl shadow-md p-5 max-h-[380px] flex flex-col justify-between">
              <div className="space-y-1 mb-3 shrink-0">
                <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-red-500 animate-pulse" /> Luồng Ghi Danh Vàng
                </h3>
                <p className="text-stone-500 text-[10px] font-sans">Ai đã ghi danh rồi? Hãy tra cứu bên dưới nhé!</p>
              </div>

              {/* Feed scroll area */}
              <div className="space-y-3 overflow-y-auto flex-1 pr-1">
                {attendees.length > 0 ? (
                  attendees.map((person) => (
                    <div
                      key={person.id}
                      className="bg-stone-50/70 border border-stone-200 p-3 rounded-2xl flex flex-col gap-1.5 transition hover:bg-white text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="w-6 h-6 bg-amber-800/10 text-amber-800 border border-amber-800/15 rounded-full flex items-center justify-center font-bold text-[10px] uppercase">
                            {person.name.charAt(0)}
                          </span>
                          <div>
                            <p className="font-sans text-[11px] font-bold text-stone-800 leading-tight">{person.name}</p>
                            <p className="text-[9px] text-stone-400 font-medium">Lớp cũ: {person.classGroup || '12C8'}</p>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold tracking-wide uppercase ${
                          person.attendance === 'yes'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-150'
                            : person.attendance === 'maybe'
                            ? 'bg-amber-50 text-amber-700 border border-amber-150'
                            : 'bg-stone-100 text-stone-500'
                        }`}>
                          {person.attendance === 'yes' && 'Chắc chắn đi'}
                          {person.attendance === 'maybe' && 'Có thể'}
                          {person.attendance === 'no' && 'Vắng mặt'}
                        </span>
                      </div>

                      {person.message && (
                        <p className="text-stone-600 font-sans text-[11px] bg-white/70 border border-stone-100 p-2 rounded-xl italic flex items-start gap-1">
                          <MessageSquare className="w-3.5 h-3.5 text-stone-300 mt-0.5 flex-shrink-0" />
                          <span>"{person.message}"</span>
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-stone-400 flex flex-col items-center justify-center gap-1">
                    <Users className="w-6 h-6 text-stone-300" />
                    <p className="font-sans text-[10px]">Chưa có ai đăng ký tham dự</p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
