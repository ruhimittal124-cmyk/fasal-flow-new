import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MapPin, 
  ShieldCheck, 
  Star, 
  PhoneCall, 
  Send, 
  Truck, 
  Sparkles, 
  CheckCircle, 
  X, 
  PlusCircle, 
  History 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropLot, CropType } from '../types';
import { LotHistoryTrackerModal } from '../components/LotHistoryTrackerModal';

interface BrowseLotsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const BrowseLotsView: React.FC<BrowseLotsViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { lots, currentUser, createOffer, openCallModal, addToast } = useApp();

  const [selectedCrop, setSelectedCrop] = useState<string>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLotForHistory, setSelectedLotForHistory] = useState<string | null>(null);

  // Bid Modal
  const [bidLot, setBidLot] = useState<CropLot | null>(null);
  const [bidPrice, setBidPrice] = useState<number>(0);
  const [bidQuantity, setBidQuantity] = useState<number>(0);
  const [bidNotes, setBidNotes] = useState<string>('');

  const filteredLots = lots.filter((lot) => {
    const matchesCrop = selectedCrop === 'All' || lot.crop === selectedCrop;
    const matchesDistrict = selectedDistrict === 'All' || lot.sellerDistrict === selectedDistrict;
    const matchesSearch =
      lot.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.variety.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.sellerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.sellerDistrict.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCrop && matchesDistrict && matchesSearch;
  });

  const handleOpenBid = (lot: CropLot) => {
    setBidLot(lot);
    setBidPrice(lot.askingPricePerQuintal);
    setBidQuantity(lot.quantityQuintals);
    setBidNotes('Payment within 24 hours of moisture testing upon delivery.');
  };

  const handleSendOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bidLot || !bidPrice || !bidQuantity) return;

    createOffer({
      lotId: bidLot.id,
      crop: bidLot.crop,
      buyerId: currentUser?.id || 'user-buyer-1',
      buyerName: currentUser?.name || 'Shree Ganesh Agro Processing',
      buyerDistrict: currentUser?.district || 'Latur',
      buyerPhone: currentUser?.phone || '+91 94220 88990',
      offeredPricePerQuintal: Number(bidPrice),
      quantityQuintals: Number(bidQuantity),
      totalAmount: Number(bidPrice) * Number(bidQuantity),
      notes: bidNotes,
    });

    addToast({
      type: 'success',
      title: 'Offer Dispatched',
      message: `Your bid of ₹${bidPrice}/q for ${bidQuantity}q has been sent to ${bidLot.sellerName}.`,
    });

    setBidLot(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {t('browseLots.title', 'Explore Active Harvest Lots')}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              {filteredLots.length} {t('stats.activeLots', 'Active Lots')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('browseLots.subtitle', 'Buy directly from verified farmers and FPOs with AI quality certificates and transparent pricing.')}
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('create-lot')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center space-x-1.5 self-start md:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('hero.ctaCreateLot', 'Post Your Harvest')}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('browseLots.searchPlaceholder', 'Search crop, variety, or farmer...')}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Commodity Filter */}
        <div>
          <select
            value={selectedCrop}
            onChange={(e) => setSelectedCrop(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
          >
            <option value="All">{t('browseLots.allCrops', 'All Crops')}</option>
            <option value="Soybean">{t('crops.Soybean', 'Soybean')}</option>
            <option value="Tur">{t('crops.Tur', 'Tur / Arhar')}</option>
            <option value="Cotton">{t('crops.Cotton', 'Cotton')}</option>
            <option value="Onion">{t('crops.Onion', 'Onion')}</option>
            <option value="Wheat">{t('crops.Wheat', 'Wheat')}</option>
            <option value="Chana">{t('crops.Gram', 'Chana')}</option>
          </select>
        </div>

        {/* District Filter */}
        <div>
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold text-slate-700"
          >
            <option value="All">{t('browseLots.allDistricts', 'All Districts')}</option>
            <option value="Osmanabad">Osmanabad / Dharashiv</option>
            <option value="Latur">Latur</option>
            <option value="Solapur">Solapur</option>
            <option value="Nashik">Nashik</option>
            <option value="Pune">Pune</option>
            <option value="Jalgaon">Jalgaon</option>
          </select>
        </div>

      </div>

      {/* Crop Lots Grid */}
      {filteredLots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <ShoppingBag className="w-10 h-10 mx-auto text-slate-400" />
          <p className="font-bold text-slate-800 text-base">{t('browseLots.noLotsFound', 'No active harvest lots matched your query')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLots.map((lot) => (
            <div
              key={lot.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Photo & Badge */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={lot.photos[0] || 'https://images.unsplash.com/photo-1599583718211-09439fcf499f?auto=format&fit=crop&q=80&w=800'}
                    alt={lot.crop}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-950/80 backdrop-blur-xs text-white">
                      {lot.crop}
                    </span>
                    <span className="px-2 py-1 rounded-md text-xs font-bold bg-emerald-600 text-white">
                      {lot.grade}
                    </span>
                  </div>

                  {lot.bestOfferPrice && (
                    <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[11px] font-extrabold shadow-sm">
                      Top Bid: ₹{lot.bestOfferPrice}/q
                    </div>
                  )}
                </div>

                {/* Body Details */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">{lot.variety}</h3>
                    <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lot.sellerDistrict}, Maharashtra</span>
                    </p>
                  </div>

                  {/* Quantity & Price */}
                  <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('browseLots.quantity', 'Quantity')}</span>
                      <p className="font-black text-slate-900 text-sm">{lot.quantityQuintals} {t('common.quintal', 'Quintals')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-semibold uppercase">{t('browseLots.askingPrice', 'Asking Rate')}</span>
                      <p className="font-black text-emerald-700 text-lg">₹{lot.askingPricePerQuintal.toLocaleString('en-IN')}<span className="text-xs font-normal text-slate-500">/q</span></p>
                    </div>
                  </div>

                  {/* AI Quality Attributes */}
                  <div className="text-xs space-y-1 text-slate-600 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100">
                    <div className="flex justify-between">
                      <span>{t('browseLots.moisture', 'Moisture')}: <strong>{lot.moisturePercent || 10.5}%</strong></span>
                      <span>{t('browseLots.purity', 'Purity')}: <strong>{lot.purityPercent || 98.2}%</strong></span>
                    </div>
                    {lot.aiNotes && (
                      <p className="text-[11px] text-slate-500 italic line-clamp-1">"{lot.aiNotes}"</p>
                    )}
                  </div>

                  {/* Farmer Info */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-semibold text-slate-800">{lot.sellerName}</span>
                      {lot.sellerIsKyc && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <div className="flex items-center space-x-0.5 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{lot.sellerRating || 4.8}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center space-x-2">
                <button
                  onClick={() => handleOpenBid(lot)}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('browseLots.placeBid', 'Send Offer')}</span>
                </button>

                <button
                  onClick={() => setSelectedLotForHistory(lot.id)}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title={t('browseLots.viewHistory', 'View Complete Lot History')}
                >
                  <History className="w-4 h-4 text-emerald-700" />
                </button>

                <button
                  onClick={() =>
                    openCallModal({
                      targetName: lot.sellerName,
                      targetRole: 'Farmer',
                      targetPhone: lot.sellerPhone || '+91 98221 45678',
                      lotCrop: lot.crop,
                      lotGrade: lot.grade,
                    })
                  }
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title={t('browseLots.callFarmer', 'Direct Secure Call')}
                >
                  <PhoneCall className="w-4 h-4 text-emerald-600" />
                </button>

                <button
                  onClick={() => setCurrentTab('transport')}
                  className="p-2.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title={t('nav.transport', 'Estimate Transport')}
                >
                  <Truck className="w-4 h-4 text-slate-600" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Offer / Bid Modal */}
      {bidLot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {t('browseLots.makeOfferTitle', 'Send Direct Purchase Offer')}
                </h3>
                <p className="text-xs text-slate-500">{bidLot.crop} • {bidLot.variety} ({bidLot.sellerName})</p>
              </div>
              <button onClick={() => setBidLot(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendOffer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('browseLots.offeredPrice', 'Your Offered Price (₹ / Quintal)')}
                </label>
                <input
                  type="number"
                  min="100"
                  step="25"
                  value={bidPrice}
                  onChange={(e) => setBidPrice(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-800 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">{t('browseLots.askingPrice', 'Asking')}: ₹{bidLot.askingPricePerQuintal}/q</p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  {t('browseLots.offeredQuantity', 'Quantity (Quintals)')}
                </label>
                <input
                  type="number"
                  min="1"
                  max={bidLot.quantityQuintals}
                  value={bidQuantity}
                  onChange={(e) => setBidQuantity(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Total Calculation */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Gross Crop Deal:</span>
                  <span className="font-bold text-slate-900">₹{(bidPrice * bidQuantity).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{t('hero.flatFee', 'Buyer Platform Fee (1%)')}:</span>
                  <span>₹{Math.round(bidPrice * bidQuantity * 0.01).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBidLot(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {t('browseLots.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('browseLots.sendOfferBtn', 'Submit Bid to Farmer')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lot History & Audit Tracker Modal */}
      <LotHistoryTrackerModal
        lotId={selectedLotForHistory}
        isOpen={!!selectedLotForHistory}
        onClose={() => setSelectedLotForHistory(null)}
        currentUserRole={currentUser?.role || 'buyer'}
        currentUserId={currentUser?.id}
        currentUserName={currentUser?.name}
      />

    </div>
  );
};

export default BrowseLotsView;
