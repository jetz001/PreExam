import React, { useState, useEffect } from 'react';
import { CreditCard, Clock, CheckCircle2, XCircle, FileText } from 'lucide-react';
import paymentService from '../../services/paymentService';

const ProfileBillingHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await paymentService.getMyTransactions();
        if (res.success && res.history) {
          setHistory(res.history);
        } else if (res.data) {
          setHistory(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="py-12 text-center text-white/75 font-bold">
        กำลังโหลดประวัติการชำระเงิน...
      </div>
    );
  }

  return (
    <div id="sec-billing-history">
      <div className="section-title" style={{ marginBottom: '20px', fontSize: '20px' }}>
        <div className="dot" />
        <CreditCard size={20} className="text-amber-300" />
        <span>Billing History</span>
      </div>

      {history.length === 0 ? (
        <div className="activity-card py-10 text-center text-white/75 font-semibold">
          <CreditCard size={32} className="mx-auto mb-3 opacity-60" />
          <div>ยังไม่มีประวัติการชำระเงิน</div>
        </div>
      ) : (
        <div className="activity-card" style={{ animation: 'fadeSlideIn 0.4s both' }}>
          {history.map((item, index) => {
            const dateStr = item.created_at || Date.now();
            const rawStatus = item.status || 'pending';

            let statusColor = '#fde047';
            let iconTone = 'y';
            let StatusIcon = Clock;
            let statusText = 'Pending';

            if (rawStatus === 'approved' || rawStatus === 'complete' || rawStatus === 'paid') {
              statusColor = '#34d399';
              iconTone = 't';
              StatusIcon = CheckCircle2;
              statusText = 'Completed';
            } else if (rawStatus === 'rejected' || rawStatus === 'failed') {
              statusColor = '#fda4af';
              iconTone = 'r';
              StatusIcon = XCircle;
              statusText = 'Failed';
            }

            return (
              <div
                className="activity-item flex-wrap sm:flex-nowrap"
                key={item.id || index}
                style={{ padding: '14px 10px' }}
              >
                <div className={`act-icon ${iconTone}`}>
                  <StatusIcon size={19} strokeWidth={2.2} />
                </div>
                <div className="act-body">
                  <div className="act-title" style={{ fontSize: '15px' }}>
                    {item.metadata?.product_name || item.plan_id || 'Premium Subscription'}
                  </div>
                  <div className="act-sub" style={{ fontSize: '12.5px', marginTop: '3px' }}>
                    ช่องทาง:{' '}
                    <strong className="text-white uppercase">{item.payment_method || 'N/A'}</strong>
                    {' • '}ID: {item.id ? `${item.id.substring(0, 8)}...` : '-'}
                  </div>
                </div>
                <div className="act-right" style={{ minWidth: '105px' }}>
                  <div className="act-pts" style={{ color: statusColor }}>
                    ฿{item.amount || 0}
                  </div>
                  <div className="act-time">
                    {new Date(dateStr).toLocaleString('th-TH', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </div>
                  <div style={{ fontSize: '11px', color: statusColor, marginTop: '2px', fontWeight: 800 }}>
                    {statusText}
                  </div>
                  {item.receipt_url && (
                    <div className="mt-2">
                      <a
                        href={item.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
                      >
                        <FileText size={12} />
                        <span>View Receipt</span>
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProfileBillingHistory;
