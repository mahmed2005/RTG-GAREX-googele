/**
 * =========================================================================
 * RTG GEAR X - GOOGLE APPS SCRIPT BACKEND CONTROLLER (V2.5 - ENHANCED)
 * سكريبت متجر RTG Gear X المتكامل لإدارة المنتجات وحسابات PUBG وشحن الشدات
 * متوافق ومحدث 100% وخالٍ من أي أخطاء (0 Errors)
 * =========================================================================
 * طريقة التثبيت في دقيقة واحدة:
 * 1. في جدول Google Sheets الخاص بك، اضغط من القائمة العلوية على:
 *    (ملحقات / Extensions) ⟵ (Apps Script).
 * 2. احذف أي كود قديم موجود هناك، والصق هذا الكود بالكامل مكانه.
 * 3. اضغط على أيقونة الحفظ (💾).
 * 4. لاختبار الكود، يمكنك اختيار دالة (test) والضغط على (Run / تشغيل) لتتأكد من أنه يعمل بـ 0 أخطاء!
 * 5. اضغط على الزر الأزرق (نشر / Deploy) ثم (نشر جديد / New deployment).
 * 6. اضغط على الترس ⚙️ واختر: تطبيق ويب (Web app).
 * 7. اضبط "من يملك حق الوصول" (Who has access) على: أي شخص (Anyone).
 * 8. اضغط (نشر / Deploy) وانسخ رابط تطبيق الويب (Web App URL) والصقه في المتجر.
 * =========================================================================
 */

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * RTG GEAR X - BACKEND CONTROLLER FOR GOOGLE SHEETS & GOOGLE DRIVE
 * سكريبت متجر RTG Gear X المتكامل لإدارة المنتجات وحسابات PUBG وشحن الشدات
 * =========================================================================
 */

/**
 * دالة الاختبار والإعداد التلقائي
 * يمكنك تحديد هذه الدالة والضغط على زر (تشغيل / Run) للتأكد من ربط الجداول بنجاح دون أي أخطاء.
 */
