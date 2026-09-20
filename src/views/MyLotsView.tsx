import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Sprout, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  PhoneCall, 
  DollarSign, 
  PlusCircle, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Printer, 
  ReceiptText, 
  History 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Offer } from '../types';
import { LotHistoryTrackerModal } from '../components/LotHistoryTrackerModal';

interface MyLotsViewProps {
  setCurrentTab: (tab: string) => void;
}

export const MyLotsView: React.FC<MyLotsViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { lots, deleteLot, offers, acceptOffer, rejectOffer, counterOffer, openCallModal, currentUser } = useApp();
  const [counteringOfferId, setCounteringOfferId] = useState<string | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState<number>(0);
  const [selectedLotForHistory, setSelectedLotForHistory] = useState<string | null>(null);

  // Lots published by current user
  const userLots = lots.filter(l => l.sellerId === (currentUser?.id || 'user-farmer-1'));

  const handleStartCounter = (offer: Offer) => {
    setCounteringOfferId(offer.id);
    setCounterPriceInput(offer.offeredPricePerQuintal + 100);
  };

  const handleApplyCounter = (offerId: string) => {
    if (!counterPriceInput) return;
    counterOffer(offerId, counterPriceInput);
    setCounteringOfferId(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t('myLots.title', 'My Listed Produce & Negotiation Room')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('myLots.subtitle', 'Manage your harvest listings, review incoming mill bids, and lock deals directly.')}
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('create-lot')}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-xs flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{t('myLots.addNewLot', 'Add New Harvest Lot')}</span>
        </button>
      </div>

      {userLots.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <Sprout className="w-10 h-10 mx-auto text-slate-400" />
          <h3 className="font-bold text-slate-800 text-base">{t('myLots.noLots', 'No active harvest listings yet')}</h3>
          <p className="text-xs text-slate-500">{t('myLots.noLotsDesc', 'Post your crop lot to start receiving instant bids from mills and buyers.')}</p>
          <button
            onClick={() => setCurrentTab('create-lot')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs cursor-pointer"
          >
            {t('myLots.createFirst', 'Create Your First Listing')}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {userLots.map((lot) => {
            // Find offers for this lot
            const lotOffers = offers.filter(o => o.lotId === lot.id);

            return (
              <div
                key={lot.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4"
              >
                {/* Lot Header Bar */}
                <div className="p-5 bg-slate-50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={lot.photos[0] || 'https://images.unsplash.com/photo-1599583718211-09439fcf499f?auto=format&fit=crop&q=80&w=800'}
                      alt={lot.crop}
                      referrerPolicy="no-referrer"
                      className="w-16 h-16 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-base text-slate-900">{lot.crop} - {lot.variety}</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                          {lot.grade}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold capitalize ${
                          lot.status === 'sold' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-800'
                        }`}>
                          {lot.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {t('myLots.listed', 'Listed')}: {new Date(lot.createdAt).toLocaleDateString()} • {lot.quantityQuintals} {t('myLots.quintals', 'Quintals')} • {t('myLots.asking', 'Asking')}: ₹{lot.askingPricePerQuintal}/q
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setSelectedLotForHistory(lot.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-2xs cursor-pointer"
                      title={t('myLots.lotHistory', 'View Complete Lifecycle & Transaction History')}
                    >
                      <History className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{t('myLots.lotHistory', 'Lot History & Ledger')}</span>
                    </button>

                    <button
                      onClick={() => deleteLot(lot.id)}
                      className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                      title={t('myLots.deleteTitle', 'Delete Listing')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Received Offers Section */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {t('myLots.incomingOffers', 'Received Buyer Offers')} ({lotOffers.length})
                    </h4>
                    {lot.status === 'sold' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded flex items-center space-x-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{t('myLots.dealLockedEscrow', 'Deal Locked with Escrow')}</span>
                      </span>
                    )}
                  </div>

                  {lotOffers.length === 0 ? (
                    <div className="text-center py-6 bg-slate-50 rounded-xl text-xs text-slate-400">
                      {t('myLots.noOffersYet', 'No offers received for this lot yet. Our AI buyer matching is active.')}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {lotOffers.map((offer) => (
                        <div
                          key={offer.id}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-sm">{offer.buyerName}</span>
                              <span className="text-slate-400">({offer.buyerDistrict})</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                                offer.status === 'accepted'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : offer.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : offer.status === 'countered'
                                  ? 'bg-sky-100 text-sky-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {offer.status}
                              </span>
                            </div>

                            <p className="text-slate-600 font-semibold">
                              {t('myLots.bid', 'Bid')}: <strong className="text-emerald-700 font-black text-sm">₹{offer.offeredPricePerQuintal}/q</strong> ({offer.quantityQuintals} q = ₹{offer.totalAmount.toLocaleString('en-IN')})
                            </p>

                            {offer.counterPrice && (
                              <p className="text-sky-700 font-medium">{t('myLots.counterPrice', 'Your Counter Price')}: ₹{offer.counterPrice}/q</p>
                            )}

                            {offer.notes && (
                              <p className="text-slate-500 italic">"{offer.notes}"</p>
                            )}
                          </div>

                          {/* Offer Action Buttons */}
                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            {offer.status === 'accepted' && (
                              <button
                                onClick={() => setCurrentTab('transactions')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold flex items-center space-x-1 cursor-pointer"
                              >
                                <ReceiptText className="w-3.5 h-3.5 text-emerald-700" />
                                <span>{t('myLots.viewReceipt', 'View & Print Receipt')}</span>
                              </button>
                            )}

                            {offer.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => acceptOffer(offer.id)}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-xs flex items-center space-x-1 cursor-pointer"
                                >
                                  <CheckCircle className="w-3.5 h-3.5" />
                                  <span>{t('myLots.acceptOffer', 'Accept Deal')}</span>
                                </button>

                                <button
                                  onClick={() => handleStartCounter(offer)}
                                  className="px-3 py-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold border border-sky-200 cursor-pointer"
                                >
                                  {t('myLots.counterOffer', 'Counter')}
                                </button>

                                <button
                                  onClick={() => rejectOffer(offer.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
                                >
                                  {t('myLots.rejectOffer', 'Decline')}
                                </button>
                              </>
                            )}

                            <button
                              onClick={() =>
                                openCallModal({
                                  targetName: offer.buyerName,
                                  targetRole: 'Verified Buyer / Mill',
                                  targetPhone: offer.buyerPhone || '+91 94220 88990',
                                  lotCrop: offer.crop,
                                })
                              }
                              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                              title={t('myLots.directCall', 'Direct Phone Call')}
                            >
                              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  )}

                  {/* Counter Price Form */}
                  {counteringOfferId && (
                    <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-center space-x-2 text-xs">
                      <span className="font-semibold text-sky-900">{t('myLots.enterCounter', 'Enter Counter Price (₹/q):')}</span>
                      <input
                        type="number"
                        value={counterPriceInput}
                        onChange={(e) => setCounterPriceInput(Number(e.target.value))}
                        className="px-2 py-1 border border-sky-300 rounded text-xs font-bold w-28"
                      />
                      <button
                        onClick={() => handleApplyCounter(counteringOfferId)}
                        className="px-3 py-1 bg-sky-700 text-white font-bold rounded cursor-pointer"
                      >
                        {t('myLots.submitCounter', 'Submit Counter')}
                      </button>
                      <button
                        onClick={() => setCounteringOfferId(null)}
                        className="text-slate-500 hover:underline text-[11px] cursor-pointer"
                      >
                        {t('myLots.cancel', 'Cancel')}
                      </button>
                    </div>
                  )}

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Lot Transaction History & Audit Modal */}
      <LotHistoryTrackerModal
        lotId={selectedLotForHistory}
        isOpen={!!selectedLotForHistory}
        onClose={() => setSelectedLotForHistory(null)}
        currentUserRole={currentUser?.role || 'farmer'}
        currentUserId={currentUser?.id}
        currentUserName={currentUser?.name}
      />

    </div>
  );
};

export default MyLotsView;
