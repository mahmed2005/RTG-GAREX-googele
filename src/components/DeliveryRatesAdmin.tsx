import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import { DeliveryCityRate } from '../types';
import { DELIVERY_ZONES } from '../data/deliveryData';
import { soundEngine } from '../utils/soundEngine';
import { 
  Truck, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RotateCcw, 
  Save, 
  Clock, 
  MapPin, 
  Layers, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Coins, 
  TrendingUp, 
  RefreshCw,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const DeliveryRatesAdmin: React.FC = () => {
  const { 
    deliveryRates, 
    addDeliveryRate, 
    updateDeliveryRate, 
    deleteDeliveryRate, 
    resetDeliveryRates,
    syncDeliveryRatesToSheets
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZoneFilter, setSelectedZoneFilter] = useState('all');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Rate Form State
  const [newRateForm, setNewRateForm] = useState<Omit<DeliveryCityRate, 'id'>>({
    name: '',
    price: 25,
    priceDisplay: '25 د.ل',
    zoneId: 'tripoli_suburbs',
    zoneName: 'ضواحي طرابلس',
    estimatedTime: '24 - 48 ساعة'
  });

  // Inline Edit State
  const [editFormData, setEditFormData] = useState<Partial<DeliveryCityRate>>({});

  // Confirmation Modals
  const [rateToDelete, setRateToDelete] = useState<DeliveryCityRate | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => {
      setToastMsg(null);
    }, 4000);
  };

  // Filtered Delivery Rates
  const filteredRates = useMemo(() => {
    return deliveryRates.filter((rate) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        rate.name.toLowerCase().includes(q) ||
        rate.zoneName.toLowerCase().includes(q) ||
        rate.priceDisplay.toLowerCase().includes(q) ||
        String(rate.price).includes(q);

      const matchesZone =
        selectedZoneFilter === 'all' || rate.zoneId === selectedZoneFilter;

      return matchesSearch && matchesZone;
    });
  }, [deliveryRates, searchQuery, selectedZoneFilter]);

  // Statistics
  const stats = useMemo(() => {
    if (deliveryRates.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    const prices = deliveryRates.map((r) => r.price || 0);
    const sum = prices.reduce((a, b) => a + b, 0);
    return {
      count: deliveryRates.length,
      avg: Math.round(sum / deliveryRates.length),
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [deliveryRates]);

  // Handle Add Submit
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRateForm.name.trim()) {
      showToast('error', 'يرجى إدخال اسم المدينة أو المنطقة');
      return;
    }

    const priceNum = Number(newRateForm.price) || 0;
    const finalPriceDisplay = newRateForm.priceDisplay?.trim() || `${priceNum} د.ل`;

    // Find zone name from zoneId if not set
    const matchedZone = DELIVERY_ZONES.find(z => z.id === newRateForm.zoneId);
    const finalZoneName = newRateForm.zoneName || matchedZone?.name || 'منطقة أخرى';

    await addDeliveryRate({
      name: newRateForm.name.trim(),
      price: priceNum,
      priceDisplay: finalPriceDisplay,
      zoneId: newRateForm.zoneId || 'other_zone',
      zoneName: finalZoneName,
      estimatedTime: newRateForm.estimatedTime || '24 - 48 ساعة'
    });

    setNewRateForm({
      name: '',
      price: 25,
      priceDisplay: '25 د.ل',
      zoneId: 'tripoli_suburbs',
      zoneName: 'ضواحي طرابلس',
      estimatedTime: '24 - 48 ساعة'
    });
    setIsAddingNew(false);
    showToast('success', `تمت إضافة مدينة "${newRateForm.name}" وتحديث الأسعار بنجاح!`);
  };

  // Start Inline Edit
  const startEdit = (rate: DeliveryCityRate) => {
    soundEngine.playButtonClick();
    setEditingId(rate.id);
    setEditFormData({
      name: rate.name,
      price: rate.price,
      priceDisplay: rate.priceDisplay,
      zoneId: rate.zoneId,
      zoneName: rate.zoneName,
      estimatedTime: rate.estimatedTime
    });
  };

  // Save Inline Edit
  const saveEdit = async (id: string) => {
    soundEngine.playSuccessSound();
    const priceNum = editFormData.price !== undefined ? Number(editFormData.price) : undefined;
    const priceDisplay = editFormData.priceDisplay || (priceNum !== undefined ? `${priceNum} د.ل` : undefined);
    
    // update zone name if zoneId changed
    let zoneName = editFormData.zoneName;
    if (editFormData.zoneId) {
      const z = DELIVERY_ZONES.find(zone => zone.id === editFormData.zoneId);
      if (z) zoneName = z.name;
    }

    await updateDeliveryRate(id, {
      ...editFormData,
      price: priceNum,
      priceDisplay,
      zoneName
    });

    setEditingId(null);
    setEditFormData({});
    showToast('success', 'تم حفظ وتحديث سعر التوصيل بنجاح!');
  };

  // Cancel Inline Edit
  const cancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  // Confirm Delete
  const confirmDeleteRate = async () => {
    if (!rateToDelete) return;
    soundEngine.playButtonClick();
    await deleteDeliveryRate(rateToDelete.id);
    showToast('success', `تم حذف "${rateToDelete.name}" من قائمة التوصيل بنجاح!`);
    setRateToDelete(null);
  };

  // Sync to Google Sheets
  const handleSyncToSheets = async () => {
    try {
      setIsSyncingSheets(true);
      soundEngine.playButtonClick();
      const ok = await syncDeliveryRatesToSheets();
      if (ok) {
        soundEngine.playSuccessSound();
        showToast('success', 'تمت مزامنة وحفظ جميع أسعار التوصيل في Google Sheets بنجاح!');
      } else {
        showToast('error', 'يرجى التأكد من ربط رابط Google Apps Script أولاً في تبويب "كود Apps Script"');
      }
    } catch (e: any) {
      showToast('error', e.message || 'حدث خطأ أثناء المزامنة مع Google Sheets');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  // Reset to Defaults
  const handleResetDefaults = async () => {
    await resetDeliveryRates();
    setShowResetConfirm(false);
    soundEngine.playSuccessSound();
    showToast('success', 'تمت استعادة أسعار التوصيل الافتراضية بنجاح!');
  };

  return (
    <div className="space-y-6 text-right font-['Cairo',sans-serif]">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 text-xs sm:text-sm font-bold shadow-xl animate-fadeIn ${
            toastMsg.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/15 border-red-500/30 text-red-300'
          }`}
        >
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#12141e] border border-white/10 p-5 sm:p-6 rounded-3xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>إدارة وتعديل أسعار التوصيل</span>
                <span className="px-2 py-0.5 rounded-lg bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-mono">
                  {deliveryRates.length} مدينة
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                التحكم الكامل بأسعار التوصيل لكل مدينة ومنطقة مع مزامنة فورية في Google Sheets والموقع
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleSyncToSheets}
            disabled={isSyncingSheets}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin text-emerald-400' : ''}`} />
            <span>{isSyncingSheets ? 'جاري الحفظ...' : 'حفظ ومزامنة مع Google Sheet'}</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playButtonClick();
              setIsAddingNew(!isAddingNew);
            }}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-red-950/60"
          >
            {isAddingNew ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isAddingNew ? 'إلغاء' : 'إضافة مدينة / سعر جديد'}</span>
          </button>
        </div>
      </div>

      {/* KPI / Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#151824] border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>إجمالي المناطق</span>
            <MapPin className="w-4 h-4 text-red-400" />
          </div>
          <p className="text-xl font-black text-white font-mono">{stats.count}</p>
        </div>

        <div className="bg-[#151824] border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>متوسط سعر التوصيل</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-xl font-black text-amber-400 font-mono">{stats.avg} <span className="text-xs font-sans text-slate-400">د.ل</span></p>
        </div>

        <div className="bg-[#151824] border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>أقل سعر (داخل طرابلس)</span>
            <Coins className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">{stats.min} <span className="text-xs font-sans text-slate-400">د.ل</span></p>
        </div>

        <div className="bg-[#151824] border border-white/10 p-4 rounded-2xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>أعلى سعر (الجنوب وأقصى الشرق)</span>
            <Truck className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-xl font-black text-rose-400 font-mono">{stats.max} <span className="text-xs font-sans text-slate-400">د.ل</span></p>
        </div>
      </div>

      {/* Add New Rate Form */}
      {isAddingNew && (
        <form 
          onSubmit={handleAddSubmit}
          className="bg-[#151824] border border-red-500/30 rounded-3xl p-6 shadow-2xl space-y-5 animate-fadeIn"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-red-500" />
              <span>إضافة مدينة أو منطقة توصيل جديدة</span>
            </h3>
            <span className="text-xs text-slate-400">سيتم الحفظ محلياً وفي Google Sheets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* City Name */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                اسم المدينة / المنطقة <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={newRateForm.name}
                onChange={(e) => setNewRateForm({ ...newRateForm, name: e.target.value })}
                placeholder="مثال: صبراتة، سوق الجمعة، البيضاء"
                className="w-full bg-[#1c2030] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
              />
            </div>

            {/* Price (LYD) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                سعر التوصيل (دينار ليبي) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                min="0"
                step="1"
                value={newRateForm.price}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setNewRateForm({ 
                    ...newRateForm, 
                    price: val,
                    priceDisplay: `${val} د.ل`
                  });
                }}
                placeholder="25"
                className="w-full bg-[#1c2030] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none font-mono"
              />
            </div>

            {/* Price Display Text */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                النص الظاهر للسعر
              </label>
              <input
                type="text"
                value={newRateForm.priceDisplay}
                onChange={(e) => setNewRateForm({ ...newRateForm, priceDisplay: e.target.value })}
                placeholder="25 د.ل"
                className="w-full bg-[#1c2030] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
              />
            </div>

            {/* Zone Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">
                المنطقة الجغرافية
              </label>
              <select
                value={newRateForm.zoneId}
                onChange={(e) => {
                  const selected = DELIVERY_ZONES.find(z => z.id === e.target.value);
                  setNewRateForm({
                    ...newRateForm,
                    zoneId: e.target.value,
                    zoneName: selected ? selected.name : newRateForm.zoneName
                  });
                }}
                className="w-full bg-[#1c2030] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
              >
                {DELIVERY_ZONES.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.name} ({zone.priceDisplay})
                  </option>
                ))}
              </select>
            </div>

            {/* Estimated Delivery Time */}
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-xs font-bold text-slate-300">
                المدة المتوقعة للتوصيل
              </label>
              <input
                type="text"
                value={newRateForm.estimatedTime}
                onChange={(e) => setNewRateForm({ ...newRateForm, estimatedTime: e.target.value })}
                placeholder="خلال 24 ساعة، أو 24 - 48 ساعة"
                className="w-full bg-[#1c2030] border border-white/10 focus:border-red-500 rounded-xl px-4 py-2.5 text-white text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-lg shadow-red-950/60"
            >
              <Save className="w-4 h-4" />
              <span>إضافة وحفظ المدينة</span>
            </button>
          </div>
        </form>
      )}

      {/* Search and Filters Controls */}
      <div className="bg-[#12141e] border border-white/10 p-4 rounded-3xl space-y-3 shadow-lg">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن مدينة، منطقة، أو سعر (مثال: طرابلس، الزاوية، 25)..."
              className="w-full bg-[#181b28] border border-white/10 focus:border-red-500 focus:ring-1 focus:ring-red-500 rounded-2xl py-3 pl-4 pr-11 text-white text-xs outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-white bg-white/10 px-2 py-0.5 rounded-lg"
              >
                مسح
              </button>
            )}
          </div>

          {/* Reset Defaults Button */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="w-full sm:w-auto px-4 py-3 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>استعادة القائمة الافتراضية</span>
          </button>
        </div>

        {/* Zone Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar pt-2 border-t border-white/5">
          <button
            onClick={() => setSelectedZoneFilter('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
              selectedZoneFilter === 'all'
                ? 'bg-red-600 text-white'
                : 'bg-white/5 text-slate-400 hover:text-white border border-white/5'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>الكل ({deliveryRates.length})</span>
          </button>

          {DELIVERY_ZONES.map((zone) => {
            const count = deliveryRates.filter((r) => r.zoneId === zone.id).length;
            const isSelected = selectedZoneFilter === zone.id;
            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZoneFilter(zone.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                  isSelected
                    ? `${zone.badgeColor} border-current shadow-md`
                    : 'bg-white/5 text-slate-400 hover:text-white border-white/5'
                }`}
              >
                <span>{zone.name}</span>
                <span className="mr-1 opacity-70 font-mono text-[10px]">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Delivery Rates Table / Grid */}
      <div className="bg-[#12141e] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-[#151824] border-b border-white/10 flex items-center justify-between">
          <div className="text-xs text-slate-400">
            عرض <strong className="text-white font-mono">{filteredRates.length}</strong> من إجمالي <strong className="text-white font-mono">{deliveryRates.length}</strong> مدينة ومنطقة
          </div>
          {searchQuery && (
            <span className="text-xs text-red-400 font-bold">
              تصفية حسب: "{searchQuery}"
            </span>
          )}
        </div>

        {filteredRates.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Truck className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">لم يتم العثور على أي مدينة مطابقة</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              جرب تغيير كلمة البحث أو الضغط على "عرض الكل" أو إضافة مدينة جديدة.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredRates.map((rate) => {
              const isEditing = editingId === rate.id;

              return (
                <div
                  key={rate.id}
                  className={`p-4 sm:p-5 transition-all hover:bg-white/[0.02] ${
                    isEditing ? 'bg-red-950/20 border-y border-red-500/30' : ''
                  }`}
                >
                  {isEditing ? (
                    /* Inline Editing Mode */
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">اسم المدينة</label>
                          <input
                            type="text"
                            value={editFormData.name || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                            className="w-full bg-[#1c2030] border border-red-500/50 rounded-xl px-3 py-2 text-white text-xs outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">السعر (د.ل)</label>
                          <input
                            type="number"
                            value={editFormData.price !== undefined ? editFormData.price : rate.price}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setEditFormData({ 
                                ...editFormData, 
                                price: val,
                                priceDisplay: `${val} د.ل`
                              });
                            }}
                            className="w-full bg-[#1c2030] border border-red-500/50 rounded-xl px-3 py-2 text-white text-xs outline-none font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">المنطقة الجغرافية</label>
                          <select
                            value={editFormData.zoneId || rate.zoneId}
                            onChange={(e) => setEditFormData({ ...editFormData, zoneId: e.target.value })}
                            className="w-full bg-[#1c2030] border border-red-500/50 rounded-xl px-3 py-2 text-white text-xs outline-none"
                          >
                            {DELIVERY_ZONES.map((z) => (
                              <option key={z.id} value={z.id}>
                                {z.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1">مدة التوصيل</label>
                          <input
                            type="text"
                            value={editFormData.estimatedTime || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, estimatedTime: e.target.value })}
                            placeholder="مثال: 24 ساعة"
                            className="w-full bg-[#1c2030] border border-red-500/50 rounded-xl px-3 py-2 text-white text-xs outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="px-4 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>إلغاء</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => saveEdit(rate.id)}
                          className="px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shadow-md"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>حفظ التعديل</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Display Mode */
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <MapPin className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <h4 className="text-sm font-bold text-white">
                            {rate.name}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 text-[11px]">
                            {rate.zoneName}
                          </span>
                        </div>

                        {rate.estimatedTime && (
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 pr-6">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>المدة المتوقعة: {rate.estimatedTime}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Price Badge */}
                        <div className="text-left">
                          <span className="px-3.5 py-1.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-400 font-mono font-bold text-sm tracking-tight inline-block">
                            {rate.priceDisplay || `${rate.price} د.ل`}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => startEdit(rate)}
                            title="تعديل السعر والبيانات"
                            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-colors"
                          >
                            <Edit3 className="w-4 h-4 text-amber-400" />
                          </button>

                          <button
                            onClick={() => setRateToDelete(rate)}
                            title="حذف المدينة"
                            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {rateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151824] border border-red-500/40 rounded-3xl p-6 max-w-md w-full text-right shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-400 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">تأكيد حذف منطقة التوصيل</h3>
                <p className="text-xs text-slate-400">هذا الإجراء سيحذف المدينة من القائمة وجوجل شيت</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف مدينة <strong className="text-white">"{rateToDelete.name}"</strong> بسعر <strong className="text-red-400 font-mono">{rateToDelete.priceDisplay}</strong>؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setRateToDelete(null)}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={confirmDeleteRate}
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، تأكيد الحذف</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#151824] border border-amber-500/40 rounded-3xl p-6 max-w-md w-full text-right shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400 pb-3 border-b border-white/10">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <RotateCcw className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">استعادة أسعار التوصيل الافتراضية</h3>
                <p className="text-xs text-slate-400">إعادة تعيين جدول التوصيل لجميع المدن الليبية</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              سيتم استبدال القائمة الحالية بالجدول الافتراضي الشامل لشركة درب السبيل (طرابلس، بنغازي، مصراتة، الزاوية، وكل المناطق). هل تريد المتابعة؟
            </p>

            <div className="flex items-center justify-end gap-3 pt-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-bold transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleResetDefaults}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>تأكيد الاستعادة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
