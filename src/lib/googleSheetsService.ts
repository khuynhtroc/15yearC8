/**
 * Google Sheets API Service
 * Handles direct interactions with Google Sheets using Google REST APIs
 */

export interface GoogleSpreadsheetMeta {
  id: string;
  name: string;
  url: string;
}

/**
 * Search the user's Google Drive for a spreadsheet by name or list recent ones
 */
export async function searchSpreadsheets(accessToken: string, nameSearch?: string): Promise<GoogleSpreadsheetMeta[]> {
  try {
    let query = "mimeType='application/vnd.google-apps.spreadsheet' and trashed = false";
    if (nameSearch) {
      query += ` and name contains '${nameSearch.replace(/'/g, "\\'")}'`;
    }
    
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,webViewLink)&orderBy=modifiedTime desc&pageSize=15`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || `Lỗi truy cập Drive: ${response.status}`);
    }

    const data = await response.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      url: f.webViewLink || `https://docs.google.com/spreadsheets/d/${f.id}/edit`,
    }));
  } catch (error) {
    console.error('Error searching spreadsheets:', error);
    throw error;
  }
}

/**
 * Create a new pre-formatted Google Spreadsheet with relevant tabs for the event
 */
export async function createEventSpreadsheet(accessToken: string): Promise<GoogleSpreadsheetMeta> {
  try {
    const url = 'https://sheets.googleapis.com/v4/spreadsheets';
    const body = {
      properties: {
        title: "Hàm Rồng 12C8 - Quản lý Hội khóa 15 năm (Tự Động)",
      },
      sheets: [
        {
          properties: {
            title: "Đăng Ký Tham Dự (RSVP)",
          },
        },
        {
          properties: {
            title: "Đăng Ký Đồng Phục",
          },
        },
        {
          properties: {
            title: "Lời Nhắn & Lưu Bút",
          },
        },
        {
          properties: {
            title: "Quỹ Đóng Góp",
          },
        },
      ],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error?.message || 'Không thể tạo Spreadsheet mới');
    }

    const data = await response.json();
    const id = data.spreadsheetId;
    
    // Set headers on each newly created sheet tab
    await initializeSheetHeaders(accessToken, id);

    return {
      id,
      name: data.properties.title,
      url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${id}/edit`,
    };
  } catch (error) {
    console.error('Error creating spreadsheet:', error);
    throw error;
  }
}

/**
 * Write headers to a newly created or empty spreadsheet to structure the data nicely
 */
async function initializeSheetHeaders(accessToken: string, spreadsheetId: string) {
  const rangesAndHeaders = [
    {
      range: "Đăng Ký Tham Dự (RSVP)!A1:H1",
      values: [["Thời Gian Đăng Ký", "Họ & Tên", "Số Điện Thoại", "Email", "Lớp Học Cũ", "Mức Độ Tham Dự", "Người Đi Cùng", "Lời Nhắn Gửi Gắm"]],
    },
    {
      range: "Đăng Ký Đồng Phục!A1:J1",
      values: [["Thời Gian Đăng Ký", "Họ & Tên", "Số Điện Thoại", "Email", "Lớp Học Cũ", "Kích Cỡ Áo", "Số Lượng", "Phương Thức Nhận", "Địa Chỉ Giao Hàng", "Ghi Chú Đơn Hàng"]],
    },
    {
      range: "Lời Nhắn & Lưu Bút!A1:C1",
      values: [["Thời Gian", "Họ & Tên", "Lời Nhắn Lưu Bút"]],
    },
    {
      range: "Quỹ Đóng Góp!A1:F1",
      values: [["Thời Gian", "Người Đóng Góp", "Lớp Cũ / Quan Hệ", "Số Tiền Đóng Góp", "Lời Nhắn Chúc Mừng", "Trạng Thái Xác Nhận"]],
    },
  ];

  for (const item of rangesAndHeaders) {
    try {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(item.range)}?valueInputOption=USER_ENTERED`;
      await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ values: item.values }),
      });
    } catch (e) {
      console.error(`Lỗi khi tạo tiêu đề cho khoảng ${item.range}:`, e);
    }
  }
}

/**
 * Append a row of data to a specific sheet range
 */
export async function appendSheetRow(
  accessToken: string,
  spreadsheetId: string,
  sheetName: string,
  rowData: any[]
): Promise<boolean> {
  try {
    const range = `${sheetName}!A1`;
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowData],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error(`Google Sheets Append Error for ${sheetName}:`, err);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`Error appending row to ${sheetName}:`, error);
    return false;
  }
}

/**
 * Read data from a specific sheet range
 */
export async function readSheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<any[][] | null> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.warn(`Lỗi khi đọc bảng tính range ${range}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Error reading sheet values from ${range}:`, error);
    return null;
  }
}
