import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const DemoContext = createContext();

export function DemoProvider({ children }) {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [conditionLogs, setConditionLogs] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  
  // Navigation: 'catalog' | 'my-bookings' | 'manager-queue' | 'incidents' | 'audit'
  const [activeTab, setActiveTab] = useState('catalog');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  }, []);

  // Fetch consolidated bootstrap data
  const refreshData = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const res = await api.get('/bootstrap');
      if (res.data?.success) {
        const {
          users: u,
          resources: r,
          bookings: b,
          conditionLogs: cl,
          incidents: inc,
          auditLogs: al,
          notifications: notifs,
        } = res.data.data;

        setUsers(u || []);
        setResources(r || []);
        setBookings(b || []);
        setConditionLogs(cl || []);
        setIncidents(inc || []);
        setAuditLogs(al || []);
        setNotifications(notifs || []);

        // Default or preserve currentUser
        setCurrentUser((prev) => {
          if (!prev && u?.length > 0) return u[0]; // default to Aarav Sharma
          if (prev && u?.length > 0) {
            const found = u.find((item) => item._id === prev._id);
            return found || prev;
          }
          return prev;
        });
      }
    } catch (err) {
      console.error('Failed to bootstrap data:', err);
      showToast('Could not reach backend API. Ensure server is running.', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Switch persona
  const switchUser = (user) => {
    setCurrentUser(user);
    showToast(`Switched active persona to ${user.name} (${user.role.toUpperCase()})`, 'info');
  };

  // Reset Demo Data
  const resetDemoData = async () => {
    setLoading(true);
    try {
      await api.post('/demo/reset');
      await refreshData(true);
      showToast('Demo data restored to clean 10-step judge state! All scenarios reset.', 'success');
    } catch (err) {
      showToast('Error resetting demo database: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Quick Safety Verification (earn badge live)
  const verifyBadge = async (badgeName) => {
    if (!currentUser) return;
    try {
      const res = await api.post(`/users/${currentUser._id}/badges`, { badge: badgeName });
      if (res.data?.success) {
        showToast(`Safety Credential [${badgeName}] successfully verified and added!`, 'success');
        await refreshData(true);
      }
    } catch (err) {
      showToast('Failed to verify safety badge: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // Step 1: List Resource
  const listResource = async (formData) => {
    try {
      const payload = {
        ...formData,
        ownerId: currentUser?._id,
        ownerName: currentUser?.name || 'Lab Manager',
      };
      const res = await api.post('/resources', payload);
      if (res.data?.success) {
        showToast(`Resource "${formData.name}" listed successfully with Tier ${formData.riskTier} compliance!`, 'success');
        await refreshData(true);
        return true;
      }
    } catch (err) {
      showToast('Failed to list resource: ' + (err.response?.data?.error || err.message), 'error');
      return false;
    }
  };

  // Step 3 & 4: Request Booking
  const createBooking = async (bookingData) => {
    try {
      const payload = {
        ...bookingData,
        userId: currentUser?._id,
      };
      const res = await api.post('/bookings', payload);
      if (res.data?.success) {
        const { booking, verification } = res.data;
        showToast(
          verification.passedAll
            ? `Booking request submitted! Fair-Share Score: ${booking.priorityScore} pts.`
            : `Booking submitted with automated warnings. Priority Score: ${booking.priorityScore} pts.`,
          verification.passedAll ? 'success' : 'warning'
        );
        await refreshData(true);
        setActiveTab('my-bookings');
        return res.data;
      }
    } catch (err) {
      showToast('Booking failed: ' + (err.response?.data?.error || err.message), 'error');
      throw err;
    }
  };

  // Step 5 & 6: Manager Decision
  const decideBooking = async (bookingId, decision, decisionReason) => {
    try {
      const res = await api.patch(`/bookings/${bookingId}/decision`, {
        decision,
        decisionReason,
        managerId: currentUser?._id,
        managerName: currentUser?.name || 'Authorized Manager',
      });
      if (res.data?.success) {
        showToast(`Booking marked as ${decision}! Competing requests evaluated.`, 'success');
        await refreshData(true);
        return res.data;
      }
    } catch (err) {
      showToast('Decision failed: ' + (err.response?.data?.error || err.message), 'error');
      throw err;
    }
  };

  // Step 6: Cancel Booking (triggers waitlist auto-promotion)
  const cancelBooking = async (bookingId, cancelReason) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, {
        cancelReason,
        actorName: currentUser?.name,
        actorRole: currentUser?.role,
      });
      if (res.data?.success) {
        if (res.data.promotedBooking) {
          showToast(`Booking cancelled. Waitlist candidate auto-promoted to APPROVED!`, 'info');
        } else {
          showToast(`Booking cancelled.`, 'info');
        }
        await refreshData(true);
      }
    } catch (err) {
      showToast('Cancellation failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  // Step 7: Check-In
  const checkInBooking = async (bookingId, checkInData) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/checkin`, {
        ...checkInData,
        actorName: currentUser?.name,
      });
      if (res.data?.success) {
        showToast(`Check-In confirmed! Equipment condition recorded and status set to IN_USE.`, 'success');
        await refreshData(true);
        return res.data;
      }
    } catch (err) {
      showToast('Check-In failed: ' + (err.response?.data?.error || err.message), 'error');
      throw err;
    }
  };

  // Step 8 & 9: Return / Check-Out
  const checkOutBooking = async (bookingId, checkOutData) => {
    try {
      const res = await api.post(`/bookings/${bookingId}/checkout`, {
        ...checkOutData,
        actorName: currentUser?.name,
      });
      if (res.data?.success) {
        if (res.data.incident) {
          showToast(`Returned with incident flag! Hardware placed on MAINTENANCE_HOLD. AI Advisory generated.`, 'warning');
          setActiveTab('incidents');
        } else {
          showToast(`Clean return verified! Hardware restored to AVAILABLE status.`, 'success');
        }
        await refreshData(true);
        return res.data;
      }
    } catch (err) {
      showToast('Check-out failed: ' + (err.response?.data?.error || err.message), 'error');
      throw err;
    }
  };

  // Step 9: Resolve Incident
  const resolveIncident = async (incidentId, resolutionNotes, restoreResource = true) => {
    try {
      const res = await api.patch(`/incidents/${incidentId}/resolve`, {
        managerResolutionNotes: resolutionNotes,
        restoreResource,
        managerName: currentUser?.name || 'Authorized Manager',
      });
      if (res.data?.success) {
        showToast(`Incident marked RESOLVED. Resource status updated.`, 'success');
        await refreshData(true);
      }
    } catch (err) {
      showToast('Resolution failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  return (
    <DemoContext.Provider
      value={{
        users,
        currentUser,
        resources,
        bookings,
        conditionLogs,
        incidents,
        auditLogs,
        notifications,
        activeTab,
        loading,
        toast,
        setActiveTab,
        switchUser,
        refreshData,
        resetDemoData,
        verifyBadge,
        listResource,
        createBooking,
        decideBooking,
        cancelBooking,
        checkInBooking,
        checkOutBooking,
        resolveIncident,
        showToast,
      }}
    >
      {children}
      {/* Persistent Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-bounce-in">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-3 backdrop-blur-md ${
              toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/50 text-rose-200'
                : toast.type === 'warning'
                ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
                : toast.type === 'info'
                ? 'bg-cyan-950/90 border-cyan-500/50 text-cyan-200'
                : 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}
