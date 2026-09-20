import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Truck, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Star, 
  PhoneCall, 
  Calculator, 
  CheckCircle,
  Navigation,
  Clock,
  Sparkles,
  Printer,
  ReceiptText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateTransportFare, createTransportBookingApi } from '../services/api';
import { TransportFareResult, Transporter, TransportBooking, CropType } from '../types';
import { printTransportReceipt } from '../utils/printReceipt';

interface TransportViewProps {
  setCurrentTab: (tab: string) => void;
}

export const TransportView: React.FC<TransportViewProps> = ({ setCurrentTab }) => {
  const { t } = useTranslation();
  const { transporters, openCallModal, addToast, currentUser, openInsufficientBalanceDialog, refreshData } = useApp();

  // Calculator state
  const [pickupDistrict, setPickupDistrict] = useState('Osmanabad');
  const [dropDistrict, setDropDistrict] = useState('Latur');
  const [distanceKm, setDistanceKm] = useState<number>(75);
  const [vehicleType, setVehicleType] = useState('Small Truck (1-3 tons)');
  const [quantityQuintals, setQuantityQuintals] = useState<number>(40);
  const [hasTempControl, setHasTempControl] = useState<boolean>(false);
  
  const [fareResult, setFareResult] = useState<TransportFareResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Auto-estimate distance based on district pair
  useEffect(() => {
    const distances: Record<string, number> = {
      'Osmanabad-Latur': 75,
      'Osmanabad-Solapur': 68,
      'Osmanabad-Pune': 260,
      'Latur-Solapur': 120,
      'Latur-Pune': 320,
      'Nashik-Pune': 210,
      'Jalgaon-Nashik': 240,
    };
    const key = `${pickupDistrict}-${dropDistrict}`;
    const reverseKey = `${dropDistrict}-${pickupDistrict}`;
    const est = distances[key] || distances[reverseKey] || 90;
    setDistanceKm(est);
  }, [pickupDistrict, dropDistrict]);

  const runFareCalculation = async () => {
    setCalcLoading(true);
    try {
      const res = await calculateTransportFare({
        distanceKm,
        vehicleType,
        quantityQuintals,
        hasTempControl,
        isFirstTransaction: currentUser?.freeTransactionAvailable ?? true,
      });
      setFareResult(res);
    } catch (e: any) {
      console.warn('Fallback transport fare');
    } finally {
      setCalcLoading(false);
    }
  };

  useEffect(() => {
    runFareCalculation();
  }, [distanceKm, vehicleType, quantityQuintals, hasTempControl]);

  const [bookedReceipt, setBookedReceipt] = useState<TransportBooking | null>(null);

  const handleBookTransporter = async (tr: Transporter) => {
    const totalFare = fareResult?.totalAmount || distanceKm * tr.ratePerKm;
    const currentBal = currentUser?.walletBalance ?? 0;

    // Check if user has sufficient funds for this transport booking
    if (currentBal < totalFare) {
      const shortfall = totalFare - currentBal;
      openInsufficientBalanceDialog({
        transactionTitle: `Transport Waybill: ${tr.name} (${distanceKm} km)`,
        transactionType: 'transport_fare',
        requiredAmount: totalFare,
        currentBalance: currentBal,
        shortfall,
        payerName: currentUser?.name,
        payerRole: currentUser?.role,
        payerId: currentUser?.id,
        crop: 'Soybean',
        quantityQuintals,
        onRetry: () => handleBookTransporter(tr),
      });
      return; // STOP TRANSACTION
    }

    try {
      const bookingData = {
        transporterId: tr.id,
        transporterName: tr.name,
        driverPhone: tr.phone,
        pickupLocation: `${pickupDistrict} APMC Farm Gate`,
        dropLocation: `${dropDistrict} Warehouse`,
        crop: 'Soybean' as CropType,
        quantityQuintals,
        distanceKm,
        totalFare,
        userId: currentUser?.id || 'usr_001',
      };

      const created = await createTransportBookingApi(bookingData);
      setBookedReceipt(created);
      await refreshData();
      addToast({
        type: 'success',
        title: 'Transporter Request Dispatched',
        message: `${tr.name} booked. Waybill generated ready to print.`,
      });
    } catch (e: any) {
      if (e.code === 'INSUFFICIENT_BALANCE' || e.data?.code === 'INSUFFICIENT_BALANCE' || e.message?.includes('INSUFFICIENT_BALANCE')) {
        const data = e.data || {};
        const reqAmt = data.requiredAmount || totalFare;
        const bal = data.currentBalance ?? currentBal;
        const shortfall = data.shortfall || Math.max(0, reqAmt - bal);

        openInsufficientBalanceDialog({
          transactionTitle: `Transport Waybill: ${tr.name}`,
          transactionType: 'transport_fare',
          requiredAmount: reqAmt,
          currentBalance: bal,
          shortfall,
          payerName: data.userName || currentUser?.name,
          payerRole: data.userRole || currentUser?.role,
          payerId: data.userId || currentUser?.id,
          crop: 'Soybean',
          quantityQuintals,
          onRetry: () => handleBookTransporter(tr),
        });
        return; // STOP TRANSACTION
      }

      addToast({
        type: 'error',
        title: 'Booking Halted',
        message: e.message || 'Could not place transport booking.',
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-slate-900">
            {t('transport.title', 'Rural Agricultural Logistics & Haulage')}
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
            {t('transport.farmGatePickup', 'Farm Gate Pickup')}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {t('transport.subtitle', 'Instant transparent per-km trucking rates, GPS corridor tracking, and certified rural freight carriers.')}
        </p>
      </div>

      {/* Grid: Left Fare Calculator, Right Vetted Transporters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Interactive Fare Engine */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <Calculator className="w-5 h-5 text-purple-600" />
            <h3 className="font-bold text-base text-slate-900">{t('transport.calculatorTitle', 'Transport Rate Calculator')}</h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('transport.pickup', 'Pickup District')}</label>
                <select
                  value={pickupDistrict}
                  onChange={(e) => setPickupDistrict(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Osmanabad">Osmanabad</option>
                  <option value="Latur">Latur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Nashik">Nashik</option>
                  <option value="Pune">Pune</option>
                  <option value="Jalgaon">Jalgaon</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">{t('transport.drop', 'Drop Mandi/Mill')}</label>
                <select
                  value={dropDistrict}
                  onChange={(e) => setDropDistrict(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg font-medium"
                >
                  <option value="Latur">Latur</option>
                  <option value="Solapur">Solapur</option>
                  <option value="Pune">Pune</option>
                  <option value="Osmanabad">Osmanabad</option>
                  <option value="Nashik">Nashik</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">{t('transport.distance', 'Route Distance')}: <strong>{distanceKm} km</strong></label>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={distanceKm}
                onChange={(e) => setDistanceKm(Number(e.target.value))}
                className="w-full accent-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('transport.vehicleType', 'Vehicle Classification')}</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-medium"
              >
                <option value="Mini Truck (up to 1 ton)">{t('transport.vehicleMini', 'Mini Truck / Tata Ace (up to 1 Ton)')}</option>
                <option value="Small Truck (1-3 tons)">{t('transport.vehicleSmall', 'Small Truck / Pickup (1-3 Tons)')}</option>
                <option value="Large Truck (3-10 tons)">{t('transport.vehicleMedium', 'Medium Eicher (3-10 Tons)')}</option>
                <option value="Container (10+ tons)">{t('transport.vehicleHeavy', 'Heavy Multiaxle / Reefer (10+ Tons)')}</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('transport.weight', 'Load Weight (Quintals)')}</label>
              <input
                type="number"
                min="5"
                max="300"
                value={quantityQuintals}
                onChange={(e) => setQuantityQuintals(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-bold"
              />
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={hasTempControl}
                onChange={(e) => setHasTempControl(e.target.checked)}
                className="rounded text-purple-600 focus:ring-purple-500"
              />
              <span>{t('transport.tempControl', 'Perishable Temperature Control (+20% for Vegetables/Fruits)')}</span>
            </label>
          </div>

          {/* Computed Estimate Box */}
          {fareResult && (
            <div className="bg-purple-950 text-white rounded-xl p-4 space-y-2 text-xs border border-purple-800">
              <div className="flex justify-between text-purple-200">
                <span>{t('transport.baseFare', 'Base Loading & Flagfall')}:</span>
                <span>₹{fareResult.baseFare}</span>
              </div>
              <div className="flex justify-between text-purple-200">
                <span>{t('transport.distanceRate', 'Distance Rate')} ({distanceKm} km):</span>
                <span>₹{fareResult.distanceCharge}</span>
              </div>
              {fareResult.weightSurcharge > 0 && (
                <div className="flex justify-between text-purple-200">
                  <span>{t('transport.weightSurcharge', 'Weight Surcharge')}:</span>
                  <span>₹{fareResult.weightSurcharge}</span>
                </div>
              )}
              <div className="flex justify-between text-purple-200 pt-1 border-t border-purple-800">
                <span>{t('transport.platformFee', 'Platform Commission (2%)')}:</span>
                <span>{fareResult.isFreeCommissionUsed ? `₹0 (${t('transport.freeTrip', '1st Trip Free')})` : `₹${fareResult.platformCommission}`}</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-400 pt-2 border-t border-purple-700">
                <span>{t('transport.estimatedFare', 'Estimated Total Fare')}:</span>
                <span>₹{fareResult.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <p className="text-[10px] text-purple-300 text-center mt-1">{t('transport.payOnDelivery', 'Pay upon successful delivery verification')}</p>
            </div>
          )}

        </div>

        {/* Right: Available Regional Transporters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-base text-slate-900">{t('transport.availableTransporters', 'Available Rural Transporters')} ({transporters.length})</h3>
            <span className="text-xs text-slate-500">{t('transport.verifiedDriversNotice', 'Verified drivers with valid commercial permits')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {transporters.map((tr) => (
              <div
                key={tr.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">{tr.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center space-x-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t('transport.basedIn', 'Based in')} {tr.district}</span>
                      </p>
                    </div>
                    <div className="flex items-center space-x-0.5 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{tr.rating}</span>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-700">
                      <span>{t('transport.vehicle', 'Vehicle')}:</span>
                      <strong className="text-slate-900">{tr.vehicleType}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>{t('transport.maxPayload', 'Max Payload')}:</span>
                      <strong className="text-slate-900">{tr.capacityTons} {t('transport.tons', 'Metric Tons')}</strong>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>{t('transport.ratePerKm', 'Rate / km')}:</span>
                      <strong className="text-purple-700">₹{tr.ratePerKm}/km</strong>
                    </div>
                    <div className="flex justify-between text-slate-500 text-[11px] pt-1 border-t border-slate-200">
                      <span>{t('transport.completedTrips', 'Completed Trips')}:</span>
                      <span>{tr.completedTrips} {t('transport.deliveries', 'deliveries')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleBookTransporter(tr)}
                    className="flex-1 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                  >
                    {t('transport.bookNow', 'Request Booking')}
                  </button>

                  <button
                    onClick={() =>
                      openCallModal({
                        targetName: tr.name,
                        targetRole: 'Transporter',
                        targetPhone: tr.phone,
                      })
                    }
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                    title={t('transport.directCall', 'Direct Call Driver')}
                  >
                    <PhoneCall className="w-4 h-4 text-purple-700" />
                  </button>
                </div>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Transport Booking Waybill Modal */}
      {bookedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Truck className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">{t('transport.waybillTitle', 'Rural Transport Waybill Booked')}</h3>
              </div>
              <button 
                onClick={() => setBookedReceipt(null)}
                className="text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-purple-700">{t('transport.waybillRef', 'Waybill Reference')}:</span>
                <strong className="text-purple-950 font-mono">{bookedReceipt.id}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">{t('transport.carrier', 'Carrier')}:</span>
                <strong className="text-purple-950">{bookedReceipt.transporterName} ({bookedReceipt.driverPhone})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-purple-700">{t('transport.corridor', 'Route Corridor')}:</span>
                <strong className="text-purple-950">{bookedReceipt.pickupLocation} → {bookedReceipt.dropLocation} ({bookedReceipt.distanceKm} km)</strong>
              </div>
              <div className="flex justify-between pt-1 border-t border-purple-200">
                <span className="text-purple-700 font-bold">{t('transport.totalFare', 'Total Haulage Fare')}:</span>
                <strong className="text-purple-950 font-black text-sm">₹{bookedReceipt.totalFare.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 text-center">
              {t('transport.driverPrintNotice', 'Print this official consignment receipt for the driver at the farm gate checkpoint.')}
            </p>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => printTransportReceipt(bookedReceipt)}
                className="flex-1 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>{t('transport.printWaybill', 'Print Consignment Waybill')}</span>
              </button>
              <button
                onClick={() => setBookedReceipt(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {t('common.close', 'Close')}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TransportView;
