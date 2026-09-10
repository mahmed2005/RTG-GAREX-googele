/**
 * Google Apps Script Web App Integration
 * Enables Google Sheets and Google Drive to act as a 100% free, real-time backend database for RTG Gear X
 */

import { Product, PubgAccount, UcPackage, Order, StoreSettings, PubgSellSubmission, DeliveryCityRate } from '../types';

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
    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
    var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    // Fast-path: Only run setup on explicit setup action or if core sheets are missing
    if (action === 'setup' || !ss.getSheetByName('المنتجات')) {
      setupSheetsIfMissing(ss);
    }

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

      var accSheet = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
      var newId = sub.id || 'acc-' + new Date().getTime();
      var displayFlag = sub.displayOnSite || (action === 'add_pubg_account' ? 'نعم' : 'لا');
      var saleFlag = (sub.isSold || sub.sold || sub.saleStatus === 'تم البيع') ? 'لا' : 'نعم'; // نعم = متاح للبيع / لا = تم بيع الحساب

      var pColsSubmit = getPubgColumnIndices(accSheet);
      var rowToInsert = [];
      rowToInsert[0] = newId;                                                      // 1. الطابع الزمني / المعرف
      rowToInsert[1] = sub.ownerName || sub.fullName || '';                        // 2. الاسم الثلاثي
      rowToInsert[2] = sub.accountName || sub.title || '';                         // 3. اسم الحساب
      rowToInsert[3] = sub.accountLevel || sub.level || '';                        // 4. مستوى الحساب
      rowToInsert[4] = sub.mythicsCount || '0';                                    // 5. عدد الميثيك
      rowToInsert[5] = sub.apartmentLevel || sub.powerLevel || '';                 // 6. مستوى السكنات
      rowToInsert[6] = sub.goldCount || sub.goldenMythicsCount || '';              // 7. عدد الميثيك الذهبي
      rowToInsert[7] = sub.upgradableWeapons || sub.upgradableWeaponsCount || '';  // 8. عدد الأسلحة
      rowToInsert[8] = sub.carsCount || '0';                                       // 9. عدد السيارات
      rowToInsert[9] = sub.hashtagsCount || '0';                                   // 10. عدد الهاشتاجات
      rowToInsert[10] = sub.linkedServices || sub.linkedAccounts || '';            // 11. الربط
      rowToInsert[11] = sub.salePrice || sub.price || '0';                         // 12. السعر
      rowToInsert[12] = sub.sellerPhone || sub.phone || '';                        // 13. رقم الهاتف
      rowToInsert[13] = sub.transferPhone || '';                                   // 14. رقم الهاتف المحول منه 5 دينار
      rowToInsert[14] = videoFinalUrl;                                             // 15. فيديو للحساب
      rowToInsert[15] = '5';                                                       // 16. تقييم للموقع بكل صدق
      if (pColsSubmit.dispCol >= 19) {
        rowToInsert[16] = '5';                                                     // 17. تقييم للموقع (متكررة)
        rowToInsert[17] = saleFlag;                                                // 18. متاح نعم أو لا
        rowToInsert[18] = displayFlag;                                             // 19. عرض الحساب في الموقع
      } else {
        rowToInsert[16] = saleFlag;                                                // 17. متاح نعم أو لا
        rowToInsert[17] = displayFlag;                                             // 18. عرض الحساب في الموقع
      }

      accSheet.appendRow(rowToInsert);

      return createJsonResponse({ 
        status: 'success', 
        message: 'تم حفظ حساب ببجي في Google Sheets بنجاح', 
        id: newId,
        videoUrl: videoFinalUrl
      });
    }

    // 2. تغيير حالة عرض الحساب في الموقع (نعم / لا) بمرونة عبر العمود المخصص
    if (action === 'set_pubg_display' || action === 'toggle_pubg_display' || action === 'approve_pubg_submission' || action === 'reject_pubg_submission') {
      var sheetA = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
      if (!sheetA) return createJsonResponse({ status: 'error', message: 'ورقة حسابات ببجي غير موجودة' });

      var colsD = getPubgColumnIndices(sheetA);
      var aRowsD = sheetA.getDataRange().getValues();
      var targetRowD = findPubgRowIndex(sheetA, payload, aRowsD, colsD);

      var rawDisplay = payload.display || (action === 'approve_pubg_submission' ? 'نعم' : (action === 'reject_pubg_submission' ? 'لا' : 'نعم'));
      var newDisplay = (rawDisplay === 'نعم' || rawDisplay === true || rawDisplay === 'yes') ? 'نعم' : 'لا';

      if (targetRowD > 1) {
        sheetA.getRange(targetRowD, colsD.dispCol).setValue(newDisplay);
        return createJsonResponse({ 
          status: 'success', 
          message: 'تم تحديث حالة عرض الحساب بالصف ' + targetRowD + ' بالعمود ' + colsD.dispCol + ' إلى: ' + newDisplay,
          row: targetRowD,
          display: newDisplay
        });
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب لتعديل حالة العرض' });
    }

    // 2.5. تغيير حالة توفر الحساب للبيع (نعم = متاح للبيع / لا = تم بيع الحساب)
    if (action === 'set_pubg_sold' || action === 'toggle_pubg_sold' || action === 'set_pubg_available') {
      var sheetASold = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
      if (!sheetASold) return createJsonResponse({ status: 'error', message: 'ورقة حسابات ببجي غير موجودة' });

      var colsS = getPubgColumnIndices(sheetASold);
      var aRowsSold = sheetASold.getDataRange().getValues();
      var targetRowS = findPubgRowIndex(sheetASold, payload, aRowsSold, colsS);

      var isSold = (payload.isSold === true || payload.sold === true || payload.saleStatus === 'تم البيع' || payload.available === false || payload.isAvailable === false);
      var saleFlagVal = isSold ? 'لا' : 'نعم'; // نعم = متاح للبيع / لا = تم بيع الحساب

      if (targetRowS > 1) {
        sheetASold.getRange(targetRowS, colsS.availCol).setValue(saleFlagVal);
        return createJsonResponse({ 
          status: 'success', 
          message: 'تم تحديث توفر الحساب بالصف ' + targetRowS + ' بالعمود ' + colsS.availCol + ' إلى: ' + saleFlagVal + ' (' + (isSold ? 'تم البيع' : 'متاح للبيع') + ')',
          row: targetRowS,
          isSold: isSold,
          available: !isSold
        });
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب لتعديل حالة البيع' });
    }

    // 3. حذف حساب ببجي نهائياً من Google Sheets
    if (action === 'delete_pubg_account') {
      var sheetDelA = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
      if (sheetDelA) {
        var colsDel = getPubgColumnIndices(sheetDelA);
        var delRowsA = sheetDelA.getDataRange().getValues();
        var targetDelRow = findPubgRowIndex(sheetDelA, payload, delRowsA, colsDel);
        if (targetDelRow > 1) {
          sheetDelA.deleteRow(targetDelRow);
          return createJsonResponse({ status: 'success', message: 'تم حذف الحساب بنجاح نهائياً من Google Sheets بالصف ' + targetDelRow });
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تنفيذ أمر الحذف' });
    }

    // 3.5. تعديل حساب ببجي
    if (action === 'update_pubg_account') {
      var upAcc = payload.data || payload;
      var sheetAUp = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
      if (!sheetAUp) return createJsonResponse({ status: 'error', message: 'ورقة حسابات ببجي غير موجودة' });

      var colsUp = getPubgColumnIndices(sheetAUp);
      var aDataUp = sheetAUp.getDataRange().getValues();
      var aFoundRow = findPubgRowIndex(sheetAUp, payload, aDataUp, colsUp);

      var videoFinal = upAcc.videoUrl !== undefined ? upAcc.videoUrl : (aFoundRow > 0 ? aDataUp[aFoundRow - 1][14] : '');

      var qAvailVal = 'نعم';
      if (upAcc.isAvailable !== undefined) {
        qAvailVal = (upAcc.isAvailable === true || upAcc.isAvailable === 'نعم') ? 'نعم' : 'لا';
      } else if (upAcc.isSold !== undefined) {
        qAvailVal = (upAcc.isSold === true || upAcc.isSold === 'نعم') ? 'لا' : 'نعم';
      } else if (upAcc.saleStatus !== undefined) {
        qAvailVal = (upAcc.saleStatus === 'تم البيع') ? 'لا' : 'نعم';
      } else if (aFoundRow > 0) {
        qAvailVal = aDataUp[aFoundRow - 1][colsUp.availIdx] || 'نعم';
      }

      var rDispVal = 'نعم';
      if (upAcc.displayOnSite !== undefined) {
        rDispVal = (upAcc.displayOnSite === 'نعم' || upAcc.displayOnSite === true) ? 'نعم' : 'لا';
      } else if (upAcc.approved !== undefined) {
        rDispVal = upAcc.approved ? 'نعم' : 'لا';
      } else if (aFoundRow > 0) {
        rDispVal = aDataUp[aFoundRow - 1][colsUp.dispIdx] || 'لا';
      }

      if (aFoundRow > 1) {
        var existingRow = aDataUp[aFoundRow - 1].slice();
        while (existingRow.length < Math.max(sheetAUp.getLastColumn(), colsUp.dispCol)) {
          existingRow.push('');
        }

        if (upAcc.ownerName !== undefined) existingRow[colsUp.ownerName] = upAcc.ownerName;
        if (upAcc.accountName !== undefined || upAcc.title !== undefined) existingRow[colsUp.accountName] = upAcc.accountName || upAcc.title;
        if (upAcc.accountLevel !== undefined || upAcc.level !== undefined) existingRow[colsUp.level] = upAcc.accountLevel || upAcc.level;
        if (upAcc.mythicsCount !== undefined) existingRow[colsUp.mythics] = upAcc.mythicsCount;
        if (upAcc.apartmentLevel !== undefined || upAcc.powerLevel !== undefined) existingRow[colsUp.powerLevel] = upAcc.apartmentLevel || upAcc.powerLevel;
        if (upAcc.goldCount !== undefined || upAcc.goldenMythicsCount !== undefined) existingRow[colsUp.goldMythics] = upAcc.goldCount || upAcc.goldenMythicsCount;
        if (upAcc.upgradableWeaponsCount !== undefined || upAcc.upgradableWeapons !== undefined) existingRow[colsUp.weapons] = upAcc.upgradableWeaponsCount || upAcc.upgradableWeapons;
        if (upAcc.carsCount !== undefined) existingRow[colsUp.cars] = upAcc.carsCount;
        if (upAcc.hashtagsCount !== undefined) existingRow[colsUp.hashtags] = upAcc.hashtagsCount;
        if (upAcc.linkedServices !== undefined || upAcc.linkedAccounts !== undefined) existingRow[colsUp.linked] = upAcc.linkedServices || upAcc.linkedAccounts;
        if (upAcc.salePrice !== undefined || upAcc.price !== undefined) existingRow[colsUp.price] = upAcc.salePrice || upAcc.price;
        if (upAcc.sellerPhone !== undefined || upAcc.phone !== undefined) existingRow[colsUp.phone] = upAcc.sellerPhone || upAcc.phone;
        if (upAcc.transferPhone !== undefined) existingRow[colsUp.transferPhone] = upAcc.transferPhone;
        if (videoFinal) existingRow[colsUp.video] = videoFinal;
        existingRow[colsUp.availIdx] = qAvailVal;
        existingRow[colsUp.dispIdx] = rDispVal;

        sheetAUp.getRange(aFoundRow, 1, 1, existingRow.length).setValues([existingRow]);
        return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات حساب PUBG بنجاح بالصف ' + aFoundRow });
      } else {
        var newAppendRow = [];
        newAppendRow[0] = upAcc.id || 'acc-' + new Date().getTime();
        newAppendRow[1] = upAcc.ownerName || '';
        newAppendRow[2] = upAcc.accountName || upAcc.title || '';
        newAppendRow[3] = upAcc.accountLevel || upAcc.level || '';
        newAppendRow[4] = upAcc.mythicsCount || '0';
        newAppendRow[5] = upAcc.apartmentLevel || upAcc.powerLevel || '';
        newAppendRow[6] = upAcc.goldCount || upAcc.goldenMythicsCount || '';
        newAppendRow[7] = upAcc.upgradableWeaponsCount || upAcc.upgradableWeapons || '';
        newAppendRow[8] = upAcc.carsCount || '0';
        newAppendRow[9] = upAcc.hashtagsCount || '0';
        newAppendRow[10] = upAcc.linkedServices || upAcc.linkedAccounts || '';
        newAppendRow[11] = upAcc.salePrice || upAcc.price || '0';
        newAppendRow[12] = upAcc.sellerPhone || upAcc.phone || '';
        newAppendRow[13] = upAcc.transferPhone || '';
        newAppendRow[14] = videoFinal;
        newAppendRow[15] = '5';
        if (colsUp.dispCol >= 19) {
          newAppendRow[16] = '5';
          newAppendRow[17] = qAvailVal;
          newAppendRow[18] = rDispVal;
        } else {
          newAppendRow[16] = qAvailVal;
          newAppendRow[17] = rDispVal;
        }

        sheetAUp.appendRow(newAppendRow);
        return createJsonResponse({ status: 'success', message: 'تم حفظ حساب PUBG بنجاح' });
      }
    }

    // 4. إضافة منتج جديد
    if (action === 'add_product') {
      var p = payload.data || payload;
      var pSheet = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
      if (!pSheet) return createJsonResponse({ status: 'error', message: 'ورقة المنتجات غير موجودة' });
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

      var colMap = getProductColumnMap(pSheet);
      var lastCol = Math.max(pSheet.getLastColumn(), 10);
      var newRow = [];
      for (var rk = 0; rk < lastCol; rk++) newRow.push('');

      newRow[colMap.id] = prodId;
      newRow[colMap.name] = p.name || '';
      newRow[colMap.category] = p.category || 'الكل';
      newRow[colMap.price] = Number(p.price) || 0;
      newRow[colMap.oldPrice] = (p.oldPrice !== undefined && p.oldPrice !== '') ? Number(p.oldPrice) : '';
      newRow[colMap.image] = prodImage;
      if (colMap.tag !== -1) newRow[colMap.tag] = p.tag || '';
      newRow[colMap.description] = p.description || '';
      newRow[colMap.inStock] = p.inStock !== false ? 'نعم' : 'لا';
      newRow[colMap.featured] = p.featured ? 'نعم' : 'لا';

      pSheet.appendRow(newRow);

      return createJsonResponse({ status: 'success', message: 'تمت إضافة المنتج بنجاح', id: prodId, image: prodImage });
    }

    // 5. تعديل منتج
    if (action === 'update_product') {
      var upProd = payload.data || payload;
      var upProdId = String(payload.id || upProd.id || '').trim();
      var sheetP = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
      if (!sheetP) return createJsonResponse({ status: 'error', message: 'ورقة المنتجات غير موجودة' });
      var pData = sheetP.getDataRange().getValues();
      var pFound = -1;

      for (var pi = 1; pi < pData.length; pi++) {
        if (String(pData[pi][0]).trim() === upProdId || String(pData[pi][1]).trim() === upProdId) {
          pFound = pi + 1;
          break;
        }
      }

      if (pFound > 0) {
        var colMap = getProductColumnMap(sheetP);
        var existingRow = pData[pFound - 1];
        var rowImage = upProd.image || existingRow[colMap.image] || '';

        if (upProd.imageBase64 && upProd.imageBase64.length > 20) {
          try {
            var newImg = saveFileToGoogleDrive(upProd.imageBase64, 'prod_' + upProdId + '.jpg', 'image/jpeg');
            if (newImg && newImg.previewUrl) rowImage = newImg.previewUrl;
          } catch(e){}
        }

        var newPRow = existingRow.slice();
        while (newPRow.length < Math.max(sheetP.getLastColumn(), 10)) {
          newPRow.push('');
        }

        newPRow[colMap.id] = upProdId;
        if (upProd.name !== undefined) newPRow[colMap.name] = upProd.name;
        if (upProd.category !== undefined) newPRow[colMap.category] = upProd.category;
        if (upProd.price !== undefined) newPRow[colMap.price] = Number(upProd.price);
        if (upProd.oldPrice !== undefined) newPRow[colMap.oldPrice] = upProd.oldPrice ? Number(upProd.oldPrice) : '';
        newPRow[colMap.image] = rowImage;
        if (colMap.tag !== -1 && upProd.tag !== undefined) newPRow[colMap.tag] = upProd.tag;
        if (upProd.description !== undefined) newPRow[colMap.description] = upProd.description;
        if (upProd.inStock !== undefined) newPRow[colMap.inStock] = upProd.inStock ? 'نعم' : 'لا';
        if (upProd.featured !== undefined) newPRow[colMap.featured] = upProd.featured ? 'نعم' : 'لا';

        sheetP.getRange(pFound, 1, 1, newPRow.length).setValues([newPRow]);
        return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات المنتج بنجاح' });
      }
      return createJsonResponse({ status: 'error', message: 'المنتج غير موجود' });
    }

    // 5.5 تغيير توفر المنتج في المخزون (نعم / لا)
    if (action === 'set_product_stock' || action === 'toggle_product_stock') {
      var sProdId = String(payload.id || '').trim();
      var inStockVal = (payload.inStock !== false && payload.inStock !== 'لا' && payload.inStock !== 0) ? 'نعم' : 'لا';
      var sheetStkP = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
      if (sheetStkP) {
        var pDataStk = sheetStkP.getDataRange().getValues();
        var colMapStk = getProductColumnMap(sheetStkP);
        var foundStkRow = -1;
        for (var psi = 1; psi < pDataStk.length; psi++) {
          if (String(pDataStk[psi][colMapStk.id]).trim() === sProdId || (sProdId && String(pDataStk[psi][colMapStk.name]).trim() === sProdId)) {
            foundStkRow = psi + 1;
            break;
          }
        }
        if (foundStkRow > 0) {
          var targetCol = (colMapStk.inStock !== undefined && colMapStk.inStock >= 0) ? (colMapStk.inStock + 1) : 9;
          sheetStkP.getRange(foundStkRow, targetCol).setValue(inStockVal); // الخلية I1 (العمود 9)
          return createJsonResponse({ status: 'success', message: 'تم تحديث توفر المنتج بالمخزون بالخلية I1 إلى: ' + inStockVal });
        }
      }
      return createJsonResponse({ status: 'error', message: 'المنتج غير موجود' });
    }

    // 6. حذف منتج نهائياً من Google Sheets
    if (action === 'delete_product') {
      var delPId = String(payload.id || '').trim();
      var sheetDelP = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
      if (sheetDelP) {
        var pRowsDel = sheetDelP.getDataRange().getValues();
        for (var pdi = 1; pdi < pRowsDel.length; pdi++) {
          var pid = String(pRowsDel[pdi][0] || '').trim();
          var pname = String(pRowsDel[pdi][1] || '').trim();
          if (pid === delPId || (delPId && pname === delPId)) {
            sheetDelP.deleteRow(pdi + 1);
            return createJsonResponse({ status: 'success', message: 'تم حذف المنتج نهائياً من Google Sheets' });
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تنفيذ حذف المنتج' });
    }

    // 7. إضافة باقة شدات UC
    if (action === 'add_uc_package') {
      var uc = payload.data || payload;
      var ucSheet = findSheet(ss, ['باقات الشدات', 'باقة شدات', 'شدات ببجي', 'باقة شدات والمنتجات', 'UC Packages', 'UC']) || ss.getSheetByName('باقات الشدات');
      var ucId = uc.id || 'uc-' + new Date().getTime();
      ucSheet.appendRow([
        ucId,                                            // A1 (1): المعرف
        Number(uc.ucAmount) || 0,                        // B1 (2): كمية الشدات
        Number(uc.bonusUc) || 0,                         // C1 (3): شدات إضافية
        Number(uc.price) || 0,                           // D1 (4): السعر
        uc.discountPrice ? Number(uc.discountPrice) : '',// E1 (5): السعر بعد الخصم
        uc.tag || '',                                    // F1 (6): الشارة
        uc.isPopular ? 'نعم' : 'لا',                     // G1 (7): الأكثر طلباً
        uc.isAvailable !== false ? 'نعم' : 'لا'          // H1 (8): متوفر للشحن؟ (العمود H1)
      ]);
      return createJsonResponse({ status: 'success', message: 'تمت إضافة باقة الشدات بنجاح', id: ucId });
    }

    // 8. تعديل باقة شدات UC
    if (action === 'update_uc_package') {
      var upUcId = String(payload.id || '').trim();
      var upUc = payload.data || payload;
      var sheetUc = findSheet(ss, ['باقات الشدات', 'باقة شدات', 'شدات ببجي', 'باقة شدات والمنتجات', 'UC Packages', 'UC']) || ss.getSheetByName('باقات الشدات');
      var ucRows = sheetUc.getDataRange().getValues();
      for (var uci = 1; uci < ucRows.length; uci++) {
        if (String(ucRows[uci][0]).trim() === upUcId) {
          var updatedUcRow = [
            upUcId,
            upUc.ucAmount !== undefined ? Number(upUc.ucAmount) : ucRows[uci][1],
            upUc.bonusUc !== undefined ? Number(upUc.bonusUc) : ucRows[uci][2],
            upUc.price !== undefined ? Number(upUc.price) : ucRows[uci][3],
            upUc.discountPrice !== undefined ? Number(upUc.discountPrice) : (ucRows[uci][4] || ''),
            upUc.tag !== undefined ? upUc.tag : (ucRows[uci][5] || ''),
            upUc.isPopular !== undefined ? (upUc.isPopular ? 'نعم' : 'لا') : (ucRows[uci][6] || 'لا'),
            upUc.isAvailable !== undefined ? (upUc.isAvailable ? 'نعم' : 'لا') : (ucRows[uci][7] || 'نعم')
          ];
          sheetUc.getRange(uci + 1, 1, 1, updatedUcRow.length).setValues([updatedUcRow]);
          return createJsonResponse({ status: 'success', message: 'تم تحديث باقة الشدات بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'باقة الشدات غير موجودة' });
    }

    // 8.5 تغيير توفر باقة الشدات للشحن (نعم / لا) بالعمود H1 (العمود 8)
    if (action === 'set_uc_package_stock' || action === 'toggle_uc_package_stock') {
      var sUcId = String(payload.id || '').trim();
      var isAvailUcVal = (payload.isAvailable !== false && payload.isAvailable !== 'لا' && payload.isAvailable !== 0 && payload.isAvailable !== 'غير متوفر') ? 'نعم' : 'لا';
      var sheetUcStk = findSheet(ss, ['باقات الشدات', 'باقة شدات', 'شدات ببجي', 'باقة شدات والمنتجات', 'UC Packages', 'UC']) || ss.getSheetByName('باقات الشدات');
      if (sheetUcStk) {
        var ucStkData = sheetUcStk.getDataRange().getValues();
        var foundUcRow = -1;
        for (var usi = 1; usi < ucStkData.length; usi++) {
          if (String(ucStkData[usi][0]).trim() === sUcId || (sUcId && String(ucStkData[usi][1]).trim() === sUcId)) {
            foundUcRow = usi + 1;
            break;
          }
        }
        if (foundUcRow > 0) {
          sheetUcStk.getRange(foundUcRow, 8).setValue(isAvailUcVal); // الخلية H1 (العمود 8)
          return createJsonResponse({ status: 'success', message: 'تم تحديث توفر باقة الشدات بالعمود H1 إلى: ' + isAvailUcVal });
        }
      }
      return createJsonResponse({ status: 'error', message: 'باقة الشدات غير موجودة' });
    }

    // 9. حذف باقة شدات UC نهائياً من Google Sheets
    if (action === 'delete_uc_package') {
      var delUcId = String(payload.id || '').trim();
      var sheetDelUc = findSheet(ss, ['باقات الشدات', 'باقة شدات والمنتجات', 'باقة شدات', 'شدات ببجي', 'UC Packages', 'UC']) || ss.getSheetByName('باقات الشدات');
      if (sheetDelUc) {
        var rowsDelUc = sheetDelUc.getDataRange().getValues();
        for (var duci = 1; duci < rowsDelUc.length; duci++) {
          var rUcId = String(rowsDelUc[duci][0] || '').trim();
          var rUcAmount = String(rowsDelUc[duci][1] || '').trim();
          if (rUcId === delUcId || (delUcId && rUcAmount === delUcId)) {
            sheetDelUc.deleteRow(duci + 1);
            return createJsonResponse({ status: 'success', message: 'تم حذف باقة الشدات نهائياً من Google Sheets' });
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم حذف باقة الشدات' });
    }

    // 10. حفظ صفحات التواصل وإعدادات المتجر
    if (action === 'save_settings' || action === 'save_social_links') {
      var setObj = payload.data || payload;

      // تحديث ورقة "صفحات التواصل"
      var socSheet = findSheet(ss, ['صفحات التواصل', 'روابط التواصل', 'التواصل', 'Social Links', 'Social']) || ss.getSheetByName('صفحات التواصل');
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
      var setSheet = findSheet(ss, ['Store Setting', 'Store Settings', 'إعدادات المتجر', 'اعدادات المتجر', 'Settings']) || ss.getSheetByName('إعدادات المتجر');
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
      var ordSheet = findSheet(ss, ['الطلبات الواردة', 'طلبات الواردة', 'الطلبات', 'طلبات الشراء', 'Orders']) || ss.getSheetByName('الطلبات الواردة');
      if (ordSheet) {
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
      return createJsonResponse({ status: 'error', message: 'ورقة الطلبات غير موجودة' });
    }

    // 12. إضافة أو تعديل أو حذف أسعار التوصيل
    if (action === 'add_delivery_rate') {
      var dRate = payload.data || payload;
      var dSheet = findSheet(ss, ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
      if (dSheet) {
        var dId = dRate.id || 'rate-' + new Date().getTime();
        dSheet.appendRow([
          dId,
          dRate.name || '',
          dRate.zoneName || dRate.zoneId || 'داخل طرابلس',
          dRate.price || '25',
          dRate.priceDisplay || ((dRate.price || '25') + ' د.ل'),
          dRate.estimatedTime || '24 - 48 ساعة',
          dRate.notes || ''
        ]);
        return createJsonResponse({ status: 'success', message: 'تمت إضافة تسعيرة التوصيل للمدينة بنجاح', id: dId });
      }
    }

    if (action === 'update_delivery_rate') {
      var upRate = payload.data || payload;
      var upRateId = String(payload.id || upRate.id || '').trim();
      var dSheetUp = findSheet(ss, ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
      if (dSheetUp) {
        var dRows = dSheetUp.getDataRange().getValues();
        for (var dri = 1; dri < dRows.length; dri++) {
          var rId = String(dRows[dri][0] || '').trim();
          var rName = String(dRows[dri][1] || '').trim();
          if (rId === upRateId || (upRateId && rName === upRateId)) {
            var updatedRow = [
              upRateId || rId,
              upRate.name !== undefined ? upRate.name : dRows[dri][1],
              upRate.zoneName !== undefined ? upRate.zoneName : dRows[dri][2],
              upRate.price !== undefined ? upRate.price : dRows[dri][3],
              upRate.priceDisplay !== undefined ? upRate.priceDisplay : dRows[dri][4],
              upRate.estimatedTime !== undefined ? upRate.estimatedTime : dRows[dri][5],
              upRate.notes !== undefined ? upRate.notes : dRows[dri][6]
            ];
            dSheetUp.getRange(dri + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
            return createJsonResponse({ status: 'success', message: 'تم تحديث سعر وبيانات التوصيل بنجاح' });
          }
        }
      }
      return createJsonResponse({ status: 'error', message: 'المدينة أو التسعيرة غير موجودة' });
    }

    if (action === 'delete_delivery_rate') {
      var delRateId = String(payload.id || '').trim();
      var dSheetDel = findSheet(ss, ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
      if (dSheetDel) {
        var dRowsDel = dSheetDel.getDataRange().getValues();
        for (var drd = 1; drd < dRowsDel.length; drd++) {
          var rowRateId = String(dRowsDel[drd][0] || '').trim();
          var rowRateName = String(dRowsDel[drd][1] || '').trim();
          if (rowRateId === delRateId || (delRateId && rowRateName === delRateId)) {
            dSheetDel.deleteRow(drd + 1);
            return createJsonResponse({ status: 'success', message: 'تم حذف تسعيرة المدينة نهائياً من Google Sheets' });
          }
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تنفيذ الحذف بنجاح' });
    }

    if (action === 'save_delivery_rates' || action === 'sync_delivery_rates') {
      var ratesList = payload.data || payload.rates || [];
      var dSheetSave = findSheet(ss, ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
      if (dSheetSave && Array.isArray(ratesList) && ratesList.length > 0) {
        dSheetSave.clearContents();
        var dHeader = ['المعرف (ID)', 'اسم المدينة / المنطقة', 'المنطقة الجغرافية (Zone)', 'سعر التوصيل (د.ل)', 'العرض النصي للسعر', 'الوقت المتوقع للتسليم', 'ملاحظات'];
        var dRowsToInsert = ratesList.map(function(item) {
          return [
            item.id || ('rate-' + new Date().getTime()),
            item.name || '',
            item.zoneName || item.zoneId || '',
            item.price || '',
            item.priceDisplay || (item.price ? (item.price + ' د.ل') : ''),
            item.estimatedTime || '24 - 48 ساعة',
            item.notes || ''
          ];
        });
        dSheetSave.getRange(1, 1, dRowsToInsert.length + 1, dHeader.length).setValues([dHeader].concat(dRowsToInsert));
        dSheetSave.getRange(1, 1, 1, dHeader.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
        return createJsonResponse({ status: 'success', message: 'تم حفظ ومزامنة كافة أسعار التوصيل في Google Sheets بنجاح!' });
      }
    }

    // 13. حفظ وتعديل بيانات تسجيل دخول الأدمن في Google Sheets
    if (action === 'save_admin_credentials' || action === 'update_admin_credentials') {
      var admUser = String(payload.username || (payload.data && payload.data.username) || '').trim();
      var admPass = String(payload.password || (payload.data && payload.data.password) || '').trim();

      if (!admUser || !admPass) {
        return createJsonResponse({ status: 'error', message: 'اسم المستخدم وكلمة المرور مطلوبان' });
      }

      var setSheetA = findSheet(ss, ['Store Setting', 'Store Settings', 'إعدادات المتجر', 'اعدادات المتجر', 'Settings']) || ss.getSheetByName('إعدادات المتجر');
      if (!setSheetA) {
        setSheetA = ss.insertSheet('إعدادات المتجر');
        setSheetA.appendRow(['اسم الإعداد', 'القيمة']);
      }

      var sData = setSheetA.getDataRange().getValues();
      var userRow = -1;
      var passRow = -1;

      for (var si = 1; si < sData.length; si++) {
        var k = String(sData[si][0] || '').trim();
        if (k === 'adminUsername') userRow = si + 1;
        if (k === 'adminPassword') passRow = si + 1;
      }

      if (userRow > 0) {
        setSheetA.getRange(userRow, 2).setValue(admUser);
      } else {
        setSheetA.appendRow(['adminUsername', admUser]);
      }

      if (passRow > 0) {
        setSheetA.getRange(passRow, 2).setValue(admPass);
      } else {
        setSheetA.appendRow(['adminPassword', admPass]);
      }

      return createJsonResponse({ 
        status: 'success', 
        message: 'تم حفظ وتحديث بيانات دخول الأدمن في Google Sheets بنجاح!',
        username: admUser
      });
    }

    // 14. حفظ وتعديل تصنيفات وأقسام المنتجات في Google Sheets
    if (action === 'save_categories' || action === 'sync_categories') {
      var catList = payload.categories || payload.data || [];
      if (typeof catList === 'string') {
        try { catList = JSON.parse(catList); } catch(e) { catList = catList.split(',').map(function(s){return s.trim();}); }
      }

      var catSheet = findSheet(ss, ['تصنيفات المنتجات', 'التصنيفات', 'أقسام المنتجات', 'Categories', 'تصنيفات']) || ss.getSheetByName('تصنيفات المنتجات');
      if (!catSheet) {
        catSheet = ss.insertSheet('تصنيفات المنتجات');
      }

      catSheet.clearContents();
      var catHeader = ['المعرف (ID)', 'اسم التصنيف / القسم'];
      var catRowsToInsert = [];

      for (var ci = 0; ci < catList.length; ci++) {
        var cName = String(catList[ci] || '').trim();
        if (cName) {
          catRowsToInsert.push(['cat-' + (ci + 1), cName]);
        }
      }

      if (catRowsToInsert.length > 0) {
        catSheet.getRange(1, 1, catRowsToInsert.length + 1, catHeader.length).setValues([catHeader].concat(catRowsToInsert));
        catSheet.getRange(1, 1, 1, catHeader.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      }

      // وأيضاً حفظها في ورقة إعدادات المتجر كنسخة احتياطية
      var setSheetC = findSheet(ss, ['Store Setting', 'Store Settings', 'إعدادات المتجر', 'اعدادات المتجر', 'Settings']);
      if (setSheetC) {
        var scData = setSheetC.getDataRange().getValues();
        var cRow = -1;
        for (var sci = 1; sci < scData.length; sci++) {
          if (String(scData[sci][0] || '').trim() === 'categories') {
            cRow = sci + 1;
            break;
          }
        }
        var cJson = JSON.stringify(catList);
        if (cRow > 0) setSheetC.getRange(cRow, 2).setValue(cJson);
        else setSheetC.appendRow(['categories', cJson]);
      }

      return createJsonResponse({ 
        status: 'success', 
        message: 'تم حفظ وتحديث تصنيفات المنتجات في Google Sheets بنجاح!',
        categories: catList
      });
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

// دالة تحديد وتعيين أعمدة ورقة المنتجات بذكاء وديناميكية لتفادي أي إزاحة في الأعمدة
function getProductColumnMap(pSheet) {
  var map = {
    id: 0,
    name: 1,
    category: 2,
    price: 3,
    oldPrice: 4,
    image: 5,
    tag: 6,
    description: 7,
    inStock: 8,
    featured: 9
  };

  if (!pSheet) return map;
  var lastCol = pSheet.getLastColumn();
  if (lastCol < 1) return map;
  
  var headers = pSheet.getRange(1, 1, 1, lastCol).getValues()[0];
  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').trim().toLowerCase();
    if (!h) continue;
    if (h.indexOf('معرف') > -1 || h.indexOf('id') > -1) map.id = c;
    else if (h.indexOf('اسم') > -1 || h.indexOf('name') > -1) map.name = c;
    else if (h.indexOf('تصنيف') > -1 || h.indexOf('فئة') > -1 || h.indexOf('category') > -1) map.category = c;
    else if (h.indexOf('قديم') > -1 || h.indexOf('old') > -1 || h.indexOf('مخفض') > -1) map.oldPrice = c;
    else if (h.indexOf('سعر') > -1 || h.indexOf('price') > -1) map.price = c;
    else if (h.indexOf('صورة') > -1 || h.indexOf('image') > -1) map.image = c;
    else if (h.indexOf('شارة') > -1 || h.indexOf('tag') > -1) map.tag = c;
    else if (h.indexOf('وصف') > -1 || h.indexOf('desc') > -1) map.description = c;
    else if (h.indexOf('متوفر') > -1 || h.indexOf('مخزن') > -1 || h.indexOf('stock') > -1) map.inStock = c;
    else if (h.indexOf('مميز') > -1 || h.indexOf('featured') > -1) map.featured = c;
  }
  return map;
}

// دالة تحديد وتعيين أعمدة ورقة حسابات ببجي بدقة فائقة
function getPubgColumnIndices(sheetA) {
  var cols = {
    id: 0,
    ownerName: 1,
    accountName: 2,
    level: 3,
    mythics: 4,
    powerLevel: 5,
    goldMythics: 6,
    weapons: 7,
    cars: 8,
    hashtags: 9,
    linked: 10,
    price: 11,
    phone: 12,
    transferPhone: 13,
    video: 14,
    availCol: 17, // 1-based default Q
    dispCol: 18,  // 1-based default R
    availIdx: 16, // 0-based default Q
    dispIdx: 17   // 0-based default R
  };

  if (!sheetA) return cols;

  var lastCol = sheetA.getLastColumn();
  if (lastCol >= 1) {
    var headers = sheetA.getRange(1, 1, 1, lastCol).getValues()[0];
    var foundAvail = -1;
    var foundDisp = -1;

    for (var c = 0; c < headers.length; c++) {
      var h = String(headers[c] || '').trim().toLowerCase();
      if (!h) continue;

      if (h.indexOf('طابع') > -1 || h.indexOf('معرف') > -1 || h.indexOf('timestamp') > -1 || h.indexOf('id') > -1) cols.id = c;
      else if (h.indexOf('اسم الثلاثي') > -1 || h.indexOf('الاسم') > -1 || h.indexOf('المالك') > -1) cols.ownerName = c;
      else if (h.indexOf('اسم الحساب') > -1) cols.accountName = c;
      else if (h.indexOf('مستوى الحساب') > -1 || h.indexOf('لفل') > -1) cols.level = c;
      else if (h.indexOf('عدد الميثيك') > -1 || h.indexOf('المثكات') > -1 || h.indexOf('mythic') > -1) {
        if (h.indexOf('ذهب') > -1) cols.goldMythics = c;
        else cols.mythics = c;
      }
      else if (h.indexOf('مستوى السكنات') > -1 || h.indexOf('الشقة') > -1 || h.indexOf('الروم') > -1) cols.powerLevel = c;
      else if (h.indexOf('ذهب') > -1 || h.indexOf('gold') > -1) cols.goldMythics = c;
      else if (h.indexOf('أسلحة') > -1 || h.indexOf('اسلحة') > -1 || h.indexOf('weapons') > -1) cols.weapons = c;
      else if (h.indexOf('سيارات') > -1 || h.indexOf('cars') > -1) cols.cars = c;
      else if (h.indexOf('هاشتاج') > -1 || h.indexOf('هاش') > -1) cols.hashtags = c;
      else if (h.indexOf('ربط') > -1 || h.indexOf('خدمات') > -1) cols.linked = c;
      else if (h.indexOf('سعر') > -1 || h.indexOf('price') > -1) cols.price = c;
      else if (h.indexOf('هاتف') > -1 || h.indexOf('phone') > -1) {
        if (h.indexOf('محول') > -1 || h.indexOf('تحويل') > -1) cols.transferPhone = c;
        else cols.phone = c;
      }
      else if (h.indexOf('فيديو') > -1 || h.indexOf('video') > -1) cols.video = c;

      // كشف عمود العرض في الموقع (R1 أو العمود 18 / 19)
      if (h.indexOf('عرض') > -1 || h.indexOf('موقع') > -1 || h.indexOf('display') > -1 || h.indexOf('الموقع') > -1) {
        foundDisp = c;
      }
      // كشف عمود التوفر والبيع (Q1 أو العمود 17 / 18)
      else if (h.indexOf('متاح') > -1 || h.indexOf('بيع') > -1 || h.indexOf('متوفر') > -1 || h.indexOf('avail') > -1 || h.indexOf('sold') > -1) {
        foundAvail = c;
      }
    }

    if (foundAvail > -1) {
      cols.availIdx = foundAvail;
      cols.availCol = foundAvail + 1;
    } else if (lastCol >= 19) {
      cols.availCol = 18;
      cols.availIdx = 17;
    } else {
      cols.availCol = 17;
      cols.availIdx = 16;
    }

    if (foundDisp > -1) {
      cols.dispIdx = foundDisp;
      cols.dispCol = foundDisp + 1;
    } else if (lastCol >= 19) {
      cols.dispCol = 19;
      cols.dispIdx = 18;
    } else {
      cols.dispCol = 18;
      cols.dispIdx = 17;
    }
  }

  return cols;
}

// دالة البحث الذكي عن رقم صف حساب ببجي في ورقة جوجل شيت
function findPubgRowIndex(sheetA, payload, aRows, cols) {
  var accId = String(payload.id || payload.submissionId || '').trim().toLowerCase();
  var rowIdx = Number(payload.rowIndex || payload.rowNumber || 0);

  // 1. إذا كان رقم الصف مُرسلاً وصالحاً
  if (rowIdx > 1 && rowIdx <= aRows.length) {
    return rowIdx;
  }

  // 2. مطابقة بالمعرف أو الاسم أو التوقيت أو رقم الهاتف
  if (accId) {
    var m = accId.match(/row-(\d+)/i);
    if (m && m[1]) {
      var extractedRow = parseInt(m[1], 10);
      if (extractedRow > 1 && extractedRow <= aRows.length) {
        return extractedRow;
      }
    }

    for (var i = 1; i < aRows.length; i++) {
      var rId = String(aRows[i][cols.id] || '').trim().toLowerCase();
      var rName = String(aRows[i][cols.accountName] || '').trim().toLowerCase();
      var rOwner = String(aRows[i][cols.ownerName] || '').trim().toLowerCase();
      var rPhone = String(aRows[i][cols.phone] || '').trim().toLowerCase();

      if (rId === accId || (accId && (rName === accId || rOwner === accId || rPhone === accId))) {
        return i + 1;
      }
    }
  }

  var accData = payload.data || payload;
  var targetName = String(accData.accountName || accData.title || '').trim().toLowerCase();
  var targetPhone = String(accData.sellerPhone || accData.phone || '').trim().toLowerCase();

  if (targetName || targetPhone) {
    for (var j = 1; j < aRows.length; j++) {
      var rName2 = String(aRows[j][cols.accountName] || '').trim().toLowerCase();
      var rPhone2 = String(aRows[j][cols.phone] || '').trim().toLowerCase();
      if ((targetName && rName2 === targetName) || (targetPhone && rPhone2 === targetPhone)) {
        return j + 1;
      }
    }
  }

  return -1;
}

// دالة جلب كافة بيانات المتجر وصفحات التواصل من Google Sheets
function getAllStoreData(ss) {
  // 1. المنتجات
  var prodSheet = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
  var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
  var products = [];

  if (prodData.length > 1) {
    var colMap = getProductColumnMap(prodSheet);
    for (var i = 1; i < prodData.length; i++) {
      var r = prodData[i];
      var pid = r[colMap.id];
      var pname = r[colMap.name];
      if (pid && pname) {
        var inStockVal = String(r[colMap.inStock] !== undefined ? r[colMap.inStock] : 'نعم').trim();
        var featuredVal = String(r[colMap.featured] !== undefined ? r[colMap.featured] : 'لا').trim();

        products.push({
          id: String(pid),
          name: String(pname),
          category: String(r[colMap.category] || 'الكل'),
          price: Number(r[colMap.price]) || 0,
          oldPrice: r[colMap.oldPrice] ? Number(r[colMap.oldPrice]) : undefined,
          image: String(r[colMap.image] || ''),
          description: String(r[colMap.description] || ''),
          inStock: inStockVal === 'لا' ? false : true,
          featured: featuredVal === 'نعم' ? true : false,
          tag: colMap.tag !== -1 && r[colMap.tag] ? String(r[colMap.tag]) : undefined
        });
      }
    }
  }

  // 2. حسابات ببجي
  var accSheet = findSheet(ss, ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg']) || ss.getSheetByName('حسابات ببجي');
  var accData = accSheet ? accSheet.getDataRange().getValues() : [];
  var pubgAccounts = [];
  var allPubgAccounts = [];

  if (accData.length > 1) {
    var pCols = getPubgColumnIndices(accSheet);
    for (var j = 1; j < accData.length; j++) {
      var a = accData[j];
      if (a[0] || a[1] || a[2]) {
        // قراءة حالة التوفر والبيع بدقة ديناميكية (نعم = متاح للبيع / لا = تم بيع الحساب)
        var availVal = String(a[pCols.availIdx] !== undefined ? a[pCols.availIdx] : 'نعم').trim();
        var isSold = (availVal === 'لا' || availVal === 'تم البيع' || availVal === 'مباع' || availVal.toLowerCase() === 'sold' || availVal.toLowerCase() === 'no');
        var isAvailable = !isSold;
        var saleStatus = isSold ? 'تم البيع' : 'متوفر';

        // قراءة حالة العرض في الموقع بدقة ديناميكية (نعم = معروض / لا = مخفي)
        var displayFlag = String(a[pCols.dispIdx] !== undefined ? a[pCols.dispIdx] : 'لا').trim();
        var isApproved = (displayFlag === 'نعم' || displayFlag.toLowerCase() === 'yes' || displayFlag === 'true');
        
        // البحث بمرونة فائقة عن رابط الفيديو في أي عمود
        var foundVideo = String(a[14] || '').trim();
        if (!foundVideo || (foundVideo.indexOf('http') === -1 && foundVideo.indexOf('drive') === -1)) {
          for (var colIdx = 0; colIdx < a.length; colIdx++) {
            var cellVal = String(a[colIdx] || '').trim();
            if (cellVal.indexOf('http') > -1 && (cellVal.indexOf('drive.google.com') > -1 || cellVal.indexOf('youtu') > -1 || cellVal.indexOf('.mp4') > -1 || cellVal.indexOf('video') > -1)) {
              foundVideo = cellVal;
              break;
            }
          }
        }

        var accItem = {
          id: String(a[0] || ('acc-row-' + (j + 1))),
          rowIndex: j + 1,
          rowNumber: j + 1,
          ownerName: String(a[pCols.ownerName] || a[1] || ''),
          fullName: String(a[pCols.ownerName] || a[1] || ''),
          accountName: String(a[pCols.accountName] || a[2] || ''),
          title: String(a[pCols.accountName] || a[2] || ('حساب PUBG لفل ' + (a[pCols.level] || a[3]))),
          badge: isSold ? 'تم البيع' : 'حساب موثق',
          level: a[pCols.level] ? ('LVL ' + String(a[pCols.level]).replace(/LVL/i, '').trim()) : 'LVL --',
          accountLevel: String(a[pCols.level] || a[3] || ''),
          mythicsCount: String(a[pCols.mythics] || a[4] || '0'),
          apartmentLevel: String(a[pCols.powerLevel] || a[5] || ''),
          powerLevel: String(a[pCols.powerLevel] || a[5] || ''),
          goldCount: String(a[pCols.goldMythics] || a[6] || '0'),
          goldenMythicsCount: String(a[pCols.goldMythics] || a[6] || '0'),
          upgradableWeaponsCount: String(a[pCols.weapons] || a[7] || ''),
          upgradableWeapons: String(a[pCols.weapons] || a[7] || ''),
          carsCount: String(a[pCols.cars] || a[8] || '0'),
          hashtagsCount: String(a[pCols.hashtags] || a[9] || '0'),
          linkedServices: String(a[pCols.linked] || a[10] || ''),
          linkedAccounts: String(a[pCols.linked] || a[10] || ''),
          price: Number(a[pCols.price] || a[11]) || 0,
          salePrice: String(a[pCols.price] || a[11] || '0'),
          sellerPhone: String(a[pCols.phone] || a[12] || ''),
          sellerName: String(a[pCols.ownerName] || a[1] || ''),
          phone: String(a[pCols.phone] || a[12] || ''),
          transferPhone: String(a[pCols.transferPhone] || a[13] || ''),
          storeReceivePhone: '0943981577',
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          videoUrl: foundVideo,
          siteRating: String(a[15] || a[16] || '5'),
          displayOnSite: isApproved ? 'نعم' : 'لا',
          approved: isApproved,
          isAvailable: isAvailable,
          isSold: isSold,
          sold: isSold,
          saleStatus: saleStatus,
          status: isApproved ? 'approved' : 'pending',
          features: [
            ((a[pCols.mythics] || a[4]) ? (a[pCols.mythics] || a[4]) + ' ميثيك' : 'حساب مميز'),
            ((a[pCols.weapons] || a[7]) ? String(a[pCols.weapons] || a[7]) : 'أسلحة مطورة'),
            (isSold ? 'تم بيع هذا الحساب' : 'تسليم آمن ومضمون')
          ]
        };

        allPubgAccounts.push(accItem);

        if (isApproved) {
          pubgAccounts.push(accItem);
        }
      }
    }
  }

  // 3. باقات الشدات
  var ucSheet = findSheet(ss, ['باقات الشدات', 'باقة شدات', 'شدات ببجي', 'باقة شدات والمنتجات', 'UC Packages', 'UC']) || ss.getSheetByName('باقات الشدات');
  var ucData = ucSheet ? ucSheet.getDataRange().getValues() : [];
  var ucPackages = [];
  for (var u = 1; u < ucData.length; u++) {
    var uc = ucData[u];
    if (uc[0] && uc[1]) {
      var isPopularVal = String(uc[6] || '').trim();
      // العمود رقم 8 (الخلية H1) لتوفر الباقة للشحن (نعم / لا)
      var isAvailVal = String(uc[7] !== undefined ? uc[7] : 'نعم').trim();
      var isUcAvailable = !(isAvailVal === 'لا' || isAvailVal === 'كلا' || isAvailVal === 'غير متوفر' || isAvailVal === 'false' || isAvailVal === 'no');

      ucPackages.push({
        id: String(uc[0]),
        ucAmount: Number(uc[1]) || 0,
        bonusUc: Number(uc[2]) || 0,
        price: Number(uc[3]) || 0,
        discountPrice: uc[4] ? Number(uc[4]) : undefined,
        tag: uc[5] ? String(uc[5]) : undefined,
        isPopular: isPopularVal === 'نعم' ? true : false,
        isAvailable: isUcAvailable
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
  var socSheet = findSheet(ss, ['صفحات التواصل', 'روابط التواصل', 'التواصل', 'Social Links', 'Social']) || ss.getSheetByName('صفحات التواصل');
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
  var setSheet = findSheet(ss, ['Store Setting', 'Store Settings', 'إعدادات المتجر', 'اعدادات المتجر', 'Settings']) || ss.getSheetByName('إعدادات المتجر');
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

  // 5. أسعار التوصيل
  var rateSheet = findSheet(ss, ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
  var deliveryRates = [];
  if (rateSheet) {
    var rateData = rateSheet.getDataRange().getValues();
    for (var rd = 1; rd < rateData.length; rd++) {
      var rowD = rateData[rd];
      if (rowD[0] && rowD[1]) {
        deliveryRates.push({
          id: String(rowD[0]),
          name: String(rowD[1]),
          zoneName: String(rowD[2] || ''),
          zoneId: String(rowD[2] || ''),
          price: rowD[3] ? (isNaN(Number(rowD[3])) ? String(rowD[3]) : Number(rowD[3])) : '25',
          priceDisplay: String(rowD[4] || (rowD[3] ? (rowD[3] + ' د.ل') : '25 د.ل')),
          estimatedTime: String(rowD[5] || '24 - 48 ساعة'),
          notes: String(rowD[6] || '')
        });
      }
    }
  }

  // 6. تصنيفات المنتجات (Categories)
  var defaultCategories = ['الكل', 'كاميرات مراقبة', 'سماعات', 'مبردات', 'كروت شاشة', 'ميكروفونات', 'كيبورد', 'ماوس', 'إكسسوارات'];
  var categories = defaultCategories.slice();
  var catSheetRead = findSheet(ss, ['تصنيفات المنتجات', 'التصنيفات', 'أقسام المنتجات', 'Categories', 'تصنيفات']);
  if (catSheetRead) {
    var cRowsRead = catSheetRead.getDataRange().getValues();
    if (cRowsRead.length > 1) {
      var sheetCats = [];
      for (var cri = 1; cri < cRowsRead.length; cri++) {
        var cn = String(cRowsRead[cri][1] || cRowsRead[cri][0] || '').trim();
        if (cn && sheetCats.indexOf(cn) === -1) {
          sheetCats.push(cn);
        }
      }
      if (sheetCats.length > 0) {
        if (sheetCats.indexOf('الكل') === -1) sheetCats.unshift('الكل');
        categories = sheetCats;
      }
    }
  } else if (settings.categories) {
    try {
      var parsedCats = JSON.parse(settings.categories);
      if (Array.isArray(parsedCats) && parsedCats.length > 0) {
        categories = parsedCats;
      }
    } catch(e) {}
  }

  // 7. بيانات دخول الأدمن (Admin Credentials)
  var adminUsername = 'admin';
  var adminPassword = 'rtg2026';
  if (settings.adminUsername) adminUsername = String(settings.adminUsername).trim();
  if (settings.adminPassword) adminPassword = String(settings.adminPassword).trim();

  return {
    products: products,
    pubgAccounts: pubgAccounts,
    allPubgAccounts: allPubgAccounts,
    ucPackages: ucPackages,
    settings: settings,
    deliveryRates: deliveryRates,
    categories: categories,
    adminCredentials: { username: adminUsername, password: adminPassword }
  };
}

// دالة مساعدة شاملة للبحث الذكي والمرن عن الأوراق بجدول Google Sheets وتفادي أي اختلاف في التسمية
function findSheet(ss, candidates) {
  if (!ss || !candidates) return null;
  if (typeof candidates === 'string') candidates = [candidates];
  // 1. بحث مباشر بالأسماء
  for (var i = 0; i < candidates.length; i++) {
    var sh = ss.getSheetByName(candidates[i]);
    if (sh) return sh;
  }
  // 2. بحث مرن يتجاهل الهمزات والمسافات والحروف الكبيرة/الصغيرة والتاء المربوطة
  var all = ss.getSheets();
  var normalize = function(str) {
    return String(str || '')
      .trim()
      .toLowerCase()
      .replace(/[\s_\-]/g, '')
      .replace(/[أإآ]/g, 'ا')
      .replace(/ة/g, 'ه')
      .replace(/ى/g, 'ي');
  };

  for (var c = 0; c < candidates.length; c++) {
    var target = normalize(candidates[c]);
    for (var s = 0; s < all.length; s++) {
      var sheetName = all[s].getName();
      var cleanS = normalize(sheetName);
      if (cleanS === target || cleanS.indexOf(target) > -1 || target.indexOf(cleanS) > -1) {
        return all[s];
      }
    }
  }
  return null;
}

// دالة تجهيز وإعداد الجداول إذا لم تكن موجودة
function setupSheetsIfMissing(ss) {
  var requiredSheets = [
    {
      name: 'المنتجات',
      aliases: ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products'],
      headers: ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)']
    },
    {
      name: 'حسابات ببجي',
      aliases: ['حسابات ببجي', 'حسابات ببجى', 'حسابات PUBG', 'PUBG', 'pubg'],
      headers: [
        'الطابع الزمني / المعرف (ID)', 
        'الاسم الثلاثي', 
        'اسم الحساب', 
        'مستوى الحساب', 
        'عدد الميثيك', 
        'مستوى السكنات (الشقة/الروم)', 
        'عدد الميثيك الذهبي', 
        'عدد الأسلحة المطورة', 
        'عدد السيارات', 
        'عدد الهاشتاجات', 
        'الربط / خدمات الربط', 
        'السعر (د.ل)', 
        'رقم الهاتف', 
        'رقم الهاتف المحول منه 5 دينار', 
        'فيديو للحساب', 
        'تقييم للموقع', 
        'متاح للبيع؟ (نعم/لا)',
        'هل يتم عرض هذا الحساب على الموقع؟ (نعم/لا)'
      ]
    },
    {
      name: 'باقات الشدات',
      aliases: ['باقات الشدات', 'باقة شدات والمنتجات', 'باقة شدات', 'شدات ببجي', 'UC Packages', 'UC'],
      headers: ['المعرف (ID)', 'كمية الشدات (UC)', 'شدات إضافية مجانية (Bonus)', 'السعر الأساسي (د.ل)', 'السعر بعد الخصم/الحسم (د.ل)', 'الشارة (Tag)', 'الأكثر طلباً؟ (نعم/لا)', 'متوفر للشحن؟ (نعم/لا)']
    },
    {
      name: 'أسعار التوصيل',
      aliases: ['أسعار التوصيل', 'اسعار التوصيل', 'التوصيل', 'Delivery', 'Delivery Rates'],
      headers: ['المعرف (ID)', 'اسم المدينة / المنطقة', 'المنطقة الجغرافية (Zone)', 'سعر التوصيل (د.ل)', 'العرض النصي للسعر', 'الوقت المتوقع للتسليم', 'ملاحظات'],
      defaultRows: [
        ['tripoli_central', 'داخل طرابلس (وسط البلد والأحياء الرئيسية)', 'داخل طرابلس', '15 - 20', '15 - 20 د.ل', '24 ساعة', 'سوق الجمعة، عين زارة، تاجوراء، جنزور، حي الأندلس'],
        ['karimiya', 'الكريمية / أنجيلة', 'ضواحي طرابلس', '20', '20 د.ل', '24 - 48 ساعة', 'ضواحي طرابلس القريبة'],
        ['swani', 'السواني / قصر بن غشير', 'ضواحي طرابلس', '25', '25 د.ل', '24 - 48 ساعة', 'النواحي الأربعة'],
        ['qarabolli', 'القره بوللي / الخمس / زليتن', 'شرق طرابلس', '25', '25 د.ل', '24 - 48 ساعة', 'الساحل الشرقي'],
        ['maya', 'الماية', 'غرب طرابلس', '25', '25 د.ل', '24 - 48 ساعة', 'غرب طرابلس'],
        ['zawiya', 'الزاوية', 'غرب طرابلس', '25', '25 د.ل', '24 - 48 ساعة', 'غرب طرابلس'],
        ['zwara', 'زوارة', 'غرب طرابلس', '25', '25 د.ل', '24 - 48 ساعة', 'غرب طرابلس'],
        ['matrad', 'المطرد', 'غرب طرابلس', '20', '20 د.ل', '24 - 48 ساعة', 'غرب طرابلس'],
        ['surman', 'صرمان / صبراتة / العجيلات', 'غرب طرابلس', '30', '30 د.ل', '24 - 48 ساعة', 'الساحل الغربي'],
        ['gharyan', 'غريان', 'الجبل الغربي (نفوسة)', '25', '25 د.ل', '24 - 48 ساعة', 'الجبل الغربي'],
        ['yafran', 'يفرن / ككلة / الزنتان / جادو', 'الجبل الغربي (نفوسة)', '35 - 40', '35 - 40 د.ل', '48 ساعة', 'مدن الجبل'],
        ['misrata', 'مصراتة', 'المنطقة الوسطى', '25', '25 د.ل', '24 - 48 ساعة', 'المنطقة الوسطى'],
        ['sirt', 'سرت / أجدابيا', 'المنطقة الوسطى', '30', '30 د.ل', '48 ساعة', 'المنطقة الوسطى'],
        ['benghazi', 'بنغازي', 'المنطقة الشرقية (برقة)', '30', '30 د.ل', '48 ساعة', 'كبرى مدن الشرق'],
        ['bayda', 'البيضاء / المرج / شحات / درنة', 'المنطقة الشرقية (برقة)', '35 - 40', '35 - 40 د.ل', '48 - 72 ساعة', 'الجبل الأخضر'],
        ['tobruk', 'طبرق', 'المنطقة الشرقية (برقة)', '40', '40 د.ل', '48 - 72 ساعة', 'أقصى الشرق'],
        ['sabha', 'سبها', 'المنطقة الجنوبية (فزان)', '35', '35 د.ل', '48 - 72 ساعة', 'عاصمة الجنوب'],
        ['ubari', 'أوباري / مرزق / غات', 'المنطقة الجنوبية (فزان)', '45 - 50', '45 - 50 د.ل', '72 - 96 ساعة', 'الجنوب الغربي'],
        ['kufra', 'جالو / أوجلة / الكفرة', 'الجنوب الشرقي (الواحات والكفرة)', '50', '50 د.ل', '72 - 96 ساعة', 'حوض الواحات']
      ]
    },
    {
      name: 'صفحات التواصل',
      aliases: ['صفحات التواصل', 'روابط التواصل', 'التواصل', 'Social Links', 'Social'],
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
      aliases: ['Store Setting', 'Store Settings', 'إعدادات المتجر', 'اعدادات المتجر', 'Settings'],
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
        ['aboutText', 'متجرك الأول في ليبيا لمعدات الألعاب وشحن الشدات وشراء حسابات ببجي الموثقة.'],
        ['adminUsername', 'admin'],
        ['adminPassword', 'rtg2026']
      ]
    },
    {
      name: 'تصنيفات المنتجات',
      aliases: ['تصنيفات المنتجات', 'التصنيفات', 'أقسام المنتجات', 'Categories', 'تصنيفات'],
      headers: ['المعرف (ID)', 'اسم التصنيف / القسم'],
      defaultRows: [
        ['cat-1', 'الكل'],
        ['cat-2', 'كاميرات مراقبة'],
        ['cat-3', 'سماعات'],
        ['cat-4', 'مبردات'],
        ['cat-5', 'كروت شاشة'],
        ['cat-6', 'ميكروفونات'],
        ['cat-7', 'كيبورد'],
        ['cat-8', 'ماوس'],
        ['cat-9', 'إكسسوارات']
      ]
    },
    {
      name: 'الطلبات الواردة',
      aliases: ['طلبات الواردة', 'الطلبات الواردة', 'الطلبات', 'طلبات الشراء', 'Orders'],
      headers: ['رقم الطلب', 'التاريخ والوقت', 'نوع الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'المنطقة', 'طريقة الدفع', 'الإجمالي (د.ل)', 'الحالة', 'تفاصيل العناصر']
    }
  ];

  requiredSheets.forEach(function(sInfo) {
    var sheet = findSheet(ss, sInfo.aliases || [sInfo.name]);
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

export const DEFAULT_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLT7CH_DtGvX63okgIsf-PqWLTgxJk9y2lwtxiv3WWhfT0PQwLB9n-647sg0d5SKSeOA/exec';
export const DEFAULT_DEV_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyLT7CH_DtGvX63okgIsf-PqWLTgxJk9y2lwtxiv3WWhfT0PQwLB9n-647sg0d5SKSeOA/exec';

export class AppsScriptService {
  public static getConfig(): AppsScriptConfig {
    try {
      const saved = localStorage.getItem(APPS_SCRIPT_CONFIG_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.webAppUrl && parsed.webAppUrl.trim()) {
          // If stored URL was the old default, upgrade to current default
          if (parsed.webAppUrl.includes('AKfycbwxO0mCyl7uJx1EhxtWUBfR86pSRGKL')) {
            parsed.webAppUrl = DEFAULT_APPS_SCRIPT_URL;
            localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(parsed));
          }
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

    // 1. Try server-side proxy first (100% reliable, zero CORS restrictions on mobile/desktop)
    try {
      const proxyRes = await fetch('/api/apps-script-proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl, payload: body }),
      });
      if (proxyRes.ok) {
        const proxyData = await proxyRes.json();
        return proxyData;
      }
    } catch {}

    // 2. Direct fetch fallback
    try {
      const res = await fetch(targetUrl, {
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
      // 3. Fallback no-cors
      try {
        await fetch(targetUrl, {
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
    deliveryRates?: DeliveryCityRate[];
    categories?: string[];
    adminCredentials?: { username: string; password?: string; passwordHash?: string; salt?: string };
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
      // 1. Try server-side proxy FIRST (100% reliable, zero CORS, follows Google 302 redirects)
      try {
        const fullUrl = testUrl.includes('?') ? `${testUrl}&action=get_all` : `${testUrl}?action=get_all`;
        const proxyRes = await fetch(`/api/apps-script-proxy?url=${encodeURIComponent(fullUrl)}`);
        if (proxyRes.ok) {
          const result = await proxyRes.json();
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
              deliveryRates: Array.isArray(data.deliveryRates) ? data.deliveryRates : undefined,
              categories: Array.isArray(data.categories) ? data.categories : undefined,
              adminCredentials: data.adminCredentials || (data.settings && data.settings.adminUsername ? { username: data.settings.adminUsername, password: data.settings.adminPassword } : undefined),
            };
          }
        }
      } catch (proxyErr: any) {
        lastError = proxyErr;
      }

      // 2. Try standard GET fetch
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
              deliveryRates: Array.isArray(data.deliveryRates) ? data.deliveryRates : undefined,
              categories: Array.isArray(data.categories) ? data.categories : undefined,
              adminCredentials: data.adminCredentials || (data.settings && data.settings.adminUsername ? { username: data.settings.adminUsername, password: data.settings.adminPassword } : undefined),
            };
          }
        }
      } catch (err: any) {
        lastError = err;
      }

      // 3. Try JSONP fallback (bypasses all browser CORS and origin blocks across all devices)
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
            deliveryRates: Array.isArray(data.deliveryRates) ? data.deliveryRates : undefined,
            categories: Array.isArray(data.categories) ? data.categories : undefined,
            adminCredentials: data.adminCredentials || (data.settings && data.settings.adminUsername ? { username: data.settings.adminUsername, password: data.settings.adminPassword } : undefined),
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
    display: 'نعم' | 'لا' | 'كلا',
    extraData?: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_pubg_display',
      id,
      display: display === 'نعم' ? 'نعم' : 'لا',
      ...(extraData || {}),
    });
    return true;
  }

  /**
   * Toggle PUBG account sold status (متوفر / تم البيع)
   */
  public static async setPubgSold(
    webAppUrl: string,
    id: string,
    isSold: boolean,
    extraData?: any
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_pubg_sold',
      id,
      isSold,
      sold: isSold,
      saleStatus: isSold ? 'تم البيع' : 'متوفر',
      saleFlag: isSold ? 'لا' : 'نعم',
      ...(extraData || {}),
    });
    return true;
  }

  /**
   * Toggle Product In-Stock status (نعم / لا)
   */
  public static async setProductStock(
    webAppUrl: string,
    id: string,
    inStock: boolean
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_product_stock',
      id,
      inStock,
    });
    return true;
  }

  /**
   * Toggle UC Package In-Stock status (نعم / لا)
   */
  public static async setUcPackageStock(
    webAppUrl: string,
    id: string,
    isAvailable: boolean
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'set_uc_package_stock',
      id,
      isAvailable,
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

  /**
   * Add a delivery rate to Google Sheets
   */
  public static async addDeliveryRate(webAppUrl: string, rate: DeliveryCityRate): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'add_delivery_rate',
      data: rate,
    });
    return true;
  }

  /**
   * Update a delivery rate in Google Sheets
   */
  public static async updateDeliveryRate(webAppUrl: string, id: string, rate: Partial<DeliveryCityRate>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_delivery_rate',
      id,
      data: rate,
    });
    return true;
  }

  /**
   * Delete a delivery rate from Google Sheets
   */
  public static async deleteDeliveryRate(webAppUrl: string, id: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'delete_delivery_rate',
      id,
    });
    return true;
  }

  /**
   * Save / Sync all delivery rates in Google Sheets
   */
  public static async saveDeliveryRates(webAppUrl: string, rates: DeliveryCityRate[]): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_delivery_rates',
      rates,
    });
    return true;
  }

  /**
   * Save Admin Credentials in Google Sheets
   */
  public static async saveAdminCredentials(
    webAppUrl: string,
    username: string,
    password: string
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_admin_credentials',
      username,
      password,
    });
    return true;
  }

  /**
   * Save Product Categories in Google Sheets
   */
  public static async saveCategories(
    webAppUrl: string,
    categories: string[]
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'save_categories',
      categories,
    });
    return true;
  }
}
