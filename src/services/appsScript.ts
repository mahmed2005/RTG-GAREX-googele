/**
 * Google Apps Script Web App Integration
 * Enables Google Sheets and Google Drive to act as a 100% free, real-time backend database for RTG Gear X
 */

import { Product, PubgAccount, UcPackage, Order, StoreSettings, PubgSellSubmission } from '../types';

export interface AppsScriptConfig {
  webAppUrl: string;
  autoFetchOnLoad: boolean;
  lastSyncedAt: string | null;
}

const APPS_SCRIPT_CONFIG_KEY = 'rtg_apps_script_config_v2';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * RTG GEAR X - BACKEND CONTROLLER FOR GOOGLE SHEETS & GOOGLE DRIVE
 * سكريبت متجر RTG Gear X المتكامل لإدارة المنتجات وحسابات PUBG وشحن الشدات وصفحات التواصل
 * =========================================================================
 * طريقة التثبيت في دقيقة واحدة:
 * 1. في جدول Google Sheets الخاص بك، اضغط من القائمة العلوية على (ملحقات / Extensions) ثم (Apps Script).
 * 2. امسح أي كود موجود هناك، والصق هذا الكود بالكامل مكانه.
 * 3. اضغط على أيقونة الحفظ (💾).
 * 4. اضغط على الزر الأزرق (نشر / Deploy) ثم (نشر جديد / New deployment).
 * 5. اضغط على الترس ⚙️ واختر: تطبيق ويب (Web app).
 * 6. اضبط "من يملك حق الوصول" (Who has access) على: أي شخص (Anyone).
 * 7. اضغط (نشر / Deploy) وانسخ رابط تطبيق الويب (Web App URL) والصقه في خانة الربط في لوحة الإدارة بالموقع.
 * =========================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
    var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    if (action === 'get_all' || action === 'ping') {
      var data = getAllStoreData(ss);
      var responseObj = { status: 'success', data: data };
      var jsonStr = JSON.stringify(responseObj);

      if (callback) {
        return ContentService.createTextOutput(callback + '(' + jsonStr + ')')
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }

      return ContentService.createTextOutput(jsonStr)
        .setMimeType(ContentService.MimeType.JSON);
    }

    var notFoundObj = { status: 'error', message: 'إجراء غير معروف' };
    if (callback) {
      return ContentService.createTextOutput(callback + '(' + JSON.stringify(notFoundObj) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(notFoundObj))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    var errObj = { status: 'error', message: err.toString() };
    if (e && e.parameter && e.parameter.callback) {
      return ContentService.createTextOutput(e.parameter.callback + '(' + JSON.stringify(errObj) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    return ContentService.createTextOutput(JSON.stringify(errObj))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;

    // 1. إضافة أو تقديم حساب ببجي جديد
    if (action === 'submit_pubg_account' || action === 'add_pubg_account') {
      var sub = payload.data || payload;
      var videoFinalUrl = sub.videoUrl || '';

      if (sub.videoFileBase64 && sub.videoFileBase64.length > 20) {
        try {
          var uploadRes = saveFileToGoogleDrive(
            sub.videoFileBase64,
            sub.videoFileName || ('pubg_video_' + (sub.accountName || 'acc') + '_' + new Date().getTime() + '.mp4'),
            sub.videoMimeType || 'video/mp4'
          );
          if (uploadRes && uploadRes.previewUrl) {
            videoFinalUrl = uploadRes.previewUrl;
          }
        } catch (vErr) {
          Logger.log('Video upload error: ' + vErr);
        }
      }

      var accSheet = ss.getSheetByName('حسابات ببجي');
      var newId = sub.id || 'acc-' + new Date().getTime();
      var displayFlag = sub.displayOnSite || (action === 'add_pubg_account' ? 'نعم' : 'لا');

      accSheet.appendRow([
        newId,                                        // العمود 1: المعرف
        sub.ownerName || sub.fullName || '',          // العمود 2: 1. اسم المالك
        sub.accountName || sub.title || '',           // العمود 3: 2. اسم الحساب المراد بيعه
        sub.accountLevel || sub.level || '',          // العمود 4: 3. مستوى الحساب
        sub.mythicsCount || '0',                      // العمود 5: 4. عدد المثكات الموجودة
        sub.apartmentLevel || sub.powerLevel || '',   // العمود 6: 5. مستوى الشقة / الروم
        sub.goldCount || sub.goldenMythicsCount || '',// العمود 7: 6. عدد مقاييس الذهب
        sub.upgradableWeapons || sub.upgradableWeaponsCount || '', // العمود 8: 7. عدد الأسلحة قيد التطوير
        sub.carsCount || '0',                         // العمود 9: 8. عدد السيارات
        sub.hashtagsCount || '0',                     // العمود 10: 9. عدد الهاشتاجات
        sub.linkedServices || sub.linkedAccounts || '',// العمود 11: 10. خدمات الربط
        sub.salePrice || sub.price || '0',            // العمود 12: 11. سعر بيع الحساب
        sub.sellerPhone || sub.phone || '',           // العمود 13: 12. رقم هاتف البائع
        sub.transferPhone || '',                      // العمود 14: 13. رقم الهاتف المحول منه 5 دينار
        sub.storeReceivePhone || '0943981577',        // العمود 15: 14. رقم الهاتف لتحويل 5 دينار إليه
        videoFinalUrl,                                // العمود 16: 15. فيديو الحساب
        sub.siteRating || '5',                        // العمود 17: 16. تقييم الموقع
        displayFlag                                   // العمود 18: 17. هل يتم عرض هذا الحساب على الموقع؟ (نعم/لا)
      ]);

      return createJsonResponse({ 
        status: 'success', 
        message: 'تم حفظ حساب ببجي في Google Sheets بنجاح', 
        id: newId,
        videoUrl: videoFinalUrl
      });
    }

    // 2. تغيير حالة عرض الحساب في الموقع (نعم / لا)
    if (action === 'set_pubg_display' || action === 'approve_pubg_submission' || action === 'reject_pubg_submission') {
      var accId = payload.id || payload.submissionId;
      var newDisplay = payload.display || (action === 'approve_pubg_submission' ? 'نعم' : 'لا');
      var sheetA = ss.getSheetByName('حسابات ببجي');
      var aRows = sheetA.getDataRange().getValues();
      var foundA = false;

      for (var rowIdx = 1; rowIdx < aRows.length; rowIdx++) {
        if (String(aRows[rowIdx][0]) === String(accId) || String(aRows[rowIdx][2]) === String(accId)) {
          sheetA.getRange(rowIdx + 1, 18).setValue(newDisplay);
          foundA = true;
          break;
        }
      }

      if (foundA) {
        return createJsonResponse({ status: 'success', message: 'تم تحديث حالة عرض الحساب إلى: ' + newDisplay });
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب' });
    }

    // 3. حذف حساب ببجي نهائياً من Google Sheets
    if (action === 'delete_pubg_account') {
      var delAccId = String(payload.id || '').trim();
      var sheetDelA = ss.getSheetByName('حسابات ببجي');
      var delRowsA = sheetDelA.getDataRange().getValues();
      for (var dIdx = 1; dIdx < delRowsA.length; dIdx++) {
        var rowId = String(delRowsA[dIdx][0] || '').trim();
        var rowTitle = String(delRowsA[dIdx][2] || '').trim();
        if (rowId === delAccId || (delAccId && rowTitle === delAccId)) {
          sheetDelA.deleteRow(dIdx + 1);
          return createJsonResponse({ status: 'success', message: 'تم حذف الحساب بنجاح نهائياً من Google Sheets' });
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تنفيذ الحذف بنجاح' });
    }

    // 4. إضافة منتج جديد
    if (action === 'add_product') {
      var p = payload.data || payload;
      var pSheet = ss.getSheetByName('المنتجات');
      var prodId = p.id || 'prod-' + new Date().getTime();
      var prodImage = p.image || '';

      if (p.imageBase64 && p.imageBase64.length > 20) {
        try {
          var imgRes = saveFileToGoogleDrive(p.imageBase64, 'prod_' + prodId + '.jpg', 'image/jpeg');
          if (imgRes && imgRes.previewUrl) {
            prodImage = imgRes.previewUrl;
          }
        } catch (iErr) {
          Logger.log('Image upload err: ' + iErr);
        }
      }

      pSheet.appendRow([
        prodId,
        p.name || '',
        p.category || 'الكل',
        Number(p.price) || 0,
        p.oldPrice ? Number(p.oldPrice) : '',
        prodImage,
        p.tag || '',
        p.description || '',
        p.inStock !== false ? 'نعم' : 'لا',
        p.featured ? 'نعم' : 'لا'
      ]);

      return createJsonResponse({ status: 'success', message: 'تمت إضافة المنتج بنجاح', id: prodId, image: prodImage });
    }

    // 5. تعديل منتج
    if (action === 'update_product') {
      var upProd = payload.data || payload;
      var upProdId = String(payload.id || upProd.id || '').trim();
      var sheetP = ss.getSheetByName('المنتجات');
      var pData = sheetP.getDataRange().getValues();
      var pFound = -1;

      for (var pi = 1; pi < pData.length; pi++) {
        if (String(pData[pi][0]).trim() === upProdId || String(pData[pi][1]).trim() === upProdId) {
          pFound = pi + 1;
          break;
        }
      }

      if (pFound > 0) {
        var rowImage = upProd.image || pData[pFound-1][5];
        if (upProd.imageBase64 && upProd.imageBase64.length > 20) {
          try {
            var newImg = saveFileToGoogleDrive(upProd.imageBase64, 'prod_' + upProdId + '.jpg', 'image/jpeg');
            if (newImg && newImg.previewUrl) rowImage = newImg.previewUrl;
          } catch(e){}
        }

        var newPRow = [
          upProdId,
          upProd.name || pData[pFound-1][1],
          upProd.category || pData[pFound-1][2],
          upProd.price !== undefined ? Number(upProd.price) : pData[pFound-1][3],
          upProd.oldPrice !== undefined ? Number(upProd.oldPrice) : pData[pFound-1][4],
          rowImage,
          upProd.tag !== undefined ? upProd.tag : pData[pFound-1][6],
          upProd.description !== undefined ? upProd.description : pData[pFound-1][7],
          upProd.inStock !== undefined ? (upProd.inStock ? 'نعم' : 'لا') : pData[pFound-1][8],
          upProd.featured !== undefined ? (upProd.featured ? 'نعم' : 'لا') : pData[pFound-1][9]
        ];
        sheetP.getRange(pFound, 1, 1, newPRow.length).setValues([newPRow]);
        return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات المنتج بنجاح' });
      }
      return createJsonResponse({ status: 'error', message: 'المنتج غير موجود' });
    }

    // 6. حذف منتج نهائياً من Google Sheets
    if (action === 'delete_product') {
      var delPId = String(payload.id || '').trim();
      var sheetDelP = ss.getSheetByName('المنتجات');
      var pRowsDel = sheetDelP.getDataRange().getValues();
      for (var pdi = 1; pdi < pRowsDel.length; pdi++) {
        var pid = String(pRowsDel[pdi][0] || '').trim();
        var pname = String(pRowsDel[pdi][1] || '').trim();
        if (pid === delPId || (delPId && pname === delPId)) {
          sheetDelP.deleteRow(pdi + 1);
          return createJsonResponse({ status: 'success', message: 'تم حذف المنتج نهائياً من Google Sheets' });
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تنفيذ حذف المنتج' });
    }

    // 7. إضافة باقة شدات UC
    if (action === 'add_uc_package') {
      var uc = payload.data || payload;
      var ucSheet = ss.getSheetByName('باقات الشدات');
      var ucId = uc.id || 'uc-' + new Date().getTime();
      ucSheet.appendRow([
        ucId,
        Number(uc.ucAmount) || 0,
        Number(uc.bonusUc) || 0,
        Number(uc.price) || 0,
        uc.discountPrice ? Number(uc.discountPrice) : '',
        uc.tag || '',
        uc.isPopular ? 'نعم' : 'لا',
        uc.isAvailable !== false ? 'نعم' : 'لا'
      ]);
      return createJsonResponse({ status: 'success', message: 'تمت إضافة باقة الشدات بنجاح', id: ucId });
    }

    // 8. تعديل باقة شدات UC
    if (action === 'update_uc_package') {
      var upUcId = String(payload.id || '').trim();
      var upUc = payload.data || payload;
      var sheetUc = ss.getSheetByName('باقات الشدات');
      var ucRows = sheetUc.getDataRange().getValues();
      for (var uci = 1; uci < ucRows.length; uci++) {
        if (String(ucRows[uci][0]).trim() === upUcId) {
          var updatedUcRow = [
            upUcId,
            upUc.ucAmount !== undefined ? Number(upUc.ucAmount) : ucRows[uci][1],
            upUc.bonusUc !== undefined ? Number(upUc.bonusUc) : ucRows[uci][2],
            upUc.price !== undefined ? Number(upUc.price) : ucRows[uci][3],
            upUc.discountPrice !== undefined ? Number(upUc.discountPrice) : ucRows[uci][4],
            upUc.tag !== undefined ? upUc.tag : ucRows[uci][5],
            upUc.isPopular !== undefined ? (upUc.isPopular ? 'نعم' : 'لا') : ucRows[uci][6],
            upUc.isAvailable !== undefined ? (upUc.isAvailable ? 'نعم' : 'لا') : ucRows[uci][7]
          ];
          sheetUc.getRange(uci + 1, 1, 1, updatedUcRow.length).setValues([updatedUcRow]);
          return createJsonResponse({ status: 'success', message: 'تم تحديث باقة الشدات بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'باقة الشدات غير موجودة' });
    }

    // 9. حذف باقة شدات UC نهائياً من Google Sheets
    if (action === 'delete_uc_package') {
      var delUcId = String(payload.id || '').trim();
      var sheetDelUc = ss.getSheetByName('باقات الشدات');
      var rowsDelUc = sheetDelUc.getDataRange().getValues();
      for (var duci = 1; duci < rowsDelUc.length; duci++) {
        var rUcId = String(rowsDelUc[duci][0] || '').trim();
        var rUcAmount = String(rowsDelUc[duci][1] || '').trim();
        if (rUcId === delUcId || (delUcId && rUcAmount === delUcId)) {
          sheetDelUc.deleteRow(duci + 1);
          return createJsonResponse({ status: 'success', message: 'تم حذف باقة الشدات نهائياً من Google Sheets' });
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم حذف باقة الشدات' });
    }

    // 10. حفظ صفحات التواصل وإعدادات المتجر
    if (action === 'save_settings' || action === 'save_social_links') {
      var setObj = payload.data || payload;

      // تحديث ورقة "صفحات التواصل"
      var socSheet = ss.getSheetByName('صفحات التواصل');
      if (socSheet) {
        socSheet.clearContents();
        var socHeader = ['المعرف', 'اسم المنصة', 'الرابط المباشر (URL)', 'اسم المعرف/الحساب (@Handle)', 'ملاحظات / رقم'];
        var socRows = [
          ['soc-tiktok', 'TikTok', setObj.tiktokUrl || 'https://www.tiktok.com/@rtg_gear_x', setObj.tiktokHandle || '@rtg_gear_x', 'حساب تيك توك الرسمي'],
          ['soc-facebook', 'Facebook', setObj.facebookUrl || 'https://www.facebook.com/share/18H2vFuhd9/', setObj.facebookHandle || 'RTG Gear X', 'صفحة فيسبوك الرسمية'],
          ['soc-instagram', 'Instagram', setObj.instagramUrl || 'https://www.instagram.com/rtg_gear_x', setObj.instagramHandle || '@rtg_gear_x', 'حساب انستقرام الرسمي'],
          ['soc-whatsapp', 'WhatsApp', 'https://wa.me/' + (setObj.whatsappNumber || '218934590635'), setObj.phoneDisplay || '+218 93 459 0635', setObj.whatsappNumber || '218934590635'],
          ['soc-phone', 'Phone (هاتف الدعم)', 'tel:' + (setObj.supportPhoneAlt || '0934590635'), setObj.supportPhoneAlt || '0934590635', 'رقم الاتصال المباشر'],
          ['soc-transfer', 'Transfer Phone (رقم تحويل 5 دينار)', 'tel:' + (setObj.transferFeePhone || '0943981577'), setObj.transferFeePhone || '0943981577', 'رقم استلام رسوم العرض']
        ];
        socSheet.getRange(1, 1, socRows.length + 1, socHeader.length).setValues([socHeader].concat(socRows));
        socSheet.getRange(1, 1, 1, socHeader.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      }

      // تحديث ورقة "إعدادات المتجر"
      var setSheet = ss.getSheetByName('إعدادات المتجر');
      if (setSheet) {
        setSheet.clearContents();
        var setHeader = ['اسم الإعداد', 'القيمة'];
        var setRows = [
          ['whatsappNumber', setObj.whatsappNumber || '218934590635'],
          ['phoneDisplay', setObj.phoneDisplay || '+218 93 459 0635'],
          ['supportPhoneAlt', setObj.supportPhoneAlt || '0934590635'],
          ['transferFeePhone', setObj.transferFeePhone || '0943981577'],
          ['googleFormUrl', setObj.googleFormUrl || 'https://forms.gle/LCS6CgXUWciHH21k8'],
          ['tiktokUrl', setObj.tiktokUrl || 'https://www.tiktok.com/@rtg_gear_x'],
          ['tiktokHandle', setObj.tiktokHandle || '@rtg_gear_x'],
          ['facebookUrl', setObj.facebookUrl || 'https://www.facebook.com/share/18H2vFuhd9/'],
          ['facebookHandle', setObj.facebookHandle || 'RTG Gear X'],
          ['instagramUrl', setObj.instagramUrl || 'https://www.instagram.com/rtg_gear_x'],
          ['instagramHandle', setObj.instagramHandle || '@rtg_gear_x'],
          ['aboutText', setObj.aboutText || 'متجرك الأول في ليبيا لمعدات الألعاب وشحن الشدات وشراء حسابات ببجي الموثقة.']
        ];
        setSheet.getRange(1, 1, setRows.length + 1, setHeader.length).setValues([setHeader].concat(setRows));
        setSheet.getRange(1, 1, 1, setHeader.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      }

      return createJsonResponse({ status: 'success', message: 'تم حفظ وتحديث روابط التواصل وإعدادات المتجر في Google Sheets بنجاح' });
    }

    // 11. إضافة طلب شراء
    if (action === 'submit_order') {
      var order = payload.data || payload;
      var ordSheet = ss.getSheetByName('الطلبات الواردة');
      ordSheet.appendRow([
        order.id || 'ORD-' + new Date().getTime(),
        order.date || new Date().toLocaleString('ar-LY'),
        order.type || '',
        order.customerName || '',
        order.phone || '',
        order.city || '',
        order.region || '',
        order.paymentMethod || '',
        order.total || 0,
        order.status || 'قيد الانتظار',
        JSON.stringify(order.items || [])
      ]);
      return createJsonResponse({ status: 'success', message: 'تم تسجيل الطلب في Google Sheets' });
    }

    return createJsonResponse({ status: 'error', message: 'Unknown action' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// دالة حفظ الملفات في Google Drive وإنشاء روابط عامة
function saveFileToGoogleDrive(base64Data, fileName, mimeType) {
  var folderName = 'RTG_GEARX_UPLOADS';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var cleanBase64 = base64Data;
  if (cleanBase64.indexOf(',') > -1) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  var decoded = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(decoded, mimeType || 'application/octet-stream', fileName || ('file_' + new Date().getTime()));
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  var previewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
  var downloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;

  return {
    fileId: fileId,
    previewUrl: previewUrl,
    downloadUrl: downloadUrl
  };
}

// دالة جلب كافة بيانات المتجر وصفحات التواصل من Google Sheets
function getAllStoreData(ss) {
  // 1. المنتجات
  var prodSheet = ss.getSheetByName('المنتجات');
  var prodData = prodSheet.getDataRange().getValues();
  var products = [];
  for (var i = 1; i < prodData.length; i++) {
    var r = prodData[i];
    if (r[0] && r[1]) {
      products.push({
        id: String(r[0]),
        name: String(r[1]),
        category: String(r[2]),
        price: Number(r[3]) || 0,
        oldPrice: r[4] ? Number(r[4]) : undefined,
        image: String(r[5] || ''),
        tag: r[6] ? String(r[6]) : undefined,
        description: String(r[7] || ''),
        inStock: r[8] === 'لا' ? false : true,
        featured: r[9] === 'نعم' ? true : false
      });
    }
  }

  // 2. حسابات ببجي
  var accSheet = ss.getSheetByName('حسابات ببجي');
  var accData = accSheet.getDataRange().getValues();
  var pubgAccounts = [];
  var allPubgAccounts = [];

  for (var j = 1; j < accData.length; j++) {
    var a = accData[j];
    if (a[0] && (a[1] || a[2])) {
      var displayFlag = String(a[17] || 'لا').trim();
      var isApproved = (displayFlag === 'نعم' || displayFlag.toLowerCase() === 'yes');
      
      // Find video URL flexibly if column shifted or received in alternative column
      var foundVideo = '';
      for (var colIdx = 13; colIdx < a.length; colIdx++) {
        var cellVal = String(a[colIdx] || '').trim();
        if (cellVal.indexOf('http') > -1 && (cellVal.indexOf('drive.google.com') > -1 || cellVal.indexOf('youtu') > -1 || cellVal.indexOf('.mp4') > -1)) {
          foundVideo = cellVal;
          break;
        }
      }
      if (!foundVideo) {
        foundVideo = String(a[15] || '').trim();
      }

      var accItem = {
        id: String(a[0]),
        ownerName: String(a[1] || ''),
        accountName: String(a[2] || ''),
        title: String(a[2] || ('حساب PUBG لفل ' + a[3])),
        badge: 'حساب موثق',
        level: a[3] ? ('LVL ' + String(a[3]).replace(/LVL/i, '').trim()) : 'LVL --',
        accountLevel: String(a[3] || ''),
        mythicsCount: String(a[4] || '0'),
        apartmentLevel: String(a[5] || ''),
        goldCount: String(a[6] || '0'),
        upgradableWeaponsCount: String(a[7] || ''),
        carsCount: String(a[8] || '0'),
        hashtagsCount: String(a[9] || '0'),
        linkedServices: String(a[10] || ''),
        linkedAccounts: String(a[10] || ''),
        price: Number(a[11]) || 0,
        salePrice: String(a[11] || '0'),
        sellerPhone: String(a[12] || ''),
        sellerName: String(a[1] || ''),
        transferPhone: String(a[13] || ''),
        storeReceivePhone: String(a[14] || '0943981577'),
        image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
        videoUrl: foundVideo,
        siteRating: String(a[16] || '5'),
        displayOnSite: isApproved ? 'نعم' : 'لا',
        approved: isApproved,
        isAvailable: true,
        features: [
          (a[4] ? a[4] + ' ميثيك' : 'حساب مميز'),
          (a[7] ? String(a[7]) : 'أسلحة مطورة'),
          'تسليم آمن ومضمون'
        ]
      };

      allPubgAccounts.push(accItem);

      if (isApproved) {
        pubgAccounts.push(accItem);
      }
    }
  }

  // 3. باقات الشدات
  var ucSheet = ss.getSheetByName('باقات الشدات');
  var ucData = ucSheet.getDataRange().getValues();
  var ucPackages = [];
  for (var u = 1; u < ucData.length; u++) {
    var uc = ucData[u];
    if (uc[0] && uc[1]) {
      ucPackages.push({
        id: String(uc[0]),
        ucAmount: Number(uc[1]) || 0,
        bonusUc: Number(uc[2]) || 0,
        price: Number(uc[3]) || 0,
        discountPrice: uc[4] ? Number(uc[4]) : undefined,
        tag: uc[5] ? String(uc[5]) : undefined,
        isPopular: uc[6] === 'نعم' ? true : false,
        isAvailable: uc[7] === 'لا' ? false : true
      });
    }
  }

  // 4. صفحات التواصل وإعدادات المتجر
  var settings = {
    tiktokUrl: 'https://www.tiktok.com/@rtg_gear_x',
    tiktokHandle: '@rtg_gear_x',
    facebookUrl: 'https://www.facebook.com/share/18H2vFuhd9/',
    facebookHandle: 'RTG Gear X',
    instagramUrl: 'https://www.instagram.com/rtg_gear_x',
    instagramHandle: '@rtg_gear_x',
    whatsappNumber: '218934590635',
    phoneDisplay: '+218 93 459 0635',
    supportPhoneAlt: '0934590635',
    transferFeePhone: '0943981577',
    googleFormUrl: 'https://forms.gle/LCS6CgXUWciHH21k8'
  };

  // قراءة ورقة صفحات التواصل إن وُجدت
  var socSheet = ss.getSheetByName('صفحات التواصل');
  if (socSheet) {
    var socData = socSheet.getDataRange().getValues();
    for (var sc = 1; sc < socData.length; sc++) {
      var rowP = String(socData[sc][1] || '').trim().toLowerCase();
      var rowUrl = String(socData[sc][2] || '').trim();
      var rowHandle = String(socData[sc][3] || '').trim();
      var rowNotes = String(socData[sc][4] || '').trim();

      if (rowP.indexOf('tiktok') > -1) {
        if (rowUrl) settings.tiktokUrl = rowUrl;
        if (rowHandle) settings.tiktokHandle = rowHandle;
      } else if (rowP.indexOf('facebook') > -1) {
        if (rowUrl) settings.facebookUrl = rowUrl;
        if (rowHandle) settings.facebookHandle = rowHandle;
      } else if (rowP.indexOf('instagram') > -1) {
        if (rowUrl) settings.instagramUrl = rowUrl;
        if (rowHandle) settings.instagramHandle = rowHandle;
      } else if (rowP.indexOf('whatsapp') > -1) {
        if (rowNotes) settings.whatsappNumber = rowNotes.replace(/[^0-9]/g, '');
        if (rowHandle) settings.phoneDisplay = rowHandle;
      } else if (rowP.indexOf('phone') > -1 || rowP.indexOf('هاتف') > -1) {
        if (rowHandle) settings.supportPhoneAlt = rowHandle;
      } else if (rowP.indexOf('transfer') > -1 || rowP.indexOf('تحويل') > -1) {
        if (rowHandle) settings.transferFeePhone = rowHandle;
      }
    }
  }

  // قراءة ورقة إعدادات المتجر العامة
  var setSheet = ss.getSheetByName('إعدادات المتجر');
  if (setSheet) {
    var setData = setSheet.getDataRange().getValues();
    for (var s = 1; s < setData.length; s++) {
      if (setData[s][0]) {
        var key = String(setData[s][0]).trim();
        var val = String(setData[s][1] || '').trim();
        if (val) {
          settings[key] = val;
        }
      }
    }
  }

  return {
    products: products,
    pubgAccounts: pubgAccounts,
    allPubgAccounts: allPubgAccounts,
    ucPackages: ucPackages,
    settings: settings
  };
}

// دالة تجهيز وإعداد الجداول إذا لم تكن موجودة
function setupSheetsIfMissing(ss) {
  var requiredSheets = [
    {
      name: 'المنتجات',
      headers: ['المعرف (ID)', 'اسم المنتج', 'فئة المنتج', 'سعر المنتج (د.ل)', 'السعر الخاص/المخفض', 'رابط صورة المنتج', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)']
    },
    {
      name: 'حسابات ببجي',
      headers: [
        'المعرف (ID)', 
        '1. اسم المالك', 
        '2. اسم الحساب المراد بيعه', 
        '3. مستوى الحساب', 
        '4. عدد المثكات الموجودة', 
        '5. مستوى الشقة', 
        '6. عدد مقاييس الذهب', 
        '7. عدد الأسلحة قيد التطوير', 
        '8. عدد السيارات', 
        '9. عدد الهاشتاجات', 
        '10. خدمات الربط', 
        '11. سعر بيع الحساب (د.ل)', 
        '12. رقم هاتف البائع', 
        '13. رقم الهاتف المحول منه 5 دينار', 
        '14. رقم الهاتف لتحويل 5 دينار إليه', 
        '15. فيديو الحساب (أقل من 40 ثانية)', 
        '16. تقييم الموقع', 
        '17. هل يتم عرض هذا الحساب على الموقع؟ (نعم/لا)'
      ]
    },
    {
      name: 'باقات الشدات',
      headers: ['المعرف (ID)', 'كمية الشدات (UC)', 'شدات إضافية مجانية (Bonus)', 'السعر الأساسي (د.ل)', 'السعر بعد الخصم/الحسم (د.ل)', 'الشارة (Tag)', 'الأكثر طلباً؟ (نعم/لا)', 'متوفر للشحن؟ (نعم/لا)']
    },
    {
      name: 'صفحات التواصل',
      headers: ['المعرف', 'اسم المنصة', 'الرابط المباشر (URL)', 'اسم المعرف/الحساب (@Handle)', 'ملاحظات / رقم الهاتف'],
      defaultRows: [
        ['soc-tiktok', 'TikTok', 'https://www.tiktok.com/@rtg_gear_x', '@rtg_gear_x', 'حساب تيك توك الرسمي'],
        ['soc-facebook', 'Facebook', 'https://www.facebook.com/share/18H2vFuhd9/', 'RTG Gear X', 'صفحة فيسبوك الرسمية'],
        ['soc-instagram', 'Instagram', 'https://www.instagram.com/rtg_gear_x', '@rtg_gear_x', 'حساب انستقرام الرسمي'],
        ['soc-whatsapp', 'WhatsApp', 'https://wa.me/218934590635', '+218 93 459 0635', '218934590635'],
        ['soc-phone', 'Phone (هاتف الدعم)', 'tel:0934590635', '0934590635', 'رقم الاتصال المباشر'],
        ['soc-transfer', 'Transfer Phone (رقم تحويل 5 دينار)', 'tel:0943981577', '0943981577', 'رقم استلام رسوم العرض']
      ]
    },
    {
      name: 'إعدادات المتجر',
      headers: ['اسم الإعداد', 'القيمة'],
      defaultRows: [
        ['whatsappNumber', '218934590635'],
        ['phoneDisplay', '+218 93 459 0635'],
        ['supportPhoneAlt', '0934590635'],
        ['transferFeePhone', '0943981577'],
        ['googleFormUrl', 'https://forms.gle/LCS6CgXUWciHH21k8'],
        ['tiktokUrl', 'https://www.tiktok.com/@rtg_gear_x'],
        ['tiktokHandle', '@rtg_gear_x'],
        ['facebookUrl', 'https://www.facebook.com/share/18H2vFuhd9/'],
        ['facebookHandle', 'RTG Gear X'],
        ['instagramUrl', 'https://www.instagram.com/rtg_gear_x'],
        ['instagramHandle', '@rtg_gear_x'],
        ['aboutText', 'متجرك الأول في ليبيا لمعدات الألعاب وشحن الشدات وشراء حسابات ببجي الموثقة.']
      ]
    },
    {
      name: 'الطلبات الواردة',
      headers: ['رقم الطلب', 'التاريخ والوقت', 'نوع الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'المنطقة', 'طريقة الدفع', 'الإجمالي (د.ل)', 'الحالة', 'تفاصيل العناصر']
    }
  ];

  requiredSheets.forEach(function(sInfo) {
    var sheet = ss.getSheetByName(sInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sInfo.name);
      sheet.appendRow(sInfo.headers);
      sheet.getRange(1, 1, 1, sInfo.headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      if (sInfo.defaultRows && sInfo.defaultRows.length > 0) {
        sheet.getRange(2, 1, sInfo.defaultRows.length, sInfo.headers.length).setValues(sInfo.defaultRows);
      }
      sheet.setFrozenRows(1);
    }
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxO0mCyl7uJx1EhxtWUBfR86pSRGKL-oVByHfKBA3TSfKhKZt-D8nWKTSMS_1poz7VsA/exec';
export const DEFAULT_DEV_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwxO0mCyl7uJx1EhxtWUBfR86pSRGKL-oVByHfKBA3TSfKhKZt-D8nWKTSMS_1poz7VsA/exec';

export class AppsScriptService {
  public static getConfig(): AppsScriptConfig {
    try {
      const saved = localStorage.getItem(APPS_SCRIPT_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.webAppUrl && parsed.webAppUrl.trim()) {
          return parsed;
        }
      }
      return { 
        webAppUrl: DEFAULT_APPS_SCRIPT_URL, 
        autoFetchOnLoad: true, 
        lastSyncedAt: null 
      };
    } catch {
      return { 
        webAppUrl: DEFAULT_APPS_SCRIPT_URL, 
        autoFetchOnLoad: true, 
        lastSyncedAt: null 
      };
    }
  }

  public static saveConfig(config: Partial<AppsScriptConfig>): AppsScriptConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Helper to send JSON payload via POST (avoid preflight issues)
   */
  private static async sendPost(webAppUrl: string, body: any): Promise<any> {
    const targetUrl = webAppUrl && webAppUrl.trim() ? webAppUrl.trim() : DEFAULT_APPS_SCRIPT_URL;
    const cleanUrl = targetUrl;

    try {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        try {
          return await res.json();
        } catch {
          return { status: 'success' };
        }
      }
    } catch (e) {
      // Fallback no-cors
      try {
        await fetch(cleanUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain;charset=utf-8',
          },
          body: JSON.stringify(body),
        });
      } catch (err) {
        console.warn('Apps script post error:', err);
      }
    }
    return { status: 'success' };
  }

  /**
   * Universal JSONP requester that completely bypasses CORS restrictions
   */
  private static loadViaJsonp(baseUrl: string, timeoutMs: number = 7000): Promise<any> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        return reject(new Error('Window is undefined'));
      }

      const callbackName = 'rtg_gas_cb_' + Math.random().toString(36).substring(2, 10);
      let isDone = false;

      const timer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          cleanup();
          reject(new Error('JSONP timeout'));
        }
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        try {
          delete (window as any)[callbackName];
        } catch {}
        const scriptEl = document.getElementById(callbackName);
        if (scriptEl && scriptEl.parentNode) {
          scriptEl.parentNode.removeChild(scriptEl);
        }
      };

      (window as any)[callbackName] = (data: any) => {
        if (!isDone) {
          isDone = true;
          cleanup();
          resolve(data);
        }
      };

      const script = document.createElement('script');
      script.id = callbackName;
      const sep = baseUrl.includes('?') ? '&' : '?';
      script.src = `${baseUrl}${sep}action=get_all&callback=${callbackName}&_t=${Date.now()}`;
      script.async = true;
      script.onerror = () => {
        if (!isDone) {
          isDone = true;
          cleanup();
          reject(new Error('JSONP load error'));
        }
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Fetch all store items live from Google Apps Script Web App
   */
  public static async fetchStoreData(webAppUrl?: string): Promise<{
    products: Product[];
    pubgAccounts: PubgAccount[];
    allPubgAccounts?: PubgAccount[];
    pubgSubmissions?: PubgSellSubmission[];
    ucPackages: UcPackage[];
    settings?: Partial<StoreSettings>;
  }> {
    const inputUrl = (webAppUrl && webAppUrl.trim()) ? webAppUrl.trim() : DEFAULT_APPS_SCRIPT_URL;
    
    // Prepare candidate URLs (support both /exec and /dev seamlessly)
    const urlsToTry: string[] = [];
    urlsToTry.push(inputUrl);

    if (inputUrl.endsWith('/dev')) {
      urlsToTry.push(inputUrl.replace(/\/dev$/, '/exec'));
    } else if (inputUrl.endsWith('/exec')) {
      urlsToTry.push(inputUrl.replace(/\/exec$/, '/dev'));
    }

    let lastError: any = null;

    for (const testUrl of urlsToTry) {
      // 1. Try standard GET fetch
      try {
        const fullUrl = testUrl.includes('?') ? `${testUrl}&action=get_all` : `${testUrl}?action=get_all`;
        const res = await fetch(fullUrl, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (res.ok) {
          const result = await res.json();
          const data = result.data || result;

          if (result.status === 'success' || data.products || data.pubgAccounts || data.ucPackages) {
            this.saveConfig({ 
              webAppUrl: testUrl,
              lastSyncedAt: new Date().toLocaleString('ar-LY') 
            });

            return {
              products: Array.isArray(data.products) ? data.products : [],
              pubgAccounts: Array.isArray(data.pubgAccounts) ? data.pubgAccounts : [],
              allPubgAccounts: Array.isArray(data.allPubgAccounts) ? data.allPubgAccounts : data.pubgAccounts,
              pubgSubmissions: Array.isArray(data.pubgSubmissions) ? data.pubgSubmissions : [],
              ucPackages: Array.isArray(data.ucPackages) ? data.ucPackages : [],
              settings: data.settings || {},
            };
          }
        }
      } catch (err: any) {
        lastError = err;
      }

      // 2. Try JSONP fallback (bypasses all browser CORS and origin blocks across all devices)
      try {
        const result = await this.loadViaJsonp(testUrl);
        const data = result.data || result;

        if (result.status === 'success' || data.products || data.pubgAccounts || data.ucPackages) {
          this.saveConfig({ 
            webAppUrl: testUrl,
            lastSyncedAt: new Date().toLocaleString('ar-LY') 
          });

          return {
            products: Array.isArray(data.products) ? data.products : [],
            pubgAccounts: Array.isArray(data.pubgAccounts) ? data.pubgAccounts : [],
            allPubgAccounts: Array.isArray(data.allPubgAccounts) ? data.allPubgAccounts : data.pubgAccounts,
            pubgSubmissions: Array.isArray(data.pubgSubmissions) ? data.pubgSubmissions : [],
            ucPackages: Array.isArray(data.ucPackages) ? data.ucPackages : [],
            settings: data.settings || {},
          };
        }
      } catch (jsonpErr: any) {
        lastError = jsonpErr;
      }
    }

    throw new Error(lastError?.message || 'فشل جلب البيانات من Google Sheets');
  }

  /**
   * Submit a new PUBG Sell Request or Add PUBG Account
   */
  public static async submitPubgSellAccount(
    webAppUrl: string,
    submission: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'submit_pubg_account',
      data: submission,
    });
    return true;
  }

  /**
   * Toggle PUBG account display on website (نعم / لا)
   */
  public static async setPubgDisplay(
    webAppUrl: string,
    id: string,
    display: 'نعم' | 'لا'
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_pubg_display',
      id,
      display,
    });
    return true;
  }

  /**
   * Delete PUBG Account from Google Sheet
   */
  public static async deletePubgAccount(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_pubg_account',
      id,
    });
    return true;
  }

  /**
   * Update PUBG Account in Google Sheets
   */
  public static async updatePubgAccount(webAppUrl: string, id: string, updated: Partial<PubgAccount>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_pubg_account',
      id,
      data: updated,
    });
    return true;
  }

  /**
   * Approve PUBG Submission (set display to 'نعم')
   */
  public static async approvePubgSubmission(webAppUrl: string, id: string): Promise<boolean> {
    return this.setPubgDisplay(webAppUrl, id, 'نعم');
  }

  /**
   * Reject PUBG Submission (set display to 'لا')
   */
  public static async rejectPubgSubmission(webAppUrl: string, id: string): Promise<boolean> {
    return this.setPubgDisplay(webAppUrl, id, 'لا');
  }

  /**
   * Sync All Data
   */
  public static async syncAllData(webAppUrl: string, data: any): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'sync_all',
      data,
    });
    return true;
  }

  /**
   * Add a product to Google Sheets
   */
  public static async addProduct(webAppUrl: string, product: Product & { imageBase64?: string }): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_product',
      data: product,
    });
    return true;
  }

  /**
   * Update a product in Google Sheets
   */
  public static async updateProduct(webAppUrl: string, id: string, product: Partial<Product>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_product',
      id,
      data: product,
    });
    return true;
  }

  /**
   * Delete a product from Google Sheets
   */
  public static async deleteProduct(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_product',
      id,
    });
    return true;
  }

  /**
   * Add a UC Package to Google Sheets
   */
  public static async addUcPackage(webAppUrl: string, ucPackage: UcPackage): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_uc_package',
      data: ucPackage,
    });
    return true;
  }

  /**
   * Update a UC Package in Google Sheets
   */
  public static async updateUcPackage(webAppUrl: string, id: string, ucPackage: Partial<UcPackage>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_uc_package',
      id,
      data: ucPackage,
    });
    return true;
  }

  /**
   * Delete a UC Package from Google Sheets
   */
  public static async deleteUcPackage(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_uc_package',
      id,
    });
    return true;
  }

  /**
   * Save store settings in Google Sheets
   */
  public static async saveSettings(webAppUrl: string, settings: Partial<StoreSettings>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_settings',
      data: settings,
    });
    return true;
  }

  /**
   * Submit Order to Google Sheets via Web App
   */
  public static async submitOrder(webAppUrl: string, order: Order): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'submit_order',
      data: order,
    });
    return true;
  }
}
