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

const APPS_SCRIPT_CONFIG_KEY = 'rtg_apps_script_config_v1';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * =========================================================================
 * RTG GEAR X - BACKEND CONTROLLER FOR GOOGLE SHEETS & GOOGLE DRIVE
 * سكريبت متجر RTG Gear X المتكامل لإدارة المنتجات وحسابات PUBG ورفع الفيديوهات
 * =========================================================================
 * طريقة التثبيت في دقيقة واحدة:
 * 1. في جدول Google Sheets الخاص بك، اضغط على (ملحقات / Extensions) ثم (Apps Script).
 * 2. امسح أي كود موجود هناك، والصق هذا الكود بالكامل مكانه.
 * 3. اضغط على أيقونة الحفظ (💾).
 * 4. اضغط على الزر الأزرق (نشر / Deploy) ثم (نشر جديد / New deployment).
 * 5. اضغط على الترس ⚙️ واختر: تطبيق ويب (Web app).
 * 6. اضبط "من يملك حق الوصول" (Who has access) على: أي شخص (Anyone).
 * 7. اضغط (نشر / Deploy) وانسخ رابط تطبيق الويب (Web App URL) وضعه في لوحة تحكم الموقع.
 * =========================================================================
 */

function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var action = e.parameter.action || 'get_all';

    if (action === 'get_all') {
      var data = getAllStoreData(ss);
      return createJsonResponse({ status: 'success', data: data });
    }

    return createJsonResponse({ status: 'error', message: 'إجراء غير معروف' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    var raw = e.postData.contents;
    var payload = JSON.parse(raw);
    var action = payload.action;

    // 1. إضافة طلب بيع حساب ببجي جديد من الزبون مع حفظ الفيديو في Google Drive
    if (action === 'submit_pubg_account') {
      var sub = payload.data;
      var videoFinalUrl = sub.videoUrl || '';

      // إذا تم إرسال ملف فيديو أصلي Base64 يتم حفظه في Google Drive تلقائياً
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

      var subSheet = ss.getSheetByName('طلبات بيع الحسابات');
      var newId = sub.id || 'sub-' + new Date().getTime();
      var newDate = sub.date || new Date().toLocaleString('ar-LY');

      subSheet.appendRow([
        newId,
        newDate,
        sub.fullName || '',
        sub.accountName || '',
        sub.accountLevel || '',
        sub.powerLevel || '',
        sub.mythicsCount || '0',
        sub.goldenMythicsCount || '0',
        sub.upgradableWeapons || '',
        sub.carsCount || '0',
        sub.hashtagsCount || '0',
        sub.linkedAccounts || '',
        sub.salePrice || '0',
        sub.phone || '',
        sub.transferPhone || '',
        videoFinalUrl,
        'لا' // هل تمت الموافقة؟ الافتراضي 'لا' حتى يوافق عليها المسؤول لتظهر في الموقع
      ]);

      return createJsonResponse({ 
        status: 'success', 
        message: 'تم استلام طلب بيع الحساب وحفظه بنجاح', 
        videoUrl: videoFinalUrl,
        submissionId: newId 
      });
    }

    // 2. موافقة ونشر حساب ببجي في الموقع (من لوحة الإدارة أو الشيت)
    if (action === 'approve_pubg_submission') {
      var submissionId = payload.submissionId;
      var subSheet = ss.getSheetByName('طلبات بيع الحسابات');
      var subData = subSheet.getDataRange().getValues();
      var targetRow = -1;
      var targetSub = null;

      for (var r = 1; r < subData.length; r++) {
        if (String(subData[r][0]) === String(submissionId)) {
          targetRow = r + 1;
          targetSub = subData[r];
          break;
        }
      }

      if (targetRow > 0 && targetSub) {
        // تحديث خانة الموافقة إلى 'نعم'
        subSheet.getRange(targetRow, 17).setValue('نعم');

        // التأكد من إضافة الحساب إلى شيت 'حسابات PUBG' المعروضة
        var accSheet = ss.getSheetByName('حسابات PUBG');
        var accData = accSheet.getDataRange().getValues();
        var existingAccRow = -1;

        for (var a = 1; a < accData.length; a++) {
          if (String(accData[a][0]) === String(submissionId)) {
            existingAccRow = a + 1;
            break;
          }
        }

        var featuresText = (targetSub[6] ? targetSub[6] + ' ميثيك, ' : '') + 
                           (targetSub[8] ? targetSub[8] + ', ' : '') + 
                           (targetSub[9] ? targetSub[9] + ' سيارات, ' : '') + 
                           'تسليم آمن ومضمون';

        var accRowValues = [
          submissionId,
          targetSub[3] || ('حساب PUBG لفل ' + targetSub[4]),
          'حساب موثق',
          'LVL ' + targetSub[4],
          Number(targetSub[12]) || 0,
          Math.round((Number(targetSub[12]) || 0) * 1.15),
          targetSub[5] || '',
          targetSub[6] || '',
          targetSub[7] || '',
          targetSub[8] || '',
          targetSub[9] || '',
          targetSub[10] || '',
          targetSub[11] || '',
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
          targetSub[15] || '', // رابط الفيديو من درايف
          featuresText,
          'نعم', // متاح
          'نعم', // عرض في الموقع
          targetSub[2] || '', // اسم البائع
          targetSub[13] || '' // هاتف البائع
        ];

        if (existingAccRow > 0) {
          accSheet.getRange(existingAccRow, 1, 1, accRowValues.length).setValues([accRowValues]);
        } else {
          accSheet.appendRow(accRowValues);
        }

        return createJsonResponse({ status: 'success', message: 'تمت الموافقة على الحساب ونشره في الموقع بنجاح' });
      }

      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على الطلب' });
    }

    // 3. رفض أو إلغاء نشر طلب الحساب
    if (action === 'reject_pubg_submission') {
      var subId = payload.submissionId;
      var sSheet = ss.getSheetByName('طلبات بيع الحسابات');
      var sData = sSheet.getDataRange().getValues();
      for (var sr = 1; sr < sData.length; sr++) {
        if (String(sData[sr][0]) === String(subId)) {
          sSheet.getRange(sr + 1, 17).setValue('مرفوض');
          break;
        }
      }

      var aSheet = ss.getSheetByName('حسابات PUBG');
      var aData = aSheet.getDataRange().getValues();
      for (var ar = 1; ar < aData.length; ar++) {
        if (String(aData[ar][0]) === String(subId)) {
          aSheet.deleteRow(ar + 1);
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم رفض الحساب وحذفه من العرض' });
    }

    // 4. إضافة منتج جديد
    if (action === 'add_product') {
      var p = payload.data;
      var pSheet = ss.getSheetByName('المنتجات');
      var prodId = p.id || 'prod-' + new Date().getTime();
      var prodImage = p.image || '';

      // رفع صورة المنتج إذا كانت Base64
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

      return createJsonResponse({ status: 'success', message: 'تمت إضافة المنتج إلى Google Sheets بنجاح', id: prodId, image: prodImage });
    }

    // 5. تعديل منتج
    if (action === 'update_product') {
      var up = payload.data;
      var upId = payload.id || up.id;
      var sheetProd = ss.getSheetByName('المنتجات');
      var pRows = sheetProd.getDataRange().getValues();
      var foundRow = -1;

      for (var pr = 1; pr < pRows.length; pr++) {
        if (String(pRows[pr][0]) === String(upId)) {
          foundRow = pr + 1;
          break;
        }
      }

      if (foundRow > 0) {
        var rowData = [
          upId,
          up.name || pRows[foundRow-1][1],
          up.category || pRows[foundRow-1][2],
          up.price !== undefined ? Number(up.price) : pRows[foundRow-1][3],
          up.oldPrice !== undefined ? Number(up.oldPrice) : pRows[foundRow-1][4],
          up.image || pRows[foundRow-1][5],
          up.tag !== undefined ? up.tag : pRows[foundRow-1][6],
          up.description !== undefined ? up.description : pRows[foundRow-1][7],
          up.inStock !== undefined ? (up.inStock ? 'نعم' : 'لا') : pRows[foundRow-1][8],
          up.featured !== undefined ? (up.featured ? 'نعم' : 'لا') : pRows[foundRow-1][9]
        ];
        sheetProd.getRange(foundRow, 1, 1, rowData.length).setValues([rowData]);
        return createJsonResponse({ status: 'success', message: 'تم تحديث بيانات المنتج في Google Sheets' });
      }
      return createJsonResponse({ status: 'error', message: 'المنتج غير موجود' });
    }

    // 6. حذف منتج
    if (action === 'delete_product') {
      var delId = payload.id;
      var delSheet = ss.getSheetByName('المنتجات');
      var dRows = delSheet.getDataRange().getValues();
      for (var dr = 1; dr < dRows.length; dr++) {
        if (String(dRows[dr][0]) === String(delId)) {
          delSheet.deleteRow(dr + 1);
          return createJsonResponse({ status: 'success', message: 'تم حذف المنتج من Google Sheets بنجاح' });
        }
      }
      return createJsonResponse({ status: 'error', message: 'لم يتم العثور على المنتج لحذفه' });
    }

    // 7. حذف حساب PUBG
    if (action === 'delete_pubg_account') {
      var delAccId = payload.id;
      var accS = ss.getSheetByName('حسابات PUBG');
      var aRows = accS.getDataRange().getValues();
      for (var ar2 = 1; ar2 < aRows.length; ar2++) {
        if (String(aRows[ar2][0]) === String(delAccId)) {
          accS.deleteRow(ar2 + 1);
          break;
        }
      }

      var subS = ss.getSheetByName('طلبات بيع الحسابات');
      var sRows2 = subS.getDataRange().getValues();
      for (var sr2 = 1; sr2 < sRows2.length; sr2++) {
        if (String(sRows2[sr2][0]) === String(delAccId)) {
          subS.deleteRow(sr2 + 1);
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم حذف الحساب بنجاح من Google Sheets' });
    }

    // 7.1 تعديل حساب PUBG
    if (action === 'update_pubg_account') {
      var uAccId = payload.id;
      var uAcc = payload.data;
      var accSheetU = ss.getSheetByName('حسابات PUBG');
      var accRowsU = accSheetU.getDataRange().getValues();
      for (var au = 1; au < accRowsU.length; au++) {
        if (String(accRowsU[au][0]) === String(uAccId)) {
          if (uAcc.price !== undefined) accSheetU.getRange(au + 1, 5).setValue(Number(uAcc.price));
          if (uAcc.title !== undefined) accSheetU.getRange(au + 1, 2).setValue(uAcc.title);
          if (uAcc.level !== undefined) accSheetU.getRange(au + 1, 4).setValue(uAcc.level);
          if (uAcc.isAvailable !== undefined) accSheetU.getRange(au + 1, 17).setValue(uAcc.isAvailable ? 'نعم' : 'لا');
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تعديل الحساب في Google Sheets' });
    }

    // 7.2 إضافة باقة شدات UC جديدة
    if (action === 'add_uc_package') {
      var ucP = payload.data;
      var ucSheetA = ss.getSheetByName('باقات الشدات UC');
      var ucId = ucP.id || 'uc-' + new Date().getTime();
      ucSheetA.appendRow([
        ucId,
        Number(ucP.ucAmount) || 0,
        Number(ucP.bonusUc) || 0,
        Number(ucP.price) || 0,
        ucP.tag || '',
        ucP.isPopular ? 'نعم' : 'لا'
      ]);
      return createJsonResponse({ status: 'success', message: 'تمت إضافة باقة الشدات إلى Google Sheets', id: ucId });
    }

    // 7.3 تعديل باقة شدات UC
    if (action === 'update_uc_package') {
      var ucUpId = payload.id;
      var ucUp = payload.data;
      var ucSheetU = ss.getSheetByName('باقات الشدات UC');
      var ucRowsU = ucSheetU.getDataRange().getValues();
      for (var ucr = 1; ucr < ucRowsU.length; ucr++) {
        if (String(ucRowsU[ucr][0]) === String(ucUpId)) {
          var updatedRow = [
            ucUpId,
            ucUp.ucAmount !== undefined ? Number(ucUp.ucAmount) : ucRowsU[ucr][1],
            ucUp.bonusUc !== undefined ? Number(ucUp.bonusUc) : ucRowsU[ucr][2],
            ucUp.price !== undefined ? Number(ucUp.price) : ucRowsU[ucr][3],
            ucUp.tag !== undefined ? ucUp.tag : ucRowsU[ucr][4],
            ucUp.isPopular !== undefined ? (ucUp.isPopular ? 'نعم' : 'لا') : ucRowsU[ucr][5]
          ];
          ucSheetU.getRange(ucr + 1, 1, 1, updatedRow.length).setValues([updatedRow]);
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم تحديث باقة الشدات في Google Sheets' });
    }

    // 7.4 حذف باقة شدات UC
    if (action === 'delete_uc_package') {
      var ucDelId = payload.id;
      var ucSheetD = ss.getSheetByName('باقات الشدات UC');
      var ucRowsD = ucSheetD.getDataRange().getValues();
      for (var ucd = 1; ucd < ucRowsD.length; ucd++) {
        if (String(ucRowsD[ucd][0]) === String(ucDelId)) {
          ucSheetD.deleteRow(ucd + 1);
          break;
        }
      }
      return createJsonResponse({ status: 'success', message: 'تم حذف باقة الشدات من Google Sheets' });
    }

    // 8. إضافة طلب شراء وارد
    if (action === 'submit_order') {
      var order = payload.data;
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
        'قيد الانتظار',
        JSON.stringify(order.items || [])
      ]);
      return createJsonResponse({ status: 'success', message: 'تم حفظ الطلب في Google Sheets' });
    }

    // 9. مزامنة كاملة للمتجر
    if (action === 'sync_all') {
      saveAllStoreData(ss, payload.data);
      return createJsonResponse({ status: 'success', message: 'تمت مزامنة كافة بيانات المتجر بنجاح' });
    }

    return createJsonResponse({ status: 'error', message: 'Action not handled' });
  } catch (err) {
    return createJsonResponse({ status: 'error', message: err.toString() });
  }
}

// دالة حفظ الملفات (فيديو / صور) في Google Drive وإنشاء رابط مباشر
function saveFileToGoogleDrive(base64Data, fileName, mimeType) {
  var folderName = 'RTG_GEARX_UPLOADS';
  var folders = DriveApp.getFoldersByName(folderName);
  var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  // إزالة الترويسة إذا كانت موجودة data:video/mp4;base64,...
  var cleanBase64 = base64Data;
  if (cleanBase64.indexOf(',') > -1) {
    cleanBase64 = cleanBase64.split(',')[1];
  }

  var decoded = Utilities.base64Decode(cleanBase64);
  var blob = Utilities.newBlob(decoded, mimeType || 'video/mp4', fileName || ('file_' + new Date().getTime()));
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  var fileId = file.getId();
  // روابط المشاهدة والتحميل المباشر
  var previewUrl = 'https://drive.google.com/file/d/' + fileId + '/preview';
  var directDownloadUrl = 'https://drive.google.com/uc?export=download&id=' + fileId;

  return {
    fileId: fileId,
    previewUrl: previewUrl,
    downloadUrl: directDownloadUrl
  };
}

// دالة جلب كافة بيانات المتجر
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

  // 2. حسابات ببجي المعروضة والموافق عليها فقط
  var accSheet = ss.getSheetByName('حسابات PUBG');
  var accData = accSheet.getDataRange().getValues();
  var pubgAccounts = [];
  for (var j = 1; j < accData.length; j++) {
    var a = accData[j];
    if (a[0] && a[1]) {
      var isAvailable = a[16] === 'لا' ? false : true;
      var isApproved = String(a[17]).trim() === 'نعم' || String(a[17]).trim() === 'Yes';
      
      // لا يظهر في المتجر إلا الحسابات التي وُضعت لها 'نعم'
      if (isApproved) {
        pubgAccounts.push({
          id: String(a[0]),
          title: String(a[1]),
          badge: String(a[2]),
          level: String(a[3]),
          price: Number(a[4]) || 0,
          oldPrice: a[5] ? Number(a[5]) : undefined,
          powerLevel: String(a[6] || ''),
          mythicsCount: String(a[7] || ''),
          goldenMythicsCount: String(a[8] || ''),
          upgradableWeaponsCount: String(a[9] || ''),
          carsCount: String(a[10] || ''),
          hashtagsCount: String(a[11] || ''),
          linkedAccounts: String(a[12] || ''),
          image: String(a[13] || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80'),
          videoUrl: String(a[14] || ''),
          features: a[15] ? String(a[15]).split(',').map(function(s){return s.trim();}) : [],
          isAvailable: isAvailable,
          approved: true,
          status: 'approved',
          sellerName: String(a[18] || ''),
          sellerPhone: String(a[19] || '')
        });
      }
    }
  }

  // 3. طلبات بيع الحسابات الواردة من الزوار
  var subSheet = ss.getSheetByName('طلبات بيع الحسابات');
  var subData = subSheet.getDataRange().getValues();
  var submissions = [];
  for (var k = 1; k < subData.length; k++) {
    var s = subData[k];
    if (s[0] && s[2]) {
      var approvalText = String(s[16]).trim();
      var approved = approvalText === 'نعم' || approvalText === 'Yes';
      var rejected = approvalText === 'مرفوض' || approvalText === 'Rejected';
      var status = approved ? 'approved' : (rejected ? 'rejected' : 'pending');

      var subObj = {
        id: String(s[0]),
        date: String(s[1]),
        fullName: String(s[2]),
        accountName: String(s[3]),
        accountLevel: String(s[4]),
        powerLevel: String(s[5] || ''),
        mythicsCount: String(s[6] || ''),
        goldenMythicsCount: String(s[7] || ''),
        upgradableWeapons: String(s[8] || ''),
        carsCount: String(s[9] || ''),
        hashtagsCount: String(s[10] || ''),
        linkedAccounts: String(s[11] || ''),
        salePrice: String(s[12] || ''),
        phone: String(s[13] || ''),
        transferPhone: String(s[14] || ''),
        videoUrl: String(s[15] || ''),
        status: status
      };
      submissions.push(subObj);

      // إذا كُتب 'نعم' في طلب البيع ولم يكن موجوداً في قائمة الحسابات المعروضة، نعرضه تلقائياً
      if (approved) {
        var alreadyInAcc = false;
        for (var m = 0; m < pubgAccounts.length; m++) {
          if (pubgAccounts[m].id === subObj.id) {
            alreadyInAcc = true;
            break;
          }
        }
        if (!alreadyInAcc) {
          pubgAccounts.push({
            id: subObj.id,
            title: subObj.accountName || ('حساب PUBG لفل ' + subObj.accountLevel),
            badge: 'حساب موثق',
            level: 'LVL ' + subObj.accountLevel,
            price: Number(subObj.salePrice) || 0,
            oldPrice: Math.round((Number(subObj.salePrice) || 0) * 1.15),
            powerLevel: subObj.powerLevel,
            mythicsCount: subObj.mythicsCount,
            goldenMythicsCount: subObj.goldenMythicsCount,
            upgradableWeaponsCount: subObj.upgradableWeapons,
            carsCount: subObj.carsCount,
            hashtagsCount: subObj.hashtagsCount,
            linkedAccounts: subObj.linkedAccounts,
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80',
            videoUrl: subObj.videoUrl,
            features: [subObj.mythicsCount ? subObj.mythicsCount + ' ميثيك' : 'حساب مميز', subObj.upgradableWeapons || 'أسلحة مطورة', 'تسليم آمن'],
            isAvailable: true,
            approved: true,
            status: 'approved',
            sellerName: subObj.fullName,
            sellerPhone: subObj.phone
          });
        }
      }
    }
  }

  // 4. باقات الشدات
  var ucSheet = ss.getSheetByName('باقات الشدات UC');
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
        tag: uc[4] ? String(uc[4]) : undefined,
        isPopular: uc[5] === 'نعم' ? true : false
      });
    }
  }

  return {
    products: products,
    pubgAccounts: pubgAccounts,
    pubgSubmissions: submissions,
    ucPackages: ucPackages
  };
}

// دالة حفظ ومزامنة كافة البيانات
function saveAllStoreData(ss, data) {
  if (data.products) {
    var pSheet = ss.getSheetByName('المنتجات');
    var pHeader = ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)'];
    var pRows = (data.products || []).map(function(p) {
      return [p.id, p.name, p.category, p.price, p.oldPrice || '', p.image, p.tag || '', p.description, p.inStock ? 'نعم' : 'لا', p.featured ? 'نعم' : 'لا'];
    });
    pSheet.clearContents();
    pSheet.getRange(1, 1, pRows.length + 1, pHeader.length).setValues([pHeader].concat(pRows));
  }

  if (data.pubgAccounts) {
    var aSheet = ss.getSheetByName('حسابات PUBG');
    var aHeader = ['المعرف (ID)', 'عنوان الحساب', 'الرتبة', 'المستوى', 'السعر (د.ل)', 'السعر القديم', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'أسلحة مطورة', 'سيارات', 'هاشتاجات', 'روابط الربط', 'رابط الصورة', 'رابط الفيديو', 'المميزات', 'متاح؟ (نعم/لا)', 'عرض في الموقع (نعم/لا)', 'اسم البائع', 'هاتف البائع'];
    var aRows = (data.pubgAccounts || []).map(function(a) {
      return [
        a.id, a.title, a.badge, a.level, a.price, a.oldPrice || '',
        a.powerLevel || '', a.mythicsCount || '', a.goldenMythicsCount || '',
        a.upgradableWeaponsCount || '', a.carsCount || '', a.hashtagsCount || '',
        a.linkedAccounts || '', a.image, a.videoUrl || '',
        (a.features || []).join(', '),
        a.isAvailable ? 'نعم' : 'لا',
        a.approved ? 'نعم' : 'لا',
        a.sellerName || '', a.sellerPhone || ''
      ];
    });
    aSheet.clearContents();
    aSheet.getRange(1, 1, aRows.length + 1, aHeader.length).setValues([aHeader].concat(aRows));
  }
}

// دالة التأكد من وجود وتجهيز جميع الصفحات
function setupSheetsIfMissing(ss) {
  var requiredSheets = [
    {
      name: 'المنتجات',
      headers: ['المعرف (ID)', 'اسم المنتج', 'التصنيف', 'السعر (د.ل)', 'السعر القديم', 'رابط الصورة', 'الشارة (Tag)', 'الوصف', 'متوفر؟ (نعم/لا)', 'مميز؟ (نعم/لا)']
    },
    {
      name: 'حسابات PUBG',
      headers: ['المعرف (ID)', 'عنوان الحساب', 'الرتبة', 'المستوى', 'السعر (د.ل)', 'السعر القديم', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'أسلحة مطورة', 'سيارات', 'هاشتاجات', 'روابط الربط', 'رابط الصورة', 'رابط الفيديو', 'المميزات', 'متاح؟ (نعم/لا)', 'عرض في الموقع (نعم/لا)', 'اسم البائع', 'هاتف البائع']
    },
    {
      name: 'طلبات بيع الحسابات',
      headers: ['المعرف (ID)', 'تاريخ التقديم', 'الاسم الثلاثي', 'اسم الحساب', 'المستوى', 'مستوى القوة', 'ميثيك عادي', 'ميثيك ذهبي', 'الأسلحة المطورة', 'السيارات', 'الهاشتاجات', 'روابط الربط', 'السعر المطلوب', 'رقم الهاتف', 'الرقم المحول منه 5 ليرات', 'رابط الفيديو', 'الموافقة والنشر (نعم/لا)']
    },
    {
      name: 'باقات الشدات UC',
      headers: ['المعرف (ID)', 'الشدات الأساسية', 'البونص', 'السعر (د.ل)', 'الشارة (Tag)', 'شائع؟ (نعم/لا)']
    },
    {
      name: 'الطلبات الواردة',
      headers: ['رقم الطلب', 'التاريخ', 'نوع الطلب', 'اسم العميل', 'رقم الهاتف', 'المدينة', 'المنطقة', 'طريقة الدفع', 'الإجمالي', 'الحالة', 'تفاصيل العناصر']
    }
  ];

  requiredSheets.forEach(function(sInfo) {
    var sheet = ss.getSheetByName(sInfo.name);
    if (!sheet) {
      sheet = ss.insertSheet(sInfo.name);
      sheet.appendRow(sInfo.headers);
      sheet.setFrozenRows(1);
    }
  });
}

function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export class AppsScriptService {
  public static getConfig(): AppsScriptConfig {
    try {
      const saved = localStorage.getItem(APPS_SCRIPT_CONFIG_KEY);
      return saved
        ? JSON.parse(saved)
        : { webAppUrl: '', autoFetchOnLoad: true, lastSyncedAt: null };
    } catch {
      return { webAppUrl: '', autoFetchOnLoad: true, lastSyncedAt: null };
    }
  }

  public static saveConfig(config: Partial<AppsScriptConfig>): AppsScriptConfig {
    const current = this.getConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(APPS_SCRIPT_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  }

  /**
   * Helper to send JSON payload via POST (fallback no-cors / normal fetch)
   */
  private static async sendPost(webAppUrl: string, body: any): Promise<any> {
    if (!webAppUrl || !webAppUrl.trim()) return null;
    const cleanUrl = webAppUrl.trim();

    try {
      const res = await fetch(cleanUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', // avoid preflight OPTIONS issues in Apps Script
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
      // If CORS blocks response, fire no-cors to guarantee Google Apps Script receives the execution
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
   * Fetch all store items live from Google Apps Script Web App
   */
  public static async fetchStoreData(webAppUrl: string): Promise<{
    products: Product[];
    pubgAccounts: PubgAccount[];
    pubgSubmissions: PubgSellSubmission[];
    ucPackages: UcPackage[];
  }> {
    if (!webAppUrl || !webAppUrl.trim()) {
      throw new Error('يرجى إدخال رابط Google Apps Script Web App أولاً');
    }

    const cleanUrl = webAppUrl.trim();
    const url = cleanUrl.includes('?') ? `${cleanUrl}&action=get_all` : `${cleanUrl}?action=get_all`;

    const res = await fetch(url, {
      method: 'GET',
    });

    if (!res.ok) {
      throw new Error(`تعذر الاتصال بـ Google Apps Script (${res.status})`);
    }

    const result = await res.json();
    if (result.status !== 'success' || !result.data) {
      throw new Error(result.message || 'فشل جلب البيانات من Google Sheets');
    }

    this.saveConfig({ lastSyncedAt: new Date().toLocaleString('ar-LY') });
    return result.data;
  }

  /**
   * Submit a new PUBG Sell Request with Video Upload to Google Drive
   */
  public static async submitPubgSellAccount(
    webAppUrl: string,
    submission: PubgSellSubmission
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'submit_pubg_account',
      data: submission,
    });
    return true;
  }

  /**
   * Approve a PUBG Submission in Google Sheet & Publish to Site
   */
  public static async approvePubgSubmission(webAppUrl: string, submissionId: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'approve_pubg_submission',
      submissionId,
    });
    return true;
  }

  /**
   * Reject a PUBG Submission
   */
  public static async rejectPubgSubmission(webAppUrl: string, submissionId: string): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'reject_pubg_submission',
      submissionId,
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
   * Update a PUBG account in Google Sheets
   */
  public static async updatePubgAccount(webAppUrl: string, id: string, account: Partial<PubgAccount>): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) return false;

    await this.sendPost(webAppUrl, {
      action: 'update_pubg_account',
      id,
      data: account,
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
   * Delete a PUBG account from Google Sheets
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
   * Sync all products and accounts to Google Sheets via Web App
   */
  public static async syncAllData(
    webAppUrl: string,
    data: {
      products: Product[];
      pubgAccounts: PubgAccount[];
    }
  ): Promise<boolean> {
    if (!webAppUrl || !webAppUrl.trim()) {
      throw new Error('يرجى تحديد رابط Google Apps Script Web App');
    }

    try {
      await this.sendPost(webAppUrl, {
        action: 'sync_all',
        data,
      });

      this.saveConfig({ lastSyncedAt: new Date().toLocaleString('ar-LY') });
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'فشل مزامنة البيانات مع Google Apps Script');
    }
  }
}