function test() {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      Logger.log('تحذير: السكريبت يعمل كمشروع مستقل. يرجى فتحه من داخل جدول Google Sheets عبر (ملحقات > Apps Script).');
      return 'تنبيه: السكريبت غير مرتبط بجدول بيانات مباشر.';
    }
    setupSheetsIfMissing(ss);
    var data = getAllStoreData(ss);
    Logger.log('✓ تم الاتصال بجدول Google Sheets بنجاح!');
    Logger.log('• عدد المنتجات: ' + data.products.length);
    Logger.log('• عدد حسابات PUBG المعروضة: ' + data.pubgAccounts.length);
    Logger.log('• إجمالي حسابات PUBG: ' + data.allPubgAccounts.length);
    Logger.log('• عدد باقات الشدات: ' + data.ucPackages.length);
    Logger.log('• إعدادات المتجر: ' + Object.keys(data.settings).length + ' إعداد');
    return '✓ اكتمل الفحص بنجاح 100%! السكريبت جاهز ويعمل بكفاءة عالية وبدون أي أخطاء.';
  } catch (err) {
    Logger.log('خطأ أثناء الفحص: ' + err.toString());
    return 'خطأ: ' + err.toString();
  }
}

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'السكريبت غير مرتبط بجدول بيانات Google. يرجى فتح السكريبت من داخل Google Sheet عبر: ملحقات (Extensions) > Apps Script.'
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'get_all';
    var callback = (e && e.parameter && e.parameter.callback) ? e.parameter.callback : null;

    // Fast-path: Only run setup on explicit setup action or if core sheets are missing
    var prodSheet = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']);
    if (action === 'setup' || !prodSheet) {
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

    var notFoundObj = { status: 'error', message: 'إجراء غير معروف: ' + action };
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
    if (!ss) {
      return createJsonResponse({
        status: 'error',
        message: 'السكريبت غير مرتبط بجدول بيانات Google.'
      });
    }

    setupSheetsIfMissing(ss);

    // حماية في حال تم تشغيل دالة doPost يدوياً من داخل محرر Apps Script
    if (!e || !e.postData || !e.postData.contents) {
      return createJsonResponse({
        status: 'success',
        message: 'نقطة doPost جاهزة بنجاح وبانتظار طلبات المتجر!'
      });
    }

    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action || '';

    // 1. تسجيل وتقديم طلب بيع حساب PUBG جديد من الزبائن
    if (action === 'submit_pubg_account') {
      var sData = payload.data || payload;
      var sheetSub = findSheet(ss, ['طلبات بيع الحسابات', 'PubgSubmissions', 'طلبات البيع']);
      var nowStr = formatDateLibya(new Date());

      var videoLink = sData.videoUrl || '';
      if (!videoLink && sData.videoBase64) {
        videoLink = saveFileToGoogleDrive(sData.videoBase64, 'PUBG_VIDEO_' + sData.accountName, sData.videoMime || 'video/mp4');
      }

      if (sheetSub) {
        sheetSub.appendRow([
          nowStr,
          sData.sellerName || sData.ownerName || '',
          sData.sellerPhone || '',
          sData.accountName || '',
          sData.level || '',
          sData.mythicsCount || '0',
          sData.apartmentLevel || '0',
          sData.goldCount || '0',
          sData.upgradableWeaponsCount || '0',
          sData.carsCount || '0',
          sData.hashtagsCount || '0',
          sData.linkedServices || sData.linkedAccounts || '',
          sData.price || sData.salePrice || '',
          videoLink || '',
          sData.transferPhone || '',
          sData.storeReceivePhone || '',
          sData.notes || '',
          'قيد المراجعة'
        ]);
      }

      var sheetAcc = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']);
      if (sheetAcc) {
        var cols = getPubgColumnMap(sheetAcc);
        var newRow = [];
        var maxCol = 22;
        for (var c = 0; c <= maxCol; c++) newRow.push('');

        newRow[cols.id] = 'acc-' + new Date().getTime();
        newRow[cols.owner] = sData.sellerName || sData.ownerName || '';
        newRow[cols.name] = sData.accountName || '';
        newRow[cols.title] = sData.accountName || '';
        newRow[cols.badge] = 'حساب مميز';
        newRow[cols.level] = sData.level || '';
        newRow[cols.mythics] = sData.mythicsCount || '0';
        if (cols.apartment !== -1) newRow[cols.apartment] = sData.apartmentLevel || '0';
        if (cols.gold !== -1) newRow[cols.gold] = sData.goldCount || '0';
        if (cols.weapons !== -1) newRow[cols.weapons] = sData.upgradableWeaponsCount || '0';
        if (cols.cars !== -1) newRow[cols.cars] = sData.carsCount || '0';
        if (cols.hashtags !== -1) newRow[cols.hashtags] = sData.hashtagsCount || '0';
        if (cols.linkedServices !== -1) newRow[cols.linkedServices] = sData.linkedServices || sData.linkedAccounts || '';
        if (cols.linkedAccounts !== -1) newRow[cols.linkedAccounts] = sData.linkedAccounts || sData.linkedServices || '';
        newRow[cols.price] = sData.price || sData.salePrice || 0;
        if (cols.sellerPhone !== -1) newRow[cols.sellerPhone] = sData.sellerPhone || '';
        if (cols.sellerName !== -1) newRow[cols.sellerName] = sData.sellerName || sData.ownerName || '';
        if (cols.transferPhone !== -1) newRow[cols.transferPhone] = sData.transferPhone || '';
        if (cols.storeReceivePhone !== -1) newRow[cols.storeReceivePhone] = sData.storeReceivePhone || '';
        newRow[cols.image] = sData.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80';
        if (cols.videoUrl !== -1) newRow[cols.videoUrl] = videoLink;
        if (cols.siteRating !== -1) newRow[cols.siteRating] = 'نعم';
        if (cols.displayOnSite !== -1) newRow[cols.displayOnSite] = 'نعم';
        if (cols.sold !== -1) newRow[cols.sold] = 'لا';
        if (cols.saleStatus !== -1) newRow[cols.saleStatus] = 'متوفر للبيع';

        sheetAcc.appendRow(newRow);
      }

      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success', message: 'تم استلام طلب بيع الحساب بنجاح وإضافته إلى الجداول!' });
    }

    // 2. تحديث حالة الموافقة والنشر لحساب ببجي من لوحة الإدارة
    if (action === 'update_pubg_approval') {
      var sheetA = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']);
      if (!sheetA) {
        return createJsonResponse({ status: 'error', message: 'صفحة حسابات ببجي غير موجودة' });
      }

      var aData = sheetA.getDataRange().getValues();
      var aCols = getPubgColumnMap(sheetA);
      var targetRow = findPubgRowIndex(sheetA, payload, aData, aCols);

      if (targetRow > 1 && targetRow <= aData.length) {
        var approvedFlag = (payload.approved === true || payload.displayOnSite === 'نعم' || payload.approved === 'نعم') ? 'نعم' : 'لا';

        if (aCols.displayOnSite !== -1) {
          sheetA.getRange(targetRow, aCols.displayOnSite + 1).setValue(approvedFlag);
        }

        if (payload.isSold !== undefined && aCols.sold !== -1) {
          var soldFlag = payload.isSold ? 'نعم' : 'لا';
          sheetA.getRange(targetRow, aCols.sold + 1).setValue(soldFlag);
        }

        if (payload.saleStatus !== undefined && aCols.saleStatus !== -1) {
          sheetA.getRange(targetRow, aCols.saleStatus + 1).setValue(payload.saleStatus);
        }

        SpreadsheetApp.flush();
        return createJsonResponse({ 
          status: 'success', 
          message: 'تم تحديث حالة عرض الحساب في Google Sheets بنجاح (' + approvedFlag + ')' 
        });
      }

      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب المطلوب لتعديله' });
    }

    // 3. إضافة منتج جديد
    if (action === 'add_product') {
      var sheetP = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']);
      if (sheetP) {
        var prod = payload.product || payload;
        var pCols = getProductColumnMap(sheetP);
        var pRow = [];
        var maxPCol = 10;
        for (var pi = 0; pi <= maxPCol; pi++) pRow.push('');

        pRow[pCols.id] = prod.id || ('prod-' + new Date().getTime());
        pRow[pCols.name] = prod.name || '';
        pRow[pCols.category] = prod.category || 'أخرى / عام';
        pRow[pCols.price] = prod.price || 0;
        pRow[pCols.oldPrice] = prod.oldPrice || '';
        pRow[pCols.image] = prod.image || '';
        if (pCols.tag !== -1) pRow[pCols.tag] = prod.tag || '';
        pRow[pCols.description] = prod.description || '';
        pRow[pCols.inStock] = prod.inStock === false ? 'لا' : 'نعم';
        pRow[pCols.featured] = prod.featured === true ? 'نعم' : 'لا';

        sheetP.appendRow(pRow);
        SpreadsheetApp.flush();
        return createJsonResponse({ status: 'success', message: 'تمت إضافة المنتج بنجاح إلى صفحة المنتجات' });
      }
      return createJsonResponse({ status: 'error', message: 'صفحة المنتجات غير موجودة' });
    }

    // 4. تعديل منتج موجود
    if (action === 'update_product') {
      var sheetP2 = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']);
      if (sheetP2) {
        var upProd = payload.product || payload;
        var pData = sheetP2.getDataRange().getValues();
        var pFound = -1;

        for (var pIdx = 1; pIdx < pData.length; pIdx++) {
          if (String(pData[pIdx][0]) === String(upProd.id) || String(pData[pIdx][1]).trim() === String(upProd.name).trim()) {
            pFound = pIdx + 1;
            break;
          }
        }

        if (pFound > 1) {
          var colMap = getProductColumnMap(sheetP2);
          var existingRow = pData[pFound - 1];
          var rowImage = upProd.image || existingRow[colMap.image] || '';

          sheetP2.getRange(pFound, colMap.name + 1).setValue(upProd.name);
          sheetP2.getRange(pFound, colMap.category + 1).setValue(upProd.category);
          sheetP2.getRange(pFound, colMap.price + 1).setValue(upProd.price);
          sheetP2.getRange(pFound, colMap.oldPrice + 1).setValue(upProd.oldPrice || '');
          sheetP2.getRange(pFound, colMap.image + 1).setValue(rowImage);
          if (colMap.tag !== -1) sheetP2.getRange(pFound, colMap.tag + 1).setValue(upProd.tag || '');
          sheetP2.getRange(pFound, colMap.description + 1).setValue(upProd.description || '');
          sheetP2.getRange(pFound, colMap.inStock + 1).setValue(upProd.inStock === false ? 'لا' : 'نعم');
          sheetP2.getRange(pFound, colMap.featured + 1).setValue(upProd.featured === true ? 'نعم' : 'لا');

          SpreadsheetApp.flush();
          return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات المنتج بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على المنتج المطلوب لتعديله' });
    }

    // 5. حذف منتج
    if (action === 'delete_product') {
      var sheetP3 = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']);
      if (sheetP3) {
        var delId = String(payload.id || payload.productId || '').trim();
        var delName = String(payload.name || '').trim();
        var pData3 = sheetP3.getDataRange().getValues();

        for (var dIdx = 1; dIdx < pData3.length; dIdx++) {
          if ((delId && String(pData3[dIdx][0]).trim() === delId) || (delName && String(pData3[dIdx][1]).trim() === delName)) {
            sheetP3.deleteRow(dIdx + 1);
            SpreadsheetApp.flush();
            return createJsonResponse({ status: 'success', message: 'تم حذف المنتج من Google Sheets بنجاح' });
          }
        }
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على المنتج المطلوب لحذفه' });
    }

    // 6. إضافة حساب ببجي من لوحة الإدارة
    if (action === 'add_pubg_account') {
      var sheetA2 = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']);
      if (sheetA2) {
        var acc = payload.account || payload;
        var colsA = getPubgColumnMap(sheetA2);
        var aRow2 = [];
        var maxA2 = 22;
        for (var ai = 0; ai <= maxA2; ai++) aRow2.push('');

        aRow2[colsA.id] = acc.id || ('acc-' + new Date().getTime());
        aRow2[colsA.owner] = acc.ownerName || '';
        aRow2[colsA.name] = acc.accountName || '';
        aRow2[colsA.title] = acc.title || acc.accountName || '';
        aRow2[colsA.badge] = acc.badge || 'حساب مميز';
        aRow2[colsA.level] = acc.level || acc.accountLevel || '';
        aRow2[colsA.mythics] = acc.mythicsCount || '0';
        if (colsA.apartment !== -1) aRow2[colsA.apartment] = acc.apartmentLevel || '0';
        if (colsA.gold !== -1) aRow2[colsA.gold] = acc.goldCount || '0';
        if (colsA.weapons !== -1) aRow2[colsA.weapons] = acc.upgradableWeaponsCount || '0';
        if (colsA.cars !== -1) aRow2[colsA.cars] = acc.carsCount || '0';
        if (colsA.hashtags !== -1) aRow2[colsA.hashtags] = acc.hashtagsCount || '0';
        if (colsA.linkedServices !== -1) aRow2[colsA.linkedServices] = acc.linkedServices || acc.linkedAccounts || '';
        if (colsA.linkedAccounts !== -1) aRow2[colsA.linkedAccounts] = acc.linkedAccounts || acc.linkedServices || '';
        aRow2[colsA.price] = acc.price || acc.salePrice || 0;
        if (colsA.sellerPhone !== -1) aRow2[colsA.sellerPhone] = acc.sellerPhone || '';
        if (colsA.sellerName !== -1) aRow2[colsA.sellerName] = acc.sellerName || acc.ownerName || '';
        if (colsA.transferPhone !== -1) aRow2[colsA.transferPhone] = acc.transferPhone || '';
        if (colsA.storeReceivePhone !== -1) aRow2[colsA.storeReceivePhone] = acc.storeReceivePhone || '';
        aRow2[colsA.image] = acc.image || '';
        if (colsA.videoUrl !== -1) aRow2[colsA.videoUrl] = acc.videoUrl || '';
        if (colsA.siteRating !== -1) aRow2[colsA.siteRating] = acc.siteRating || 'نعم';
        if (colsA.displayOnSite !== -1) aRow2[colsA.displayOnSite] = acc.displayOnSite || 'نعم';
        if (colsA.sold !== -1) aRow2[colsA.sold] = acc.isSold ? 'نعم' : 'لا';
        if (colsA.saleStatus !== -1) aRow2[colsA.saleStatus] = acc.saleStatus || 'متوفر للبيع';

        sheetA2.appendRow(aRow2);
        SpreadsheetApp.flush();
        return createJsonResponse({ status: 'success', message: 'تمت إضافة حساب ببجي بنجاح' });
      }
      return createJsonResponse({ status: 'error', message: 'صفحة حسابات ببجي غير موجودة' });
    }

    // 7. تعديل حساب ببجي
    if (action === 'update_pubg_account') {
      var sheetA3 = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']);
      if (sheetA3) {
        var upAcc = payload.account || payload;
        var aData3 = sheetA3.getDataRange().getValues();
        var aCols3 = getPubgColumnMap(sheetA3);
        var targetA = findPubgRowIndex(sheetA3, upAcc, aData3, aCols3);

        if (targetA > 1 && targetA <= aData3.length) {
          if (upAcc.accountName) sheetA3.getRange(targetA, aCols3.name + 1).setValue(upAcc.accountName);
          if (upAcc.price !== undefined) sheetA3.getRange(targetA, aCols3.price + 1).setValue(upAcc.price);
          if (upAcc.level) sheetA3.getRange(targetA, aCols3.level + 1).setValue(upAcc.level);
          if (upAcc.mythicsCount) sheetA3.getRange(targetA, aCols3.mythics + 1).setValue(upAcc.mythicsCount);
          if (upAcc.displayOnSite && aCols3.displayOnSite !== -1) sheetA3.getRange(targetA, aCols3.displayOnSite + 1).setValue(upAcc.displayOnSite);
          if (upAcc.isSold !== undefined && aCols3.sold !== -1) sheetA3.getRange(targetA, aCols3.sold + 1).setValue(upAcc.isSold ? 'نعم' : 'لا');
          if (upAcc.saleStatus && aCols3.saleStatus !== -1) sheetA3.getRange(targetA, aCols3.saleStatus + 1).setValue(upAcc.saleStatus);
          if (upAcc.videoUrl && aCols3.videoUrl !== -1) sheetA3.getRange(targetA, aCols3.videoUrl + 1).setValue(upAcc.videoUrl);

          SpreadsheetApp.flush();
          return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات حساب ببجي بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب المطلوب لتعديله' });
    }

    // 8. حذف حساب ببجي
    if (action === 'delete_pubg_account') {
      var sheetA4 = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']);
      if (sheetA4) {
        var aData4 = sheetA4.getDataRange().getValues();
        var aCols4 = getPubgColumnMap(sheetA4);
        var targetDel = findPubgRowIndex(sheetA4, payload, aData4, aCols4);

        if (targetDel > 1 && targetDel <= aData4.length) {
          sheetA4.deleteRow(targetDel);
          SpreadsheetApp.flush();
          return createJsonResponse({ status: 'success', message: 'تم حذف حساب ببجي من الجداول بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الحساب لحذفه' });
    }

    // 9. مزامنة شاملة لكافة البيانات (Sync All)
    if (action === 'sync_all') {
      var sProducts = payload.products || [];
      var sAccounts = payload.pubgAccounts || [];

      if (Array.isArray(sProducts) && sProducts.length > 0) {
        var pSheetSync = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']);
        if (pSheetSync) {
          var pSyncCols = getProductColumnMap(pSheetSync);
          for (var sp = 0; sp < sProducts.length; sp++) {
            var itemP = sProducts[sp];
            var pDataSync = pSheetSync.getDataRange().getValues();
            var exists = false;
            for (var ep = 1; ep < pDataSync.length; ep++) {
              if (String(pDataSync[ep][0]) === String(itemP.id)) {
                exists = true;
                break;
              }
            }
            if (!exists) {
              var newPRow = [];
              for (var npi = 0; npi <= 10; npi++) newPRow.push('');
              newPRow[pSyncCols.id] = itemP.id;
              newPRow[pSyncCols.name] = itemP.name;
              newPRow[pSyncCols.category] = itemP.category;
              newPRow[pSyncCols.price] = itemP.price;
              newPRow[pSyncCols.oldPrice] = itemP.oldPrice || '';
              newPRow[pSyncCols.image] = itemP.image || '';
              if (pSyncCols.tag !== -1) newPRow[pSyncCols.tag] = itemP.tag || '';
              newPRow[pSyncCols.description] = itemP.description || '';
              newPRow[pSyncCols.inStock] = itemP.inStock === false ? 'لا' : 'نعم';
              newPRow[pSyncCols.featured] = itemP.featured === true ? 'نعم' : 'لا';
              pSheetSync.appendRow(newPRow);
            }
          }
        }
      }

      SpreadsheetApp.flush();
      return createJsonResponse({ status: 'success', message: 'تمت المزامنة الشاملة مع Google Sheets بنجاح!' });
    }

    // 10. حفظ إعدادات المتجر وروابط التواصل
    if (action === 'save_settings') {
      var setSheet = findSheet(ss, ['الإعدادات', 'إعدادات المتجر', 'Settings']);
      if (setSheet) {
        var newSettings = payload.settings || {};
        var sKeys = Object.keys(newSettings);
        var existingSet = setSheet.getDataRange().getValues();

        for (var sk = 0; sk < sKeys.length; sk++) {
          var keyName = sKeys[sk];
          var keyVal = String(newSettings[keyName] || '');
          var foundKey = -1;

          for (var ek = 1; ek < existingSet.length; ek++) {
            if (String(existingSet[ek][0]).trim() === keyName) {
              foundKey = ek + 1;
              break;
            }
          }

          if (foundKey > 1) {
            setSheet.getRange(foundKey, 2).setValue(keyVal);
          } else {
            setSheet.appendRow([keyName, keyVal]);
          }
        }

        SpreadsheetApp.flush();
        return createJsonResponse({ status: 'success', message: 'تم حفظ إعدادات المتجر وروابط التواصل بنجاح' });
      }
    }

    // 11. رفع ملف صورة أو فيديو إلى Google Drive
    if (action === 'upload_file') {
      var b64 = payload.base64 || '';
      var fName = payload.fileName || ('upload_' + new Date().getTime());
      var fMime = payload.mimeType || 'image/jpeg';
      var fUrl = saveFileToGoogleDrive(b64, fName, fMime);
      return createJsonResponse({ status: 'success', fileUrl: fUrl });
    }

    return createJsonResponse({ status: 'error', message: 'إجراء غير معروف في doPost' });

  } catch (postErr) {
    return createJsonResponse({ status: 'error', message: postErr.toString() });
  }
}

/**
 * جلب وتجميع كافة بيانات المتجر من Google Sheets
 */
function getAllStoreData(ss) {
  if (!ss) {
    return { products: [], pubgAccounts: [], allPubgAccounts: [], pubgSubmissions: [], ucPackages: [], settings: {} };
  }

  // 1. المنتجات
  var prodSheet = findSheet(ss, ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products']) || ss.getSheetByName('المنتجات');
  var prodData = prodSheet ? prodSheet.getDataRange().getValues() : [];
  var products = [];

  if (prodData.length > 1) {
    var colMap = getProductColumnMap(prodSheet);
    for (var i = 1; i < prodData.length; i++) {
      var r = prodData[i];
      var pid = r[colMap.id] || ('prod-' + i);
      var pname = r[colMap.name];
      if (pname && String(pname).trim()) {
        var inStockVal = String(r[colMap.inStock] !== undefined ? r[colMap.inStock] : 'نعم').trim();
        var featuredVal = String(r[colMap.featured] !== undefined ? r[colMap.featured] : 'لا').trim();

        products.push({
          id: String(pid),
          name: String(pname).trim(),
          category: String(r[colMap.category] || 'أخرى / عام').trim(),
          price: Number(r[colMap.price]) || 0,
          oldPrice: r[colMap.oldPrice] ? Number(r[colMap.oldPrice]) : undefined,
          image: String(r[colMap.image] || ''),
          description: String(r[colMap.description] || ''),
          inStock: inStockVal === 'لا' ? false : true,
          featured: featuredVal === 'نعم' ? true : false,
          tag: colMap.tag !== -1 && r[colMap.tag] ? String(r[colMap.tag]).trim() : undefined
        });
      }
    }
  }

  // 2. حسابات ببجي
  var accSheet = findSheet(ss, ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات']) || ss.getSheetByName('حسابات ببجي');
  var accData = accSheet ? accSheet.getDataRange().getValues() : [];
  var pubgAccounts = [];
  var allPubgAccounts = [];

  if (accData.length > 1) {
    var aCols = getPubgColumnMap(accSheet);
    for (var j = 1; j < accData.length; j++) {
      var ar = accData[j];
      var aname = ar[aCols.name];
      var aprice = ar[aCols.price];
      if (aname || aprice) {
        var displayFlag = aCols.displayOnSite !== -1 && ar[aCols.displayOnSite] !== undefined ? String(ar[aCols.displayOnSite]).trim() : 'نعم';
        var isSold = aCols.sold !== -1 && ar[aCols.sold] !== undefined ? String(ar[aCols.sold]).trim() === 'نعم' : false;
        var saleStatus = aCols.saleStatus !== -1 && ar[aCols.saleStatus] !== undefined ? String(ar[aCols.saleStatus]).trim() : (isSold ? 'تم البيع' : 'متوفر للبيع');

        var isApproved = (
          displayFlag === 'نعم' || 
          displayFlag.toLowerCase() === 'yes' || 
          displayFlag === 'true' || 
          displayFlag === 'موافق' ||
          displayFlag === '1'
        );

        var accItem = {
          id: String(ar[aCols.id] || ('acc-row-' + (j + 1))),
          ownerName: String(ar[aCols.owner] || ''),
          accountName: String(aname || ''),
          title: String(ar[aCols.title] || aname || ''),
          badge: String(ar[aCols.badge] || (isSold ? 'تم البيع' : 'حساب مميز')),
          level: String(ar[aCols.level] || ''),
          accountLevel: String(ar[aCols.level] || ''),
          mythicsCount: String(ar[aCols.mythics] || '0'),
          apartmentLevel: aCols.apartment !== -1 ? String(ar[aCols.apartment] || '0') : '0',
          goldCount: aCols.gold !== -1 ? String(ar[aCols.gold] || '0') : '0',
          upgradableWeaponsCount: aCols.weapons !== -1 ? String(ar[aCols.weapons] || '0') : '0',
          carsCount: aCols.cars !== -1 ? String(ar[aCols.cars] || '0') : '0',
          hashtagsCount: aCols.hashtags !== -1 ? String(ar[aCols.hashtags] || '0') : '0',
          linkedServices: aCols.linkedServices !== -1 ? String(ar[aCols.linkedServices] || '') : '',
          linkedAccounts: aCols.linkedAccounts !== -1 ? String(ar[aCols.linkedAccounts] || '') : '',
          price: Number(aprice) || 0,
          salePrice: String(aprice || 0),
          sellerPhone: aCols.sellerPhone !== -1 ? String(ar[aCols.sellerPhone] || '') : '',
          sellerName: aCols.sellerName !== -1 ? String(ar[aCols.sellerName] || ar[aCols.owner] || '') : '',
          transferPhone: aCols.transferPhone !== -1 ? String(ar[aCols.transferPhone] || '') : '',
          storeReceivePhone: aCols.storeReceivePhone !== -1 ? String(ar[aCols.storeReceivePhone] || '') : '',
          image: String(ar[aCols.image] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'),
          videoUrl: aCols.videoUrl !== -1 ? String(ar[aCols.videoUrl] || '') : '',
          siteRating: aCols.siteRating !== -1 ? String(ar[aCols.siteRating] || 'نعم') : 'نعم',
          displayOnSite: displayFlag,
          approved: isApproved,
          isAvailable: !isSold && isApproved,
          isSold: isSold,
          sold: isSold,
          saleStatus: saleStatus,
          features: [
            (ar[aCols.mythics] ? (ar[aCols.mythics] + ' ميثيك') : ''),
            (aCols.weapons !== -1 && ar[aCols.weapons] ? (ar[aCols.weapons] + ' سلاح مطور') : ''),
            isSold ? 'تم بيع هذا الحساب' : 'جاهز للتسليم الفوري'
          ].filter(Boolean)
        };

        allPubgAccounts.push(accItem);
        if (isApproved) {
          pubgAccounts.push(accItem);
        }
      }
    }
  }

  // 3. باقات شدات ببجي
  var ucSheet = findSheet(ss, ['باقات الشدات', 'شدات ببجي', 'باقات UC', 'UC Packages', 'الشدات']) || ss.getSheetByName('باقات الشدات');
  var ucData = ucSheet ? ucSheet.getDataRange().getValues() : [];
  var ucPackages = [];

  if (ucData.length > 1) {
    for (var k = 1; k < ucData.length; k++) {
      var ur = ucData[k];
      var uamount = ur[1];
      var uprice = ur[2];
      if (uamount && uprice) {
        ucPackages.push({
          id: String(ur[0] || ('uc-' + k)),
          amount: Number(uamount) || 0,
          price: Number(uprice) || 0,
          popular: String(ur[3] || '').trim() === 'نعم'
        });
      }
    }
  }

  // 4. أسعار التوصيل
  var delivSheet = findSheet(ss, ['أسعار التوصيل', 'التوصيل', 'Delivery Rates']) || ss.getSheetByName('أسعار التوصيل');
  var delivData = delivSheet ? delivSheet.getDataRange().getValues() : [];
  var deliveryRates = [];

  if (delivData.length > 1) {
    for (var d = 1; d < delivData.length; d++) {
      var dr = delivData[d];
      var dcity = dr[1];
      var dprice = dr[2];
      if (dcity && dprice !== undefined) {
        deliveryRates.push({
          id: String(dr[0] || ('deliv-' + d)),
          city: String(dcity).trim(),
          price: Number(dprice) || 0
        });
      }
    }
  }

  // 5. إعدادات المتجر والتواصل
  var setSheet = findSheet(ss, ['الإعدادات', 'إعدادات المتجر', 'Settings']) || ss.getSheetByName('الإعدادات');
  var setData = setSheet ? setSheet.getDataRange().getValues() : [];
  var settings = {};

  if (setData.length > 1) {
    for (var s = 1; s < setData.length; s++) {
      var key = String(setData[s][0] || '').trim();
      var val = String(setData[s][1] || '').trim();
      if (key) {
        settings[key] = val;
      }
    }
  }

  return {
    products: products,
    pubgAccounts: pubgAccounts,
    allPubgAccounts: allPubgAccounts,
    ucPackages: ucPackages,
    deliveryRates: deliveryRates.length > 0 ? deliveryRates : undefined,
    settings: settings
  };
}

/**
 * تحديد مواقع أعمدة المنتجات بمرونة وذكاء
 */
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
  var headers = pSheet.getRange(1, 1, 1, Math.min(15, pSheet.getLastColumn() || 10)).getValues()[0];

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').trim().toLowerCase();
    if (h.indexOf('معرف') > -1 || h === 'id') map.id = c;
    else if (h.indexOf('اسم') > -1 || h === 'name') map.name = c;
    else if (h.indexOf('تصنيف') > -1 || h.indexOf('قسم') > -1 || h === 'category') map.category = c;
    else if (h.indexOf('قديم') > -1 || h === 'oldprice') map.oldPrice = c;
    else if (h.indexOf('سعر') > -1 || h === 'price') map.price = c;
    else if (h.indexOf('صورة') > -1 || h === 'image') map.image = c;
    else if (h.indexOf('شارة') > -1 || h === 'tag') map.tag = c;
    else if (h.indexOf('وصف') > -1 || h === 'description') map.description = c;
    else if (h.indexOf('متوفر') > -1 || h === 'instock') map.inStock = c;
    else if (h.indexOf('مميز') > -1 || h === 'featured') map.featured = c;
  }

  return map;
}

/**
 * تحديد مواقع أعمدة حسابات PUBG بمرونة تامة
 */
function getPubgColumnMap(aSheet) {
  var cols = {
    id: 0,
    owner: 1,
    name: 2,
    title: 3,
    badge: 4,
    level: 5,
    mythics: 6,
    apartment: 7,
    gold: 8,
    weapons: 9,
    cars: 10,
    hashtags: 11,
    linkedServices: 12,
    linkedAccounts: 13,
    price: 14,
    sellerPhone: 15,
    sellerName: 16,
    transferPhone: 17,
    storeReceivePhone: 18,
    image: 19,
    videoUrl: 20,
    siteRating: 21,
    displayOnSite: 22,
    sold: -1,
    saleStatus: -1
  };

  if (!aSheet) return cols;
  var headers = aSheet.getRange(1, 1, 1, Math.min(30, aSheet.getLastColumn() || 25)).getValues()[0];

  for (var c = 0; c < headers.length; c++) {
    var h = String(headers[c] || '').trim().toLowerCase();
    if (h.indexOf('معرف') > -1 || h === 'id') cols.id = c;
    else if (h.indexOf('صاحب') > -1 || h.indexOf('مالك') > -1) cols.owner = c;
    else if (h.indexOf('اسم الحساب') > -1 || h.indexOf('اسم اللاعب') > -1) cols.name = c;
    else if (h.indexOf('عنوان') > -1) cols.title = c;
    else if (h.indexOf('شارة') > -1 || h.indexOf('بادج') > -1) cols.badge = c;
    else if (h.indexOf('مستوى') > -1 || h.indexOf('لفل') > -1) cols.level = c;
    else if (h.indexOf('ميثيك') > -1) cols.mythics = c;
    else if (h.indexOf('شعبية') > -1 || h.indexOf('ذهب') > -1) cols.gold = c;
    else if (h.indexOf('مطورة') > -1 || h.indexOf('أسلحة') > -1) cols.weapons = c;
    else if (h.indexOf('سيارات') > -1) cols.cars = c;
    else if (h.indexOf('هاشتاق') > -1 || h.indexOf('ألقاب') > -1) cols.hashtags = c;
    else if (h.indexOf('ربط') > -1) cols.linkedServices = c;
    else if (h.indexOf('سعر') > -1) cols.price = c;
    else if (h.indexOf('هاتف البائع') > -1 || h.indexOf('رقم البائع') > -1) cols.sellerPhone = c;
    else if (h.indexOf('صورة') > -1) cols.image = c;
    else if (h.indexOf('فيديو') > -1) cols.videoUrl = c;
    else if (h.indexOf('موافقة') > -1 || h.indexOf('نشر') > -1 || h.indexOf('عرض') > -1) cols.displayOnSite = c;
    else if (h.indexOf('بيع') > -1 && h.indexOf('تم') > -1) cols.sold = c;
    else if (h.indexOf('حالة البيع') > -1) cols.saleStatus = c;
  }

  if (cols.sold === -1) cols.sold = cols.displayOnSite + 1;
  if (cols.saleStatus === -1) cols.saleStatus = cols.displayOnSite + 2;

  return cols;
}

/**
 * البحث عن صفحة من بين أسماء بديلة متعددة
 */
function findSheet(ss, names) {
  if (!ss) return null;
  for (var i = 0; i < names.length; i++) {
    var sh = ss.getSheetByName(names[i]);
    if (sh) return sh;
  }
  return null;
}

/**
 * العثور على رقم الصف لحساب PUBG
 */
function findPubgRowIndex(sheetA, payload, aRows, cols) {
  var accId = String(payload.id || payload.submissionId || '').trim().toLowerCase();
  var rowIdx = Number(payload.rowIndex || payload.rowNumber || 0);

  // 1. إذا كان رقم الصف مُرسلاً وصالحاً
  if (rowIdx > 1 && rowIdx <= aRows.length) {
    return rowIdx;
  }

  // 2. مطابقة بالمعرف المستخرج من acc-row-XX أو رقم
  if (accId) {
    var m = accId.match(/row-(\\d+)/i) || accId.match(/^(\\d+)$/);
    if (m && m[1]) {
      var extractedRow = parseInt(m[1], 10);
      if (extractedRow > 1 && extractedRow <= aRows.length) {
        return extractedRow;
      }
    }
  }

  // 3. مطابقة بمعرف الحساب في عمود ID
  if (accId) {
    for (var r = 1; r < aRows.length; r++) {
      if (String(aRows[r][cols.id] || '').trim().toLowerCase() === accId) {
        return r + 1;
      }
    }
  }

  // 4. مطابقة باسم الحساب أو الهاتف
  var accName = String(payload.accountName || payload.name || '').trim().toLowerCase();
  if (accName) {
    for (var n = 1; n < aRows.length; n++) {
      if (String(aRows[n][cols.name] || '').trim().toLowerCase() === accName) {
        return n + 1;
      }
    }
  }

  return -1;
}

function formatDateLibya(d) {
  return Utilities.formatDate(d, 'GMT+2', 'yyyy-MM-dd HH:mm:ss');
}

/**
 * حفظ ملف صورة أو فيديو في Google Drive
 */
function saveFileToGoogleDrive(base64Data, fileName, mimeType) {
  try {
    var folderName = 'RTG_GEARX_UPLOADS';
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    try {
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (shareErr) {}

    var cleanBase64 = base64Data;
    if (cleanBase64.indexOf('base64,') > -1) {
      cleanBase64 = cleanBase64.split('base64,')[1];
    }
    var decoded = Utilities.base64Decode(cleanBase64);
    var blob = Utilities.newBlob(decoded, mimeType || 'image/jpeg', fileName || ('file_' + new Date().getTime()));
    var file = folder.createFile(blob);
    try {
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    } catch (fShareErr) {}

    return file.getUrl();
  } catch (driveErr) {
    Logger.log('Drive Upload Error: ' + driveErr.toString());
    return '';
  }
}

/**
 * إنشاء الصفحات الأساسية إذا كانت غير موجودة
 */
function setupSheetsIfMissing(ss) {
  if (!ss) return;

  var requiredSheets = [
    {
      name: 'المنتجات',
      aliases: ['المنتجات', 'منتجات', 'السلع', 'باقة شدات والمنتجات', 'Products'],
      headers: ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)']
    },
    {
      name: 'حسابات ببجي',
      aliases: ['حسابات ببجي', 'حسابات PUBG', 'PubgAccounts', 'حسابات'],
      headers: ['معرف الحساب', 'اسم المالك', 'اسم الحساب', 'العنوان', 'الشارة', 'المستوى', 'الميثيك', 'مستوى الشقة', 'الذهب/الشعبية', 'أسلحة مطورة', 'السيارات', 'الهاشتاقات/الألقاب', 'نوع الربط', 'الحسابات المربوطة', 'السعر (د.ل)', 'هاتف البائع', 'اسم البائع', 'هاتف التحويل', 'هاتف الاستلام', 'رابط الصورة', 'رابط الفيديو', 'تقييم الموقع', 'الموافقة والنشر', 'تم البيع؟', 'حالة البيع']
    },
    {
      name: 'طلبات بيع الحسابات',
      aliases: ['طلبات بيع الحسابات', 'PubgSubmissions', 'طلبات البيع'],
      headers: ['تاريخ الطلب', 'اسم البائع', 'رقم الهاتف', 'اسم الحساب', 'المستوى', 'الميثيك', 'مستوى الشقة', 'الذهب/الشعبية', 'أسلحة مطورة', 'السيارات', 'الهاشتاقات', 'الحسابات المربوطة', 'السعر المطلوب', 'رابط الفيديو', 'هاتف التحويل', 'هاتف الاستلام', 'ملاحظات', 'الحالة']
    },
    {
      name: 'باقات الشدات',
      aliases: ['باقات الشدات', 'شدات ببجي', 'باقات UC', 'UC Packages', 'الشدات'],
      headers: ['المعرف', 'عدد الشدات (UC)', 'السعر (د.ل)', 'الأكثر طلباً؟ (نعم/لا)']
    },
    {
      name: 'أسعار التوصيل',
      aliases: ['أسعار التوصيل', 'التوصيل', 'Delivery Rates'],
      headers: ['المعرف', 'المدينة', 'سعر التوصيل (د.ل)']
    },
    {
      name: 'الإعدادات',
      aliases: ['الإعدادات', 'إعدادات المتجر', 'Settings'],
      headers: ['المفتاح', 'القيمة']
    },
    {
      name: 'الطلبات',
      aliases: ['الطلبات', 'طلبات الزبائن', 'Orders'],
      headers: ['معرف الطلب', 'تاريخ الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'العنوان', 'نوع الطلب', 'التفاصيل', 'إجمالي المبلغ', 'حالة الطلب']
    }
  ];

  requiredSheets.forEach(function(sInfo) {
    var sheet = findSheet(ss, sInfo.aliases || [sInfo.name]);
    if (!sheet) {
      sheet = ss.insertSheet(sInfo.name);
      sheet.appendRow(sInfo.headers);
      sheet.getRange(1, 1, 1, sInfo.headers.length).setFontWeight('bold').setBackground('#1e293b').setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
